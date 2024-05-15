//root/server.js

// Special requests er ikke i frontend, men hvis den skal bruges er der plads i DB.

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { initializeDatabase } = require('./server/database/databaseConfig');


// Database setup
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Database connected.');
    initializeDatabase(db); 
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/orders', require('./server/routes/orderRoutes')); 
app.use('/api/tasks', require('./server/routes/taskRoutes'));
app.use('/api/rooms', require('./server/routes/roomRoutes'));


// Frontend filer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});
app.get('/orderroom', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderRoom.html'));
});
app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

// Eksport af app og db initialisering. Bliver kun brugt i tests...
module.exports = {app, initializeDatabase};

// Start server med port 3000
if (require.main === module) {
  const port = 3000;
  app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
  });
}