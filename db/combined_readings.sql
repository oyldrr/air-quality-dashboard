CREATE TABLE combined_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    weather_id INT,
    timestamp DATETIME NOT NULL,

    FOREIGN KEY(sensor_id) REFERENCES sensor_readings(id),
    FOREIGN KEY(weather_id) REFERENCES weather_readings(id)
);
