// /server/database/databaseConfig.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Database initialisering
function initializeDatabase(db) {
  const sqlSchema = fs.readFileSync('./sql/create_tables.sql', 'utf8');
  db.exec(sqlSchema, (error) => {
      if (error) {
          console.error('Failed to create tables', error);
      } else {
          console.log('Tables created successfully');
      }
  });
}

module.exports = { initializeDatabase };
