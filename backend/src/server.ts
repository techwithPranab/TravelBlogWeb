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

// Connect to database
connectDB()

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

// Debug endpoint to check environment variables
app.get('/debug/env', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Environment variables check',
    cloudinary: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    },
    port: process.env.PORT,
    node_env: process.env.NODE_ENV
  })
})

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
app.use(`${API_VERSION}/reader`, readerRoutes)

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
