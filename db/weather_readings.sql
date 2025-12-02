CREATE TABLE weather_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    temperature FLOAT,
    humidity INT,
    pressure INT,
    wind_speed FLOAT,
);
