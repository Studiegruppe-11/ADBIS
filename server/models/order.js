// /server/models/order.js

// Klasse til ordre
class Order {
    constructor(db) {
        this.db = db;
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

    async getOrderById(orderId) {
        const query = `
            SELECT orders.*, orderRoom.roomId 
            FROM orders 
            LEFT JOIN orderRoom ON orders.id = orderRoom.orderId 
            WHERE orders.id = ?
        `;
        const result = await this.db.query(query, [orderId]);
        return result[0];
    }
}

module.exports = Order;