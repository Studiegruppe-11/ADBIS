// /server/services/taskService.js

const Database = require('../database/database');
const db = new Database('./mydatabase.db');

async function createTasksForOrder(orderId, roomId, date, startTime, endTime, servingTime) {
    // Konverterer tiden til et JavaScript Date objekt som lokal tid
    function convertToLocalTime(time) {
        return new Date(date + 'T' + time);
    }

    const prepTime = convertToLocalTime(startTime);
    prepTime.setMinutes(prepTime.getMinutes() - 15); // Klargøring af lokale 15 minutter før start

    const waterTime = convertToLocalTime(startTime);
    waterTime.setMinutes(waterTime.getMinutes() - 10); // Vand på bordene 10 minutter før start

    const servingTimeDate = convertToLocalTime(servingTime); // Serveringstidspunkt

    const cleaningTime = convertToLocalTime(endTime); // Rengøring starter ved endtime

    const tasks = [
        { description: "Klargøring af lokale", time: prepTime },
        { description: "Vand på bordene", time: waterTime },
        { description: "Servere frokost", time: servingTimeDate },
        { description: "Rengøring af lokale", time: cleaningTime }
    ];

    try {
        for (const task of tasks) {
            const taskId = await db.run(
                'INSERT INTO tasks (description, startTime, endTime, date, roomId) VALUES (?, ?, ?, ?, ?)', 
                [task.description, task.time.toISOString(), task.time.toISOString(), date, roomId]
            );
            await db.run(
                'INSERT INTO orderTasks (orderId, taskId, roomId) VALUES (?, ?, ?)', 
                [orderId, taskId, roomId]
            );
        }
    } catch (error) {
        console.error('Error creating tasks for order:', error);
        throw error;
    }
}


module.exports = { createTasksForOrder };
