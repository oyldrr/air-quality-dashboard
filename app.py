from flask import Flask, render_template, jsonify, request
import random
from datetime import datetime
import mysql.connector
import threading
import time
import requests

app = Flask(__name__)


db_config = {
    "host": "localhost",
    "user": "root",
    "password": "password",       
    "database": "air-quality-dashboard" 
}

def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/sensor")
def get_sensor_data():
    sensor_connected = random.choice([True, True, True, False])
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not sensor_connected:
        data = {
            "connected": False,
            "pm1_cf1": None,
            "pm25_cf1": None,
            "pm10_cf1": None,
            "pm1_atm": None,
            "pm25_atm": None,
            "pm10_atm": None,
            "timestamp": timestamp
        }
    else:
        data = {
            "connected": True,
            "pm1_cf1": random.randint(1, 20),
            "pm25_cf1": random.randint(5, 60),
            "pm10_cf1": random.randint(10, 120),
            "pm1_atm": random.randint(1, 25),
            "pm25_atm": random.randint(5, 65),
            "pm10_atm": random.randint(10, 130),
            "timestamp": timestamp
        }


    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sensor_readings 
            (timestamp, pm1_cf1, pm25_cf1, pm10_cf1, pm1_atm, pm25_atm, pm10_atm, is_connected)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            timestamp,
            data["pm1_cf1"],
            data["pm25_cf1"],
            data["pm10_cf1"],
            data["pm1_atm"],
            data["pm25_atm"],
            data["pm10_atm"],
            sensor_connected
        ))
        conn.commit()
        cursor.close()
        conn.close()
        print(request.host," - - [",datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"]", "Stored in database")
    except Exception as e:
        print("DB Error:", e)

    return jsonify(data)


@app.route("/weather")
def get_weather_data():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = {
        "temperature": round(random.uniform(0, 20), 1),
        "humidity": random.randint(30, 90),
        "pressure": random.randint(980, 1030),
        "wind_speed": round(random.uniform(0, 10), 1),
        "aqi": random.randint(20, 150),
        "weather_desc": random.choice(["Clear", "Cloudy", "Rain", "Snow"]),
        "timestamp": timestamp
    }


    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO weather_readings
            (timestamp, temperature, humidity, pressure, wind_speed, aqi, weather_desc)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            timestamp,
            data["temperature"],
            data["humidity"],
            data["pressure"],
            data["wind_speed"],
            data["aqi"],
            data["weather_desc"]
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("DB Error:", e)

    return jsonify(data)


def auto_fetch_data():
    while True:
        try:
            requests.get(request.host_url+"/sensor")
            requests.get(request.host_url+"/weather")
        except Exception as e:
            print("Auto fetch error:", e)
        time.sleep(600) 

threading.Thread(target=auto_fetch_data, daemon=True).start()

if __name__ == "__main__":
    app.run(debug=True)
