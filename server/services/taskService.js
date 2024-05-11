// /server/services/taskService.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydatabase.db');

async function createTasksForOrder(orderId, roomId, date, startTime, endTime, servingTime) {
    // Implementering af logik for oprettelse af opgaver

     // Opret Date objekter i UTC
     const eventDateUTC = new Date(`${date}T${startTime}:00Z`); // Antager, at tiden er i UTC
     const setupTimeUTC = new Date(eventDateUTC.getTime() - 15 * 60000); // 15 minutter før
     const waterTimeUTC = new Date(eventDateUTC.getTime() - 10 * 60000); // 10 minutter før
     const servingTimeUTC = new Date(`${date}T${servingTime}:00Z`); // Serveringstid i UTC
     const cleaningTimeUTC = new Date(`${date}T${endTime}:00Z`); // Sluttid i UTC
 
     const tasks = [
         { description: "Klargøring af lokale", time: setupTimeUTC.toISOString() },
         { description: "Vand på bordene", time: waterTimeUTC.toISOString() },
         { description: "Servere frokost", time: servingTimeUTC.toISOString() },
         { description: "Rengøring af lokale", time: cleaningTimeUTC.toISOString() }
     ];
 
     // Indsæt opgaver i databasen
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
}

module.exports = { createTasksForOrder };
