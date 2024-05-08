DROP TABLE IF EXISTS orders;

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventName TEXT,
    date TEXT,
    startTime TEXT,
    endTime TEXT,
    servingTime TEXT,
    guests INTEGER,
    specialRequests TEXT,
    menu1 INTEGER DEFAULT 0,
    menu2 INTEGER DEFAULT 0,
    menu3 INTEGER DEFAULT 0
);
