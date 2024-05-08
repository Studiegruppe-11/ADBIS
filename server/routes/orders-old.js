// server/routes/orders.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Opret forbindelse til SQLite-database
const db = new sqlite3.Database('./mydatabase.db');

// GET endpoint for at hente opgaveliste til tjenerne
router.get('/tasks', (req, res) => {
  // Hent relevante oplysninger fra databasen for at generere opgavelisten
  db.all('SELECT id, date, time, guests, special_requests FROM orders WHERE completed = 0', (error, tasks) => {
    if (error) {
      console.error('Fejl ved hentning af opgaveliste:', error);
      res.status(500).json({ error: 'Fejl ved hentning af opgaveliste' });
    } else {
      // Formatér opgavelisten som ønsket, f.eks. som en liste af opgaver
      const taskList = tasks.map(task => ({
        id: task.id,
        description: `Server ${task.guests} gæster kl. ${task.time} på ${task.date} (${task.special_requests})`
      }));
      res.json(taskList);
    }
  });
});

// POST endpoint for at placere en ordre
router.post('/', (req, res) => {
  const { date, time, guests, specialRequests, menu } = req.body;
  
  // Indsæt ordren i databasen
  db.run('INSERT INTO orders (date, time, guests, special_requests, menu) VALUES (?, ?, ?, ?, ?)',
    [date, time, guests, specialRequests, menu],
    function(error) {
      if (error) {
        console.error('Fejl ved oprettelse af ordre:', error);
        res.status(500).json({ error: 'Fejl ved oprettelse af ordre' });
      } else {
        res.json({ id: this.lastID, date, time, guests, specialRequests, menu });
      }
    }
  );
});

// GET endpoint for at hente alle ordrer
router.get('/', (req, res) => {
  // Hent alle ordrer fra databasen
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
