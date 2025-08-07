
const API_KEY = 'e9ed6aaf80a344cfa5724630250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');

// 현재 날씨 요소들
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const currentTemp = document.getElementById('currentTemp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const forecastList = document.getElementById('forecastList');

// 이벤트 리스너
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// 페이지 로드 시 서울 날씨 표시
window.addEventListener('load', () => {
    getWeatherData('Seoul');
});

async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('도시명을 입력해주세요.');
        return;
    }
    
    await getWeatherData(city);
}

async function getWeatherData(city) {
    showLoading();
    hideError();
    
    try {
        // 현재 날씨와 예보 데이터를 동시에 가져오기
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&lang=ko`),
            fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&lang=ko`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('도시를 찾을 수 없습니다.');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData.forecast.forecastday);
        
        hideLoading();
        showWeatherContainer();
        
    } catch (error) {
        hideLoading();
        showError(error.message || '날씨 정보를 불러오는데 실패했습니다.');
    }
}

function displayCurrentWeather(data) {
    const { location, current } = data;
    
    // 도시명과 날짜
    cityName.textContent = `${location.name}, ${location.country}`;
    currentDate.textContent = formatDate(new Date());
    
    // 온도와 아이콘
    currentTemp.textContent = `${Math.round(current.temp_c)}°C`;
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    
    // 날씨 설명
    weatherDescription.textContent = current.condition.text;
    feelsLike.textContent = `체감온도: ${Math.round(current.feelslike_c)}°C`;
    
    // 상세 정보
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${current.wind_kph} km/h`;
    pressure.textContent = `${current.pressure_mb} hPa`;
    visibility.textContent = `${current.vis_km} km`;
}

function displayForecast(forecastDays) {
    forecastList.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const date = new Date(day.date);
        const dayName = index === 0 ? '오늘' : 
                       index === 1 ? '내일' : 
                       formatDayName(date);
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
            <div class="forecast-condition">${day.day.condition.text}</div>
            <div class="forecast-temps">
                <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        
        forecastList.appendChild(forecastItem);
    });
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('ko-KR', options);
}

function formatDayName(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()] + '요일';
}

function showLoading() {
    loading.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showWeatherContainer() {
    weatherContainer.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}
