import dotenv from 'dotenv'

// Load environment variables FIRST
dotenv.config()

import weatherService from './services/weatherService'

const testWeatherService = async () => {
  console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'Set' : 'Not set')
  console.log('API Key length:', process.env.OPENWEATHER_API_KEY?.length || 0)
  try {
    console.log('🌤️ Testing Weather Service...\n')

    // Test 1: Get coordinates for a location
    console.log('1. Testing geocoding for "Paris, France"...')
    const coordinates = await weatherService.getCoordinates('Paris, France')
    if (coordinates) {
      console.log(`✅ Coordinates found: ${coordinates.lat}, ${coordinates.lng}`)
    } else {
      console.log('❌ Failed to get coordinates')
      return
    }

    // Test 2: Get weather forecast
    console.log('\n2. Testing weather forecast for Paris...')
    const startDate = new Date().toISOString().split('T')[0] // Today
    const endDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days later

    const weatherData = await weatherService.getWeatherForecast(
      coordinates.lat,
      coordinates.lng,
      startDate,
      endDate
    )

    if (weatherData && weatherData.length > 0) {
      console.log(`✅ Weather forecast retrieved: ${weatherData.length} days`)
      console.log('\n📊 Sample weather data for first day:')
      const firstDay = weatherData[0]
      console.log(`   Date: ${firstDay.date}`)
      console.log(`   Conditions: ${firstDay.conditions}`)
      console.log(`   Temperature: ${firstDay.temperature.min}° - ${firstDay.temperature.max}°${firstDay.temperature.unit}`)
      console.log(`   Precipitation: ${firstDay.precipitation}%`)
      console.log(`   Humidity: ${firstDay.humidity}%`)
      console.log(`   Wind Speed: ${firstDay.windSpeed} km/h`)
      console.log(`   UV Index: ${firstDay.uvIndex}`)
      console.log(`   Icon: ${firstDay.icon}`)
      if (firstDay.recommendations && firstDay.recommendations.length > 0) {
        console.log(`   Recommendations: ${firstDay.recommendations.join(', ')}`)
      }
    } else {
      console.log('❌ Failed to get weather forecast')
    }

    console.log('\n🎉 Weather service test completed!')

  } catch (error: any) {
    console.error('❌ Error testing weather service:', error.message)
  }
}

testWeatherService()
