import express from 'express'
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  bulkUpdateStatus,
  duplicateAdvertisement,
  getActiveAds,
  getAdsForPlacement,
  getAdsForBlogPost,
  getStatsOverview
} from '../controllers/advertisementController'
import { requireAdmin } from '../middleware/adminAuth'
import { validate } from '../middleware/validate'
import { body, param, query } from 'express-validator'

const router = express.Router()

// Validation rules
const createAdValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn([
    'announcement', 'hotel', 'travel_accessories', 'tour_operator',
    'airline', 'insurance', 'booking_platform', 'destination_promotion',
    'restaurant', 'transportation', 'photography', 'experience',
    'financial', 'technology', 'affiliate', 'sponsored_content', 'custom'
  ]).withMessage('Invalid advertisement type'),
  body('format').isIn([
    'banner', 'rectangle', 'skyscraper', 'leaderboard', 'mobile_banner',
    'native', 'interstitial', 'sticky', 'in_content', 'sidebar',
    'popup', 'video', 'carousel'
  ]).withMessage('Invalid advertisement format'),
  body('destinationUrl').isURL().withMessage('Valid destination URL is required'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required')
]

const updateAdValidation = [
  param('id').isMongoId().withMessage('Invalid advertisement ID')
]

// Admin routes (protected)
router.post('/', requireAdmin, createAdValidation, validate, createAdvertisement)
router.get('/', requireAdmin, getAdvertisements)
router.get('/stats/overview', requireAdmin, getStatsOverview)
router.get('/:id', requireAdmin, updateAdValidation, validate, getAdvertisementById)
router.put('/:id', requireAdmin, updateAdValidation, validate, updateAdvertisement)
router.delete('/:id', requireAdmin, updateAdValidation, validate, deleteAdvertisement)
router.patch('/bulk-status', requireAdmin, bulkUpdateStatus)
router.post('/:id/duplicate', requireAdmin, updateAdValidation, validate, duplicateAdvertisement)

// Public routes
router.get('/active', getActiveAds)
router.get('/placement/:position', getAdsForPlacement)
router.get('/blog/:blogId', getAdsForBlogPost)

export default router
