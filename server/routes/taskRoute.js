// /server/routes/taskRoute.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

// Funktion til at oprette opgaver for en ordre
const createTasksForOrder = async (orderId, roomId, date, startTime, endTime, servingTime) => {
    const eventDateUTC = new Date(`${date}T${startTime}:00Z`);
    const setupTimeUTC = new Date(eventDateUTC.getTime() - 15 * 60000);
    const waterTimeUTC = new Date(eventDateUTC.getTime() - 10 * 60000);
    const servingTimeUTC = new Date(`${date}T${servingTime}:00Z`);
    const cleaningTimeUTC = new Date(`${date}T${endTime}:00Z`);

    const tasks = [
        { description: "Klargøring af lokale inkl. bordopdækning", time: setupTimeUTC.toISOString() },
        { description: "Vand klar på bordene", time: waterTimeUTC.toISOString() },
        { description: "Servere frokost", time: servingTimeUTC.toISOString() },
        { description: "Rengøring af lokale", time: cleaningTimeUTC.toISOString() }
    ];

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

router.get('/', (req, res) => {
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
            res.json(tasks);
        }
    });
});

router.post('/:taskId/complete', (req, res) => {
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
