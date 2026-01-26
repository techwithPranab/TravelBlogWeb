import mongoose, { Schema, Document } from 'mongoose'

export interface IItineraryReview extends Document {
  userId: mongoose.Types.ObjectId
  itineraryId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  rating: number
  title: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  showOnHomePage: boolean
  moderationFlags: string[]
  reviewDate: Date
  approvedDate?: Date
  approvedBy?: mongoose.Types.ObjectId
  rejectionReason?: string
  helpfulCount: number
  helpfulBy: mongoose.Types.ObjectId[]
  tripDate?: Date
  isVerifiedTrip: boolean
  createdAt: Date
  updatedAt: Date
}

const ItineraryReviewSchema = new Schema<IItineraryReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    itineraryId: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: [true, 'Itinerary ID is required'],
      index: true
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer'
      }
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [30, 'Comment must be at least 30 characters long'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending',
      index: true
    },
    showOnHomePage: {
      type: Boolean,
      default: false,
      index: true
    },
    moderationFlags: {
      type: [String],
      default: []
    },
    reviewDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    approvedDate: {
      type: Date
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    helpfulBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    tripDate: {
      type: Date
    },
    isVerifiedTrip: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Compound indexes for efficient queries
ItineraryReviewSchema.index({ itineraryId: 1, status: 1 })
ItineraryReviewSchema.index({ status: 1, createdAt: -1 })
ItineraryReviewSchema.index({ showOnHomePage: 1, status: 1, createdAt: -1 })
ItineraryReviewSchema.index({ userId: 1, createdAt: -1 })
ItineraryReviewSchema.index({ userId: 1, itineraryId: 1 }, { unique: true })

// Virtual: Word count
ItineraryReviewSchema.virtual('wordCount').get(function() {
  return this.comment.trim().split(/\s+/).length
})

// Virtual: Is recent (within last 30 days)
ItineraryReviewSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return this.createdAt >= thirtyDaysAgo
})

// Pre-save middleware: Validate word count
ItineraryReviewSchema.pre('save', function(next) {
  const wordCount = this.comment.trim().split(/\s+/).length
  if (wordCount < 10) {
    return next(new Error('Review comment must contain at least 10 words'))
  }
  next()
})

// Pre-save middleware: Normalize email
ItineraryReviewSchema.pre('save', function(next) {
  if (this.userEmail) {
    this.userEmail = this.userEmail.toLowerCase().trim()
  }
  next()
})

// Static method: Get review statistics for an itinerary
ItineraryReviewSchema.statics.getReviewStats = async function(itineraryId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: {
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$itineraryId',
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratings: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          fiveStar: {
            $size: {
              $filter: {
                input: '$ratings',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          fourStar: {
            $size: {
              $filter: {
                input: '$ratings',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          threeStar: {
            $size: {
              $filter: {
                input: '$ratings',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          twoStar: {
            $size: {
              $filter: {
                input: '$ratings',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          oneStar: {
            $size: {
              $filter: {
                input: '$ratings',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ])

  return stats.length > 0 ? stats[0] : {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0
    }
  }
}

// Static method: Check if user already reviewed an itinerary
ItineraryReviewSchema.statics.hasUserReviewed = async function(
  userId: mongoose.Types.ObjectId,
  itineraryId: mongoose.Types.ObjectId
) {
  const review = await this.findOne({ userId, itineraryId })
  return !!review
}

// Instance method: Mark as approved
ItineraryReviewSchema.methods.approve = async function(adminId: mongoose.Types.ObjectId) {
  this.status = 'approved'
  this.approvedDate = new Date()
  this.approvedBy = adminId
  this.rejectionReason = undefined
  return this.save()
}

// Instance method: Mark as rejected
ItineraryReviewSchema.methods.reject = async function(adminId: mongoose.Types.ObjectId, reason: string) {
  this.status = 'rejected'
  this.rejectionReason = reason
  this.showOnHomePage = false
  this.approvedDate = undefined
  this.approvedBy = adminId
  return this.save()
}

// Instance method: Toggle homepage feature
ItineraryReviewSchema.methods.toggleHomepageFeature = async function() {
  if (this.status !== 'approved') {
    throw new Error('Only approved reviews can be featured on homepage')
  }
  this.showOnHomePage = !this.showOnHomePage
  return this.save()
}

// Instance method: Mark as helpful
ItineraryReviewSchema.methods.markHelpful = async function(userId: mongoose.Types.ObjectId) {
  if (this.helpfulBy.includes(userId)) {
    // Remove from helpful if already marked
    this.helpfulBy = this.helpfulBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId))
    this.helpfulCount = Math.max(0, this.helpfulCount - 1)
  } else {
    // Add to helpful
    this.helpfulBy.push(userId)
    this.helpfulCount += 1
  }
  return this.save()
}

export default mongoose.model<IItineraryReview>('ItineraryReview', ItineraryReviewSchema)
