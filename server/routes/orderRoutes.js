// /server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const Order = require('../models/order');
const TaskService = require('../services/taskService');
const db = new Database('./mydatabase.db');
const orderModel = new Order(db);

router.post('/', async (req, res) => {
    const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3 } = req.body;
    
    try {
        const rooms = await orderModel.findAvailableRoom(guests, date, startTime, endTime);
        if (!rooms.length) {
            return res.status(409).json({ error: 'No available rooms for the given number of guests and time slot' });
        }

        const orderId = await orderModel.createOrder({ ...req.body, roomId: rooms[0].roomId });
        TaskService.createTasksForOrder(orderId, rooms[0].roomId, date, startTime, endTime, servingTime);
        res.status(200).json({ message: 'Order created and room allocated successfully', orderId, roomId: rooms[0].roomId });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Database error while processing order' });
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

router.get('/order-room', async (req, res) => {
    try {
        const orderRooms = await orderModel.getOrderRooms();
        res.json(orderRooms);
    } catch (error) {
        console.error('Error retrieving order-room relations:', error);
        res.status(500).json({ error: 'Failed to retrieve order-room relations' });
    }
});

module.exports = router;
