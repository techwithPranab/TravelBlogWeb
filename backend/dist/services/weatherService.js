"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY || '';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        if (!this.apiKey) {
            console.warn('OPENWEATHER_API_KEY not configured - weather features will be disabled');
        }
    }
    /**
     * Get weather forecast for a location and date range
     */
    async getWeatherForecast(latitude, longitude, startDate, endDate) {
        if (!this.apiKey) {
            console.warn('Weather API key not configured, returning empty forecast');
            return [];
        }
        try {
            const forecast = [];
            // Get current weather for today
            const currentResponse = await axios_1.default.get(`${this.baseUrl}/weather`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    units: 'metric',
                    appid: this.apiKey
                },
                timeout: 10000
            });
            const currentData = currentResponse.data;
            const today = new Date().toISOString().split('T')[0];
            forecast.push(this.processCurrentWeatherData(currentData, today));
            // Get 5-day forecast for future days
            const forecastResponse = await axios_1.default.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    units: 'metric',
                    appid: this.apiKey
                },
                timeout: 10000
            });
            const forecastData = forecastResponse.data;
            // Group forecast data by date and get daily summaries
            const dailyData = {};
            forecastData.list.forEach((item) => {
                const date = new Date(item.dt * 1000).toISOString().split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = [];
                }
                dailyData[date].push(item);
            });
            // Process each day's forecast
            Object.keys(dailyData).forEach(date => {
                if (date !== today) { // Skip today since we already have current weather
                    const dayData = dailyData[date];
                    forecast.push(this.processForecastDayData(dayData, date));
                }
            });
            // Sort by date and limit to requested date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            return forecast
                .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= start && itemDate <= end;
            })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 7); // Limit to 7 days
        }
        catch (error) {
            console.error('Weather API error:', error.message);
            return [];
        }
    }
    /**
     * Process raw weather data into our WeatherData format
     */
    processWeatherData(rawData, date, isCurrent) {
        const weather = rawData.weather?.[0] || {};
        // Calculate UV index (if available)
        const uvIndex = rawData.uvi || 0;
        // Generate weather-based recommendations
        const recommendations = this.generateWeatherRecommendations(rawData, isCurrent);
        return {
            date,
            temperature: {
                min: Math.round(isCurrent ? rawData.temp : rawData.temp.min),
                max: Math.round(isCurrent ? rawData.temp : rawData.temp.max),
                unit: 'C'
            },
            conditions: weather.main || 'Unknown',
            description: weather.description || 'Weather data unavailable',
            precipitation: Math.round((rawData.pop || 0) * 100), // Probability of precipitation
            humidity: rawData.humidity || 0,
            windSpeed: Math.round(rawData.wind_speed || 0),
            uvIndex: Math.round(uvIndex),
            icon: weather.icon || '01d',
            recommendations
        };
    }
    /**
     * Generate weather-based activity recommendations
     */
    generateWeatherRecommendations(weatherData, isCurrent) {
        const recommendations = [];
        // Handle different data structures
        let temp;
        let conditions;
        let precipitation;
        let uvIndex;
        if (isCurrent) {
            // Current weather API structure
            temp = weatherData.main?.temp || weatherData.temp || 20;
            conditions = weatherData.weather?.[0]?.main?.toLowerCase() || '';
            precipitation = 0; // Current weather doesn't have precipitation probability
            uvIndex = 0; // Current weather doesn't have UV index
        }
        else {
            // Forecast API structure
            temp = weatherData.main?.temp || 20;
            conditions = weatherData.weather?.[0]?.main?.toLowerCase() || '';
            precipitation = (weatherData.pop || 0) * 100;
            uvIndex = 0; // Forecast API doesn't have UV index
        }
        // Temperature-based recommendations
        if (temp >= 30) {
            recommendations.push('Stay hydrated and wear light clothing');
            recommendations.push('Plan indoor activities during peak heat');
        }
        else if (temp >= 25) {
            recommendations.push('Perfect weather for outdoor activities');
        }
        else if (temp >= 15) {
            recommendations.push('Comfortable weather for sightseeing');
        }
        else if (temp >= 5) {
            recommendations.push('Cool weather - bring a light jacket');
        }
        else {
            recommendations.push('Cold weather - dress warmly');
        }
        // Precipitation-based recommendations
        if (precipitation > 70) {
            recommendations.push('High chance of rain - pack an umbrella');
            recommendations.push('Consider indoor alternatives for outdoor activities');
        }
        else if (precipitation > 40) {
            recommendations.push('Possible rain - check weather before outdoor plans');
        }
        // UV index recommendations
        if (uvIndex >= 8) {
            recommendations.push('Very high UV - use sunscreen and wear protective clothing');
        }
        else if (uvIndex >= 6) {
            recommendations.push('High UV - apply sunscreen regularly');
        }
        else if (uvIndex >= 3) {
            recommendations.push('Moderate UV - sunscreen recommended for extended outdoor time');
        }
        // Weather condition specific recommendations
        switch (conditions) {
            case 'clear':
                recommendations.push('Excellent weather for outdoor photography');
                break;
            case 'clouds':
                recommendations.push('Good weather for most activities');
                break;
            case 'rain':
                recommendations.push('Rain expected - plan indoor activities');
                break;
            case 'snow':
                recommendations.push('Snow conditions - check road and transport status');
                break;
            case 'thunderstorm':
                recommendations.push('Thunderstorms possible - stay indoors during storms');
                break;
        }
        return recommendations.slice(0, 3); // Limit to 3 recommendations
    }
    /**
     * Process current weather data from the current weather API
     */
    processCurrentWeatherData(data, date) {
        const weather = data.weather?.[0] || {};
        // Generate weather-based recommendations
        const recommendations = this.generateWeatherRecommendations(data, true);
        return {
            date,
            temperature: {
                min: Math.round(data.main.temp),
                max: Math.round(data.main.temp),
                unit: 'C'
            },
            conditions: weather.main || 'Unknown',
            description: weather.description || 'Weather data unavailable',
            precipitation: 0, // Current weather API doesn't provide precipitation probability
            humidity: data.main.humidity || 0,
            windSpeed: Math.round(data.wind?.speed || 0),
            uvIndex: 0, // Current weather API doesn't provide UV index
            icon: weather.icon || '01d',
            recommendations
        };
    }
    /**
     * Process forecast data for a day from the 5-day forecast API
     */
    processForecastDayData(dayData, date) {
        if (!dayData || dayData.length === 0) {
            return {
                date,
                temperature: { min: 0, max: 0, unit: 'C' },
                conditions: 'Unknown',
                description: 'Weather data unavailable',
                precipitation: 0,
                humidity: 0,
                windSpeed: 0,
                uvIndex: 0,
                icon: '01d',
                recommendations: []
            };
        }
        // Calculate daily min/max temperatures
        const temps = dayData.map(item => item.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        // Use midday forecast for main conditions (around 12:00)
        const middayForecast = dayData.find(item => {
            const hour = new Date(item.dt * 1000).getHours();
            return hour >= 11 && hour <= 13;
        }) || dayData[0];
        const weather = middayForecast.weather?.[0] || {};
        // Calculate average precipitation probability
        const avgPrecipitation = dayData.reduce((sum, item) => {
            return sum + (item.pop || 0);
        }, 0) / dayData.length;
        // Calculate average humidity
        const avgHumidity = Math.round(dayData.reduce((sum, item) => {
            return sum + (item.main.humidity || 0);
        }, 0) / dayData.length);
        // Calculate average wind speed
        const avgWindSpeed = Math.round(dayData.reduce((sum, item) => {
            return sum + (item.wind?.speed || 0);
        }, 0) / dayData.length);
        // Generate weather-based recommendations using midday data
        const recommendations = this.generateWeatherRecommendations(middayForecast, false);
        return {
            date,
            temperature: {
                min: Math.round(minTemp),
                max: Math.round(maxTemp),
                unit: 'C'
            },
            conditions: weather.main || 'Unknown',
            description: weather.description || 'Weather data unavailable',
            precipitation: Math.round(avgPrecipitation * 100),
            humidity: avgHumidity,
            windSpeed: avgWindSpeed,
            uvIndex: 0, // 5-day forecast API doesn't provide UV index
            icon: weather.icon || '01d',
            recommendations
        };
    }
    /**
     * Get coordinates for a city/location using OpenWeatherMap's geocoding API
     */
    async getCoordinates(location) {
        if (!this.apiKey) {
            return null;
        }
        try {
            const geoUrl = 'https://api.openweathermap.org/geo/1.0/direct';
            const response = await axios_1.default.get(geoUrl, {
                params: {
                    q: location,
                    limit: 1,
                    appid: this.apiKey
                },
                timeout: 5000
            });
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return { lat: parseFloat(lat), lng: parseFloat(lon) };
            }
            return null;
        }
        catch (error) {
            console.error('Geocoding API error:', error.message);
            return null;
        }
    }
}
exports.default = new WeatherService();
