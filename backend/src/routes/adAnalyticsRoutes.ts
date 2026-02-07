import express from 'express'
import {
  trackImpression,
  trackClick,
  trackConversion,
  getAnalyticsByAd,
  getAnalyticsSummary,
  getPerformanceReport,
  exportAnalytics,
  getTopPerformers,
  getRevenueAnalytics
} from '../controllers/adAnalyticsController'
import { requireAdmin } from '../middleware/adminAuth'
import { validate } from '../middleware/validate'
import { body, param, query } from 'express-validator'

const router = express.Router()

// Validation rules
const trackingValidation = [
  body('advertisementId').isMongoId().withMessage('Invalid advertisement ID'),
  body('placement').notEmpty().withMessage('Placement is required')
]

// Public tracking routes (no auth, but rate limited)
router.post('/impression', trackingValidation, validate, trackImpression)
router.post('/click', trackingValidation, validate, trackClick)
router.post('/conversion', trackingValidation, validate, trackConversion)

// Admin analytics routes (protected)
router.get('/advertisement/:id', requireAdmin, getAnalyticsByAd)
router.get('/summary', requireAdmin, getAnalyticsSummary)
router.get('/performance', requireAdmin, getPerformanceReport)
router.get('/export', requireAdmin, exportAnalytics)
router.get('/top-performers', requireAdmin, getTopPerformers)
router.get('/revenue', requireAdmin, getRevenueAnalytics)

export default router
