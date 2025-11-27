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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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

// Public testimonials endpoint for home page
app.get('/api/public/testimonials', async (req, res) => {
  try {
    // For now, return curated testimonials
    // In a real application, this could fetch from a testimonials collection
    const testimonials = [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Adventure Traveler',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        text: 'BagPackStories has been my go-to resource for planning amazing adventures. The detailed guides and real traveler experiences are invaluable.',
        featured: true
      },
      {
        id: '2',
        name: 'Mike Chen',
        role: 'Photography Enthusiast',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        text: 'The photography tips and destination guides have helped me capture stunning travel photos. Highly recommend for any travel photographer.',
        featured: true
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        role: 'Solo Female Traveler',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        text: 'As a solo female traveler, I appreciate the safety tips and community support. BagPackStories makes solo travel feel safe and exciting.',
        featured: true
      }
    ]

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
        contactEmail: 'hello@bagpackstories.in',
        supportEmail: 'support@bagpackstories.in',
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
          email: 'support@bagpackstories.in',
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
        email: 'support@bagpackstories.in',
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
