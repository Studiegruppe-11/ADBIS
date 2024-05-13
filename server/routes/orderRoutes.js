// /server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const Order = require('../models/order');
const Room = require('../models/room');
const Task = require('../models/task');

const db = new Database('./mydatabase.db');
const orderModel = new Order(db);
const roomModel = new Room(db);
const taskModel = new Task(db);  // Using the Task model directly

router.post('/', async (req, res) => {
    const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3 } = req.body;
    
    try {
        const availability = await roomModel.checkRoomAvailability(null, date, startTime, endTime);
        if (!availability.available) {
            return res.status(409).json({ error: 'No available rooms for the given number of guests and time slot' });
        }

        const orderId = await orderModel.createOrder({ ...req.body, roomId: availability.roomId });
        // Directly create tasks using the Task model now, instead of TaskService
        await taskModel.createTasksForOrder(orderId, availability.roomId, date, startTime, endTime, servingTime);
        res.status(200).json({ message: 'Order created and room allocated successfully', orderId, roomId: availability.roomId });
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
