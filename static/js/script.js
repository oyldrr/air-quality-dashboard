$(window).on('load', function() {

    // PM Gauges
    let pm1Gauge = new JustGage({
        id: "pm1-gauge",
        value: 0,
        min: 0,
        max: 150,
        title: "PM1.0",
        levelColors: ["#3498db"]
    });
    let pm25Gauge = new JustGage({
        id: "pm25-gauge",
        value: 0,
        min: 0,
        max: 150,
        title: "PM2.5",
        levelColors: ["#e74c3c"]
    });
    let pm10Gauge = new JustGage({
        id: "pm10-gauge",
        value: 0,
        min: 0,
        max: 300,
        title: "PM10",
        levelColors: ["#2ecc71"]
    });

    function fetchSensorData() {
        $.getJSON('/sensor', function(data) {
            if(data.connected){
                pm1Gauge.refresh(data.pm1);
                pm25Gauge.refresh(data.pm25);
                pm10Gauge.refresh(data.pm10);

                // AQI Bar
                const maxAQI = 500;
                const aqiPercent = Math.min(data.aqi, maxAQI)/maxAQI*100;
                $('#aqi-indicator').css('left', (100 - aqiPercent) + '%');

                $('header h1').text(`AQI: ${data.aqi}`);
            } else {
                pm1Gauge.refresh(0);
                pm25Gauge.refresh(0);
                pm10Gauge.refresh(0);
                $('#aqi-indicator').css('left','100%');
                $('header h1').text('AQI: --');
            }
        });
    }

    function fetchWeatherData() {
        $.getJSON('/weather', function(data) {
            $('#temp').text(data.temperature + ' °C');
            $('#humidity').text(data.humidity + ' %');
            $('#pressure').text(data.pressure + ' hPa');
            $('#wind').text(data.wind_speed + ' m/s');
            $('#condition').text(data.weather_desc);

            // Condition icon
            let cond = data.weather_desc.toLowerCase();
            if(cond.includes("sun") || cond.includes("clear")) {
                $('#condition-icon').attr("class","fa-solid fa-sun");
            } else if(cond.includes("cloud")) {
                $('#condition-icon').attr("class","fa-solid fa-cloud");
            } else if(cond.includes("rain")) {
                $('#condition-icon').attr("class","fa-solid fa-cloud-showers-heavy");
            } else if(cond.includes("snow")) {
                $('#condition-icon').attr("class","fa-solid fa-snowflake");
            } else {
                $('#condition-icon').attr("class","fa-solid fa-cloud-sun");
            }

            // Temp color
            let temp = data.temperature;
            if(temp < 0) $('#temp-icon').css('color','#00f');
            else if(temp < 15) $('#temp-icon').css('color','#0ff');
            else if(temp < 30) $('#temp-icon').css('color','#ff0');
            else $('#temp-icon').css('color','#f00');

            // Humidity color
            let hum = data.humidity;
            $('#humidity-icon').css('color', hum>70?'#00f':'#0f0');

            // Wind color
            let wind = data.wind_speed;
            $('#wind-icon').css('color', wind>10?'#f00':'#ff0');
        });
    }

    // İlk veri çekimi
    fetchSensorData();
    fetchWeatherData();

    // Her dakika güncelle
    setInterval(fetchSensorData, 60000);
    setInterval(fetchWeatherData, 60000);
});
