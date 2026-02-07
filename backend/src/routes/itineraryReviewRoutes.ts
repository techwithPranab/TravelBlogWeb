import express from 'express'
import { protect as auth } from '../middleware/auth'
import { requireAdmin as adminAuth } from '../middleware/adminAuth'
import { simpleRateLimit } from '../middleware/rateLimiter'
import { validate } from '../middleware/validate'
import { body, param, query } from 'express-validator'
import * as itineraryReviewController from '../controllers/itineraryReviewController'
import * as adminItineraryReviewController from '../controllers/adminItineraryReviewController'
import { Request, Response, NextFunction } from 'express'

const router = express.Router()

// Validation schemas
const createReviewValidation = [
  body('itineraryId').isMongoId().withMessage('Valid itinerary ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 30, max: 2000 })
    .withMessage('Comment must be between 30 and 2000 characters')
    .custom((value) => {
      const wordCount = value.trim().split(/\s+/).length
      if (wordCount < 10) {
        throw new Error('Comment must contain at least 10 words')
      }
      return true
    }),
  body('tripDate').optional().isISO8601().withMessage('Trip date must be a valid date')
]

const updateReviewValidation = [
  param('id').isMongoId().withMessage('Valid review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 30, max: 2000 })
    .withMessage('Comment must be between 30 and 2000 characters')
    .custom((value) => {
      if (value) {
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount < 10) {
          throw new Error('Comment must contain at least 10 words')
        }
      }
      return true
    }),
  body('tripDate').optional().isISO8601().withMessage('Trip date must be a valid date')
]

const rejectReviewValidation = [
  param('id').isMongoId().withMessage('Valid review ID is required'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
]

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['recent', 'helpful', 'rating-high', 'rating-low']).withMessage('Invalid sort option')
]

// ===================
// PUBLIC ROUTES
// ===================

/**
 * POST /api/itinerary-reviews/validate
 * Validate review content before submission
 */
router.post(
  '/validate',
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('comment').isLength({ min: 1, max: 3000 }).withMessage('Comment is required')
  ],
  validate,
  itineraryReviewController.validateReviewContent
)

/**
 * GET /api/itinerary-reviews/featured
 * Get featured reviews for homepage carousel
 */
router.get(
  '/featured',
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  validate,
  itineraryReviewController.getFeaturedReviews
)

/**
 * GET /api/itinerary-reviews/itinerary/:itineraryId
 * Get all approved reviews for a specific itinerary
 */
router.get(
  '/itinerary/:itineraryId',
  param('itineraryId').isMongoId().withMessage('Valid itinerary ID is required'),
  paginationValidation,
  validate,
  itineraryReviewController.getReviewsByItinerary
)

// ===================
// AUTHENTICATED USER ROUTES
// ===================

/**
 * POST /api/itinerary-reviews
 * Create a new review (rate limited to 5 per hour)
 */
router.post(
  '/',
  auth,
  simpleRateLimit(5, 60 * 60 * 1000), // 5 reviews per hour
  createReviewValidation,
  validate,
  itineraryReviewController.createItineraryReview
)

/**
 * GET /api/itinerary-reviews/my-reviews
 * Get current user's reviews
 */
router.get(
  '/my-reviews',
  auth,
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  validate,
  itineraryReviewController.getUserReviews
)

/**
 * PUT /api/itinerary-reviews/:id
 * Update user's own review
 */
router.put(
  '/:id',
  auth,
  updateReviewValidation,
  validate,
  itineraryReviewController.updateItineraryReview
)

/**
 * DELETE /api/itinerary-reviews/:id
 * Delete user's own review
 */
router.delete(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validate,
  itineraryReviewController.deleteItineraryReview
)

/**
 * POST /api/itinerary-reviews/:id/helpful
 * Mark a review as helpful
 */
router.post(
  '/:id/helpful',
  auth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validate,
  itineraryReviewController.markReviewHelpful
)

// ===================
// ADMIN ROUTES
// ===================

/**
 * GET /api/itinerary-reviews/admin/pending
 * Get all pending reviews (admin only)
 */
router.get(
  '/admin/pending',
  auth,
  adminAuth,
  paginationValidation,
  validate,
  adminItineraryReviewController.getPendingReviews
)

/**
 * GET /api/itinerary-reviews/admin/all
 * Get all reviews with filters (admin only)
 */
router.get(
  '/admin/all',
  auth,
  adminAuth,
  [
    ...paginationValidation,
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    query('itineraryId').optional().isMongoId().withMessage('Valid itinerary ID required'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  validate,
  adminItineraryReviewController.getAllReviews
)

/**
 * GET /api/itinerary-reviews/admin/featured
 * Get all featured reviews (admin only)
 */
router.get(
  '/admin/featured',
  auth,
  adminAuth,
  adminItineraryReviewController.getFeaturedReviews
)

/**
 * PUT /api/itinerary-reviews/admin/:id/approve
 * Approve a review (admin only)
 */
router.put(
  '/admin/:id/approve',
  auth,
  adminAuth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validate,
  adminItineraryReviewController.approveReview
)

/**
 * PUT /api/itinerary-reviews/admin/:id/reject
 * Reject a review (admin only)
 */
router.put(
  '/admin/:id/reject',
  auth,
  adminAuth,
  rejectReviewValidation,
  validate,
  adminItineraryReviewController.rejectReview
)

/**
 * PUT /api/itinerary-reviews/admin/:id/toggle-featured
 * Toggle homepage feature for a review (admin only)
 */
router.put(
  '/admin/:id/toggle-featured',
  auth,
  adminAuth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validate,
  adminItineraryReviewController.toggleHomepageFeature
)

/**
 * DELETE /api/itinerary-reviews/admin/:id
 * Delete any review (admin only)
 */
router.delete(
  '/admin/:id',
  auth,
  adminAuth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validate,
  adminItineraryReviewController.deleteReview
)

export default router
