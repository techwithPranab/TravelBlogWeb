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
    shortDescription: 'Tropical paradise with beaches, temples, and rich culture',
    country: 'Indonesia',
    region: 'Southeast Asia',
    coordinates: {
      latitude: -8.4095,
      longitude: 115.1889
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
        alt: 'Bali rice terraces',
        caption: 'Famous Jatiluwih rice terraces in Bali',
        isPrimary: true
      }
    ],
    highlights: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach', 'Mount Batur Sunrise Trek'],
    bestTimeToVisit: {
      months: ['April', 'May', 'June', 'July', 'August', 'September'],
      description: 'Dry season with less rainfall and perfect weather for outdoor activities'
    },
    difficulty: 'Easy',
    budget: {
      currency: 'USD',
      low: 30,
      high: 100,
      description: 'Per day including accommodation, food, and activities'
    },
    tags: ['beaches', 'temples', 'culture', 'rice terraces', 'tropical'],
    activities: ['Surfing', 'Temple Hopping', 'Yoga Retreats', 'Hiking', 'Snorkeling'],
    isPopular: true,
    isFeatured: true,
    rating: {
      average: 4.8,
      count: 1250
    }
  },
  {
    name: 'Kyoto, Japan',
    description: 'Former imperial capital renowned for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.',
    shortDescription: 'Ancient capital with temples, gardens, and traditional culture',
    country: 'Japan',
    region: 'East Asia',
    coordinates: {
      latitude: 35.0116,
      longitude: 135.7681
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
        alt: 'Kyoto bamboo forest',
        caption: 'Famous Arashiyama Bamboo Grove',
        isPrimary: true
      }
    ],
    highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji Temple', 'Arashiyama Bamboo Grove', 'Gion District'],
    bestTimeToVisit: {
      months: ['March', 'April', 'May', 'October', 'November'],
      description: 'Spring cherry blossoms and autumn colors'
    },
    difficulty: 'Easy',
    budget: {
      currency: 'USD',
      low: 80,
      high: 200,
      description: 'Per day including accommodation, food, and activities'
    },
    tags: ['temples', 'culture', 'history', 'gardens', 'cherry blossoms'],
    activities: ['Temple Visits', 'Tea Ceremony', 'Cherry Blossom Viewing', 'Traditional Crafts'],
    isFeatured: true,
    rating: {
      average: 4.9,
      count: 980
    }
  },
  {
    name: 'Patagonia, Argentina & Chile',
    description: 'Vast wilderness region at the southern tip of South America, known for dramatic landscapes including glaciers, mountains, and steppes.',
    shortDescription: 'Dramatic wilderness with glaciers and mountains',
    country: 'Argentina',
    region: 'South America',
    coordinates: {
      latitude: -50.5,
      longitude: -73.0
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop',
        alt: 'Patagonia mountains',
        caption: 'Torres del Paine National Park',
        isPrimary: true
      }
    ],
    highlights: ['Torres del Paine', 'Perito Moreno Glacier', 'Mount Fitz Roy', 'Ushuaia'],
    bestTimeToVisit: {
      months: ['December', 'January', 'February', 'March'],
      description: 'Summer season with best weather for trekking'
    },
    difficulty: 'Challenging',
    budget: {
      currency: 'USD',
      low: 60,
      high: 150,
      description: 'Per day including accommodation, food, and activities'
    },
    tags: ['hiking', 'glaciers', 'wilderness', 'adventure', 'mountains'],
    activities: ['Trekking', 'Glacier Viewing', 'Wildlife Watching', 'Photography'],
    isPopular: true,
    rating: {
      average: 4.7,
      count: 650
    }
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
        title: '7-Day Bali Itinerary: From Temples to Beaches',
        description: 'Perfect week-long itinerary covering the best of Bali including cultural sites, beaches, and adventure activities.',
        content: 'Detailed day-by-day itinerary for exploring Bali...',
        author: users[1]._id,
        destination: destinations[0]._id,
        category: categories[1]._id,
        type: 'Itinerary',
        duration: {
          days: 7,
          description: 'One week exploring the highlights of Bali'
        },
        difficulty: 'Easy',
        budget: {
          currency: 'USD',
          amount: 500,
          description: 'Total budget for 7 days including accommodation and activities'
        },
        itinerary: [
          {
            day: 1,
            title: 'Arrival in Ubud',
            description: 'Arrive in Ubud, check into accommodation, explore Ubud center',
            activities: ['Check-in', 'Ubud Market visit', 'Traditional dinner'],
            accommodation: 'Ubud traditional guesthouse',
            meals: ['Traditional Balinese dinner'],
            transportation: 'Airport transfer',
            budget: 80
          }
        ],
        tags: ['bali', 'itinerary', 'culture', 'beaches'],
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
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
