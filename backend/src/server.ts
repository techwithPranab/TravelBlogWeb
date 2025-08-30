import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import dotenv from 'dotenv'

import { connectDB } from '@/config/database'
import { errorHandler } from '@/middleware/errorHandler'
import { notFound } from '@/middleware/notFound'

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

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Create Express app
const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
