// /server/routes/taskRoutes.js
const express = require('express');
const Database = require('../database/database');
const Task = require('../models/task');

const db = new Database('./mydatabase.db');
const taskModel = new Task(db);

const router = express.Router();

// Henter alle opgaver
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await taskModel.fetchAllTasksWithDetails();
        res.json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});

// Markerer en opgave som færdig
router.post('/tasks/:taskId/complete', async (req, res) => {
    const { taskId } = req.params;
    try {
        await taskModel.completeTask(taskId);
        io.emit('taskUpdated', { taskId, completed: true });
        res.json({ message: 'Task completed successfully' });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
});

// Henter alle opgaver med tilhørende ordre
router.get('/order-tasks', async (req, res) => {
    try {
        const results = await taskModel.fetchOrderTasks();
        res.json(results);
    } catch (error) {
        console.error('Error retrieving order-tasks relations:', error);
        res.status(500).json({ error: 'Failed to retrieve order-tasks relations' });
    }
});

module.exports = router;