//root/server.js


// OBS: HAR SAT DEN TIL AT DROPPE TABLES VED HVER RESTART AF SERVEREN (hvis vi skal ændre i kolonner)
// Special requests mangler i frontend, men kolonne er i databasen


const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Database setup
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Database connected.');
    initializeDatabase(); // Sikrer, at tabellerne er oprettet
  }
});

// Funktion til at oprette tabeller i databasen. Kører filen create_tables.sql
function initializeDatabase() {
  const sqlSchema = fs.readFileSync('./sql/create_tables.sql', 'utf8');
  db.exec(sqlSchema, (error) => {
      if (error) {
          console.error('Failed to create tables', error);
      } else {
          console.log('Tables created successfully');
      }
  });
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

app.use('/api/orders', require('./server/routes/orders')); // Brug den opdaterede route fil

// Frontend route
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html')); // Tjener den opdaterede HTML fil
});
app.get('/rooms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rooms.html')); // Tjener den opdaterede HTML fil
});
app.get('/orderroom', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orderRoom.html')); // Tjener den opdaterede HTML fil
});

// Server setup
const port = 3000; 
app.listen(port, () => {
    console.log(`Serveren kører på http://localhost:${port}`);
});