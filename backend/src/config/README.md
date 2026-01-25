# Destination Pricing Configuration

## Overview
This configuration file provides realistic pricing data for accommodations, food, transportation, and attractions across different countries and budget levels. All prices are standardized in INR (Indian Rupees) for consistency.

## Features

### 1. **Country-Specific Pricing**
Pricing data for major tourist destinations including:
- India
- USA
- UK
- Thailand
- Japan
- France
- UAE (Dubai)
- Singapore
- Australia
- Sri Lanka
- Default (fallback for unlisted countries)

### 2. **Trip Naming**
Automatic generation of unique trip names based on location sequence:
- **Single destination**: "Mumbai to Dubai Adventure"
- **Multi-destination**: "Delhi → Dubai → Singapore → Delhi Journey"
- Names are generated from source → destinations → source sequence

### 4. **Return Journey Integration**
- Last day of itinerary includes return journey back to source location
- Return travel costs are properly included in daily cost breakdown
- Accommodation costs are set to 0 on the return day (since travelers are going home)
- Travel costs reflect round-trip pricing for complete budget accuracy

### 3. **Pricing Categories**

#### Accommodation
- Price range per room per night
- Min and max values
- Description of accommodation type

#### Transportation
- Local transport per day
- Airport transfer costs
- Intra-city taxi fares
- Public transport costs

#### Food
- Breakfast, lunch, and dinner costs per person
- Separate pricing for each budget level

#### Attractions
- Average cost range for entry fees and activities

## Usage

### Import the Functions

```typescript
import { 
  getDestinationPricing, 
  formatPricingGuidance,
  getCountryFromDestination 
} from '../config/destinationPricing'
```

### Get Pricing for a Destination

```typescript
const pricing = getDestinationPricing('Paris', 'moderate')
// Returns CountryPricing object for France with moderate budget
```

### Format Pricing Guidance for AI Prompt

```typescript
const guidance = formatPricingGuidance(
  'Tokyo',           // destination
  'luxury',          // budget level
  2,                 // number of rooms
  4                  // number of people
)
// Returns formatted string with detailed pricing guidelines
```

### Get Country from Destination

```typescript
const country = getCountryFromDestination('Mumbai')
// Returns 'India'

const country2 = getCountryFromDestination('New York')
// Returns 'USA'
```

## Adding New Destinations

To add a new country/destination:

1. Add the country to `DESTINATION_PRICING` object:

```typescript
'CountryName': {
  country: 'CountryName',
  currency: 'CURRENCY_CODE',
  currencySymbol: 'SYMBOL',
  accommodation: {
    budget: { min: 1000, max: 2000, description: '...' },
    moderate: { min: 3000, max: 6000, description: '...' },
    luxury: { min: 8000, max: 15000, description: '...' }
  },
  transportation: {
    localTransportPerDay: { min: 300, max: 800 },
    airportTransfer: { min: 800, max: 2000 },
    intraCityTaxi: { min: 400, max: 1000 },
    publicTransport: { min: 100, max: 300 }
  },
  food: {
    budget: { breakfast: 200, lunch: 300, dinner: 400 },
    moderate: { breakfast: 500, lunch: 800, dinner: 1200 },
    luxury: { breakfast: 1500, lunch: 2500, dinner: 4000 }
  },
  averageAttractionCost: { min: 500, max: 2000 }
}
```

2. Add city-to-country mappings to `CITY_TO_COUNTRY_MAP`:

```typescript
'CityName': 'CountryName',
'AnotherCity': 'CountryName',
```

## Price Conversion

All prices in this configuration are in INR. The conversion rates used (approximate):
- 1 USD = ₹83
- 1 EUR = ₹90
- 1 GBP = ₹105
- 1 AUD = ₹55
- 1 SGD = ₹62
- 1 AED = ₹23

**Note**: These are approximate rates and should be updated periodically to reflect current exchange rates.

## Integration with AI Service

The pricing framework is integrated into `aiItineraryService.ts`:

1. Pricing guidance is automatically generated based on destination and budget
2. AI prompts include detailed cost ranges for realistic estimates
3. All costs are standardized in INR for consistency
4. Accommodation costs reflect the number of rooms requested
5. Food costs reflect the total number of people

## Example Output

When generating an itinerary for **Dubai** with **moderate budget**, **2 rooms**, and **4 people**:

```
**PRICING GUIDELINES FOR DUBAI (MODERATE BUDGET):**

All costs in INR (₹):

🏨 **Accommodation** (2 rooms):
   - Range: ₹20000 - ₹40000 per night
   - Average: ₹30000 per night
   - Type: Mid-range hotels (AED 400-800)

🍽️ **Food** (4 persons):
   - Breakfast: ₹1200 per person (₹4800 total)
   - Lunch: ₹2000 per person (₹8000 total)
   - Dinner: ₹3000 per person (₹12000 total)
   - Daily Total: ₹24800

🚗 **Local Transportation**:
   - Per Day: ₹600 - ₹1500
   - Airport Transfer: ₹1500 - ₹3000
   ...
```

## Maintenance

- Update exchange rates quarterly
- Review and adjust pricing based on inflation
- Add new destinations as needed
- Validate pricing with real-world data

## Future Enhancements

- [ ] Dynamic currency conversion based on real-time rates
- [ ] Seasonal pricing adjustments
- [ ] More granular city-level pricing
- [ ] Integration with booking APIs for real-time prices
- [ ] User feedback loop for pricing accuracy
