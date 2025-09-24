// Configuración de la API del clima
const WEATHER_API_CONFIG = {
    API_KEY: '76c335c80985436eac192d8007276bc5',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    ICON_URL: 'https://openweathermap.org/img/wn'
};

class WeatherAPI {
    constructor() {
        this.apiKey = WEATHER_API_CONFIG.API_KEY;
        this.baseURL = WEATHER_API_CONFIG.BASE_URL;
        this.geoURL = WEATHER_API_CONFIG.GEO_URL;
    }

    async getCurrentWeather(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    async getForecast(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    async searchCity(cityName) {
        try {
            const response = await fetch(
                `${this.geoURL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.length === 0) {
                throw new Error('Ciudad no encontrada');
            }
            
            return data[0];
        } catch (error) {
            console.error('Error searching city:', error);
            throw error;
        }
    }

    getWeatherIcon(iconCode) {
        return `${WEATHER_API_CONFIG.ICON_URL}/${iconCode}@2x.png`;
    }
}

// Variables globales
let weatherAPI;
let currentLat, currentLon;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    weatherAPI = new WeatherAPI();
    
    // Event listener para búsqueda con Enter
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
});

// Funciones de UI
function showLoading() {
    document.getElementById('weather-loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('weather-loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.remove('hidden');
}

function closeErrorModal() {
    document.getElementById('error-modal').classList.add('hidden');
}

// Buscar ciudad
async function searchWeather() {
    const cityName = document.getElementById('cityInput').value.trim();
    if (!cityName) {
        showError('Por favor ingresa el nombre de una ciudad');
        return;
    }

    showLoading();
    try {
        const cityData = await weatherAPI.searchCity(cityName);
        currentLat = cityData.lat;
        currentLon = cityData.lon;
        
        await loadWeatherData(cityData.lat, cityData.lon, cityData.name, cityData.country);
    } catch (error) {
        showError('No se pudo encontrar la ciudad. Verifica el nombre e intenta de nuevo.');
    } finally {
        hideLoading();
    }
}

// Obtener ubicación actual
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('La geolocalización no es compatible con este navegador');
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                await loadWeatherData(currentLat, currentLon, 'Tu ubicación');
            } catch (error) {
                showError('Error al obtener el clima de tu ubicación');
            } finally {
                hideLoading();
            }
        },
        (error) => {
            hideLoading();
            showError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        }
    );
}

// Cargar datos del clima
async function loadWeatherData(lat, lon, cityName, country = '') {
    try {
        const [currentWeather, forecast] = await Promise.all([
            weatherAPI.getCurrentWeather(lat, lon),
            weatherAPI.getForecast(lat, lon)
        ]);

        updateCurrentWeather(currentWeather, cityName, country);
        updateHourlyForecast(forecast);
        updateWeeklyForecast(forecast);
        updateAirConditions(currentWeather);

    } catch (error) {
        showError('Error al cargar los datos del clima');
    }
}

// Actualizar clima actual
function updateCurrentWeather(weather, cityName, country) {
    const displayName = country ? `${cityName}, ${country}` : cityName;
    
    document.getElementById('city-name').textContent = displayName;
    document.getElementById('weather-date').textContent = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('temperature').textContent = `${Math.round(weather.main.temp)}°`;
    document.getElementById('weather-description').textContent = 
        weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1);
    document.getElementById('feels-like').textContent = `${Math.round(weather.main.feels_like)}°`;
    document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
    
    // Icono del clima con emoji basado en el código
    const iconEmoji = getWeatherEmoji(weather.weather[0].icon);
    document.getElementById('weather-icon').textContent = iconEmoji;
}

// Actualizar pronóstico por horas
function updateHourlyForecast(forecast) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    const next24Hours = forecast.list.slice(0, 8); // Próximas 8 mediciones (24 horas)
    
    hourlyContainer.innerHTML = next24Hours.map(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="bg-[#0B131E] rounded-xl p-3 text-center min-w-[80px]">
                <div class="text-gray-400 text-sm">${time}</div>
                <div class="text-2xl my-2">${getWeatherEmoji(item.weather[0].icon)}</div>
                <div class="text-white font-semibold">${Math.round(item.main.temp)}°</div>
            </div>
        `;
    }).join('');
}

// Actualizar pronóstico semanal
function updateWeeklyForecast(forecast) {
    const weeklyContainer = document.getElementById('weekly-forecast');
    
    // Agrupar por días
    const dailyForecasts = {};
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
    });
    
    const days = Object.keys(dailyForecasts).slice(0, 7);
    
    weeklyContainer.innerHTML = days.map(date => {
        const dayData = dailyForecasts[date];
        const maxTemp = Math.max(...dayData.map(d => d.main.temp_max));
        const minTemp = Math.min(...dayData.map(d => d.main.temp_min));
        const mainWeather = dayData[Math.floor(dayData.length / 2)].weather[0];
        
        const dayName = new Date(date).toLocaleDateString('es-ES', { weekday: 'short' });
        
        return `
            <div class="flex items-center justify-between text-white py-2">
                <span class="w-12">${dayName}</span>
                <span class="text-xl">${getWeatherEmoji(mainWeather.icon)}</span>
                <span class="text-right">
                    <span class="font-semibold">${Math.round(maxTemp)}°</span>
                    <span class="text-gray-400">${Math.round(minTemp)}°</span>
                </span>
            </div>
        `;
    }).join('');
}

// Actualizar condiciones del aire
function updateAirConditions(weather) {
    document.getElementById('wind-speed').textContent = `${Math.round(weather.wind?.speed * 3.6 || 0)} km/h`;
    document.getElementById('wind-direction').textContent = getWindDirection(weather.wind?.deg || 0);
    document.getElementById('pressure').textContent = `${weather.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(weather.visibility / 1000).toFixed(1)} km`;
    document.getElementById('uv-index').textContent = '--'; // La API gratuita no incluye UV index
}

// Obtener emoji del clima
function getWeatherEmoji(iconCode) {
    const iconMap = {
        '01d': '☀️',  // clear sky day
        '01n': '🌙',  // clear sky night
        '02d': '⛅',  // few clouds day
        '02n': '☁️',  // few clouds night
        '03d': '☁️',  // scattered clouds
        '03n': '☁️',
        '04d': '☁️',  // broken clouds
        '04n': '☁️',
        '09d': '🌧️',  // shower rain
        '09n': '🌧️',
        '10d': '🌦️',  // rain day
        '10n': '🌧️',  // rain night
        '11d': '⛈️',  // thunderstorm
        '11n': '⛈️',
        '13d': '❄️',  // snow
        '13n': '❄️',
        '50d': '🌫️',  // mist
        '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '🌤️';
}

// Obtener dirección del viento
function getWindDirection(degrees) {
    const directions = [
        'N', 'NNE', 'NE', 'ENE',
        'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW',
        'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}