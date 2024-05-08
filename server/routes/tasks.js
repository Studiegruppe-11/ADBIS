// server/routes/tasks.js
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

module.exports = router;
