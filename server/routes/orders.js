// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

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
                          res.status(200).json({ message: 'Order created and room allocated successfully', orderId: orderId, roomId: room.roomId });
                      }
                  });
              }
          });
      }
  });
});

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


module.exports = router;