// No abusen porfa :)
const apiKey = "305b04322e310a137fa31a0d2d35e694";

// Elementos del DOM
const cityName = document.getElementById("city-name");
const rainChance = document.getElementById("rain-chance");
const temperature = document.getElementById("temperature");
const realFeel = document.getElementById("real-feel");
const wind = document.getElementById("wind-speed");
const uvIndex = document.getElementById("uv-index");
const dayForecast = document.getElementById("today-forecast");
const weekForecast = document.getElementById("week-forecast");
const weatherIcon = document.getElementById("weather-icon");

const icons = {
  clear_day:
    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Sun.png",
  clear_night:
    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Crescent%20Moon.png",
  thunderstorm:
    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Lightning.png",
  rain: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Rain.png",
  snow: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Snow.png",
  fog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fog.png",
  cloudy:
    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud.png",
};

async function getLatLon(city) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`
    );
    const data = await response.json();
    return [data[0].lat, data[0].lon, data[0].name];
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    return null;
  }
}

async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es&exclude=minutely,alerts`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

function getWeatherCondition(id, icon) {
  id = String(id);
  if (id === "800") {
    return icon.endsWith("d")
      ? ["☀️", "Despejado", icons.clear_day]
      : ["🌙", "Despejado", icons.clear_night];
  }
  switch (id[0]) {
    case "2":
      return ["🌩️", "Tormenta", icons.thunderstorm];
    case "3":
      return ["🌧️", "Llovizna", icons.rain];
    case "5":
      return ["🌧️", "Lluvia", icons.rain];
    case "6":
      return ["🌨️", "Nieve", icons.snow];
    case "7":
      return ["🌫️", "Niebla", icons.fog];
    case "8":
      return ["☁️", "Nublado", icons.cloudy];
  }
}

function parseWeatherData(data, city) {
  const current = data.current;

  const today = [];
  for (let hour = 6; hour <= 21; hour += 3) {
    const hourData = data.hourly[hour];
    today.push({
      time: `${hour}:00`,
      temp: Math.round(hourData.temp),
      icon: getWeatherCondition(
        hourData.weather[0].id,
        hourData.weather[0].icon
      )[0],
    });
  }

  const week = [];
  for (let day = 0; day < 7; day++) {
    const dayData = data.daily[day];
    week.push({
      day: new Date(dayData.dt * 1000).toLocaleDateString("es-ES", {
        weekday: "short",
      }),
      temp_max: Math.round(dayData.temp.max),
      temp_min: Math.round(dayData.temp.min),
      icon: getWeatherCondition(
        dayData.weather[0].id,
        dayData.weather[0].icon
      )[0],
      desc: getWeatherCondition(
        dayData.weather[0].id,
        dayData.weather[0].icon
      )[1],
    });
  }

  return {
    city: city,
    temp: Math.round(current.temp),
    real_feel: Math.round(current.feels_like),
    wind: Math.round(current.wind_speed * 3.6),
    uv: current.uvi,
    icon: getWeatherCondition(
      current.weather[0].id,
      current.weather[0].icon
    )[2],
    rainChance: data.daily[0].pop * 100,
    today: today,
    week: week,
  };
}

function createDayForecastElements(today) {
  const template = document.getElementById("today-forecast-template");
  dayForecast.innerHTML = "";

  today.forEach((hour) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".day-time").textContent = hour.time;
    clone.querySelector(".day-icon").textContent = hour.icon;
    clone.querySelector(".day-temp").textContent = `${hour.temp} °C`;

    if (hour === today[today.length - 1]) {
      clone.querySelector(".day-forecast").classList.remove("border-r");
    }

    dayForecast.appendChild(clone);
  });
}

function createWeekForecastElements(week) {
  const template = document.getElementById("week-row-template");
  weekForecast.querySelectorAll(".week-row").forEach((row) => row.remove());

  week.forEach((day) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".week-day").textContent = day.day;
    clone.querySelector(".week-icon").textContent = day.icon;
    clone.querySelector(".week-desc").textContent = day.desc;
    clone.querySelector(".week-max").textContent = `${day.temp_max}/`;
    clone.querySelector(".week-min").textContent = `${day.temp_min}`;

    if (day === week[week.length - 1]) {
      clone.querySelector(".week-row").classList.remove("border-b");
    }

    weekForecast.appendChild(clone);
  });
}

function updatePage(weather) {
  cityName.innerHTML = weather.city;
  temperature.innerHTML = `${weather.temp} °C`;
  realFeel.innerHTML = `${weather.real_feel} °C`;
  wind.innerHTML = `${weather.wind} km/h`;
  uvIndex.innerHTML = weather.uv;
  rainChance.innerHTML = `${weather.rainChance}%`;
  weatherIcon.querySelector("img").src = weather.icon;
  createDayForecastElements(weather.today);
  createWeekForecastElements(weather.week);
}

(async () => {
  const [lat, lon, city] = await getLatLon("Coquimbo");
  const weatherData = await getWeather(lat, lon);
  const weather = parseWeatherData(weatherData, city);

  updatePage(weather);
})();
