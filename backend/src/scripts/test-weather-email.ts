import mongoose from 'mongoose'
import Itinerary from '../models/Itinerary'
import { emailService } from '../services/emailService'
import * as dotenv from 'dotenv'

dotenv.config()

async function testWeatherEmail() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog')
    console.log('Connected to database')

    // Find an itinerary with weather data
    const itinerary = await Itinerary.findOne({
      weatherForecast: { $exists: true, $ne: null },
      status: 'completed'
    })

    if (!itinerary) {
      console.log('No itinerary with weather data found')
      return
    }

    console.log('Found itinerary:', itinerary.title)
    console.log('Weather data locations:', itinerary.weatherForecast?.map((w: any) => w.location).join(', '))

    // Generate email HTML
    const emailHtml = (emailService as any).generateItineraryHTMLTemplate(itinerary)
    console.log('Email HTML generated successfully')

    // Check if weather section is included
    const hasWeatherSection = emailHtml.includes('Weather Forecast')
    console.log('Weather section included:', hasWeatherSection)

    if (hasWeatherSection) {
      // Extract weather section for verification
      const weatherStart = emailHtml.indexOf('<!-- Weather Forecast -->')
      const weatherEnd = emailHtml.indexOf('<!-- Day Plans -->', weatherStart)
      const weatherSection = emailHtml.substring(weatherStart, weatherEnd)
      console.log('Weather section length:', weatherSection.length)
      console.log('Weather section preview:', weatherSection.substring(0, 500) + '...')
    }

    // Test sending email (commented out to avoid actually sending)
    // const result = await emailService.sendItineraryEmail('test@example.com', itinerary)
    // console.log('Email sent:', result)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from database')
  }
}

testWeatherEmail()
