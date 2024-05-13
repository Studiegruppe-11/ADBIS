// /server/models/order.js
class Order {
    constructor(db) {
        this.db = db;
    }

    async findAvailableRoom(guests, date, startTime, endTime) {
        const query = `
            SELECT roomId FROM rooms 
            WHERE capacity >= ? AND roomId NOT IN (
                SELECT roomId FROM orderRoom 
                WHERE date = ? AND (
                    (startTime < ? AND endTime > ?) OR 
                    (startTime < ? AND endTime > ?) OR 
                    (startTime >= ? AND endTime <= ?)
                )
            )
            LIMIT 1;
        `;
        const room = await this.db.query(query, [guests, date, endTime, startTime, endTime, endTime, startTime, startTime]);
        return room;
    }

    async createOrder(data) {
        const { eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3, roomId } = data;
        const orderId = await this.db.run(`
            INSERT INTO orders (eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [eventName, date, startTime, endTime, servingTime, guests, menu1, menu2, menu3]);

        await this.db.run(`
            INSERT INTO orderRoom (orderId, roomId, date, startTime, endTime)
            VALUES (?, ?, ?, ?, ?);
        `, [orderId, roomId, date, startTime, endTime]);

        return orderId;
    }

    async getAllOrders() {
        return await this.db.query('SELECT * FROM orders');
    }

    async getOrderRooms() {
        return await this.db.query('SELECT * FROM orderRoom');
    }
}

module.exports = Order;
