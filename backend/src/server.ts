import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import path from 'path'
import mongoose from 'mongoose'

// Load environment variables FIRST
dotenv.config()

// Importing the database connection and middleware
import { connectDB } from '@/config/database'
import { errorHandler } from '@/middleware/errorHandler'
import notFound from '@/middleware/notFound'

// Route imports
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/users'
import postRoutes from '@/routes/posts'
import categoryRoutes from '@/routes/categoryRoutes'
import destinationRoutes from '@/routes/destinationRoutes'
import guideRoutes from '@/routes/guideRoutes'
import resourceRoutes from '@/routes/resourceRoutes'
import commentRoutes from '@/routes/commentRoutes'
import contactRoutes from '@/routes/contactRoutes'
import photoRoutes from '@/routes/photoRoutes'
import newsletterRoutes from '@/routes/newsletterRoutes'
import adminRoutes from '@/routes/adminRoutes'
import readerRoutes from '@/routes/readerRoutes'
import contributorRoutes from '@/routes/contributorRoutes'
import partnerRoutes from '@/routes/partnerRoutes'
import itineraryRoutes from '@/routes/itineraryRoutes'
import subscriptionRoutes from '@/routes/subscriptionRoutes'
import siteSettingsRoutes from '@/routes/siteSettingsRoutes'
import itineraryReviewRoutes from '@/routes/itineraryReviewRoutes'

// Connect to database
connectDB()

// Initialize email scheduler
import { emailScheduler } from '@/services/emailScheduler'

// Create Express app
const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour for dev, 15 min for prod
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests for dev, 100 for prod
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks, static files, and common development routes
  skip: (req) => {
    return req.path === '/health' || 
           req.path.startsWith('/uploads/') || 
           req.path.startsWith('/api/auth/login') ||
           req.path.startsWith('/api/auth/register')
  }
})

// Apply rate limiting to all requests
app.use(limiter)

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:'],
      frameSrc: ["'self'", 'https:'],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Data sanitization
app.use(mongoSanitize())
app.use(hpp())

// Serve static files from uploads directory (for local storage fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Public stats endpoint for home page metrics
app.get('/api/public/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalDestinations,
      totalGuides,
      totalSubscribers
    ] = await Promise.all([
      require('./models/User').default.countDocuments(),
      require('./models/Post').default.countDocuments({ status: 'published' }),
      require('./models/Destination').default.countDocuments({ isActive: true }),
      require('./models/Guide').default.countDocuments({ isPublished: true }),
      require('./models/Newsletter').default.countDocuments()
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalDestinations,
        totalGuides,
        totalSubscribers
      }
    })
  } catch (error) {
    console.error('Public stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public stats'
    })
  }
})

// Public about page metrics endpoint
app.get('/api/public/about-metrics', async (req, res) => {
  try {
    const Post = require('./models/Post').default
    const Destination = require('./models/Destination').default
    const Photo = require('./models/Photo').default
    const User = require('./models/User').default

    const [
      totalCountries,
      totalPhotos,
      totalMilesTraveled,
      totalTravelersInspired
    ] = await Promise.all([
      // Count distinct countries from published posts
      Post.aggregate([
        { $match: { status: 'published', 'destination.country': { $exists: true, $ne: null } } },
        { $group: { _id: '$destination.country' } },
        { $count: 'totalCountries' }
      ]).then((result: any[]) => result[0]?.totalCountries || 0),
      // Count total photos
      Photo.countDocuments({ status: 'approved' }),
      // Sum all kmtravelled from published posts
      Post.aggregate([
        { $match: { status: 'published', kmtravelled: { $exists: true, $ne: null } } },
        { $group: { _id: null, totalKm: { $sum: '$kmtravelled' } } }
      ]).then((result: any[]) => result[0]?.totalKm || 0),
      // Count newsletter subscribers as travelers inspired
      require('./models/Newsletter').default.countDocuments()
    ])

    res.json({
      success: true,
      data: {
        countriesVisited: totalCountries,
        photosTaken: totalPhotos,
        kmTravelled: totalMilesTraveled,
        travelersInspired: totalTravelersInspired
      }
    })
  } catch (error) {
    console.error('About metrics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about page metrics'
    })
  }
})

// Public travel locations endpoint for interactive map
app.get('/api/public/travel-locations', async (req, res) => {
  try {
    const Post = require('./models/Post').default

    // Get distinct travel locations from published blog posts
    const posts = await Post.find({
      status: 'published',
      'destination.coordinates.lat': { $exists: true, $ne: null },
      'destination.coordinates.lng': { $exists: true, $ne: null },
      'destination.country': { $exists: true, $ne: null }
    }).select('title slug excerpt featuredImage publishedAt viewCount destination')

    // Group posts by location in JavaScript
    const locationMap = new Map()

    posts.forEach((post: any) => {
      const country = post.destination.country
      const city = post.destination.city
      const lat = post.destination.coordinates.lat
      const lng = post.destination.coordinates.lng
      
      const locationKey = `${country}-${city || 'main'}-${lat}-${lng}`
      
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          id: locationKey,
          name: city || country,
          country: country,
          city: city,
          coordinates: [lng, lat],
          posts: [],
          totalViews: 0,
          latestPost: null
        })
      }

      const location = locationMap.get(locationKey)
      location.posts.push({
        id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt,
        viewCount: post.viewCount || 0
      })
      
      location.totalViews += post.viewCount || 0
      
      if (!location.latestPost || new Date(post.publishedAt) > new Date(location.latestPost)) {
        location.latestPost = post.publishedAt
      }
    })

    // Convert map to array and add computed fields
    const travelLocations = Array.from(locationMap.values()).map((location: any) => ({
      ...location,
      totalPosts: location.posts.length,
      description: `Explored through ${location.posts.length} blog post${location.posts.length > 1 ? 's' : ''} with ${location.totalViews.toLocaleString()} total views.`,
      photos: location.posts.map((post: any) => post.featuredImage?.url).filter(Boolean),
      visitDate: location.latestPost ? new Date(location.latestPost).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown',
      highlights: location.posts.slice(0, 4).map((post: any) => post.title),
      blogPost: location.posts.length === 1 ? `/blog/${location.posts[0].slug}` : undefined
    }))

    // Sort by total views and posts
    travelLocations.sort((a: any, b: any) => b.totalViews - a.totalViews || b.totalPosts - a.totalPosts)

    res.json({
      success: true,
      data: travelLocations
    })
  } catch (error) {
    console.error('Travel locations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travel locations'
    })
  }
})

// Public testimonials endpoint for home page
app.get('/api/public/testimonials', async (req, res) => {
  try {
    const Comment = require('./models/Comment').default

    // Get 3 random flagged comments
    const flaggedComments = await Comment.aggregate([
      { $match: { status: 'flagged' } },
      { $sample: { size: 3 } }
    ])

    // Transform comments into testimonial format
    const testimonials = flaggedComments.map((comment: any, index: number) => {
      return {
        id: comment._id,
        name: comment.author.name,
        role: 'Community Member',
        avatar: comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`,
        rating: 5, // Default rating for testimonials
        text: comment.content.length > 200 ? comment.content.substring(0, 200) + '...' : comment.content,
        featured: true
      }
    })

    res.status(200).json({
      success: true,
      data: testimonials
    })
  } catch (error) {
    console.error('Public testimonials error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    })
  }
})

// Public contact/site information endpoint
app.get('/api/public/contact', async (req, res) => {
  try {
    // Fetch contact information from site settings
    const SiteSettings = (await import('./models/SiteSettings')).default
    let settings = await SiteSettings.findOne()

    if (!settings) {
      // Create default settings if none exist
      settings = new SiteSettings({
        siteName: 'BagPackStories',
        siteDescription: 'Discover amazing travel destinations and guides',
        siteUrl: 'https://yourdomain.com',
        contactEmail: process.env.CONTACT_EMAIL || 'hello@yourdomain.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
        contactPhone: '+1 (555) 123-4567',
        contactAddress: {
          street: '123 Travel Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States'
        },
        businessHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        supportSettings: {
          email: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
          responseTime: 'Within 24 hours'
        },
        socialLinks: {
          facebook: 'https://facebook.com/bagpackstories',
          twitter: 'https://twitter.com/bagpackstories',
          instagram: 'https://instagram.com/bagpackstories',
          youtube: 'https://youtube.com/bagpackstories'
        }
      })
      await settings.save()
    }

    // Return contact information from settings
    const contactInfo = {
      email: settings.contactEmail,
      phone: settings.contactPhone || '+1 (555) 123-4567',
      address: settings.contactAddress || {
        street: '123 Travel Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States'
      },
      socialLinks: {
        facebook: settings.socialLinks?.facebook || 'https://facebook.com/bagpackstories',
        twitter: settings.socialLinks?.twitter || 'https://twitter.com/bagpackstories',
        instagram: settings.socialLinks?.instagram || 'https://instagram.com/bagpackstories',
        youtube: settings.socialLinks?.youtube || 'https://youtube.com/bagpackstories'
      },
      businessHours: settings.businessHours || {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      support: settings.supportSettings || {
        email: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
        responseTime: 'Within 24 hours'
      }
    }

    res.status(200).json({
      success: true,
      data: contactInfo
    })
  } catch (error) {
    console.error('Public contact error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    })
  }
})

// Debug endpoint to check environment variables and database
app.get('/debug/env', async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState;
    const statusMap: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    const dbStatusText = statusMap[dbStatus] || 'unknown';

    // Test user count
    let userCount = 0;
    try {
      const User = (await import('./models/User')).default;
      userCount = await User.countDocuments();
    } catch (dbError) {
      console.error('Database test error:', dbError);
    }

    res.status(200).json({
      success: true,
      message: 'Environment and database check',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL: process.env.FRONTEND_URL ? 'SET' : 'NOT SET'
      },
      database: {
        status: dbStatusText,
        userCount: userCount,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
      },
      jwt: {
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
        JWT_EXPIRE: process.env.JWT_EXPIRE
      },
      cloudinary: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Rate limit status endpoint
app.get('/api/rate-limit-status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rate limit status',
    environment: process.env.NODE_ENV,
    limits: {
      windowMs: process.env.NODE_ENV === 'development' ? 60 * 60 * 1000 : 15 * 60 * 1000,
      max: process.env.NODE_ENV === 'development' ? 1000 : 100,
      window: process.env.NODE_ENV === 'development' ? '1 hour' : '15 minutes'
    }
  })
})

// API routes
const API_VERSION = '/api'

app.use(`${API_VERSION}/auth`, authRoutes)
app.use(`${API_VERSION}/users`, userRoutes)
app.use(`${API_VERSION}/posts`, postRoutes)
app.use(`${API_VERSION}/categories`, categoryRoutes)
app.use(`${API_VERSION}/destinations`, destinationRoutes)
app.use(`${API_VERSION}/guides`, guideRoutes)
app.use(`${API_VERSION}/resources`, resourceRoutes)
app.use(`${API_VERSION}/comments`, commentRoutes)
app.use(`${API_VERSION}/contact`, contactRoutes)
app.use(`${API_VERSION}/photos`, photoRoutes)
app.use(`${API_VERSION}/newsletter`, newsletterRoutes)
app.use(`${API_VERSION}/admin`, adminRoutes)
app.use(`${API_VERSION}/contributor`, contributorRoutes)
app.use(`${API_VERSION}/reader`, readerRoutes)
app.use(`${API_VERSION}/partners`, partnerRoutes)
app.use(`${API_VERSION}/itineraries`, itineraryRoutes)
app.use(`${API_VERSION}/itinerary-reviews`, itineraryReviewRoutes)
app.use(`${API_VERSION}/subscriptions`, subscriptionRoutes)
app.use(`${API_VERSION}/site-settings`, siteSettingsRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
  console.log(`📱 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}${API_VERSION}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('❌ Unhandled Rejection:', err.message)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('❌ Uncaught Exception:', err.message)
  process.exit(1)
})

export default app
