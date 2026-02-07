"use strict";
// Quick test for robustParseJSON
const AIItineraryService = require('../services/aiItineraryService').default;
const service = Object.create(AIItineraryService.prototype);
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
          "description": "Stroll throu`;
try {
    const parsed = service.robustParseJSON(sample);
    console.log('parsed OK:', JSON.stringify(parsed, null, 2).slice(0, 1000));
}
catch (err) {
    console.error('parse failed:', err);
}
