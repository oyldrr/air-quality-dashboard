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
    packet_status VARCHAR(20),   -- valid / invalid / checksum_error
    checksum INT,
    read_duration_ms INT,
    device_id VARCHAR(50),
    firmware_version VARCHAR(20),
    location VARCHAR(100),
    error_code INT,
    data_quality VARCHAR(20),
    supply_voltage FLOAT,
    uptime_seconds INT
);
