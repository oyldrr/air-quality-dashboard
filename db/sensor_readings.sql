CREATE TABLE sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    
    pm1_cf1 INT,
    pm25_cf1 INT,
    pm10_cf1 INT,

    pm1_atm INT,
    pm25_atm INT,
    pm10_atm INT,

    is_connected BOOLEAN,
);
