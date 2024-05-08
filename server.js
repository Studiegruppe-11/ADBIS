const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sti til frontend-filer
app.use(express.static(path.join(__dirname, 'public')));


// Sti til backend-ruter
app.use('/api', require('./server/routes/orders'));


// Startside route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index1.html'));
  });





// Start serveren
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveren kører på http://localhost:${port}`);
});

