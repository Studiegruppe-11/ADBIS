// /server/routes/taskRoute.js

const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const db = new Database('./mydatabase.db');

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await db.query(`
            SELECT tasks.*, orderRoom.roomId, orders.guests FROM tasks 
            JOIN orderTasks ON tasks.taskId = orderTasks.taskId
            JOIN orders ON orderTasks.orderId = orders.id
            JOIN orderRoom ON orders.id = orderRoom.orderId
            ORDER BY tasks.date, tasks.startTime;
        `);
        res.json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});

router.post('/tasks/:taskId/complete', async (req, res) => {
    const { taskId } = req.params;
    try {
        await db.run('UPDATE tasks SET completed = 1 WHERE taskId = ?', [taskId]);
        res.json({ message: 'Task completed successfully' });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
});


router.get('/order-tasks', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM orderTasks');
        res.json(results);
    } catch (error) {
        console.error('Error retrieving order-tasks relations:', error);
        res.status(500).json({ error: 'Failed to retrieve order-tasks relations' });
    }
});

router.post('/:taskId/toggle', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await db.run('UPDATE tasks SET completed = NOT completed WHERE taskId = ?', [taskId]);
        const updatedTask = await db.query('SELECT completed FROM tasks WHERE taskId = ?', [taskId]);
        res.json({ message: 'Task completion toggled', taskId, completed: updatedTask[0].completed });
    } catch (error) {
        console.error('Error toggling task completion:', error);
        res.status(500).json({ error: 'Failed to toggle task completion' });
    }
});


module.exports = router;
