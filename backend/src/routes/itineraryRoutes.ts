import express from 'express'
import {
  generateItinerary,
  getUserItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  regenerateItinerary,
  getSharedItinerary,
  regenerateDay,
  downloadItineraryPDF,
  emailItinerary
} from '../controllers/itineraryController'
import { protect } from '../middleware/auth'
import { itineraryRateLimit } from '../middleware/rateLimiter'

const router = express.Router()

// Public route - view shared itinerary
router.get('/share/:token', getSharedItinerary)

// Protected routes - require authentication
router.use(protect)

// Generate new itinerary (with rate limiting)
router.post('/', itineraryRateLimit(), generateItinerary)

// Get user's itineraries
router.get('/', getUserItineraries)

// Get single itinerary
router.get('/:id', getItineraryById)

// Update itinerary
router.put('/:id', updateItinerary)

// Delete itinerary
router.delete('/:id', deleteItinerary)

// Regenerate entire itinerary (with rate limiting)
router.post('/:id/regenerate', itineraryRateLimit(), regenerateItinerary)

// Regenerate specific day
router.post('/:id/regenerate-day', regenerateDay)

// Download itinerary as PDF (premium feature)
router.get('/:id/download', downloadItineraryPDF)

// Email itinerary (premium feature)
router.post('/:id/email', emailItinerary)

export default router
