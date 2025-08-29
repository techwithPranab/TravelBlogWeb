import { Request, Response } from 'express'
import Review from '../models/Review'
import { validationResult, body } from 'express-validator'

// Validation rules for review submission
export const validateReview = [
  body('resourceType').isIn(['destination', 'guide', 'blog']).withMessage('Invalid resource type'),
  body('resourceId').notEmpty().withMessage('Resource ID is required'),
  body('author.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('author.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10-2000 characters'),
  body('wouldRecommend').isBoolean().withMessage('Would recommend must be true or false'),
  body('pros').optional().isArray().withMessage('Pros must be an array'),
  body('cons').optional().isArray().withMessage('Cons must be an array'),
  body('travelDate').optional().isISO8601().withMessage('Travel date must be a valid date'),
  body('travelType').optional().isIn(['solo', 'couple', 'family', 'friends', 'business']).withMessage('Invalid travel type')
]

// Get reviews for a specific resource
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating,
      maxRating,
      travelType,
      verified
    } = req.query

    let verifiedFilter: boolean | undefined
    if (verified === 'true') {
      verifiedFilter = true
    } else if (verified === 'false') {
      verifiedFilter = false
    } else {
      verifiedFilter = undefined
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      minRating: minRating ? parseInt(minRating as string) : undefined,
      maxRating: maxRating ? parseInt(maxRating as string) : undefined,
      travelType: travelType as string,
      verified: verifiedFilter
    }

    const reviews = await (Review as any).getResourceReviews(resourceType, resourceId, options)
    const totalReviews = await Review.countDocuments({
      resourceType,
      resourceId,
      status: 'approved'
    })

    const stats = await (Review as any).getReviewStats(resourceType, resourceId)

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalReviews / options.limit),
          totalReviews,
          hasNextPage: options.page < Math.ceil(totalReviews / options.limit),
          hasPrevPage: options.page > 1
        },
        stats: stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          ratingCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    })
  }
}

// Submit a new review
export const submitReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      resourceType,
      resourceId,
      author,
      rating,
      title,
      content,
      pros = [],
      cons = [],
      travelDate,
      travelType,
      wouldRecommend,
      images = []
    } = req.body

    // Check if user already reviewed this resource
    const existingReview = await Review.findOne({
      resourceType,
      resourceId,
      'author.email': author.email
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this resource'
      })
    }

    const review = new Review({
      resourceType,
      resourceId,
      author,
      rating,
      title,
      content,
      pros,
      cons,
      travelDate: travelDate ? new Date(travelDate) : undefined,
      travelType,
      wouldRecommend,
      images,
      status: 'pending' // Reviews need approval by default
    })

    await review.save()

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: {
        reviewId: review._id
      }
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit review'
    })
  }
}

// Get a specific review by ID
export const getReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    // Only return approved reviews unless it's an admin request
    if (review.status !== 'approved') {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    res.json({
      success: true,
      data: review
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review'
    })
  }
}

// Mark a review as helpful
export const markHelpful = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Cannot mark unapproved review as helpful'
      })
    }

    await review.markHelpful()

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulVotes: review.helpfulVotes
      }
    })
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark review as helpful'
    })
  }
}

// Add a reply to a review
export const addReply = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const { author, content } = req.body

    // Validate input
    if (!author?.name || !author?.email || !content) {
      return res.status(400).json({
        success: false,
        error: 'Author name, email, and content are required'
      })
    }

    if (content.trim().length < 10 || content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Reply content must be between 10-1000 characters'
      })
    }

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reply to unapproved review'
      })
    }

    const reply = {
      author: {
        name: author.name.trim(),
        email: author.email.toLowerCase().trim(),
        avatar: author.avatar
      },
      content: content.trim(),
      createdAt: new Date()
    }

    await review.addReply(reply)

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        reply
      }
    })
  } catch (error) {
    console.error('Error adding reply:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add reply'
    })
  }
}

// Admin routes for review moderation
export const moderateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const { status, moderationNotes, featured } = req.body

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected'
      })
    }

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    review.status = status
    if (moderationNotes) review.moderationNotes = moderationNotes
    if (featured !== undefined) review.featured = featured

    await review.save()

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: {
        reviewId: review._id,
        status: review.status,
        featured: review.featured
      }
    })
  } catch (error) {
    console.error('Error moderating review:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to moderate review'
    })
  }
}

// Get pending reviews for moderation
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    }

    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    const reviews = await Review.find({ status: 'pending' })
      .sort(sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)

    const totalReviews = await Review.countDocuments({ status: 'pending' })

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalReviews / options.limit),
          totalReviews,
          hasNextPage: options.page < Math.ceil(totalReviews / options.limit),
          hasPrevPage: options.page > 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching pending reviews:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending reviews'
    })
  }
}

// Delete a review (admin only)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }

    await Review.findByIdAndDelete(reviewId)

    res.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    })
  }
}

// Get review statistics for a resource
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params

    const stats = await (Review as any).getReviewStats(resourceType, resourceId)

    res.json({
      success: true,
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      }
    })
  } catch (error) {
    console.error('Error fetching review stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review statistics'
    })
  }
}
