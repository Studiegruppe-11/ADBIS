// server/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Simuleret database af ordrer
let orders = [];

// POST endpoint for at placere en ordre
router.post('/orders', (req, res) => {
  const { date, time, guests, specialRequests, menu } = req.body;
  const id = orders.length + 1; // Simpel id-generering
  const order = new Order(id, date, time, guests, specialRequests, menu);
  orders.push(order);
  res.json(order);
});

// GET endpoint for at hente alle ordrer
router.get('/orders', (req, res) => {
  res.json(orders);
});

module.exports = router;

