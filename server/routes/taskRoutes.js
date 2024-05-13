// /server/routes/taskRoute.js

const express = require('express');
const router = express.Router();

const Database = require('../database/database');
const Task = require('../models/task');
const db = new Database('./mydatabase.db');

const taskModel = new Task(db);

console.log("Task model loaded:", taskModel);

// Retrieve all tasks with their order and room details
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await taskModel.fetchAllTasksWithDetails();
        res.json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});

// Complete a specific task
router.post('/tasks/:taskId/complete', async (req, res) => {
    const { taskId } = req.params;
    try {
        await taskModel.completeTask(taskId);
        res.json({ message: 'Task completed successfully' });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
});

// Retrieve all tasks related to orders
router.get('/order-tasks', async (req, res) => {
    try {
        const results = await taskModel.fetchOrderTasks();
        res.json(results);
    } catch (error) {
        console.error('Error retrieving order-tasks relations:', error);
        res.status(500).json({ error: 'Failed to retrieve order-tasks relations' });
    }
});

// Toggle the completion status of a task
router.post('/:taskId/toggle', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await taskModel.toggleTaskCompletion(taskId);
        res.json({ message: 'Task completion toggled', taskId, completed: result[0].completed });
    } catch (error) {
        console.error('Error toggling task completion:', error);
        res.status(500).json({ error: 'Failed to toggle task completion' });
    }
});

module.exports = router;