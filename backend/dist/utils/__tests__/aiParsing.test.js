"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aiParsing_1 = require("../aiParsing");
describe('deepParseIfString', () => {
    it('parses stringified array of accommodations with mixed quotes and unquoted keys', () => {
        const input = `[
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
        const parsed = (0, aiParsing_1.deepParseIfString)(input);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(3);
        expect(parsed[0]).toHaveProperty('name', 'Radisson Blu Agra Taj East Gate');
        expect(parsed[0]).toHaveProperty('amenities');
        expect(parsed[0].amenities).toContain('WiFi');
    });
    it('parses transportationTips stringified array', () => {
        const input = `[
  {
    type: 'mixed',
    description: 'Combine train, taxi, and auto-rickshaw for efficiency. Book train tickets online via IRCTC app or website for early morning departures. Use Ola/Uber app for taxis; pre-arranged hotel pickups recommended for safety and ease.',
    estimatedCost: 2000
  }
]`;
        const parsed = (0, aiParsing_1.deepParseIfString)(input);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed[0]).toHaveProperty('type', 'mixed');
        expect(parsed[0]).toHaveProperty('estimatedCost', 2000);
    });
});
