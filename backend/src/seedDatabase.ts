import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Import models
import User from './models/User'
import Category from './models/Category'
import Destination from './models/Destination'
import Post from './models/Post'
import Guide from './models/Guide'
import Resource from './models/Resource'
import Comment from './models/Comment'

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

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@travelblog.com',
    password: 'admin123',
    role: 'admin',
    bio: 'Travel blog administrator and content curator.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isEmailVerified: true
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@travelblog.com',
    password: 'sarah123',
    role: 'contributor',
    bio: 'Professional travel writer and photographer with 10+ years of experience exploring the globe.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b412?w=150&h=150&fit=crop&crop=face',
    socialLinks: {
      instagram: 'https://instagram.com/sarahtravels',
      website: 'https://sarahjohnson.travel'
    },
    isEmailVerified: true
  },
  {
    name: 'Mike Chen',
    email: 'mike@travelblog.com',
    password: 'mike123',
    role: 'contributor',
    bio: 'Adventure travel specialist focusing on hiking, climbing, and outdoor expeditions.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    socialLinks: {
      twitter: 'https://twitter.com/mikeadventures'
    },
    isEmailVerified: true
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    password: 'emma123',
    role: 'reader',
    bio: 'Travel enthusiast and blog reader.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isEmailVerified: true
  }
]

const sampleCategories = [
  {
    name: 'Adventure Travel',
    description: 'Thrilling adventures and outdoor activities around the world',
    color: '#FF6B35',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
  },
  {
    name: 'Cultural Experiences',
    description: 'Immersive cultural experiences and local traditions',
    color: '#1E88E5',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73299?w=400&h=200&fit=crop'
  },
  {
    name: 'Food & Cuisine',
    description: 'Culinary adventures and local food experiences',
    color: '#FFC107',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop'
  },
  {
    name: 'Budget Travel',
    description: 'Affordable travel tips and budget-friendly destinations',
    color: '#4CAF50',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop'
  },
  {
    name: 'Luxury Travel',
    description: 'High-end travel experiences and luxury accommodations',
    color: '#9C27B0',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop'
  },
  {
    name: 'Solo Travel',
    description: 'Tips and guides for independent travelers',
    color: '#FF9800',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop'
  }
]

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
    transportation: ['Airport transfer', 'Scooter rental', 'Private driver', 'Local buses', 'Boat transfers'],
    localCuisine: ['Nasi Goreng', 'Babi Guling', 'Sate', 'Ayam Betutu', 'Pisang Goreng'],
    travelTips: [
      'Respect local customs and dress modestly at temples',
      'Bargain politely at markets',
      'Stay hydrated and use sunscreen',
      'Learn basic Indonesian phrases',
      'Book popular activities in advance during peak season'
    ],
    relatedPosts: [
      {
        id: 'sample-post-1',
        title: '10 Must-Visit Temples in Bali: A Spiritual Journey',
        slug: '10-must-visit-temples-in-bali-spiritual-journey',
        image: 'https://images.unsplash.com/photo-1555400113-28f3e0c56e1b?w=800&h=400&fit=crop'
      }
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
    transportation: ['JR Pass', 'Subway', 'Bus', 'Bicycle rental', 'Taxi'],
    localCuisine: ['Kaiseki', 'Yudofu', 'Obanzai', 'Matcha desserts', 'Street food'],
    travelTips: [
      'Get a Japan Rail Pass for extensive travel',
      'Visit temples early to avoid crowds',
      'Try onsen (hot springs) for relaxation',
      'Learn basic bowing etiquette',
      'Book accommodation well in advance during peak seasons'
    ],
    relatedPosts: [],
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
    transportation: ['Internal flights', 'Bus tours', 'Private transfers', 'Rental cars', 'Ferries'],
    localCuisine: ['Lamb dishes', 'Seafood', 'Empanadas', 'Wine', 'Mate tea'],
    travelTips: [
      'Prepare for unpredictable weather',
      'Book tours and accommodation in advance',
      'Pack layers for variable temperatures',
      'Respect wildlife and maintain distance',
      'Consider travel insurance for remote areas'
    ],
    relatedPosts: [
      {
        id: 'sample-post-2',
        title: 'Trekking Torres del Paine: Complete Guide to Patagonia\'s Crown Jewel',
        slug: 'trekking-torres-del-paine-complete-guide-patagonia',
        image: 'https://images.unsplash.com/photo-1544737151-6e4b9b1c1b68?w=800&h=400&fit=crop'
      }
    ],
    isPopular: true,
    isFeatured: true,
    isActive: true,
    seoTitle: 'Patagonia Travel Guide: Glaciers, Mountains & Adventure',
    seoDescription: 'Explore Patagonia\'s dramatic landscapes, glaciers, and mountains. Complete guide for Argentina and Chile\'s wilderness region.'
  }
]

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await User.deleteMany({})
    await Category.deleteMany({})
    await Destination.deleteMany({})
    await Post.deleteMany({})
    await Guide.deleteMany({})
    await Resource.deleteMany({})
    await Comment.deleteMany({})

    // Create users
    console.log('Creating users...')
    const users = []
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash(userData.password, salt)
      
      const user = new User({
        ...userData,
        password: hashedPassword
      })
      users.push(await user.save())
    }

    // Create categories
    console.log('Creating categories...')
    const categories = []
    for (const categoryData of sampleCategories) {
      const category = new Category({
        ...categoryData,
        slug: createSlug(categoryData.name)
      })
      categories.push(await category.save())
    }

    // Create destinations
    console.log('Creating destinations...')
    const destinations = []
    for (const destData of sampleDestinations) {
      const destination = new Destination({
        ...destData,
        slug: createSlug(destData.name)
      })
      destinations.push(await destination.save())
    }

    // Create sample posts
    console.log('Creating posts...')
    const samplePosts = [
      {
        title: '10 Must-Visit Temples in Bali: A Spiritual Journey',
        excerpt: 'Discover the most sacred and beautiful temples in Bali, each with its own unique history and architectural marvel.',
        content: `
        <p>Bali is renowned for its stunning temples that showcase the island's rich Hindu heritage. Here are 10 temples you absolutely cannot miss:</p>
        
        <h2>1. Tanah Lot Temple</h2>
        <p>One of Bali's most iconic temples, perched on a rock formation in the sea. Best visited during sunset for breathtaking views.</p>
        
        <h2>2. Uluwatu Temple</h2>
        <p>Dramatically positioned on a cliff 70 meters above the ocean, this temple offers spectacular sunset views and traditional Kecak dance performances.</p>
        
        <h2>3. Besakih Temple</h2>
        <p>Known as the "Mother Temple" of Bali, this is the largest and holiest temple complex on the island.</p>
        
        <p>Each temple offers a unique glimpse into Balinese spirituality and culture, making them essential stops on any Bali itinerary.</p>
        `,
        author: users[1]._id,
        categories: [categories[1]._id],
        destinations: [destinations[0]._id],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1555400113-28f3e0c56e1b?w=800&h=400&fit=crop',
          alt: 'Tanah Lot Temple at sunset'
        },
        tags: ['bali', 'temples', 'culture', 'spirituality', 'indonesia'],
        status: 'published',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        readTime: 8
      },
      {
        title: 'Trekking Torres del Paine: Complete Guide to Patagonia\'s Crown Jewel',
        excerpt: 'Everything you need to know about trekking the famous W Circuit and O Circuit in Torres del Paine National Park.',
        content: `
        <p>Torres del Paine National Park is one of the world's premier trekking destinations. This comprehensive guide covers everything you need to know.</p>
        
        <h2>The W Circuit (4-5 days)</h2>
        <p>The most popular trek covering the park's highlights including the Torres Base, Cuernos viewpoint, and Grey Glacier.</p>
        
        <h2>The O Circuit (8-10 days)</h2>
        <p>For experienced trekkers, this full circuit adds the remote northern section of the park.</p>
        
        <h2>Best Time to Visit</h2>
        <p>October to April offers the most stable weather, though expect wind and unpredictable conditions year-round.</p>
        `,
        author: users[2]._id,
        categories: [categories[0]._id],
        destinations: [destinations[2]._id],
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1544737151-6e4b9b1c1b68?w=800&h=400&fit=crop',
          alt: 'Torres del Paine towers'
        },
        tags: ['patagonia', 'trekking', 'hiking', 'chile', 'adventure'],
        status: 'published',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readTime: 12
      }
    ]

    const posts = []
    for (const postData of samplePosts) {
      const post = new Post({
        ...postData,
        slug: createSlug(postData.title)
      })
      posts.push(await post.save())
    }

    // Create sample guides
    console.log('Creating guides...')
    const sampleGuides = [
      {
        id: 'bali-7-day-itinerary',
        title: '7-Day Bali Itinerary: From Temples to Beaches',
        description: 'Perfect week-long itinerary covering the best of Bali including cultural sites, beaches, and adventure activities.',
        type: 'itinerary',
        destination: {
          name: destinations[0].name,
          country: destinations[0].country,
          slug: destinations[0].slug
        },
        author: {
          name: users[1].name,
          avatar: users[1].avatar,
          bio: users[1].bio
        },
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
          alt: 'Bali itinerary guide'
        },
        duration: '7 days',
        difficulty: 'Easy',
        budget: {
          range: '$500-800',
          details: 'Total budget for 7 days including accommodation and activities'
        },
        bestTime: 'April to September',
        rating: 4.5,
        totalReviews: 25,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        isPremium: false,
        downloadCount: 150,
        sections: [
          {
            title: 'Getting to Bali',
            content: 'Fly into Ngurah Rai International Airport (DPS) in Denpasar. The airport is well-connected with major international hubs.',
            tips: [
              'Book flights during low season for better rates',
              'Consider early morning or late evening flights to avoid peak traffic',
              'Use airport taxis or ride-sharing apps for transportation'
            ]
          },
          {
            title: 'Transportation in Bali',
            content: 'Bali offers various transportation options from scooters to private drivers.',
            tips: [
              'Rent a scooter if you\'re comfortable driving on the left',
              'Use ride-sharing apps like Grab or Gojek',
              'Book private drivers for day trips',
              'Consider tourist shuttles between major areas'
            ]
          }
        ],
        itinerary: [
          {
            day: 1,
            title: 'Arrival in Ubud',
            activities: ['Check-in', 'Ubud Market visit', 'Traditional dinner'],
            meals: ['Traditional Balinese dinner'],
            accommodation: 'Ubud traditional guesthouse',
            budget: '$80'
          },
          {
            day: 2,
            title: 'Ubud Exploration',
            activities: ['Monkey Forest visit', 'Rice terrace walk', 'Art market shopping'],
            meals: ['Breakfast at guesthouse', 'Local warung lunch', 'Restaurant dinner'],
            accommodation: 'Ubud traditional guesthouse',
            budget: '$70'
          },
          {
            day: 3,
            title: 'Temples and Culture',
            activities: ['Saraswati Temple', 'Ubud Palace', 'Traditional dance show'],
            meals: ['Guesthouse breakfast', 'Street food lunch', 'Cultural dinner'],
            accommodation: 'Ubud traditional guesthouse',
            budget: '$75'
          },
          {
            day: 4,
            title: 'Mount Batur Sunrise Trek',
            activities: ['Early morning trek', 'Sunrise at summit', 'Hot springs relaxation'],
            meals: ['Pre-trek breakfast', 'Post-trek brunch', 'Relaxation dinner'],
            accommodation: 'Ubud traditional guesthouse',
            budget: '$90'
          },
          {
            day: 5,
            title: 'South Bali Beaches',
            activities: ['Uluwatu Temple', 'Kecak dance', 'Jimbaran Beach seafood'],
            meals: ['Guesthouse breakfast', 'Beachside lunch', 'Jimbaran seafood dinner'],
            accommodation: 'Jimbaran beach hotel',
            budget: '$85'
          },
          {
            day: 6,
            title: 'Seminyak and Shopping',
            activities: ['Beach time', 'Shopping at boutiques', 'Beach clubs'],
            meals: ['Hotel breakfast', 'Café lunch', 'Beach club dinner'],
            accommodation: 'Seminyak boutique hotel',
            budget: '$95'
          },
          {
            day: 7,
            title: 'Departure Day',
            activities: ['Last minute shopping', 'Relax at hotel', 'Airport transfer'],
            meals: ['Hotel breakfast', 'Airport lunch'],
            accommodation: 'Seminyak boutique hotel',
            budget: '$60'
          }
        ],
        packingList: [
          {
            category: 'Clothing',
            items: ['Light clothing', 'Swimwear', 'Light jacket', 'Comfortable walking shoes', 'Hat and sunglasses']
          },
          {
            category: 'Documents',
            items: ['Passport', 'Visa (if required)', 'Travel insurance', 'Credit cards', 'Cash (IDR)']
          },
          {
            category: 'Essentials',
            items: ['Sunscreen', 'Insect repellent', 'First aid kit', 'Reusable water bottle', 'Power adapter']
          }
        ],
        resources: [
          {
            title: 'Bali Transportation Guide',
            type: 'link',
            url: 'https://example.com/bali-transport'
          },
          {
            title: 'Bali Weather App',
            type: 'app',
            url: 'https://apps.apple.com/bali-weather'
          }
        ],
        relatedGuides: [
          {
            id: 'bali-food-guide',
            title: 'Bali Food Guide: Must-Try Local Dishes',
            slug: 'bali-food-guide-must-try-dishes',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop',
            type: 'food'
          }
        ],
        tags: ['bali', 'itinerary', 'culture', 'beaches', 'temples'],
        isPublished: true,
        isFeatured: true,
        views: 1250
      }
    ]

    const guides = []
    for (const guideData of sampleGuides) {
      const guide = new Guide({
        ...guideData,
        slug: createSlug(guideData.title)
      })
      guides.push(await guide.save())
    }

    // Create sample resources
    console.log('Creating resources...')
    const sampleResources = [
      {
        title: 'Booking.com',
        description: 'World\'s leading accommodation booking platform with millions of properties worldwide.',
        category: 'Booking',
        type: 'Website',
        url: 'https://booking.com',
        features: ['Wide selection of accommodations', 'Free cancellation options', 'Customer reviews', '24/7 support'],
        pros: ['Extensive inventory', 'User-friendly interface', 'Competitive prices'],
        cons: ['Service fees', 'Limited local properties in some areas'],
        pricing: {
          type: 'Free',
          description: 'Free to use, commission taken from bookings'
        },
        rating: {
          overall: 4.5,
          usability: 4.8,
          value: 4.2,
          support: 4.3,
          features: 4.6
        },
        tags: ['accommodation', 'hotels', 'booking'],
        isRecommended: true,
        isFeatured: true,
        author: users[0]._id
      }
    ]

    const resources = []
    for (const resourceData of sampleResources) {
      const resource = new Resource({
        ...resourceData,
        slug: createSlug(resourceData.title)
      })
      resources.push(await resource.save())
    }

    console.log('Database seeded successfully!')
    console.log(`Created:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${categories.length} categories`)
    console.log(`- ${destinations.length} destinations`)
    console.log(`- ${posts.length} posts`)
    console.log(`- ${guides.length} guides`)
    console.log(`- ${resources.length} resources`)

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

// Run the seed script
const runSeed = async () => {
  await connectDB()
  await seedDatabase()
}

if (require.main === module) {
  runSeed()
}

export default seedDatabase
