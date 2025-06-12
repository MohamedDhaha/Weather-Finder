const apiKey = "8e17ae225bab87eb0d656f04a50e9eb8";

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  fetchWeather(city);
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeather(null, latitude, longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function fetchWeather(city = null, lat = null, lon = null) {
  let url = city
    ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        alert(data.message);
        return;
      }
      updateUI(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    });
}

function updateUI(data) {
  document.getElementById("location").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("extra").textContent = `Humidity: ${data.main.humidity}% | Wind: ${data.wind.speed} m/s`;
  document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  document.body.style.background = getDynamicBackground(data.weather[0].main);
}

function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const forecastCards = document.getElementById("forecastCards");
      forecastCards.innerHTML = "";
      const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

      dailyData.forEach(item => {
        const date = new Date(item.dt_txt);
        const div = document.createElement("div");
        div.innerHTML = `
          <p>${date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" width="50">
          <p>${Math.round(item.main.temp)}°C</p>
        `;
        forecastCards.appendChild(div);
      });
    });
}

function getDynamicBackground(condition) {
  switch (condition.toLowerCase()) {
    case "clear":
      return "linear-gradient(to top, #0f2027, #203a43, #2c5364)";
    case "clouds":
      return "linear-gradient(to top, #2c3e50, #bdc3c7)";
    case "rain":
    case "drizzle":
      return "linear-gradient(to top, #232526, #414345)";
    case "thunderstorm":
      return "linear-gradient(to top, #141e30, #243b55)";
    case "snow":
      return "linear-gradient(to top, #83a4d4, #b6fbff)";
    default:
      return "radial-gradient(circle at top, #0f172a, #1e293b)";
  }
}
