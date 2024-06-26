// /server/models/task.js

// Klasse til opgaver
class Task {
    constructor(db) {
        this.db = db;
    }

    // Hent alle opgaver sammen med tilhørende ordre- og lokaleoplysninger
    async fetchAllTasksWithDetails() {
        const sql = `
            SELECT tasks.*, orderRoom.roomId, orders.guests FROM tasks 
            JOIN orderTasks ON tasks.taskId = orderTasks.taskId
            JOIN orders ON orderTasks.orderId = orders.id
            JOIN orderRoom ON orders.id = orderRoom.orderId
            ORDER BY tasks.date, tasks.startTime;
        `;
        return await this.db.query(sql);
    }

    // Afslut en opgave ved at sætte dens 'completed' status til 1
    async completeTask(taskId) {
        const sql = 'UPDATE tasks SET completed = 1 WHERE taskId = ?';
        return await this.db.run(sql, [taskId]);
    }

    // Skift fuldførelsesstatus for en opgave
    async toggleTaskCompletion(taskId) {
        const updateSql = 'UPDATE tasks SET completed = NOT completed WHERE taskId = ?';
        const selectSql = 'SELECT completed FROM tasks WHERE taskId = ?';
        await this.db.run(updateSql, [taskId]);
        return await this.db.query(selectSql, [taskId]);
    }

    // Hent alle relationer mellem opgaver og ordrer
    async fetchOrderTasks() {
        const sql = 'SELECT * FROM orderTasks';
        return await this.db.query(sql);
    }

    // Opret en ny opgave
    async createTasksForOrder(tasks) {
        try {
            for (const task of tasks) {
                const { description, startTime, endTime, date, roomId, orderId } = task;
                const taskId = await this.db.run(
                    'INSERT INTO tasks (description, startTime, endTime, date, roomId) VALUES (?, ?, ?, ?, ?)',
                    [description, startTime.toISOString(), endTime.toISOString(), date, roomId]
                );
                await this.db.run(
                    'INSERT INTO orderTasks (orderId, taskId, roomId) VALUES (?, ?, ?)',
                    [orderId, taskId, roomId]
                );
            }
        } catch (error) {
            console.error('Error creating tasks:', error);
            throw error;
        }
    }

    // Laver en liste af opgaver til en ordre
    async createTasksForOrder(orderId, roomId, date, startTime, endTime, servingTime) {
        const tasks = [
            { description: "Klargøring af lokale", time: this.convertToLocalTime(date, startTime, -15) },
            { description: "Vand på bordene", time: this.convertToLocalTime(date, startTime, -10) },
            { description: "Servere frokost", time: this.convertToLocalTime(date, servingTime, 0) },
            { description: "Rengøring af lokale", time: this.convertToLocalTime(date, endTime, 0) }
        ];

        try {
            for (const task of tasks) {
                const taskId = await this.db.run(
                    'INSERT INTO tasks (description, startTime, endTime, date, roomId) VALUES (?, ?, ?, ?, ?)', 
                    [task.description, task.time.toISOString(), task.time.toISOString(), date, roomId]
                );
                await this.db.run(
                    'INSERT INTO orderTasks (orderId, taskId, roomId) VALUES (?, ?, ?)', 
                    [orderId, taskId, roomId]
                );
            }
        } catch (error) {
            console.error('Error creating tasks for order:', error);
            throw error;
        }
    }

    convertToLocalTime(date, time, offsetMinutes) {
        const dateTime = new Date(date + 'T' + time);
        dateTime.setMinutes(dateTime.getMinutes() + offsetMinutes);
        return dateTime;
    }
}

module.exports = Task;
