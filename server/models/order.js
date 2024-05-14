// /server/models/order.js
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
}

module.exports = Order;