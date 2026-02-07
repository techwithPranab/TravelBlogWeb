'use client'

import React from 'react'

interface WeatherData {
  date: string
  temperature: {
    min: number
    max: number
    unit: 'C' | 'F'
  }
  conditions: string
  description: string
  precipitation: number
  humidity: number
  windSpeed: number
  uvIndex: number
  icon: string
  recommendations?: string[]
}

interface ForecastSummary {
  minTemp: number
  maxTemp: number
  avgMin: number
  avgMax: number
  conditions: string
  avgPrecipitation: number
  recommendations: string[]
  icon?: string
  unit?: 'C' | 'F'
  estimated?: boolean // Indicates if this is an estimated seasonal summary
}

interface WeatherForecast {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  // Legacy day-wise forecast (optional)
  forecast?: WeatherData[]
  // Aggregated forecast covering the trip duration (optional)
  dateRange?: { startDate: string, endDate: string }
  forecastSummary?: ForecastSummary | null
}

interface WeatherWidgetProps {
  weatherForecast: WeatherForecast[] | null
  className?: string
}

export default function WeatherWidget({ weatherForecast, className = '' }: WeatherWidgetProps) {
  if (!weatherForecast || weatherForecast.length === 0) {
    return null
  }

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string, icon: string) => {
    // Map OpenWeatherMap icons to emojis
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    }

    return iconMap[icon] || '🌤️'
  }

  // Get temperature color based on range
  const getTempColor = (temp: number, unit: 'C' | 'F') => {
    if (unit === 'C') {
      if (temp < 10) return 'text-blue-600'
      if (temp < 20) return 'text-green-600'
      if (temp < 30) return 'text-orange-600'
      return 'text-red-600'
    } else {
      if (temp < 50) return 'text-blue-600'
      if (temp < 68) return 'text-green-600'
      if (temp < 86) return 'text-orange-600'
      return 'text-red-600'
    }
  }

  // Get UV index description
  const getUVDescription = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600' }
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600' }
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600' }
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-600' }
    return { level: 'Extreme', color: 'text-purple-600' }
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌤️</span>
        <h2 className="text-lg sm:text-xl font-bold font-serif">Weather Forecast</h2>
      </div>

      <div className="space-y-4">
        {weatherForecast.map((locationWeather, locationIndex) => (
          <div key={locationIndex} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
              <span className="text-lg">📍</span>
              {locationWeather.location}
              {locationWeather.forecastSummary && locationWeather.forecastSummary.estimated && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-xs text-yellow-800">Estimated (seasonal)</span>
              )}
              {locationWeather.dateRange && (
                <span className="ml-2 text-xs text-gray-500">{`${new Date(locationWeather.dateRange.startDate).toLocaleDateString()} – ${new Date(locationWeather.dateRange.endDate).toLocaleDateString()}`}</span>
              )}
            </h3>

            {/* If aggregated forecast exists, show a single summary card */}
            {locationWeather.forecastSummary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-4 border col-span-1 sm:col-span-1 lg:col-span-1 flex items-center gap-3">
                  <div className="text-4xl">{getWeatherIcon(locationWeather.forecastSummary.conditions || '', locationWeather.forecastSummary.icon || '')}</div>
                  <div>
                    <div className={`text-lg sm:text-xl font-bold ${getTempColor(locationWeather.forecastSummary.maxTemp, (locationWeather.forecastSummary.unit || 'C'))}`}>
                      {Math.round(locationWeather.forecastSummary.maxTemp)}°{(locationWeather.forecastSummary.unit || 'C')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">{Math.round(locationWeather.forecastSummary.minTemp)}°{(locationWeather.forecastSummary.unit || 'C')} (min)</div>
                    <div className="text-xs text-gray-600 mt-1 capitalize">{locationWeather.forecastSummary.conditions}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border col-span-1 sm:col-span-1 lg:col-span-1">
                  <div className="text-sm text-gray-700 font-medium mb-2">Avg precipitation</div>
                  <div className="text-2xl font-bold">{locationWeather.forecastSummary.avgPrecipitation}%</div>
                </div>

                <div className="bg-white rounded-lg p-4 border col-span-1 sm:col-span-1 lg:col-span-1">
                  <div className="text-sm text-gray-700 font-medium mb-2">Recommendations</div>
                  {locationWeather.forecastSummary.recommendations && locationWeather.forecastSummary.recommendations.length > 0 ? (
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {locationWeather.forecastSummary.recommendations.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-500">No specific recommendations</div>
                  )}
                </div>
              </div>

            ) : (
              // Legacy: day-wise forecast (show up to 7 days)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(locationWeather.forecast || []).slice(0, 7).map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-white rounded-lg p-3 border">
                    <div className="text-center mb-2">
                      <div className="text-2xl mb-1">
                        {getWeatherIcon(day.conditions, day.icon)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="text-center mb-2">
                      <div className={`text-lg sm:text-xl font-bold ${getTempColor(day.temperature.max, day.temperature.unit)}`}>
                        {Math.round(day.temperature.max)}°{day.temperature.unit}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {Math.round(day.temperature.min)}°{day.temperature.unit}
                      </div>
                    </div>

                    <div className="text-center mb-2">
                      <div className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                        {day.conditions}
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>💧</span>
                        <span>{day.precipitation}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💨</span>
                        <span>{day.windSpeed}km/h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💦</span>
                        <span>{day.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>☀️</span>
                        <span className={getUVDescription(day.uvIndex).color}>
                          {getUVDescription(day.uvIndex).level}
                        </span>
                      </div>
                    </div>

                    {day.recommendations && day.recommendations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-blue-600">
                          <strong>💡 Tip:</strong> {day.recommendations[0]}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Weather data provided by OpenWeatherMap
      </div>
    </div>
  )
}
