"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aiParsing_1 = require("./aiParsing");
const sampleAccommodations = `[
  {
    name: 'Radisson Blu Agra Taj East Gate',
    type: 'Hotel',
    priceRange: '₹7,000-₹12,000 per night',
    location: 'Taj East Gate Road',
    amenities: [ 'WiFi', 'Pool', "Kids' play area", 'Family suites' ]
  },
  {
    name: 'Hotel Clarks Shiraz',
    type: 'Hotel',
    priceRange: '₹5,000-₹9,000 per night',
    location: 'Fatehabad Road',
    amenities: [ 'Pool', 'Gym', "Kids' activities" ]
  },
  {
    name: 'Trident Agra',
    type: 'Luxury Hotel',
    priceRange: '₹9,000-₹15,000 per night',
    location: 'Sadar Bazaar',
    amenities: [ 'Spa', 'Pool', "Kids' club", 'Garden' ]
  }
]`;
console.log('Input sample (first 150 chars):', sampleAccommodations.substring(0, 150));
const parsed = (0, aiParsing_1.deepParseIfString)(sampleAccommodations);
console.log('Parsed type:', Array.isArray(parsed) ? 'array' : typeof parsed);
console.log(JSON.stringify(parsed, null, 2));
