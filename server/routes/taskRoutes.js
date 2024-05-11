// /server/routes/taskRoute.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydatabase.db');
const { createTasksForOrder } = require('../services/taskService');

// endpoint til at se alle opgaver
router.get('/tasks', (req, res) => {
    console.log("Fetching tasks...")
    const query = `
    SELECT tasks.*, orderRoom.roomId, orders.guests FROM tasks 
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
router.post('/:taskId/toggle', (req, res) => {
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
