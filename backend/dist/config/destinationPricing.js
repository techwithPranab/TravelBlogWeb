"use strict";
/**
 * Destination-based pricing configuration for accommodations and transportation
 * All prices are in INR (Indian Rupees) for consistency
 * Prices are per room per night for accommodations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CITY_TO_COUNTRY_MAP = exports.DESTINATION_PRICING = void 0;
exports.getCountryFromDestination = getCountryFromDestination;
exports.getDestinationPricing = getDestinationPricing;
exports.formatPricingGuidance = formatPricingGuidance;
// Destination pricing database (all costs in INR)
exports.DESTINATION_PRICING = {
    // India
    'India': {
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        accommodation: {
            budget: { min: 500, max: 1500, description: 'Budget hotels, hostels, guesthouses' },
            moderate: { min: 1500, max: 4000, description: 'Mid-range hotels, boutique stays' },
            luxury: { min: 4000, max: 10000, description: 'Luxury hotels, 5-star resorts' }
        },
        transportation: {
            localTransportPerDay: { min: 200, max: 500 },
            airportTransfer: { min: 300, max: 1500 },
            intraCityTaxi: { min: 150, max: 500 },
            publicTransport: { min: 50, max: 200 }
        },
        food: {
            budget: { breakfast: 100, lunch: 150, dinner: 200 },
            moderate: { breakfast: 300, lunch: 500, dinner: 700 },
            luxury: { breakfast: 800, lunch: 1500, dinner: 2500 }
        },
        averageAttractionCost: { min: 100, max: 1000 }
    },
    // USA
    'USA': {
        country: 'USA',
        currency: 'USD',
        currencySymbol: '$',
        accommodation: {
            budget: { min: 4000, max: 8000, description: 'Budget motels, hostels ($50-100)' },
            moderate: { min: 10000, max: 20000, description: 'Mid-range hotels ($120-250)' },
            luxury: { min: 25000, max: 60000, description: 'Luxury hotels, resorts ($300-750)' }
        },
        transportation: {
            localTransportPerDay: { min: 800, max: 2000 },
            airportTransfer: { min: 2000, max: 5000 },
            intraCityTaxi: { min: 1000, max: 2500 },
            publicTransport: { min: 200, max: 800 }
        },
        food: {
            budget: { breakfast: 600, lunch: 1000, dinner: 1500 },
            moderate: { breakfast: 1500, lunch: 2500, dinner: 4000 },
            luxury: { breakfast: 3000, lunch: 6000, dinner: 10000 }
        },
        averageAttractionCost: { min: 1500, max: 5000 }
    },
    // United Kingdom
    'UK': {
        country: 'UK',
        currency: 'GBP',
        currencySymbol: '£',
        accommodation: {
            budget: { min: 5000, max: 9000, description: 'Budget hotels, hostels (£50-90)' },
            moderate: { min: 11000, max: 22000, description: 'Mid-range hotels (£110-220)' },
            luxury: { min: 28000, max: 70000, description: 'Luxury hotels (£280-700)' }
        },
        transportation: {
            localTransportPerDay: { min: 1000, max: 2500 },
            airportTransfer: { min: 3000, max: 6000 },
            intraCityTaxi: { min: 1500, max: 3000 },
            publicTransport: { min: 500, max: 1200 }
        },
        food: {
            budget: { breakfast: 800, lunch: 1200, dinner: 1800 },
            moderate: { breakfast: 1800, lunch: 3000, dinner: 5000 },
            luxury: { breakfast: 4000, lunch: 7000, dinner: 12000 }
        },
        averageAttractionCost: { min: 2000, max: 6000 }
    },
    // Thailand
    'Thailand': {
        country: 'Thailand',
        currency: 'THB',
        currencySymbol: '฿',
        accommodation: {
            budget: { min: 600, max: 1800, description: 'Budget guesthouses, hostels' },
            moderate: { min: 2500, max: 6000, description: 'Mid-range hotels, boutique stays' },
            luxury: { min: 8000, max: 25000, description: 'Luxury resorts, 5-star hotels' }
        },
        transportation: {
            localTransportPerDay: { min: 300, max: 1000 },
            airportTransfer: { min: 400, max: 1500 },
            intraCityTaxi: { min: 200, max: 600 },
            publicTransport: { min: 100, max: 300 }
        },
        food: {
            budget: { breakfast: 150, lunch: 200, dinner: 300 },
            moderate: { breakfast: 400, lunch: 600, dinner: 1000 },
            luxury: { breakfast: 1200, lunch: 2000, dinner: 3500 }
        },
        averageAttractionCost: { min: 200, max: 1500 }
    },
    // Japan
    'Japan': {
        country: 'Japan',
        currency: 'JPY',
        currencySymbol: '¥',
        accommodation: {
            budget: { min: 3000, max: 6000, description: 'Capsule hotels, budget ryokans' },
            moderate: { min: 8000, max: 16000, description: 'Business hotels, mid-range ryokans' },
            luxury: { min: 20000, max: 50000, description: 'Luxury hotels, traditional ryokans' }
        },
        transportation: {
            localTransportPerDay: { min: 800, max: 2000 },
            airportTransfer: { min: 2000, max: 4000 },
            intraCityTaxi: { min: 1000, max: 2500 },
            publicTransport: { min: 500, max: 1500 }
        },
        food: {
            budget: { breakfast: 400, lunch: 800, dinner: 1200 },
            moderate: { breakfast: 1000, lunch: 1800, dinner: 3000 },
            luxury: { breakfast: 2500, lunch: 5000, dinner: 8000 }
        },
        averageAttractionCost: { min: 500, max: 3000 }
    },
    // France
    'France': {
        country: 'France',
        currency: 'EUR',
        currencySymbol: '€',
        accommodation: {
            budget: { min: 5000, max: 9000, description: 'Budget hotels, hostels (€50-90)' },
            moderate: { min: 10000, max: 20000, description: 'Mid-range hotels (€100-200)' },
            luxury: { min: 25000, max: 60000, description: 'Luxury hotels (€250-600)' }
        },
        transportation: {
            localTransportPerDay: { min: 800, max: 2000 },
            airportTransfer: { min: 2500, max: 5000 },
            intraCityTaxi: { min: 1200, max: 2500 },
            publicTransport: { min: 400, max: 1000 }
        },
        food: {
            budget: { breakfast: 700, lunch: 1200, dinner: 1800 },
            moderate: { breakfast: 1500, lunch: 2500, dinner: 4000 },
            luxury: { breakfast: 3500, lunch: 6000, dinner: 10000 }
        },
        averageAttractionCost: { min: 1000, max: 4000 }
    },
    // Dubai (UAE)
    'UAE': {
        country: 'UAE',
        currency: 'AED',
        currencySymbol: 'د.إ',
        accommodation: {
            budget: { min: 4000, max: 8000, description: 'Budget hotels (AED 150-300)' },
            moderate: { min: 10000, max: 20000, description: 'Mid-range hotels (AED 400-800)' },
            luxury: { min: 30000, max: 80000, description: 'Luxury hotels (AED 1200-3000)' }
        },
        transportation: {
            localTransportPerDay: { min: 600, max: 1500 },
            airportTransfer: { min: 1500, max: 3000 },
            intraCityTaxi: { min: 800, max: 2000 },
            publicTransport: { min: 300, max: 800 }
        },
        food: {
            budget: { breakfast: 500, lunch: 800, dinner: 1200 },
            moderate: { breakfast: 1200, lunch: 2000, dinner: 3000 },
            luxury: { breakfast: 3000, lunch: 5000, dinner: 8000 }
        },
        averageAttractionCost: { min: 1000, max: 5000 }
    },
    // Singapore
    'Singapore': {
        country: 'Singapore',
        currency: 'SGD',
        currencySymbol: 'S$',
        accommodation: {
            budget: { min: 4500, max: 8000, description: 'Budget hotels, hostels (S$70-120)' },
            moderate: { min: 10000, max: 18000, description: 'Mid-range hotels (S$150-280)' },
            luxury: { min: 22000, max: 50000, description: 'Luxury hotels (S$350-800)' }
        },
        transportation: {
            localTransportPerDay: { min: 500, max: 1200 },
            airportTransfer: { min: 1200, max: 2500 },
            intraCityTaxi: { min: 800, max: 1500 },
            publicTransport: { min: 300, max: 700 }
        },
        food: {
            budget: { breakfast: 300, lunch: 500, dinner: 800 },
            moderate: { breakfast: 800, lunch: 1500, dinner: 2500 },
            luxury: { breakfast: 2000, lunch: 4000, dinner: 6000 }
        },
        averageAttractionCost: { min: 800, max: 3000 }
    },
    // Australia
    'Australia': {
        country: 'Australia',
        currency: 'AUD',
        currencySymbol: 'A$',
        accommodation: {
            budget: { min: 4500, max: 8500, description: 'Budget hotels, hostels (A$70-130)' },
            moderate: { min: 10000, max: 20000, description: 'Mid-range hotels (A$150-300)' },
            luxury: { min: 25000, max: 60000, description: 'Luxury hotels (A$400-900)' }
        },
        transportation: {
            localTransportPerDay: { min: 700, max: 1800 },
            airportTransfer: { min: 2000, max: 4000 },
            intraCityTaxi: { min: 1200, max: 2500 },
            publicTransport: { min: 400, max: 1000 }
        },
        food: {
            budget: { breakfast: 600, lunch: 1000, dinner: 1500 },
            moderate: { breakfast: 1400, lunch: 2500, dinner: 4000 },
            luxury: { breakfast: 3000, lunch: 5500, dinner: 9000 }
        },
        averageAttractionCost: { min: 1200, max: 4500 }
    },
    // Sri Lanka
    'Sri Lanka': {
        country: 'Sri Lanka',
        currency: 'LKR',
        currencySymbol: 'Rs',
        accommodation: {
            budget: { min: 800, max: 2000, description: 'Budget guesthouses, hostels' },
            moderate: { min: 2500, max: 6000, description: 'Mid-range hotels, villas' },
            luxury: { min: 8000, max: 20000, description: 'Luxury resorts, boutique hotels' }
        },
        transportation: {
            localTransportPerDay: { min: 300, max: 1000 },
            airportTransfer: { min: 500, max: 1500 },
            intraCityTaxi: { min: 250, max: 700 },
            publicTransport: { min: 100, max: 300 }
        },
        food: {
            budget: { breakfast: 150, lunch: 250, dinner: 350 },
            moderate: { breakfast: 400, lunch: 700, dinner: 1000 },
            luxury: { breakfast: 1200, lunch: 2000, dinner: 3000 }
        },
        averageAttractionCost: { min: 200, max: 1200 }
    },
    // Default/Global (fallback)
    'Default': {
        country: 'Default',
        currency: 'INR',
        currencySymbol: '₹',
        accommodation: {
            budget: { min: 1000, max: 2500, description: 'Budget accommodations' },
            moderate: { min: 3000, max: 8000, description: 'Mid-range hotels' },
            luxury: { min: 10000, max: 30000, description: 'Luxury hotels' }
        },
        transportation: {
            localTransportPerDay: { min: 500, max: 1500 },
            airportTransfer: { min: 1000, max: 3000 },
            intraCityTaxi: { min: 500, max: 1500 },
            publicTransport: { min: 200, max: 600 }
        },
        food: {
            budget: { breakfast: 200, lunch: 300, dinner: 400 },
            moderate: { breakfast: 500, lunch: 800, dinner: 1200 },
            luxury: { breakfast: 1500, lunch: 2500, dinner: 4000 }
        },
        averageAttractionCost: { min: 500, max: 2000 }
    }
};
// City to country mapping for better detection
exports.CITY_TO_COUNTRY_MAP = {
    // India
    'Mumbai': 'India', 'Delhi': 'India', 'Bangalore': 'India', 'Kolkata': 'India',
    'Chennai': 'India', 'Hyderabad': 'India', 'Pune': 'India', 'Ahmedabad': 'India',
    'Jaipur': 'India', 'Goa': 'India', 'Udaipur': 'India', 'Varanasi': 'India',
    'Agra': 'India', 'Kerala': 'India', 'Shimla': 'India', 'Manali': 'India',
    // USA
    'New York': 'USA', 'Los Angeles': 'USA', 'Chicago': 'USA', 'San Francisco': 'USA',
    'Las Vegas': 'USA', 'Miami': 'USA', 'Boston': 'USA', 'Seattle': 'USA',
    'Washington DC': 'USA', 'Orlando': 'USA', 'San Diego': 'USA',
    // UK
    'London': 'UK', 'Manchester': 'UK', 'Edinburgh': 'UK', 'Birmingham': 'UK',
    'Liverpool': 'UK', 'Glasgow': 'UK', 'Oxford': 'UK', 'Cambridge': 'UK',
    // Thailand
    'Bangkok': 'Thailand', 'Phuket': 'Thailand', 'Pattaya': 'Thailand', 'Chiang Mai': 'Thailand',
    'Krabi': 'Thailand', 'Koh Samui': 'Thailand',
    // Japan
    'Tokyo': 'Japan', 'Osaka': 'Japan', 'Kyoto': 'Japan', 'Hiroshima': 'Japan',
    'Sapporo': 'Japan', 'Fukuoka': 'Japan', 'Nara': 'Japan',
    // France
    'Paris': 'France', 'Nice': 'France', 'Lyon': 'France', 'Marseille': 'France',
    'Bordeaux': 'France', 'Cannes': 'France',
    // UAE
    'Dubai': 'UAE', 'Abu Dhabi': 'UAE', 'Sharjah': 'UAE',
    // Singapore
    'Singapore': 'Singapore',
    // Australia
    'Sydney': 'Australia', 'Melbourne': 'Australia', 'Brisbane': 'Australia',
    'Perth': 'Australia', 'Adelaide': 'Australia', 'Gold Coast': 'Australia',
    // Sri Lanka
    'Colombo': 'Sri Lanka', 'Kandy': 'Sri Lanka', 'Galle': 'Sri Lanka',
    'Ella': 'Sri Lanka', 'Nuwara Eliya': 'Sri Lanka'
};
/**
 * Get country from destination string
 */
function getCountryFromDestination(destination) {
    const dest = destination.trim();
    // Direct country match
    if (exports.DESTINATION_PRICING[dest]) {
        return dest;
    }
    // City to country mapping
    for (const [city, country] of Object.entries(exports.CITY_TO_COUNTRY_MAP)) {
        if (dest.toLowerCase().includes(city.toLowerCase())) {
            return country;
        }
    }
    // Check if destination contains country name
    for (const country of Object.keys(exports.DESTINATION_PRICING)) {
        if (dest.toLowerCase().includes(country.toLowerCase())) {
            return country;
        }
    }
    // Default fallback
    return 'Default';
}
/**
 * Get pricing for a destination and budget level
 */
function getDestinationPricing(destination, budgetLevel) {
    const country = getCountryFromDestination(destination);
    return exports.DESTINATION_PRICING[country] || exports.DESTINATION_PRICING['Default'];
}
/**
 * Format pricing guidance for AI prompt
 */
function formatPricingGuidance(destination, budgetLevel, numberOfRooms = 1, numberOfPeople = 1) {
    const pricing = getDestinationPricing(destination, budgetLevel);
    const accom = pricing.accommodation[budgetLevel];
    const food = pricing.food[budgetLevel];
    const transport = pricing.transportation;
    const totalAccomPerNight = (accom.min + accom.max) / 2 * numberOfRooms;
    const totalFoodPerPerson = food.breakfast + food.lunch + food.dinner;
    const totalFoodPerDay = totalFoodPerPerson * numberOfPeople;
    return `
**PRICING GUIDELINES FOR ${destination.toUpperCase()} (${budgetLevel.toUpperCase()} BUDGET):**

All costs in INR (₹):

🏨 **Accommodation** (${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''}):
   - Range: ₹${accom.min * numberOfRooms} - ₹${accom.max * numberOfRooms} per night
   - Average: ₹${Math.round(totalAccomPerNight)} per night
   - Type: ${accom.description}

🍽️ **Food** (${numberOfPeople} person${numberOfPeople > 1 ? 's' : ''}):
   - Breakfast: ₹${food.breakfast} per person (₹${food.breakfast * numberOfPeople} total)
   - Lunch: ₹${food.lunch} per person (₹${food.lunch * numberOfPeople} total)
   - Dinner: ₹${food.dinner} per person (₹${food.dinner * numberOfPeople} total)
   - Daily Total: ₹${totalFoodPerDay}

🚗 **Local Transportation**:
   - Per Day: ₹${transport.localTransportPerDay.min} - ₹${transport.localTransportPerDay.max}
   - Airport Transfer: ₹${transport.airportTransfer.min} - ₹${transport.airportTransfer.max}
   - Taxi (intra-city): ₹${transport.intraCityTaxi.min} - ₹${transport.intraCityTaxi.max}
   - Public Transport: ₹${transport.publicTransport.min} - ₹${transport.publicTransport.max}

🎯 **Attractions/Activities**:
   - Average Cost: ₹${pricing.averageAttractionCost.min} - ₹${pricing.averageAttractionCost.max} per attraction

⚠️ **CRITICAL**: Use these pricing guidelines to ensure realistic costs in your itinerary.
   - All estimatedCost values must be NUMERIC ONLY (no currency symbols)
   - Currency symbol (${pricing.currencySymbol}) goes in "currencySymbol" field
   - Accommodation costs should reflect ${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} per night
   - Food costs should reflect ${numberOfPeople} person${numberOfPeople > 1 ? 's' : ''} per meal
`;
}
