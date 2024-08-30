// /tests/server.test.js
const request = require('supertest');
const { app } = require('../server'); // Path til vores server.js

// Test af oprettelse af ordre og lokaler
describe('Order API Endpoint Tests', () => {
    it('should create an order and allocate a room successfully', async () => {
        const orderData = {
            eventName: 'Firmajulefrokost',
            date: '2024-12-24',
            startTime: '18:00',
            endTime: '23:00',
            servingTime: '19:00',
            guests: 50,
            menu1: 20,
            menu2: 15,
            menu3: 15
        };

        const res = await request(app)
            .post('/api/orders')
            .send(orderData)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Order created and room allocated successfully');
        expect(res.body).toHaveProperty('orderId');
        expect(res.body).toHaveProperty('roomId');
    });
});
// Test til oprettelse af opgave
describe('Task API Endpoint Tests', () => {
    it('should retrieve all tasks successfully', async () => {
        const res = await request(app)
            .get('/api/tasks/tasks')
            .expect(200);

        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
    // Test til markering af opgave som færdig
    it('should mark a task as completed', async () => {
        const taskId = 5; // ID til eksisterende task i databasen
        const res = await request(app)
            .post(`/api/tasks/tasks/${taskId}/complete`)
            .expect(200);

        expect(res.body).toEqual({ message: 'Task completed successfully' });
    });
});