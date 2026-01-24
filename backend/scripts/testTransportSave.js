const mongoose = require('mongoose')
const Itinerary = require('../dist/models/Itinerary').default

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-blog'

async function run() {
  try {
    await mongoose.connect(MONGO_URI)

    const doc = new Itinerary({
      userId: new mongoose.Types.ObjectId(),
      source: 'TestSource',
      destinations: ['TestCity'],
      travelMode: 'rail',
      adults: 2,
      children: 0,
      totalPeople: 2,
      title: 'Transport Save Test',
      duration: 2,
      budget: 'moderate',
      interests: ['culture'],
      travelStyle: 'couple',
      status: 'completed',
      generatedBy: 'ai',
      aiModel: 'test',
      transportationTips: [
        {
          type: 'rail',
          description: 'Book tickets via IRCTC online early.',
          estimatedCost: 6000,
          insiderTip: 'Check train schedules on the IRCTC website or app; consider early morning trains.',
          bookingInfo: 'Use IRCTC app or authorized agents.'
        }
      ]
    })

    await doc.save()
    console.log('Saved itinerary id:', doc._id.toString())

    const fetched = await Itinerary.findById(doc._id).lean()
    console.log('Fetched transportationTips:', JSON.stringify(fetched.transportationTips, null, 2))

    // cleanup
    await Itinerary.deleteOne({ _id: doc._id })
    await mongoose.disconnect()
  } catch (e) {
    console.error('Error in testTransportSave:', e)
    try { await mongoose.disconnect() } catch (e) {}
  }
}

run()
