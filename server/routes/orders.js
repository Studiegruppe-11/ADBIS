// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

router.post('/', (req, res) => {
    const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3 } = req.body;
    
    db.run('INSERT INTO orders (eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3],
      function(error) {
        if (error) {
          console.error('Fejl ved oprettelse af ordre:', error);
          res.status(500).json({ error: 'Fejl ved oprettelse af ordre' });
        } else {
          res.status(200).json({ id: this.lastID, message: 'Ordre oprettet succesfuldt!' });
        }
      }
    );
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