// /server/services/taskService.js

const Database = require('../database/database');
const db = new Database('./mydatabase.db');

async function createTasksForOrder(orderId, roomId, date, startTime, endTime, servingTime) {
    const tasks = [
        { description: "Klargøring af lokale", time: new Date(`${date}T${startTime}:00Z`).toISOString() },
        { description: "Vand på bordene", time: new Date(`${date}T${startTime}:00Z`).toISOString() },
        { description: "Servere frokost", time: new Date(`${date}T${servingTime}:00Z`).toISOString() },
        { description: "Rengøring af lokale", time: new Date(`${date}T${endTime}:00Z`).toISOString() }
    ];

    try {
        for (const task of tasks) {
            const taskId = await db.run('INSERT INTO tasks (description, startTime, endTime, date, roomId) VALUES (?, ?, ?, ?, ?)', [task.description, task.time, task.time, date, roomId]);
            await db.run('INSERT INTO orderTasks (orderId, taskId, roomId) VALUES (?, ?, ?)', [orderId, taskId, roomId]);
        }
    } catch (error) {
        console.error('Error creating tasks for order:', error);
        throw error;
    }
}

module.exports = { createTasksForOrder };
