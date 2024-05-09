-- /sql/create_tables.sql

-- sletter tabeller når serveren starter, så de kan oprettes fresh igen. Vi kan slå dette fra når vi er færdige med at teste

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS orderRoom;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS orderTasks;


-- Til oprettelse af ordre

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

-- Til allokkering af lokaler
CREATE TABLE IF NOT EXISTS rooms (
    roomId INTEGER PRIMARY KEY,
    capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orderRoom (
    orderRoomId INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    roomId INTEGER NOT NULL,
    date TEXT NOT NULL,  
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders (id),
    FOREIGN KEY (roomId) REFERENCES rooms (roomId)
);


-- Til oprettelse af opgaver

-- Opretter en tabel for opgaver
CREATE TABLE IF NOT EXISTS tasks (
    taskId INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER DEFAULT 0  -- 0 betyder ikke udført, 1 betyder udført
);

-- Opretter en sammenkoblingstabel mellem opgaver og ordrer
CREATE TABLE IF NOT EXISTS orderTasks (
    orderTaskId INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    taskId INTEGER NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders (id),
    FOREIGN KEY (taskId) REFERENCES tasks (taskId)
);

-- Standardværdier til lokaler
INSERT OR IGNORE INTO rooms (roomId, capacity) VALUES 
(1, 50), (2, 30), (3, 20), (4, 100), (5, 40), 
(6, 50), (7, 60), (9, 30), (11, 70), (13, 80), 
(15, 90), (17, 110), (19, 100);
