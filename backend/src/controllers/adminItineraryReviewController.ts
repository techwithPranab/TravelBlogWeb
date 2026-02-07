import { Response } from 'express'
import { AuthenticatedRequest } from '../types/express'
import ItineraryReview from '../models/ItineraryReview'
import { emailService } from '../services/emailService'
import mongoose from 'mongoose'

/**
 * Get all pending reviews
 * GET /api/admin/itinerary-reviews/pending
 */
export const getPendingReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const reviews = await ItineraryReview.find({ status: 'pending' })
      .sort({ createdAt: 1 }) // Oldest first for approval queue
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email profilePicture createdAt')
      .populate('itineraryId', 'title destinations source duration')
      .lean()

    const totalPending = await ItineraryReview.countDocuments({ status: 'pending' })

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalPending / limit),
        totalPending
      }
    })
  } catch (error: any) {
    console.error('Error fetching pending reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews'
    })
  }
}

/**
 * Get all reviews with filtering
 * GET /api/admin/itinerary-reviews
 */
export const getAllReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string
    const itineraryId = req.query.itineraryId as string
    const searchTerm = req.query.search as string
    const skip = (page - 1) * limit

    const filter: any = {}
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status
    }
    
    if (itineraryId) {
      filter.itineraryId = itineraryId
    }

    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { comment: { $regex: searchTerm, $options: 'i' } },
        { userName: { $regex: searchTerm, $options: 'i' } }
      ]
    }

    const reviews = await ItineraryReview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email profilePicture')
      .populate('itineraryId', 'title destinations source')
      .populate('approvedBy', 'name')
      .lean()

    const totalReviews = await ItineraryReview.countDocuments(filter)

    // Get summary stats
    const stats = await ItineraryReview.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          featured: {
            $sum: { $cond: ['$showOnHomePage', 1, 0] }
          }
        }
      }
    ])

    res.json({
      success: true,
      reviews,
      stats: stats.length > 0 ? stats[0] : {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        featured: 0
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews
      }
    })
  } catch (error: any) {
    console.error('Error fetching all reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    })
  }
}

/**
 * Approve a review
 * PUT /api/admin/itinerary-reviews/:id/approve
 */
export const approveReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const adminId = req.user._id

    const review = await ItineraryReview.findById(id)
      .populate('userId', 'name email')
      .populate('itineraryId', 'title')

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    if (review.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Review is already approved'
      })
    }

    // Approve the review
    await (review as any).approve(adminId)

    // Send approval email to user
    const user = review.userId as any
    const itinerary = review.itineraryId as any
    
    await emailService.sendReviewApprovedEmail(user.email, user.name, {
      reviewTitle: review.title,
      itineraryTitle: itinerary.title,
      reviewUrl: `${process.env.FRONTEND_URL}/itineraries/${itinerary._id}#reviews`
    })

    res.json({
      success: true,
      message: 'Review approved successfully',
      review
    })
  } catch (error: any) {
    console.error('Error approving review:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve review'
    })
  }
}

/**
 * Reject a review
 * PUT /api/admin/itinerary-reviews/:id/reject
 */
export const rejectReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const adminId = req.user._id

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason must be at least 10 characters long'
      })
    }

    const review = await ItineraryReview.findById(id)
      .populate('userId', 'name email')
      .populate('itineraryId', 'title')

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    if (review.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Review is already rejected'
      })
    }

    // Reject the review
    await (review as any).reject(adminId, reason)

    // Send rejection email to user
    const user = review.userId as any
    const itinerary = review.itineraryId as any
    
    await emailService.sendReviewRejectedEmail(user.email, user.name, {
      reviewTitle: review.title,
      itineraryTitle: itinerary.title,
      rejectionReason: reason,
      editUrl: `${process.env.FRONTEND_URL}/dashboard/reviews`
    })

    res.json({
      success: true,
      message: 'Review rejected successfully',
      review
    })
  } catch (error: any) {
    console.error('Error rejecting review:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reject review'
    })
  }
}

/**
 * Toggle homepage feature for a review
 * PUT /api/admin/itinerary-reviews/:id/toggle-featured
 */
export const toggleHomepageFeature = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

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
        message: 'Only approved reviews can be featured on homepage'
      })
    }

    await (review as any).toggleHomepageFeature()

    res.json({
      success: true,
      message: review.showOnHomePage ? 'Review featured on homepage' : 'Review removed from homepage',
      showOnHomePage: review.showOnHomePage
    })
  } catch (error: any) {
    console.error('Error toggling homepage feature:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle homepage feature'
    })
  }
}

/**
 * Get featured reviews (admin view)
 * GET /api/admin/itinerary-reviews/featured
 */
export const getFeaturedReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = await ItineraryReview.find({
      status: 'approved',
      showOnHomePage: true
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profilePicture')
      .populate('itineraryId', 'title destinations source coverImage')
      .lean()

    res.json({
      success: true,
      reviews,
      count: reviews.length
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
 * Delete a review (admin)
 * DELETE /api/admin/itinerary-reviews/:id
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const review = await ItineraryReview.findById(id)
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
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

export default {
  getPendingReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  toggleHomepageFeature,
  getFeaturedReviews,
  deleteReview
}
