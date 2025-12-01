from flask import Flask, render_template, jsonify, request, send_from_directory
import random
from datetime import datetime
import mysql.connector
import threading
import time
import requests
import struct
import serial

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

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.root_path, 'static/images/favicon.ico')

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/history")
def history_page():
    return render_template("history.html")

@app.route("/sensor")
def sensor_page():
    return render_template("sensor.html")

@app.route("/sensor-data")
def get_sensor_data():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        ser = serial.Serial("COM7", 9600, timeout=2)
        while True:
            b1 = ser.read(1)
            if b1 != b'\x42': continue
            b2 = ser.read(1)
            if b2 != b'\x4D': continue
            frame = ser.read(30)
            if len(frame) != 30: continue
            pm_data = frame[2:30]  # 28 byte veri
            data_parsed = struct.unpack(">HHHHHHHHHHHHHH", pm_data)
            pm1_cf1, pm25_cf1, pm10_cf1 = data_parsed[0], data_parsed[1], data_parsed[2]
            pm1_atm, pm25_atm, pm10_atm = data_parsed[3], data_parsed[4], data_parsed[5]
            sensor_connected = True
            break
    except:
        sensor_connected = False
        pm1_cf1 = pm25_cf1 = pm10_cf1 = None
        pm1_atm = pm25_atm = pm10_atm = None

    data = {
        "connected": sensor_connected,
        "pm1_cf1": pm1_cf1,
        "pm25_cf1": pm25_cf1,
        "pm10_cf1": pm10_cf1,
        "pm1_atm": pm1_atm,
        "pm25_atm": pm25_atm,
        "pm10_atm": pm10_atm,
        "timestamp": timestamp
    }

    if sensor_connected:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sensor_readings 
                (timestamp, pm1_cf1, pm25_cf1, pm10_cf1, pm1_atm, pm25_atm, pm10_atm, is_connected)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                timestamp,
                pm1_cf1,
                pm25_cf1,
                pm10_cf1,
                pm1_atm,
                pm25_atm,
                pm10_atm,
                True
            ))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("DB Error:", e)

    return jsonify(data)



API_KEY = "0ec18d9840616f60ed241475f874e555" #
CITY = "Bydgoszcz,PL"
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

@app.route("/weather-data")
def get_weather_data():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = {}
    try:
        # OpenWeatherMap API'den veriyi çek
        resp = requests.get(BASE_URL, params={
            "q": CITY,
            "appid": API_KEY,
            "units": "metric"
        })
        api_data = resp.json()

        if resp.status_code != 200:
            raise Exception(f"OpenWeatherMap API error: {api_data.get('message', 'Unknown error')}")
        
        # Verileri ayıkla
        data = {
            "temperature": api_data["main"]["temp"],
            "humidity": api_data["main"]["humidity"],
            "pressure": api_data["main"]["pressure"],
            "wind_speed": api_data["wind"]["speed"],
            "weather_desc": api_data["weather"][0]["description"],
            "timestamp": timestamp
        }

        # DB'ye kaydet
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO weather_readings
            (timestamp, temperature, humidity, pressure, wind_speed, weather_desc)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            timestamp,
            data["temperature"],
            data["humidity"],
            data["pressure"],
            data["wind_speed"],
            data["weather_desc"]
        ))
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print("Weather fetch/store error:", e)
    return jsonify(data)

def auto_fetch_data():
    host = "http://127.0.0.1:5000"
    while True:
        try:
            requests.get(f"{host}/sensor-data")
            requests.get(f"{host}/weather-data")
        except Exception as e:
            print("Auto fetch error:", e)
        time.sleep(60) 


threading.Thread(target=auto_fetch_data, daemon=True).start()

@app.route("/history-data")
def history_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Sensor history
        cursor.execute("""
            SELECT id, timestamp, pm1_atm, pm25_atm, pm10_atm, is_connected
            FROM sensor_readings
            ORDER BY id DESC
            LIMIT 500
        """)
        sensor_history = cursor.fetchall()

        # Weather history
        cursor.execute("""
            SELECT id, timestamp, temperature, humidity, pressure, wind_speed, weather_desc
            FROM weather_readings
            ORDER BY id DESC
            LIMIT 500
        """)
        weather_history = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "sensor": sensor_history,
            "weather": weather_history
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
