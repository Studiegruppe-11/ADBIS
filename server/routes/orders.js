// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

// Relateret til opgaver
const createTasksForOrder = (orderId, date, startTime, endTime, servingTime) => {
  // Sørg for, at tiderne er korrekt formateret
  const eventDate = new Date(date);
  const startDateTime = new Date(eventDate.getTime() + new Date('1970-01-01T' + startTime + 'Z').getTime());
  const endDateTime = new Date(eventDate.getTime() + new Date('1970-01-01T' + endTime + 'Z').getTime());
  const servingDateTime = new Date(eventDate.getTime() + new Date('1970-01-01T' + servingTime + 'Z').getTime());

  const preServiceTime = new Date(startDateTime.getTime() - 15 * 60000).toTimeString().substring(0, 5);
  const postServiceTime = new Date(endDateTime.getTime() + 10 * 60000).toTimeString().substring(0, 5);

  const tasks = [
    { description: "Klargøring af lokale inkl. bordopdækning", time: preServiceTime },
    { description: "Vand klar på bordene", time: startTime },
    { description: "Servere frokost", time: servingTime },
    { description: "Rengøring af lokale", time: postServiceTime }
  ];

  tasks.forEach(task => {
    const insertTaskQuery = 'INSERT INTO tasks (description, startTime, endTime, date) VALUES (?, ?, ?, ?)';
    db.run(insertTaskQuery, [task.description, task.time, task.time, date], function(err) {
      if (err) {
        console.error('Error creating task:', err);
      } else {
        const taskId = this.lastID;
        const linkTaskQuery = 'INSERT INTO orderTasks (orderId, taskId) VALUES (?, ?)';
        db.run(linkTaskQuery, [orderId, taskId], function(linkErr) {
          if (linkErr) {
            console.error('Error linking task to order:', linkErr);
          }
        });
      }
    });
  });
};


router.post('/', (req, res) => {
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

  db.get(findRoomQuery, [guests, date, startTime, endTime], (error, room) => {
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
          db.run(insertOrderQuery, [eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3], function(orderError) {
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
                  db.run(linkRoomOrderQuery, [orderId, room.roomId, date, startTime, endTime], function(linkError) {
                      if (linkError) {
                          console.error('Error linking room to order:', linkError);
                          res.status(500).json({ error: 'Error linking room to order' });
                      } else {
                          // Her oprettes opgaver for den nyligt oprettede ordre
                          createTasksForOrder(orderId, date, startTime, endTime, servingTime);
                          res.status(200).json({ message: 'Order created and room allocated successfully', orderId: orderId, roomId: room.roomId });
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

// Endpoint til at hente alle opgaver med lokaler
router.get('/tasks', (req, res) => {
  const query = `
    SELECT tasks.*, orderRoom.roomId 
    FROM tasks 
    JOIN orderTasks ON tasks.taskId = orderTasks.taskId
    JOIN orderRoom ON orderTasks.orderId = orderRoom.orderId
    ORDER BY tasks.date, tasks.startTime;
  `;

  db.all(query, (error, results) => {
    if (error) {
      console.error('Error retrieving tasks with rooms:', error);
      res.status(500).json({ error: 'Failed to retrieve tasks with rooms' });
    } else {
      res.json(results);
    }
  });
});


// Endpoint til at markere en opgave som udført

// Endpoint til at toggle opgavens fuldførelse
router.post('/tasks/:taskId/toggle', (req, res) => {
  const { taskId } = req.params;
  console.log(`Attempting to toggle task with ID: ${taskId}`);  // This should log when you attempt to toggle a task

  const query = 'UPDATE tasks SET completed = NOT completed WHERE taskId = ?';
  db.run(query, [taskId], function(err) {
    if (err) {
      console.error('Error toggling task completion:', err);
      res.status(500).json({ error: 'Failed to toggle task completion' });
    } else {
      console.log(`Task ${taskId} toggled successfully`);
      res.json({ message: 'Task toggled successfully', taskId: taskId });
    }
  });
});



// // endpoint til at markere en opgave som udført
// router.post('/tasks/:taskId/complete', (req, res) => {
//   const { taskId } = req.params;
//   const updateQuery = 'UPDATE tasks SET completed = 1 WHERE taskId = ?';
//   db.run(updateQuery, [taskId], function(err) {
//       if (err) {
//           console.error('Error completing task:', err);
//           res.status(500).json({ error: 'Failed to complete task' });
//       } else {
//           res.json({ message: 'Task completed successfully' });
//       }
//   });
// });





module.exports = router;