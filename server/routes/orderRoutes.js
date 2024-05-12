// /server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const db = new Database('./mydatabase.db');
const { createTasksForOrder } = require('../services/taskService');

router.post('/', async (req, res) => {
    const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3 } = req.body;
    
    try {
        // Dette SQL-spørgsmål tjekker for ledige lokaler, som ikke har nogen overlappende arrangementer
        const query = `
            SELECT roomId FROM rooms 
            WHERE capacity >= ? AND roomId NOT IN (
                SELECT roomId FROM orderRoom 
                WHERE date = ? AND (
                    (startTime < ? AND endTime > ?) OR 
                    (startTime < ? AND endTime > ?) OR 
                    (startTime >= ? AND endTime <= ?)
                )
            )
            LIMIT 1;
        `;

        const room = await db.query(query, [guests, date, endTime, startTime, endTime, endTime, startTime, startTime]);
        
        if (!room.length) {
            return res.status(409).json({ error: 'No available rooms for the given number of guests and time slot' });
        }

        const orderId = await db.run(`
            INSERT INTO orders (eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3]);

        await db.run(`
            INSERT INTO orderRoom (orderId, roomId, date, startTime, endTime)
            VALUES (?, ?, ?, ?, ?);
        `, [orderId, room[0].roomId, date, startTime, endTime]);

        await createTasksForOrder(orderId, room[0].roomId, date, startTime, endTime, servingTime);
        res.status(200).json({ message: 'Order created and room allocated successfully', orderId, roomId: room[0].roomId });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Database error while processing order' });
    }
});


router.get('/', async (req, res) => {
    try {
        const orders = await db.query('SELECT * FROM orders');
        res.json(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

router.get('/rooms', async (req, res) => {
    try {
        const rooms = await db.query('SELECT * FROM rooms');
        res.json(rooms);
    } catch (error) {
        console.error('Error retrieving rooms:', error);
        res.status(500).json({ error: 'Failed to retrieve rooms' });
    }
});

router.get('/order-room', async (req, res) => {
    try {
        const orderRooms = await db.query('SELECT * FROM orderRoom');
        res.json(orderRooms);
    } catch (error) {
        console.error('Error retrieving order-room relations:', error);
        res.status(500).json({ error: 'Failed to retrieve order-room relations' });
    }
});

module.exports = router;
