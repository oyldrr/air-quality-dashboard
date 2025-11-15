CREATE TABLE weather_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,

    temperature FLOAT,
    humidity INT,
    pressure INT,
    wind_speed FLOAT,
    visibility INT,
    aqi INT,                     -- şehir AQI değeri
    weather_desc VARCHAR(50),
    rain_1h FLOAT,
    snow_1h FLOAT
);
