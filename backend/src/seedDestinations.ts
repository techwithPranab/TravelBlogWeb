import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Import models
import Destination from './models/Destination'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

// Helper function to create slug from text
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

const sampleDestinations = [
  {
    name: 'Bali, Indonesia',
    description: 'A tropical paradise known for its stunning beaches, ancient temples, vibrant culture, and lush rice terraces. Experience the perfect blend of relaxation and adventure in this Indonesian gem.',
    country: 'Indonesia',
    continent: 'Asia',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
      alt: 'Bali rice terraces'
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
        alt: 'Bali rice terraces'
      },
      {
        url: 'https://images.unsplash.com/photo-1555400113-28f3e0c56e1b?w=800&h=400&fit=crop',
        alt: 'Tanah Lot Temple at sunset'
      }
    ],
    coordinates: {
      lat: -8.4095,
      lng: 115.1889
    },
    bestTimeToVisit: 'April to September (dry season)',
    averageTemperature: {
      summer: '25-32°C (77-90°F)',
      winter: '22-28°C (72-82°F)'
    },
    currency: 'IDR (Indonesian Rupiah)',
    language: 'Indonesian, Balinese',
    timezone: 'UTC+8 (Central Indonesian Time)',
    rating: 4.8,
    totalReviews: 1250,
    highlights: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach', 'Mount Batur Sunrise Trek'],
    activities: [
      {
        name: 'Surfing',
        icon: '🏄‍♂️',
        description: 'World-class surfing spots from beginner to advanced levels'
      },
      {
        name: 'Temple Hopping',
        icon: '🏛️',
        description: 'Explore ancient Hindu temples and learn about Balinese culture'
      },
      {
        name: 'Yoga Retreats',
        icon: '🧘‍♀️',
        description: 'Find peace and wellness in Bali\'s spiritual atmosphere'
      },
      {
        name: 'Hiking',
        icon: '🥾',
        description: 'Trek through rice terraces and volcanic landscapes'
      },
      {
        name: 'Snorkeling',
        icon: '🤿',
        description: 'Discover vibrant coral reefs and marine life'
      }
    ],
    accommodation: [
      {
        type: 'budget',
        name: 'Bali Budget Hostels',
        description: 'Clean hostels and guesthouses with basic amenities, perfect for backpackers',
        priceRange: '$20-50 per night',
        rating: 3.8,
        amenities: ['Free WiFi', 'Air conditioning', 'Shared bathroom', 'Common area'],
        bookingUrl: 'https://booking.com/budget-bali'
      },
      {
        type: 'mid-range',
        name: 'Boutique Hotels & Villas',
        description: 'Charming boutique hotels and private villas with local character',
        priceRange: '$50-150 per night',
        rating: 4.3,
        amenities: ['Pool', 'Private bathroom', 'Breakfast included', 'Garden view', 'Spa services'],
        bookingUrl: 'https://booking.com/midrange-bali'
      },
      {
        type: 'luxury',
        name: 'Premium Resorts & Private Villas',
        description: 'World-class resorts and exclusive private villas with premium amenities',
        priceRange: '$150+ per night',
        rating: 4.8,
        amenities: ['Private pool', 'Butler service', 'Fine dining', 'Spa', 'Ocean view', 'Private beach access'],
        bookingUrl: 'https://booking.com/luxury-bali'
      }
    ],
    transportation: ['Airport transfer', 'Scooter rental', 'Private driver', 'Local buses', 'Boat transfers'],
    localCuisine: ['Nasi Goreng', 'Babi Guling', 'Sate', 'Ayam Betutu', 'Pisang Goreng'],
    travelTips: [
      'Respect local customs and dress modestly at temples',
      'Bargain politely at markets',
      'Stay hydrated and use sunscreen',
      'Learn basic Indonesian phrases',
      'Book popular activities in advance during peak season'
    ],
    isPopular: true,
    isFeatured: true,
    isActive: true,
    seoTitle: 'Bali Travel Guide: Beaches, Temples & Culture',
    seoDescription: 'Discover Bali\'s stunning beaches, ancient temples, and vibrant culture. Complete guide for your Indonesian adventure.'
  },
  {
    name: 'Kyoto, Japan',
    description: 'Former imperial capital renowned for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.',
    country: 'Japan',
    continent: 'Asia',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
      alt: 'Kyoto bamboo forest'
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
        alt: 'Kyoto bamboo forest'
      },
      {
        url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
        alt: 'Fushimi Inari Shrine'
      }
    ],
    coordinates: {
      lat: 35.0116,
      lng: 135.7681
    },
    bestTimeToVisit: 'March-May (cherry blossoms) or September-November (autumn leaves)',
    averageTemperature: {
      summer: '20-30°C (68-86°F)',
      winter: '0-10°C (32-50°F)'
    },
    currency: 'JPY (Japanese Yen)',
    language: 'Japanese',
    timezone: 'UTC+9 (Japan Standard Time)',
    rating: 4.9,
    totalReviews: 980,
    highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji Temple', 'Arashiyama Bamboo Grove', 'Gion District'],
    activities: [
      {
        name: 'Temple Visits',
        icon: '🏛️',
        description: 'Explore Kyoto\'s 2,000+ temples and shrines'
      },
      {
        name: 'Tea Ceremony',
        icon: '🍵',
        description: 'Experience traditional Japanese tea ceremony'
      },
      {
        name: 'Cherry Blossom Viewing',
        icon: '🌸',
        description: 'Witness the famous sakura season in spring'
      },
      {
        name: 'Traditional Crafts',
        icon: '🎨',
        description: 'Learn about Kyoto\'s traditional crafts and artisans'
      }
    ],
    accommodation: [
      {
        type: 'budget',
        name: 'Kyoto Budget Hostels & Ryokan',
        description: 'Traditional hostels and budget ryokan offering authentic Japanese experience',
        priceRange: '$30-80 per night',
        rating: 4.0,
        amenities: ['Tatami rooms', 'Shared bathroom', 'Free WiFi', 'Traditional breakfast', 'Common area'],
        bookingUrl: 'https://booking.com/budget-kyoto'
      },
      {
        type: 'mid-range',
        name: 'Business Hotels & Traditional Inns',
        description: 'Comfortable business hotels and traditional Japanese inns with modern amenities',
        priceRange: '$80-200 per night',
        rating: 4.4,
        amenities: ['Private bathroom', 'Free WiFi', 'Air conditioning', 'Traditional breakfast', 'Onsen access'],
        bookingUrl: 'https://booking.com/midrange-kyoto'
      },
      {
        type: 'luxury',
        name: 'Luxury Ryokan & High-end Hotels',
        description: 'Premium traditional ryokan and luxury hotels with exceptional service',
        priceRange: '$200+ per night',
        rating: 4.9,
        amenities: ['Private onsen', 'Kaiseki dining', 'Garden view', 'Butler service', 'Traditional tea ceremony', 'Premium location'],
        bookingUrl: 'https://booking.com/luxury-kyoto'
      }
    ],
    transportation: ['JR Pass', 'Subway', 'Bus', 'Bicycle rental', 'Taxi'],
    localCuisine: ['Kaiseki', 'Yudofu', 'Obanzai', 'Matcha desserts', 'Street food'],
    travelTips: [
      'Get a Japan Rail Pass for extensive travel',
      'Visit temples early to avoid crowds',
      'Try onsen (hot springs) for relaxation',
      'Learn basic bowing etiquette',
      'Book accommodation well in advance during peak seasons'
    ],
    isPopular: true,
    isFeatured: true,
    isActive: true,
    seoTitle: 'Kyoto Travel Guide: Temples, Gardens & Culture',
    seoDescription: 'Explore Kyoto\'s ancient temples, beautiful gardens, and traditional culture. Your complete guide to Japan\'s cultural capital.'
  },
  {
    name: 'Patagonia, Argentina & Chile',
    description: 'Vast wilderness region at the southern tip of South America, known for dramatic landscapes including glaciers, mountains, and steppes.',
    country: 'Argentina',
    continent: 'South America',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop',
      alt: 'Patagonia mountains'
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop',
        alt: 'Patagonia mountains'
      },
      {
        url: 'https://images.unsplash.com/photo-1544737151-6e4b9b1c1b68?w=800&h=400&fit=crop',
        alt: 'Torres del Paine towers'
      }
    ],
    coordinates: {
      lat: -50.5,
      lng: -73.0
    },
    bestTimeToVisit: 'December to March (Southern Hemisphere summer)',
    averageTemperature: {
      summer: '5-15°C (41-59°F)',
      winter: '-5-5°C (23-41°F)'
    },
    currency: 'ARS (Argentine Peso) / CLP (Chilean Peso)',
    language: 'Spanish',
    timezone: 'UTC-3 (Argentina) / UTC-4 (Chile)',
    rating: 4.7,
    totalReviews: 650,
    highlights: ['Torres del Paine', 'Perito Moreno Glacier', 'Mount Fitz Roy', 'Ushuaia'],
    activities: [
      {
        name: 'Trekking',
        icon: '🥾',
        description: 'Hike the famous W Circuit and O Circuit trails'
      },
      {
        name: 'Glacier Viewing',
        icon: '🧊',
        description: 'Witness massive glaciers and ice formations'
      },
      {
        name: 'Wildlife Watching',
        icon: '🦌',
        description: 'Spot guanacos, condors, and marine life'
      },
      {
        name: 'Photography',
        icon: '📷',
        description: 'Capture stunning landscapes and wildlife'
      }
    ],
    accommodation: [
      {
        type: 'budget',
        name: 'Hostels & Camping',
        description: 'Basic hostels and camping sites for adventurous travelers',
        priceRange: '$25-60 per night',
        rating: 3.5,
        amenities: ['Shared facilities', 'Camping gear rental', 'Kitchen access', 'WiFi', 'Tour booking'],
        bookingUrl: 'https://booking.com/budget-patagonia'
      },
      {
        type: 'mid-range',
        name: 'Mountain Lodges & Cabins',
        description: 'Comfortable lodges and cabins with stunning mountain views',
        priceRange: '$60-150 per night',
        rating: 4.2,
        amenities: ['Mountain views', 'Heating', 'Private bathroom', 'Restaurant', 'Hiking gear storage', 'Transfer service'],
        bookingUrl: 'https://booking.com/midrange-patagonia'
      },
      {
        type: 'luxury',
        name: 'Luxury Eco-lodges & Resorts',
        description: 'Premium eco-lodges and luxury resorts with exceptional wilderness access',
        priceRange: '$150+ per night',
        rating: 4.7,
        amenities: ['All-inclusive', 'Private guides', 'Gourmet dining', 'Spa services', 'Helicopter transfers', 'Premium location'],
        bookingUrl: 'https://booking.com/luxury-patagonia'
      }
    ],
    transportation: ['Internal flights', 'Bus tours', 'Private transfers', 'Rental cars', 'Ferries'],
    localCuisine: ['Lamb dishes', 'Seafood', 'Empanadas', 'Wine', 'Mate tea'],
    travelTips: [
      'Prepare for unpredictable weather',
      'Book tours and accommodation in advance',
      'Pack layers for variable temperatures',
      'Respect wildlife and maintain distance',
      'Consider travel insurance for remote areas'
    ],
    isPopular: true,
    isFeatured: true,
    isActive: true,
    seoTitle: 'Patagonia Travel Guide: Glaciers, Mountains & Adventure',
    seoDescription: 'Explore Patagonia\'s dramatic landscapes, glaciers, and mountains. Complete guide for Argentina and Chile\'s wilderness region.'
  }
]

const seedDestinations = async () => {
  try {
    // Clear existing destinations
    console.log('Clearing existing destinations...')
    await Destination.deleteMany({})

    // Create destinations
    console.log('Creating destinations with new accommodation format...')
    const destinations = []
    for (const destData of sampleDestinations) {
      const destination = new Destination({
        ...destData,
        slug: createSlug(destData.name)
      })
      destinations.push(await destination.save())
    }

    console.log('Destinations seeded successfully!')
    console.log(`Created ${destinations.length} destinations with new accommodation array format`)

    // Log a sample destination to verify format
    console.log('\nSample destination accommodation format:')
    console.log(JSON.stringify(destinations[0].accommodation, null, 2))

  } catch (error) {
    console.error('Error seeding destinations:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

// Run the seed script
const runSeed = async () => {
  await connectDB()
  await seedDestinations()
}

if (require.main === module) {
  runSeed()
}

export default seedDestinations
