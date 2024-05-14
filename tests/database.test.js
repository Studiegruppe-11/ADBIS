const sqlite3 = require('sqlite3').verbose();
const { initializeDatabase } = require('../server/database/databaseConfig');

let db;

// Initialiserer testmiljøet og databasen før alle tests køres
beforeAll(async () => {
    db = new sqlite3.Database(':memory:'); // Bruger en hukommelsesdatabase til test
    await initializeDatabase(db); // Initialiserer databasen med nødvendige tabeller
});

describe('Database Manipulation Tests', () => {
    let insertedOrderId;

    // Tester en ny ordre i databasen
    test('should insert a new order correctly', async () => {
        const sql = `INSERT INTO orders (eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = ['Test Event', '2025-01-01', '12:00', '15:00', '13:00', 100, 30, 30, 40];

        await new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err); // Håndterer fejl ved databaseoperation
                insertedOrderId = this.lastID; // Gemmer ID for den indsatte ordre
                expect(this.lastID).toBeDefined(); // Bekræfter at en ID er blevet genereret
                resolve();
            });
        });
    });

    // Tester opdatering af en ordre
    test('should update the order successfully', async () => {
        const updateSql = `UPDATE orders SET guests = ? WHERE id = ?`;
        const updateParams = [150, insertedOrderId];

        await new Promise((resolve, reject) => {
            db.run(updateSql, updateParams, function(err) {
                if (err) reject(err);
                expect(this.changes).toEqual(1); // Tjekker at en række er blevet opdateret
                resolve();
            });
        });

        // Verificerer opdateringen ved at tjekke den opdaterede værdi
        await new Promise((resolve, reject) => {
            db.get("SELECT guests FROM orders WHERE id = ?", [insertedOrderId], (err, row) => {
                if (err) reject(err);
                expect(row.guests).toEqual(150); // Bekræfter at antallet af gæster er opdateret
                resolve();
            });
        });
    });

    // Tester sletning af en ordre
    test('should delete the order successfully', async () => {
        const deleteSql = `DELETE FROM orders WHERE id = ?`;
        const deleteParams = [insertedOrderId];

        await new Promise((resolve, reject) => {
            db.run(deleteSql, deleteParams, function(err) {
                if (err) reject(err);
                expect(this.changes).toEqual(1); // Bekræfter at en række er blevet slettet
                resolve();
            });
        });

        // Verificerer at ordren er slettet
        await new Promise((resolve, reject) => {
            db.get("SELECT * FROM orders WHERE id = ?", [insertedOrderId], (err, row) => {
                if (err) reject(err);
                expect(row).toBeUndefined(); // Bekræfter at ingen rækker findes med det givne ID
                resolve();
            });
        });
    });
});

// Lukker databasen efter alle tests er færdige
afterAll(async () => {
    await new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            resolve();
        });
    });
});
