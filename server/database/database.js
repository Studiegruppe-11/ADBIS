// /server/database/database.js
const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) console.error('Error opening database:', err.message);
            else console.log('Database connected.');
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(error) {
                if (error) reject(error);
                else resolve(this.lastID);
            });
        });
    }    

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

module.exports = Database;
