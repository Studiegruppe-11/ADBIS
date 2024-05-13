// /server/models/room.js
class Room {
    constructor(db) {
        this.db = db;
    }

    async getAllRooms() {
        const query = "SELECT * FROM rooms";
        return await this.db.query(query);
    }

    async getRoomDetails(roomId) {
        const query = "SELECT * FROM rooms WHERE roomId = ?";
        return await this.db.query(query, [roomId]);
    }

    // /server/models/room.js
    async checkRoomAvailability(roomId, date, startTime, endTime) {
        let query;
        let params;
        if (roomId) {
            query = `
                SELECT * FROM orderRoom 
                WHERE roomId = ? AND date = ? AND (
                    (startTime < ? AND endTime > ?) OR 
                    (startTime < ? AND endTime > ?) OR 
                    (startTime >= ? AND endTime <= ?)
                ) LIMIT 1;
            `;
            params = [roomId, date, endTime, startTime, endTime, endTime, startTime, startTime];
        } else {
            query = `
                SELECT roomId FROM rooms WHERE roomId NOT IN (
                    SELECT roomId FROM orderRoom 
                    WHERE date = ? AND (
                        (startTime < ? AND endTime > ?) OR 
                        (startTime < ? AND endTime > ?) OR 
                        (startTime >= ? AND endTime <= ?)
                    )
                ) LIMIT 1;
            `;
            params = [date, endTime, startTime, endTime, endTime, startTime, startTime];
        }
        const result = await this.db.query(query, params);
        return { available: result.length > 0, roomId: result.length > 0 ? result[0].roomId : null };
    }

}

module.exports = Room;
