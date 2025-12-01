$(document).ready(function () {
    $.getJSON("/history-data")
        .done(function (data) {
            const sensorData = data.sensor.reverse(); 
            const weatherData = data.weather.reverse();

            // PM Chart 
            const pmCtx = document.getElementById("pmChart").getContext("2d");
            const pmChart = new Chart(pmCtx, {
                type: "line",
                data: {
                    labels: sensorData.map((d) => {
                        const date = new Date(d.timestamp);
                        return (
                            date.getHours().toString().padStart(2, "0") +
                            ":" +
                            date.getMinutes().toString().padStart(2, "0")
                        );
                    }),
                    datasets: [
                        {
                            label: "PM1.0",
                            data: sensorData.map((d) => d.pm1_atm),
                            borderColor: "#3498db",
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: "PM2.5",
                            data: sensorData.map((d) => d.pm25_atm),
                            borderColor: "#e74c3c",
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: "PM10",
                            data: sensorData.map((d) => d.pm10_atm),
                            borderColor: "#2ecc71",
                            fill: false,
                            tension: 0.3,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: "#fff" } } },
                    scales: {
                        x: {
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" },
                        },
                        y: {
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" },
                        },
                    },
                },
            });


            // Weather Chart
            const weatherCtx = document
                .getElementById("weatherChart")
                .getContext("2d");
            const weatherChart = new Chart(weatherCtx, {
                type: "line",
                data: {
                    labels: weatherData.map((d) => {
                        const date = new Date(d.timestamp);
                        return (
                            date.getHours().toString().padStart(2, "0") +
                            ":" +
                            date.getMinutes().toString().padStart(2, "0")
                        );
                    }),
                    datasets: [
                        {
                            label: "Temperature (°C)",
                            data: weatherData.map((d) => d.temperature),
                            borderColor: "#FFD54F",
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: "Humidity (%)",
                            data: weatherData.map((d) => d.humidity),
                            borderColor: "#4FC3F7",
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: "Pressure (hPa)",
                            data: weatherData.map((d) => d.pressure),
                            borderColor: "#A5D6A7",
                            fill: false,
                            tension: 0.3,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: "#fff" } } },
                    scales: {
                        x: {
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" },
                        },
                        y: {
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" },
                        },
                    },
                },
            });
        })
        .fail(function (err) {
            console.error("Failed to fetch history data:", err);
        });
});