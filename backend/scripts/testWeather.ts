import aiItineraryService from '../src/services/aiItineraryService'

async function run() {
  try {
    const params = {
      source: 'Kolkata',
      destinations: ['Colombo'],
      startDate: new Date().toISOString().split('T')[0],
      duration: 4,
      includeWeatherReference: true
    }
    const structuredItinerary = { dayPlans: [] }
    const result = await aiItineraryService.fetchWeatherForItinerary(structuredItinerary as any, params as any)
    console.log('Fetch weather result:', JSON.stringify(result, null, 2))
  } catch (e) {
    console.error('Test failed:', e)
  }
}

run()
