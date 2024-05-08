//root/server.js

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');



//SQLite
const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/chinook.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the chinook database.');
});

db.serialize(() => {
  db.each(`SELECT PlaylistId as id,
                  Name as name
           FROM playlists`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.id + "\t" + row.name);
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});









// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sti til frontend-filer
app.use(express.static(path.join(__dirname, 'public')));


// Sti til backend-ruter
app.use('/api/orders', require('./server/routes/orders')); // Opretter ruten /api/orders

// Startside route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index1.html'));
});

// Start serveren
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveren kører på http://localhost:${port}`);
});

