const express = require('express');
const app = express();
const port = 3000;

// Definerer en simpel rute
app.get('/', (req, res) => {
  res.send('Hej verden!');
});

// Starter serveren
app.listen(port, () => {
  console.log(`Serveren kører på http://localhost:${port}`);
});