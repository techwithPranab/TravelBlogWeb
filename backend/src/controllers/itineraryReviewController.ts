import { Response } from 'express'
import { AuthenticatedRequest } from '../types/express'
import ItineraryReview from '../models/ItineraryReview'
import Itinerary from '../models/Itinerary'
import moderationService from '../services/moderationService'
import { emailService } from '../services/emailService'
import mongoose from 'mongoose'

/**
 * Create a new itinerary review
 * POST /api/itinerary-reviews
 */
export const createItineraryReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id
    const { itineraryId, rating, title, comment, tripDate } = req.body

    // Validate itinerary exists
    const itinerary = await Itinerary.findById(itineraryId)
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    // Check if user already reviewed this itinerary
    const existingReview = await ItineraryReview.findOne({ userId, itineraryId })
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this itinerary. You can edit your existing review instead.',
        reviewId: existingReview._id
      })
    }

    // Run content moderation
    const moderationResult = await moderationService.checkForOffensiveContent(comment, 10)
    
    if (!moderationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Review content did not pass moderation',
        violations: moderationResult.violations,
        suggestions: moderationResult.suggestions
      })
    }

    // Create review
    const review = new ItineraryReview({
      userId,
      itineraryId,
      userName: req.user.name,
      userEmail: req.user.email,
      rating,
      title,
      comment,
      tripDate: tripDate ? new Date(tripDate) : undefined,
      moderationFlags: moderationResult.flaggedWords,
      status: 'pending'
    })

    try {
      await review.save()
    } catch (saveError: any) {
      console.error('Error saving review:', saveError)
      return res.status(500).json({
        success: false,
        message: 'Failed to save review',
        error: saveError.message
      })
    }

    // Send notification to user (don't fail if email fails)
    try {
      await emailService.sendReviewSubmittedEmail(req.user.email, req.user.name, {
        reviewTitle: title,
        itineraryTitle: itinerary.title,
        reviewId: (review._id as string).toString()
      })
    } catch (emailError) {
      console.error('Failed to send user notification email:', emailError)
    }

    // Send notification to admin (don't fail if email fails)
    try {
      await emailService.sendNewReviewNotificationToAdmin({
        reviewId: (review._id as string).toString(),
        reviewTitle: title,
        reviewerName: req.user.name,
        reviewerEmail: req.user.email,
        itineraryTitle: itinerary.title,
        rating,
        moderationFlags: moderationResult.flaggedWords,
        adminDashboardUrl: `${process.env.FRONTEND_URL}/admin/reviews/${review._id}`
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: {
        _id: review._id,
        status: review.status,
        title: review.title,
        rating: review.rating,
        createdAt: review.createdAt
      }
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create review'
    })
  }
}

/**
 * Get reviews for a specific itinerary
 * GET /api/itinerary-reviews/itinerary/:itineraryId
 */
export const getReviewsByItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itineraryId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = req.query.sortBy as string || 'recent'

    // Build sort criteria
    let sort: any = { createdAt: -1 } // Default: most recent
    if (sortBy === 'helpful') {
      sort = { helpfulCount: -1, createdAt: -1 }
    } else if (sortBy === 'rating-high') {
      sort = { rating: -1, createdAt: -1 }
    } else if (sortBy === 'rating-low') {
      sort = { rating: 1, createdAt: -1 }
    }

    const skip = (page - 1) * limit

    // Get approved reviews
    const reviews = await ItineraryReview.find({
      itineraryId,
      status: 'approved'
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profilePicture')
      .lean()

    const totalReviews = await ItineraryReview.countDocuments({
      itineraryId,
      status: 'approved'
    })

    // Get review statistics
    const stats = await (ItineraryReview as any).getReviewStats(new mongoose.Types.ObjectId(itineraryId))

    res.json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews
      }
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    })
  }
}

/**
 * Get current user's reviews
 * GET /api/itinerary-reviews/my-reviews
 */
export const getUserReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id
    const status = req.query.status as string

    const filter: any = { userId }
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status
    }

    const reviews = await ItineraryReview.find(filter)
      .sort({ createdAt: -1 })
      .populate('itineraryId', 'title destinations source duration')
      .lean()

    res.json({
      success: true,
      data: reviews
    })
  } catch (error: any) {
    console.error('Error fetching user reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews'
    })
  }
}

/**
 * Update a review
 * PUT /api/itinerary-reviews/:id
 */
export const updateItineraryReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { rating, title, comment, tripDate } = req.body

    const review = await ItineraryReview.findOne({ _id: id, userId })
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it'
      })
    }

    // Only allow editing pending or rejected reviews
    if (review.status === 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit an approved review. Please contact support if you need to make changes.'
      })
    }

    // Run moderation if comment is updated
    if (comment && comment !== review.comment) {
      const moderationResult = await moderationService.checkForOffensiveContent(comment, 10)
      
      if (!moderationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Review content did not pass moderation',
          violations: moderationResult.violations,
          suggestions: moderationResult.suggestions
        })
      }

      review.moderationFlags = moderationResult.flaggedWords
    }

    // Update fields
    if (rating) review.rating = rating
    if (title) review.title = title
    if (comment) review.comment = comment
    if (tripDate) review.tripDate = new Date(tripDate)

    // Reset to pending if it was rejected
    if (review.status === 'rejected') {
      review.status = 'pending'
      review.rejectionReason = undefined
    }

    await review.save()

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    })
  } catch (error: any) {
    console.error('Error updating review:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review'
    })
  }
}

/**
 * Delete a review
 * DELETE /api/itinerary-reviews/:id
 */
export const deleteItineraryReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const review = await ItineraryReview.findOne({ _id: id, userId })
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      })
    }

    // Only allow deleting pending or rejected reviews
    if (review.status === 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete an approved review. Please contact support if you need to remove it.'
      })
    }

    await review.deleteOne()

    res.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    })
  }
}

/**
 * Mark review as helpful
 * POST /api/itinerary-reviews/:id/helpful
 */
export const markReviewHelpful = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const review = await ItineraryReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only mark approved reviews as helpful'
      })
    }

    await (review as any).markHelpful(userId)

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: review.helpfulCount,
      isHelpful: review.helpfulBy.includes(userId)
    })
  } catch (error: any) {
    console.error('Error marking review helpful:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    })
  }
}

/**
 * Get featured reviews for homepage
 * GET /api/itinerary-reviews/featured
 */
export const getFeaturedReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const reviews = await ItineraryReview.find({
      status: 'approved',
      showOnHomePage: true
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name profilePicture')
      .populate('itineraryId', 'title destinations source duration coverImage')
      .lean()

    res.json({
      success: true,
      reviews
    })
  } catch (error: any) {
    console.error('Error fetching featured reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured reviews'
    })
  }
}

/**
 * Validate review content before submission
 * POST /api/itinerary-reviews/validate
 */
export const validateReviewContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, comment } = req.body

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      })
    }

    // Run content moderation
    const moderationResult = await moderationService.checkForOffensiveContent(comment, 10)

    res.json({
      success: true,
      data: {
        isValid: moderationResult.isValid,
        violations: moderationResult.violations,
        wordCount: moderationResult.wordCount
      }
    })
  } catch (error) {
    console.error('Review validation error:', error)
    res.status(500).json({
      success: false,
      message: 'Validation failed'
    })
  }
}

export default {
  createItineraryReview,
  getReviewsByItinerary,
  getUserReviews,
  updateItineraryReview,
  deleteItineraryReview,
  markReviewHelpful,
  getFeaturedReviews,
  validateReviewContent
}
