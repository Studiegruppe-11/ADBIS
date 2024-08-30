// /server.js
// Special requests er ikke i frontend, men hvis den skal bruges er der plads i DB.

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { initializeDatabase } = require('./server/database/databaseConfig');

const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

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
app.use((req, res, next) => {
    req.io = io;
    next();
});

const orderRoutes = require('./server/routes/orderRoutes');
const taskRoutes = require('./server/routes/taskRoutes');
const roomRoutes = require('./server/routes/roomRoutes');

app.use('/api/orders', orderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/rooms', roomRoutes);

// Frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderList.html'));
});
app.get('/api/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderList.html'));
});
app.get('/orderroom', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderRoom.html'));
});
app.get('/api/orders/order-room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderRoom.html'));
});
app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});
app.get('/api/tasks/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});
app.get('/api/tasks/order-tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderTasks.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('newOrder', (data) => {
    io.emit('newOrder', data);
    io.emit('updateOrders');
    io.emit('updateTasks');
  });

  socket.on('taskCompleted', (data) => {
    io.emit('taskUpdated', data);
    io.emit('updateTasks');
  });
});

// Toggle task completion route
app.post('/api/tasks/:taskId/toggle', (req, res) => {
  const taskId = req.params.taskId;
  const query = 'UPDATE tasks SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END WHERE taskId = ?';
  
  db.run(query, [taskId], function(err) {
    if (err) {
      console.error('Error toggling task completion:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    } else {
      res.json({ success: true, completed: this.changes > 0 ? 1 : 0 });
    }
  });
});

// Start server with port 3000
if (require.main === module) {
  const port = 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Export for testing
module.exports = { app, initializeDatabase, io };