const mongoose = require('mongoose')
const Itinerary = require('../dist/models/Itinerary').default

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-blog'

const deepParseIfString = (str) => {
  if (!str || typeof str !== 'string') return str
  try { return JSON.parse(str) } catch (e) {}
  try { return eval('(' + str + ')') } catch (e) {}
  return str
}

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
      title: 'Sanitize Test',
      duration: 2,
      budget: 'moderate',
      interests: ['culture'],
      travelStyle: 'couple',
      status: 'generating',
      generatedBy: 'ai',
      aiModel: 'test',
      // transportationTips is a stringified array (bad AI output)
      transportationTips: ["[ { 'type': 'rail', 'description': 'Book via IRCTC early', 'estimatedCost': 4800 } ]"]
    })

    try {
      await doc.save()
      console.log('Saved unexpectedly (should have failed)')
    } catch (e) {
      console.log('Initial save failed as expected:', e.message)

      // perform sanitization similar to controller
      doc.transportationTips = (doc.transportationTips || []).flatMap(t => {
        if (typeof t === 'string') {
          const parsed = deepParseIfString(t)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(p => ({ type: p?.type || p?.mode || 'general', description: p?.description || p?.details || String(p), estimatedCost: Number(p?.estimatedCost) || 0 }))
          }
          if (parsed && typeof parsed === 'object') {
            return [{ type: parsed?.type || parsed?.mode || 'general', description: parsed?.description || String(parsed), estimatedCost: Number(parsed?.estimatedCost) || 0 }]
          }
          return [{ type: 'general', description: String(t), estimatedCost: 0 }]
        }
        if (t && typeof t === 'object') return [{ type: t?.type || t?.mode || 'general', description: t?.description || String(t), estimatedCost: Number(t?.estimatedCost) || 0 }]
        return []
      })

      await doc.save()
      console.log('Saved after sanitization:', doc._id.toString())

      const fetched = await Itinerary.findById(doc._id).lean()
      console.log('Fetched transport tips:', JSON.stringify(fetched.transportationTips, null, 2))

      // cleanup
      await Itinerary.deleteOne({ _id: doc._id })
    }

    await mongoose.disconnect()
  } catch (err) {
    console.error('Test failed:', err)
    try { await mongoose.disconnect() } catch(e){}
  }
}

run()
