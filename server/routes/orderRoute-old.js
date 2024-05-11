// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

// Logik til opgaverne og deres tidspunkter
const createTasksForOrder = async (orderId, roomId, date, startTime, endTime, servingTime) => {

    // Opret Date objekter i UTC
    const eventDateUTC = new Date(`${date}T${startTime}:00Z`); // Antager, at tiden er i UTC
    const setupTimeUTC = new Date(eventDateUTC.getTime() - 15 * 60000); // 15 minutter før
    const waterTimeUTC = new Date(eventDateUTC.getTime() - 10 * 60000); // 10 minutter før
    const servingTimeUTC = new Date(`${date}T${servingTime}:00Z`); // Serveringstid i UTC
    const cleaningTimeUTC = new Date(`${date}T${endTime}:00Z`); // Sluttid i UTC

    const tasks = [
        { description: "Klargøring af lokale inkl. bordopdækning", time: setupTimeUTC.toISOString() },
        { description: "Vand klar på bordene", time: waterTimeUTC.toISOString() },
        { description: "Servere frokost", time: servingTimeUTC.toISOString() },
        { description: "Rengøring af lokale", time: cleaningTimeUTC.toISOString() }
    ];

    // Indsæt opgaver i databasen
    for (const task of tasks) {
        const insertTaskQuery = 'INSERT INTO tasks (description, startTime, endTime, date, roomId) VALUES (?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
            db.run(insertTaskQuery, [task.description, task.time, task.time, date, roomId], function(err) {
                if (err) {
                    console.error('Error creating task:', err);
                    reject(err);
                } else {
                    const taskId = this.lastID;
                    const linkTaskQuery = 'INSERT INTO orderTasks (orderId, taskId, roomId) VALUES (?, ?, ?)';
                    db.run(linkTaskQuery, [orderId, taskId, roomId], (linkErr) => {
                        if (linkErr) {
                            console.error('Error linking task to order:', linkErr);
                            reject(linkErr);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }
};

  router.post('/', async (req, res) => {  // Tilføj 'async' her
    const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3 } = req.body;
    
    // Find et ledigt lokale
    const findRoomQuery = `
        SELECT roomId FROM rooms 
        WHERE capacity >= ? AND roomId NOT IN (
            SELECT roomId FROM orderRoom 
            WHERE date = ? AND NOT (endTime <= ? OR startTime >= ?)
        ) 
        LIMIT 1;
    `;
  
    db.get(findRoomQuery, [guests, date, startTime, endTime], async (error, room) => {  // Overvej 'async' her, hvis du bruger await indeni
        if (error) {
            console.error('Error finding available room:', error);
            res.status(500).json({ error: 'Database error while finding room' });
        } else if (!room) {
            res.status(409).json({ error: 'No available rooms for the given number of guests and time slot' });
        } else {
            // Indsæt ordre og knyt til rum
            const insertOrderQuery = `
                INSERT INTO orders (eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;
            db.run(insertOrderQuery, [eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3], async function(orderError) {  // Overvej 'async' her, hvis du bruger await indeni
                if (orderError) {
                    console.error('Error creating order:', orderError);
                    res.status(500).json({ error: 'Error creating order' });
                } else {
                    const orderId = this.lastID;
                    // Link ordre til rum med dato
                    const linkRoomOrderQuery = `
                        INSERT INTO orderRoom (orderId, roomId, date, startTime, endTime)
                        VALUES (?, ?, ?, ?, ?);
                    `;
                    db.run(linkRoomOrderQuery, [orderId, room.roomId, date, startTime, endTime], async function(linkError) {  // Overvej 'async' her, hvis du bruger await indeni
                        if (linkError) {
                            console.error('Error linking room to order:', linkError);
                            res.status(500).json({ error: 'Error linking room to order' });
                        } else {
                            // Her oprettes opgaver for den nyligt oprettede ordre
                            await createTasksForOrder(orderId, room.roomId, date, startTime, endTime, servingTime);  // Brug 'await' her
                            res.status(200).json({ message: 'Order created and room allocated successfully', orderId: orderId, roomId: room.roomId, startTime: startTime, servingTime: servingTime, endTime: endTime, date: date });
                        }
                    });
                }
            });
        }
    });
  });
  



// Route til at hente alle ordrer
router.get('/', (req, res) => {
    db.all('SELECT * FROM orders', (error, orders) => {
        if (error) {
            console.error('Fejl ved hentning af ordrer:', error);
            res.status(500).json({ error: 'Fejl ved hentning af ordrer' });
        } else {
            res.json(orders);
        }
    });
});

// Endpoint til at hente alle lokaler
router.get('/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', (error, rooms) => {
      if (error) {
          console.error('Error retrieving rooms:', error);
          res.status(500).json({ error: 'Failed to retrieve rooms' });
      } else {
          res.json(rooms);
      }
  });
});

// Endpoint til at hente alle ordre-lokale relationer
router.get('/order-room', (req, res) => {
  db.all('SELECT * FROM orderRoom', (error, orderRooms) => {
      if (error) {
          console.error('Error retrieving order-room relations:', error);
          res.status(500).json({ error: 'Failed to retrieve order-room relations' });
      } else {
          res.json(orderRooms);
      }
  });
});

// endpoint til at se alle opgaver
router.get('/tasks', (req, res) => {
    console.log("Fetching tasks...")
    const query = `
    SELECT tasks.*, orderRoom.roomId FROM tasks 
        JOIN orderTasks ON tasks.taskId = orderTasks.taskId
        JOIN orders ON orderTasks.orderId = orders.id
        JOIN orderRoom ON orders.id = orderRoom.orderId
        ORDER BY tasks.date, tasks.startTime;
    `;
    db.all(query, (error, tasks) => {
        if (error) {
            console.error('Error retrieving tasks:', error);
            res.status(500).json({ error: 'Failed to retrieve tasks' });
        } else {
            console.log('Tasks with room ID:', tasks);  
            // console.log('Full response:', res);
            res.json(tasks);
        }
    });
    
});


// endpoint til at markere en opgave som udført
router.post('/tasks/:taskId/complete', (req, res) => {
  const { taskId } = req.params;
  const updateQuery = 'UPDATE tasks SET completed = 1 WHERE taskId = ?';
  db.run(updateQuery, [taskId], function(err) {
      if (err) {
          console.error('Error completing task:', err);
          res.status(500).json({ error: 'Failed to complete task' });
      } else {
          res.json({ message: 'Task completed successfully' });
      }
  });
});

// Endpoint til at se opgaveOrdre tabel
router.get('/order-tasks', (req, res) => {
    const query = 'SELECT * FROM orderTasks';
    db.all(query, (error, results) => {
        if (error) {
            console.error('Error retrieving order-tasks relations:', error);
            res.status(500).json({ error: 'Failed to retrieve order-tasks relations' });
        } else {
            res.json(results);
        }
    });
});

// Endpoint til at toggle opgavens fuldførelsesstatus
router.post('/tasks/:taskId/toggle', (req, res) => {
    const taskId = req.params.taskId;
    const sql = `UPDATE tasks SET completed = NOT completed WHERE taskId = ?`;
  
    db.run(sql, [taskId], function(err) {
        if (err) {
            res.status(500).json({ error: 'Failed to toggle task completion' });
        } else {
            res.json({ message: 'Task completion toggled', taskId: taskId, completed: this.changes });
        }
    });
  });

module.exports = router;