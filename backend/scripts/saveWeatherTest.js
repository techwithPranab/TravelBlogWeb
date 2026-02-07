const mongoose = require('mongoose')
const Itinerary = require('../dist/models/Itinerary').default
const aiItineraryService = require('../dist/services/aiItineraryService').default

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-blog'

async function run() {
  try {
    console.log('Connecting to', MONGO_URI)
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    const params = {
      source: 'Kolkata',
      destinations: ['Colombo'],
      startDate: new Date().toISOString().split('T')[0],
      duration: 4,
      includeWeatherReference: true
    }

    const weather = await aiItineraryService.testFetchWeather(params)
    console.log('Fetched weather:', weather ? weather.map(w => ({ location: w.location, forecastCount: w.forecast ? w.forecast.length : (w.forecastSummary ? 1 : 0), hasSummary: !!w.forecastSummary })) : 'none')

    // Create a test itinerary with weatherForecast
    const doc = new Itinerary({
      userId: new mongoose.Types.ObjectId(),
      source: 'TestSource',
      destinations: ['Colombo'],
      travelMode: 'air',
      adults: 1,
      children: 0,
      totalPeople: 1,
      numberOfRooms: 1,
      dietType: 'both',
      title: 'Weather Test',
      duration: 4,
      startDate: new Date(),
      endDate: new Date(),
      budget: 'moderate',
      interests: ['culture'],
      travelStyle: 'solo',
      status: 'completed',
      generatedBy: 'ai',
      aiModel: 'test',
      weatherForecast: weather
    })

    await doc.save()
    console.log('Saved itinerary id:', doc._id.toString())

    const fetched = await Itinerary.findById(doc._id).lean()
    const first = fetched.weatherForecast && fetched.weatherForecast[0]
    console.log('Fetched weather from DB (first location):', JSON.stringify(first ? { location: first.location, hasSummary: !!first.forecastSummary, dateRange: first.dateRange || null, summary: first.forecastSummary || null } : 'no data'))

    // Verify date range alignment
    if (first && first.dateRange) {
      const expectedStart = params.startDate
      const expectedEnd = new Date(new Date(expectedStart + 'T00:00:00Z').getTime() + params.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      if (first.dateRange.startDate === expectedStart && first.dateRange.endDate === expectedEnd) {
        console.log('PASS: Saved weather dateRange matches expected start/end dates')
      } else {
        console.error('FAIL: Saved dateRange mismatch', { expectedStart, expectedEnd, got: first.dateRange })
      }
    } else {
      console.warn('No dateRange saved for first weather location; cannot verify alignment')
    }

    // Clean up
    await Itinerary.deleteOne({ _id: doc._id })
    await mongoose.disconnect()
  } catch (e) {
    console.error('Error in saveWeatherTest:', e)
    try { await mongoose.disconnect() } catch (e) {}
  }
}

run()
