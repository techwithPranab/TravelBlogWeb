import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Resource from '../models/Resource'
import User from '../models/User'

// Load environment variables
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

const sampleResources = [
  {
    title: 'Travel Insurance Comparison Guide',
    slug: 'travel-insurance-comparison-guide',
    description: 'Comprehensive guide to compare top travel insurance providers and find the best coverage for your trip. Learn about different types of coverage, exclusions, and how to choose the right policy.',
    category: 'Insurance',
    type: 'Guide',
    url: 'https://example.com/travel-insurance-guide',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop',
        alt: 'Travel insurance documents and passport',
        caption: 'Essential travel insurance documentation'
      }
    ],
    features: [
      'Compare 20+ insurance providers',
      'Coverage calculator tool',
      'Country-specific recommendations',
      'Claims process guide',
      'Emergency contact information'
    ],
    pros: [
      'Comprehensive comparison charts',
      'Regular updates with new providers',
      'Real user reviews and ratings',
      'Easy-to-understand explanations',
      'Mobile-friendly interface'
    ],
    cons: [
      'Limited to English-speaking countries',
      'Some providers require direct contact',
      'Price changes frequently'
    ],
    pricing: {
      type: 'Free',
      amount: 0,
      currency: 'INR',
      description: 'Free access to all comparison tools and guides'
    },
    rating: {
      overall: 4.8,
      usability: 4.7,
      value: 4.9,
      support: 4.6,
      features: 4.8
    },
    tags: ['insurance', 'travel safety', 'comparison', 'guide'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://partner.example.com/travel-insurance',
    isRecommended: true,
    isFeatured: true,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.8,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Budget Travel Planner Spreadsheet',
    slug: 'budget-travel-planner-spreadsheet',
    description: 'Professional Excel/Google Sheets template to plan and track your travel budget. Includes expense categories, currency converters, and visual spending analysis.',
    category: 'Apps',
    type: 'Template',
    url: 'https://docs.google.com/spreadsheets/budget-planner',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
        alt: 'Budget planning spreadsheet on laptop',
        caption: 'Travel budget planning made easy'
      }
    ],
    features: [
      'Pre-built expense categories',
      'Multi-currency support',
      'Automatic calculations',
      'Visual charts and graphs',
      'Trip comparison tools',
      'Emergency fund calculator'
    ],
    pros: [
      'Works with Excel and Google Sheets',
      'Customizable categories',
      'Real-time budget tracking',
      'Professional design',
      'Lifetime updates included'
    ],
    cons: [
      'Requires basic spreadsheet knowledge',
      'Manual data entry needed',
      'Limited mobile functionality'
    ],
    pricing: {
      type: 'Paid',
      amount: 1299,
      currency: 'INR',
      description: 'One-time purchase with lifetime updates'
    },
    rating: {
      overall: 4.6,
      usability: 4.4,
      value: 4.8,
      support: 4.5,
      features: 4.7
    },
    tags: ['budget', 'planning', 'spreadsheet', 'finance', 'template'],
    destinations: [],
    isAffiliate: false,
    affiliateLink: '',
    isRecommended: true,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.6,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Ultimate Packing Checklist',
    slug: 'ultimate-packing-checklist',
    description: 'Never forget anything again with our comprehensive packing checklist. Customizable for different trip types, seasons, and destinations with smart recommendations.',
    category: 'Other',
    type: 'Guide',
    url: 'https://example.com/packing-checklist',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop',
        alt: 'Organized travel packing',
        caption: 'Smart packing strategies'
      }
    ],
    features: [
      'Trip-type specific lists',
      'Weather-based recommendations',
      'Printable PDF versions',
      'Interactive web checklist',
      'Packing tips and tricks',
      'Space-saving techniques'
    ],
    pros: [
      'Comprehensive and detailed',
      'Customizable for any trip',
      'Regularly updated',
      'Mobile-friendly design',
      'Expert packing tips included'
    ],
    cons: [
      'Can be overwhelming for beginners',
      'Some items region-specific',
      'Requires account for customization'
    ],
    pricing: {
      type: 'Freemium',
      amount: 0,
      currency: 'INR',
      description: 'Free basic version, Premium features for ₹799'
    },
    rating: {
      overall: 4.7,
      usability: 4.8,
      value: 4.6,
      support: 4.5,
      features: 4.7
    },
    tags: ['packing', 'checklist', 'travel tips', 'organization'],
    destinations: [],
    isAffiliate: false,
    affiliateLink: '',
    isRecommended: true,
    isFeatured: true,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.7,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'TravelApps Pro Directory',
    slug: 'travelapps-pro-directory',
    description: 'Curated collection of the best travel apps for navigation, translation, booking, and travel planning. Updated monthly with new app discoveries and reviews.',
    category: 'Apps',
    type: 'App',
    url: 'https://travelapps.pro',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
        alt: 'Travel apps on smartphone',
        caption: 'Essential travel apps collection'
      }
    ],
    features: [
      '200+ curated travel apps',
      'Category-wise organization',
      'User reviews and ratings',
      'Platform compatibility info',
      'Regular monthly updates',
      'Offline functionality guide'
    ],
    pros: [
      'Expertly curated selection',
      'Detailed app descriptions',
      'Regular content updates',
      'User-friendly interface',
      'Covers all travel needs'
    ],
    cons: [
      'Subscription-based model',
      'Limited free content',
      'iOS-focused recommendations'
    ],
    pricing: {
      type: 'Subscription',
      amount: 399,
      currency: 'INR',
      description: '₹399/month or ₹3,299/year'
    },
    rating: {
      overall: 4.5,
      usability: 4.6,
      value: 4.3,
      support: 4.7,
      features: 4.5
    },
    tags: ['apps', 'mobile', 'directory', 'technology', 'tools'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://partner.travelapps.pro/signup',
    isRecommended: false,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.5,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Visa Requirements Database',
    slug: 'visa-requirements-database',
    description: 'Comprehensive database of visa requirements for travelers from different countries. Real-time updates with embassy information and application processes.',
    category: 'Services',
    type: 'Website',
    url: 'https://visarequirements.info',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop',
        alt: 'Passport and visa documents',
        caption: 'Visa information and requirements'
      }
    ],
    features: [
      '195+ countries covered',
      'Real-time requirement updates',
      'Embassy contact information',
      'Application process guides',
      'Processing time estimates',
      'Required documents lists'
    ],
    pros: [
      'Comprehensive coverage',
      'Regularly updated information',
      'User-friendly search',
      'Mobile-optimized',
      'Free basic information'
    ],
    cons: [
      'Premium features cost extra',
      'Some countries incomplete',
      'Complex requirements simplified'
    ],
    pricing: {
      type: 'Freemium',
      amount: 0,
      currency: 'INR',
      description: 'Free basic info, Premium for ₹1,099/year'
    },
    rating: {
      overall: 4.4,
      usability: 4.3,
      value: 4.5,
      support: 4.2,
      features: 4.6
    },
    tags: ['visa', 'travel documents', 'requirements', 'embassy', 'database'],
    destinations: [],
    isAffiliate: false,
    affiliateLink: '',
    isRecommended: true,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.4,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Currency Exchange Calculator',
    slug: 'currency-exchange-calculator',
    description: 'Real-time currency converter with historical rates, travel money tips, and best exchange rate finder. Includes offline functionality and rate alerts.',
    category: 'Apps',
    type: 'Tool',
    url: 'https://currencyexchange.tools',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop',
        alt: 'Currency exchange rates on phone',
        caption: 'Real-time currency conversion'
      }
    ],
    features: [
      '170+ currencies supported',
      'Real-time exchange rates',
      'Historical rate charts',
      'Rate change alerts',
      'Offline calculator',
      'Travel money tips'
    ],
    pros: [
      'Accurate real-time rates',
      'Works offline',
      'Clean, intuitive design',
      'Helpful travel tips',
      'No ads in premium version'
    ],
    cons: [
      'Basic features only in free version',
      'Requires internet for updates',
      'Limited historical data in free tier'
    ],
    pricing: {
      type: 'Freemium',
      amount: 0,
      currency: 'INR',
      description: 'Free with ads, Pro version ₹249'
    },
    rating: {
      overall: 4.3,
      usability: 4.5,
      value: 4.2,
      support: 4.1,
      features: 4.4
    },
    tags: ['currency', 'exchange rates', 'calculator', 'finance', 'travel money'],
    destinations: [],
    isAffiliate: false,
    affiliateLink: '',
    isRecommended: false,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.3,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Booking.com Travel Assistant',
    slug: 'booking-com-travel-assistant',
    description: 'Official Booking.com mobile app for finding and booking accommodations worldwide. Features exclusive mobile deals and instant confirmation.',
    category: 'Booking',
    type: 'App',
    url: 'https://booking.com/app',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=200&fit=crop',
        alt: 'Hotel booking app interface',
        caption: 'Book accommodations on the go'
      }
    ],
    features: [
      '28+ million listings',
      'Instant booking confirmation',
      'Mobile-exclusive deals',
      'Map-based search',
      'Offline access to bookings',
      '24/7 customer support'
    ],
    pros: [
      'Huge selection of properties',
      'Reliable booking platform',
      'Great mobile deals',
      'User-friendly interface',
      'Excellent customer service'
    ],
    cons: [
      'Can be overwhelming with choices',
      'Prices may not include all fees',
      'Limited loyalty program benefits'
    ],
    pricing: {
      type: 'Free',
      amount: 0,
      currency: 'INR',
      description: 'Free app, commission from bookings'
    },
    rating: {
      overall: 4.7,
      usability: 4.8,
      value: 4.6,
      support: 4.7,
      features: 4.7
    },
    tags: ['booking', 'hotels', 'accommodations', 'mobile app', 'travel planning'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://booking.com/app?aid=travel-blog',
    isRecommended: true,
    isFeatured: true,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.7,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Osprey Travel Backpack Guide',
    slug: 'osprey-travel-backpack-guide',
    description: 'Comprehensive guide to Osprey travel backpacks with detailed reviews, size comparisons, and recommendations for different travel styles.',
    category: 'Gear',
    type: 'Product',
    url: 'https://osprey.com/travel-backpacks',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop',
        alt: 'Travel backpack and gear',
        caption: 'Quality travel backpacks for every journey'
      }
    ],
    features: [
      '15+ backpack models reviewed',
      'Size and capacity guides',
      'Travel style recommendations',
      'Durability testing results',
      'Price comparison charts',
      'User experience stories'
    ],
    pros: [
      'Detailed product analysis',
      'Real user reviews',
      'Expert recommendations',
      'Regular content updates',
      'Helpful buying guides'
    ],
    cons: [
      'Brand-specific focus',
      'Higher price point products',
      'Limited budget options'
    ],
    pricing: {
      type: 'Free',
      amount: 0,
      currency: 'INR',
      description: 'Free guide with affiliate links'
    },
    rating: {
      overall: 4.6,
      usability: 4.5,
      value: 4.7,
      support: 4.4,
      features: 4.6
    },
    tags: ['backpacks', 'gear', 'osprey', 'travel equipment', 'reviews'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://osprey.com/travel?ref=travel-blog',
    isRecommended: true,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.6,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Google Translate Mobile App',
    slug: 'google-translate-mobile-app',
    description: 'Essential translation app for travelers with camera translation, offline language packs, and conversation mode for real-time communication.',
    category: 'Apps',
    type: 'App',
    url: 'https://translate.google.com/intl/en/about/apps/',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=400&h=200&fit=crop',
        alt: 'Translation app on smartphone',
        caption: 'Break language barriers while traveling'
      }
    ],
    features: [
      '100+ languages supported',
      'Camera translation',
      'Offline translation',
      'Conversation mode',
      'Voice translation',
      'Handwriting recognition'
    ],
    pros: [
      'Free to use',
      'Works offline',
      'Accurate translations',
      'Multiple input methods',
      'Constantly improving'
    ],
    cons: [
      'Requires Google account',
      'Some languages less accurate',
      'Privacy concerns for some users'
    ],
    pricing: {
      type: 'Free',
      amount: 0,
      currency: 'USD',
      description: 'Completely free with no ads'
    },
    rating: {
      overall: 4.5,
      usability: 4.7,
      value: 4.9,
      support: 4.2,
      features: 4.4
    },
    tags: ['translation', 'language', 'communication', 'mobile app', 'google'],
    destinations: [],
    isAffiliate: false,
    affiliateLink: '',
    isRecommended: true,
    isFeatured: true,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.5,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Skyscanner Flight Search',
    slug: 'skyscanner-flight-search',
    description: 'Comprehensive flight comparison engine to find the best deals across airlines. Features flexible date search, price alerts, and direct booking.',
    category: 'Transportation',
    type: 'Website',
    url: 'https://skyscanner.com',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop',
        alt: 'Flight search interface on laptop',
        caption: 'Find the best flight deals worldwide'
      }
    ],
    features: [
      'Search 1000+ airlines',
      'Flexible date comparison',
      'Price alert notifications',
      'Multi-city trip planning',
      'Mobile app available',
      'Direct airline booking'
    ],
    pros: [
      'Comprehensive search results',
      'User-friendly interface',
      'Helpful price trends',
      'No booking fees',
      'Reliable service'
    ],
    cons: [
      'Redirects to airline sites',
      'Limited customer support',
      'Prices can change quickly'
    ],
    pricing: {
      type: 'Free',
      amount: 0,
      currency: 'INR',
      description: 'Free service, earns commission from airlines'
    },
    rating: {
      overall: 4.4,
      usability: 4.5,
      value: 4.6,
      support: 4.1,
      features: 4.4
    },
    tags: ['flights', 'airlines', 'booking', 'comparison', 'travel deals'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://skyscanner.com?associateid=travel-blog',
    isRecommended: true,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.4,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'World Nomads Travel Insurance',
    slug: 'world-nomads-travel-insurance',
    description: 'Flexible travel insurance designed for adventurous travelers. Covers adventure activities, remote destinations, and provides 24/7 emergency assistance.',
    category: 'Insurance',
    type: 'Service',
    url: 'https://worldnomads.com',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
        alt: 'Adventure traveler with backpack',
        caption: 'Insurance for adventurous travelers'
      }
    ],
    features: [
      'Adventure sports coverage',
      '24/7 emergency assistance',
      'Flexible policy extensions',
      'Online claims process',
      'Travel safety resources',
      'Country-specific advice'
    ],
    pros: [
      'Covers adventure activities',
      'Can buy while already traveling',
      'Good customer service',
      'Comprehensive coverage',
      'Trusted by backpackers'
    ],
    cons: [
      'Higher premiums',
      'Age restrictions apply',
      'Some exclusions for extreme sports'
    ],
    pricing: {
      type: 'Paid',
      amount: 0,
      currency: 'INR',
      description: 'Varies by destination and coverage'
    },
    rating: {
      overall: 4.3,
      usability: 4.2,
      value: 4.1,
      support: 4.6,
      features: 4.4
    },
    tags: ['insurance', 'adventure travel', 'backpacking', 'safety', 'coverage'],
    destinations: [],
    isAffiliate: true,
    affiliateLink: 'https://worldnomads.com?affiliate=travel-blog',
    isRecommended: true,
    isFeatured: false,
    isActive: true,
    reviews: [],
    totalReviews: 0,
    averageRating: 4.3,
    clickCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const seedResources = async () => {
  try {
    console.log('🌱 Starting resource seeding process...')

    // Clear existing resources
    console.log('🗑️  Clearing existing resources...')
    const deletedCount = await Resource.deleteMany({})
    console.log(`   Deleted ${deletedCount.deletedCount} existing resources`)

    // Find or create admin user
    console.log('👤 Finding admin user...')
    let adminUser = await User.findOne({ email: 'admin@travelblog.com' })
    
    if (!adminUser) {
      console.log('   Admin user not found, please run the main seed script first or create an admin user')
      console.log('   Creating a temporary admin user for resources...')
      
      // Create temporary admin user
      const bcrypt = require('bcryptjs')
      const salt = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash('admin123', salt)
      
      adminUser = new User({
        name: 'Resource Admin',
        email: 'admin@travelblog.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        profile: {
          bio: 'Travel resource administrator',
          location: 'Worldwide',
          website: 'https://travelblog.com'
        },
        preferences: {
          emailNotifications: true,
          newsletter: true,
          twoFactorAuth: false
        }
      })
      
      await adminUser.save()
      console.log('   ✅ Created temporary admin user')
    } else {
      console.log(`   ✅ Found admin user: ${adminUser.name}`)
    }

    // Create resources
    console.log('📚 Creating sample resources...')
    const createdResources = []
    
    for (let i = 0; i < sampleResources.length; i++) {
      const resourceData = sampleResources[i]
      console.log(`   Creating: ${resourceData.title}`)
      
      const resource = new Resource({
        ...resourceData,
        author: adminUser._id
      })
      
      const savedResource = await resource.save()
      createdResources.push(savedResource)
    }

    // Summary
    console.log('\n🎉 Resource seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   ✅ Created ${createdResources.length} resources`)
    
    // Categorize resources
    const categories: { [key: string]: number } = {}
    createdResources.forEach(resource => {
      categories[resource.category] = (categories[resource.category] || 0) + 1
    })
    
    console.log('   📂 Resources by category:')
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`      ${category}: ${count} resources`)
    })
    
    console.log('   🔗 Featured resources:', createdResources.filter(r => r.isFeatured).length)
    console.log('   ⭐ Recommended resources:', createdResources.filter(r => r.isRecommended).length)
    console.log('   💰 Affiliate resources:', createdResources.filter(r => r.isAffiliate).length)

  } catch (error) {
    console.error('❌ Error seeding resources:', error)
    throw error
  }
}

// Main execution function
const runResourceSeeder = async () => {
  try {
    await connectDB()
    await seedResources()
  } catch (error) {
    console.error('💥 Resource seeder failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  runResourceSeeder()
}

export { seedResources }
export default runResourceSeeder
