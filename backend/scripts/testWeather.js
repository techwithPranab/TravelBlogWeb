const aiItineraryService = require('../dist/services/aiItineraryService').default

async function run(){
  try{
    const params = {
      source: 'Kolkata',
      destinations: ['Colombo'],
      startDate: new Date().toISOString().split('T')[0],
      duration: 4,
      includeWeatherReference: true
    }
    const res = await aiItineraryService.testFetchWeather(params)
    console.log('Test fetch weather result:', JSON.stringify(res, null, 2))

    if (!res) {
      console.log('No weather returned - this may be due to missing API key or no coordinates found')
      return
    }

    // Compute expected date range according to service logic
    const expectedStart = params.startDate
    const expectedEnd = new Date(new Date(expectedStart + 'T00:00:00Z').getTime() + params.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const first = res[0]
    if (!first.dateRange) {
      console.error('FAIL: No dateRange in aggregated forecast')
    } else if (first.dateRange.startDate !== expectedStart || first.dateRange.endDate !== expectedEnd) {
      console.error('FAIL: Date range mismatch', { expectedStart, expectedEnd, got: first.dateRange })
    } else {
      console.log('PASS: Date range matches expected values')
    }

    if (first.forecastSummary) {
      console.log('Summary exists for location:', first.location, first.forecastSummary)
    } else {
      console.log('Note: No forecast summary available for', first.location)
    }

  }catch(e){
    console.error('Error', e)
  }
}

async function runFutureTest(){
  try{
    const params = {
      source: 'Kolkata',
      destinations: ['Gangtok'],
      startDate: '2026-04-01',
      duration: 7,
      includeWeatherReference: true
    }
    const res = await aiItineraryService.testFetchWeather(params)
    console.log('Future fetch weather result:', JSON.stringify(res, null, 2))

    if (!res || res.length === 0) {
      console.log('No weather returned for future dates - likely no coordinates or API limits')
      return
    }

    const first = res[0]
    if (first.forecastSummary && first.forecastSummary.estimated === true && first.forecastSummary.source === 'seasonal-ai') {
      console.log('PASS: Seasonal AI fallback provided and marked as estimated for', first.location)
    } else if (first.forecastSummary) {
      console.warn('WARNING: Forecast summary present but not marked as seasonal AI fallback', first.forecastSummary)
    } else {
      console.warn('No forecast summary created for future date range (could be API or geocode issue)')
    }
  } catch (e) {
    console.error('Future test error', e)
  }
}

// Run both
run().then(() => runFutureTest())
