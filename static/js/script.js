$(window).on('load', function () {
    // Sayfa giriş animasyonu
    const section = document.getElementById("page-content");
    if (section) {
        section.classList.add("page-enter");
        setTimeout(() => {
            section.classList.add("page-enter-active");
        }, 20);
    }

    // AQI hesaplama fonksiyonu
    function calculateAQI(pm25, pm10) {
        function aqiFromPM(pm, breakpoints) {
            if (pm === null || pm === undefined) return 0;
            for (let i = 0; i < breakpoints.length; i++) {
                const bp = breakpoints[i];
                if (pm >= bp.cLow && pm <= bp.cHigh) {
                    const a = (bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow);
                    return a * (pm - bp.cLow) + bp.iLow;
                }
            }
            return 0;
        }

        const pm25Breakpoints = [
            { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
            { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
            { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
            { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
            { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
            { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
            { cLow: 350.5, cHigh: 500.0, iLow: 401, iHigh: 500 }
        ];

        const pm10Breakpoints = [
            { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
            { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
            { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
            { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
            { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
            { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
            { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 }
        ];

        const aqi_pm25 = aqiFromPM(pm25, pm25Breakpoints);
        const aqi_pm10 = aqiFromPM(pm10, pm10Breakpoints);

        return Math.round(Math.max(aqi_pm25 || 0, aqi_pm10 || 0));
    }

    // JustGage tanımları
    const pm1Gauge = new JustGage({
        id: "pm1-gauge",
        value: 0,
        min: 0,
        max: 150,
        title: "PM1.0",
        levelColors: ["#3498db"],
        labelFontColor: "#ffffff",
        titleFontColor: "#ffffff",
        valueFontColor: "#ffffff"
    });

    const pm25Gauge = new JustGage({
        id: "pm25-gauge",
        value: 0,
        min: 0,
        max: 150,
        title: "PM2.5",
        levelColors: ["#e74c3c"],
        labelFontColor: "#ffffff",
        titleFontColor: "#ffffff",
        valueFontColor: "#ffffff"
    });

    const pm10Gauge = new JustGage({
        id: "pm10-gauge",
        value: 0,
        min: 0,
        max: 300,
        title: "PM10",
        levelColors: ["#2ecc71"],
        labelFontColor: "#ffffff",
        titleFontColor: "#ffffff",
        valueFontColor: "#ffffff"
    });

    setTimeout(() => {
        try {
            const t1 = document.querySelector("#pm1-gauge .jg-title");
            const t2 = document.querySelector("#pm25-gauge .jg-title");
            const t3 = document.querySelector("#pm10-gauge .jg-title");
            if (t1) t1.style.fill = "#ffffff";
            if (t2) t2.style.fill = "#ffffff";
            if (t3) t3.style.fill = "#ffffff";
        } catch (e) { }
    }, 500);


    // Sensor verisi çekme
    function fetchSensorData() {
        $.getJSON('/sensor-data')
            .done(function (data) {
                const pm1 = data.pm1_atm ?? data.pm1_cf1 ?? 0;
                const pm25 = data.pm25_atm ?? data.pm25_cf1 ?? 0;
                const pm10 = data.pm10_atm ?? data.pm10_cf1 ?? 0;

                const statusEl = $('#sensor-status');


                if (data.connected) {
                    pm1Gauge.refresh(pm1);
                    pm25Gauge.refresh(pm25);
                    pm10Gauge.refresh(pm10);

                    const computedAQI = calculateAQI(pm25, pm10);
                    const aqi = typeof data.aqi === 'number' ? data.aqi : computedAQI;

                    $('header h1').text(`AQI: ${aqi}`);
                    $('#aqi-indicator').css('left', `${100 - (aqi / 500 * 100)}%`);

                    statusEl.text("Connected");
                    statusEl.removeClass("sensor-disconnected").addClass("sensor-connected");
                } else {
                    pm1Gauge.refresh(0);
                    pm25Gauge.refresh(0);
                    pm10Gauge.refresh(0);
                    $('header h1').text('AQI: --');
                    $('#aqi-indicator').css('left', '100%');
                    statusEl.text("Disconnected");
                    statusEl.removeClass("sensor-connected").addClass("sensor-disconnected");
                }
            })
            .fail(function (err) {
                console.error("Failed to fetch /sensor-data:", err);
                $('#sensor-status').text("Disconnected").removeClass("sensor-connected").addClass("sensor-disconnected");
                $('header h1').text('AQI: --');
            });
    }

    // Weather verisi çekme
    function fetchWeatherData() {
        $.getJSON('/weather-data')
            .done(function (data) {
                if (data.temperature !== undefined) $('#temp').text(data.temperature + ' °C');
                if (data.humidity !== undefined) $('#humidity').text(data.humidity + ' %');
                if (data.pressure !== undefined) $('#pressure').text(data.pressure + ' hPa');
                if (data.wind_speed !== undefined) $('#wind').text(data.wind_speed + ' m/s');
                if (data.weather_desc !== undefined) $('#condition').text(data.weather_desc);

                // Icon renkleri
                const desc = (data.weather_desc || '').toLowerCase();
                if (desc.includes("sun") || desc.includes("clear")) $('#condition-icon').attr("class", "fa-solid fa-sun").css("color", "#FFD54F");
                else if (desc.includes("cloud")) $('#condition-icon').attr("class", "fa-solid fa-cloud").css("color", "#B0BEC5");
                else if (desc.includes("rain") || desc.includes("shower")) $('#condition-icon').attr("class", "fa-solid fa-cloud-showers-heavy").css("color", "#4FC3F7");
                else if (desc.includes("snow")) $('#condition-icon').attr("class", "fa-solid fa-snowflake").css("color", "#E1F5FE");
                else if (desc.includes("storm") || desc.includes("thunder")) $('#condition-icon').attr("class", "fa-solid fa-cloud-bolt").css("color", "#FFB74D");
                else $('#condition-icon').attr("class", "fa-solid fa-cloud-sun").css("color", "#90CAF9");

                // Sıcaklık rengi
                const temp = Number(data.temperature);
                if (!isNaN(temp)) {
                    if (temp < 0) $('#temp-icon').css('color', '#00B0FF');
                    else if (temp < 15) $('#temp-icon').css('color', '#4FC3F7');
                    else if (temp < 30) $('#temp-icon').css('color', '#FFD54F');
                    else $('#temp-icon').css('color', '#FF7043');
                }

                // Nem rengi
                const hum = Number(data.humidity);
                if (!isNaN(hum)) $('#humidity-icon').css('color', hum > 70 ? '#42A5F5' : '#A5D6A7');

                // Rüzgar rengi
                const wind = Number(data.wind_speed);
                if (!isNaN(wind)) $('#wind-icon').css('color', wind > 10 ? '#EF5350' : '#FFF176');
            })
            .fail(function (err) {
                console.error("Failed to fetch /weather-data:", err);
            });
    }

    // İlk veri çekme
    fetchSensorData();
    fetchWeatherData();

    // Interval ile sürekli güncelle
    setInterval(fetchSensorData, 60000);
    setInterval(fetchWeatherData, 60000);
});
