// /server/routes/roomRoutes.js
const express = require('express');
const router = express.Router();

const Database = require('../database/database');
const Room = require('../models/room');
const db = new Database('./mydatabase.db');

const roomModel = new Room(db);

// Henter alle lokaler
router.get('/', async (req, res) => {
    try {
        const rooms = await roomModel.getAllRooms();
        res.json(rooms);
    } catch (error) {
        console.error('Error retrieving rooms:', error);
        res.status(500).json({ error: 'Failed to retrieve rooms' });
    }
});

// Henter detaljer om et enkelt lokale
router.get('/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const roomDetails = await roomModel.getRoomDetails(roomId);
        if (roomDetails.length > 0) {
            res.json(roomDetails[0]);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        console.error('Error retrieving room details:', error);
        res.status(500).json({ error: 'Failed to retrieve room details' });
    }
});

// Tjek om et lokale er ledigt på en given dato og tid
router.get('/check-availability/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { date, startTime, endTime } = req.query;
    try {
        const isAvailable = await roomModel.checkRoomAvailability(roomId, date, startTime, endTime);
        res.json({ available: isAvailable });
    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).json({ error: 'Failed to check room availability' });
    }
});

module.exports = router;
