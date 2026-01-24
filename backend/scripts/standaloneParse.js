const JSON5 = require('json5')
const vm = require('vm')

function tryParse(s) {
  if (!s || typeof s !== 'string') return undefined
  try { return JSON.parse(s) } catch(e) {}
  try { return JSON5.parse(s) } catch(e) {}
  return undefined
}

function robustParse(str) {
  let parsed = tryParse(str)
  if (parsed !== undefined) return parsed

  const firstBrace = str.indexOf('{')
  const lastBrace = str.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = str.substring(firstBrace, lastBrace + 1)
    parsed = tryParse(candidate)
    if (parsed !== undefined) return parsed
  }

  try {
    const evaled = vm.runInNewContext('(' + str + ')', {}, { timeout: 1000 })
    if (evaled !== undefined) return evaled
  } catch(e) {}

  // Attempt repair
  try {
    let inString = false
    let escape = false
    const stack = []

    for (let i=0;i<str.length;i++){
      const ch = str[i]
      if (escape) { escape = false; continue }
      if (ch === '\\') { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (!inString) {
        if (ch === '{') stack.push('}')
        else if (ch === '[') stack.push(']')
        else if ((ch === '}' || ch === ']') && stack.length) {
          if (stack[stack.length-1] === ch) stack.pop()
        }
      }
    }

    let repaired = str
    if (inString) repaired += '"'
    while (stack.length) repaired += stack.pop()
    repaired = repaired.replace(/,\s*([\]\}])/g, '$1')

    const parsedRepaired = tryParse(repaired)
    if (parsedRepaired !== undefined) return parsedRepaired
  } catch(e){ }

  throw new Error('Unable to parse')
}

const sample = `{
  "currency": "INR",
  "currencySymbol": "₹",
  "dayPlans": [
    {
      "day": 1,
      "morning": [
        {
          "time": "8:00 AM - 10:00 AM",
          "title": "Fly Kolkata to Shimla (via Delhi)",
          "description": "Catch a morning flight from Kolkata (CCU) to Delhi (DEL), then take an onward flight or scenic train to Shimla. Early flights save time and avoid midday crowds. Book tickets 2-3 months in advance for best rates; airlines like Air India and IndiGo offer direct flights to Delhi, then a separate booking for connecting to Shimla or a scenic toy train from Kalka.",
          "estimatedCost": "₹15,000",
          "duration": "4 hours",
          "location": "Kolkata International Airport",
          "insiderTip": "Use mobile apps like MakeMyTrip or Cleartrip for combo flight and train deals. Consider booking a flight to Delhi and then a comfortable Volvo bus or private cab to Shimla for scenic views.",
          "bestTimeToVisit": "Early morning for better seat availability and lower fares",
          "bookingRequired": true
        }
      ],
      "afternoon": [
        {
          "time": "1:00 PM - 3:00 PM",
          "title": "Arrival & Check-in at Family-Friendly Hotel",
          "description": "Arrive in Shimla, check-in at a family-friendly hotel like Hotel Willow Bank or Treebo Trend Grand Sunset. These offer spacious rooms, easy accessibility, and kid amenities.",
          "estimatedCost": "₹10,000",
          "duration": "2 hours",
          "location": "Shimla Mall Road area",
          "insiderTip": "Request a room with a view of the Himalayas; early check-in possible if available, or leave luggage and explore nearby markets.",
          "bestTimeToVisit": "Post-lunch to settle in, avoid midday sun",
          "bookingRequired": true
        }
      ],
      "evening": [
        {
          "time": "4:00 PM - 6:00 PM",
          "title": "Walk & Photography in Shimla Mall Road & Ridge",
          "description": "Stroll throu`

try {
  const p = robustParse(sample)
  console.log('PARSED OK:', JSON.stringify(p, null, 2).slice(0,1000))
} catch (e) {
  console.error('PARSE FAIL:', e.message)
}
