import mongoose, { Document, Schema } from 'mongoose'
import { AdPlacement } from './Advertisement'

export interface IAdPlacementConfig extends Document {
  blogPostId?: mongoose.Types.ObjectId
  category?: mongoose.Types.ObjectId
  
  placements: Array<{
    position: AdPlacement
    advertisementIds: mongoose.Types.ObjectId[]
    rotationType: 'sequential' | 'random' | 'weighted' | 'a_b_test'
    maxAdsPerPosition: number
    enabled: boolean
  }>
  
  settings: {
    respectDoNotTrack: boolean
    respectGDPR: boolean
    minScrollDepthForAds: number
    adRefreshInterval?: number
    lazyLoadAds: boolean
    preloadAds: boolean
  }
  
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
  
  createdAt: Date
  updatedAt: Date
}

// Model interface with static methods
export interface IAdPlacementConfigModel extends mongoose.Model<IAdPlacementConfig> {
  getConfigForBlogPost(
    blogPostId?: mongoose.Types.ObjectId | string, 
    categoryId?: mongoose.Types.ObjectId | string
  ): Promise<IAdPlacementConfig | null>
  getAdsForPlacement(
    position: AdPlacement,
    blogPostId?: mongoose.Types.ObjectId | string,
    categoryId?: mongoose.Types.ObjectId | string
  ): Promise<mongoose.Types.ObjectId[]>
}

const adPlacementConfigSchema = new Schema<IAdPlacementConfig>(
  {
    blogPostId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      index: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true
    },
    placements: [
      {
        position: {
          type: String,
          required: [true, 'Placement position is required'],
          index: true
        },
        advertisementIds: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Advertisement'
          }
        ],
        rotationType: {
          type: String,
          enum: ['sequential', 'random', 'weighted', 'a_b_test'],
          default: 'weighted'
        },
        maxAdsPerPosition: {
          type: Number,
          min: 1,
          max: 5,
          default: 1
        },
        enabled: {
          type: Boolean,
          default: true
        }
      }
    ],
    settings: {
      respectDoNotTrack: {
        type: Boolean,
        default: true
      },
      respectGDPR: {
        type: Boolean,
        default: true
      },
      minScrollDepthForAds: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      adRefreshInterval: {
        type: Number,
        min: 30000 // Minimum 30 seconds
      },
      lazyLoadAds: {
        type: Boolean,
        default: true
      },
      preloadAds: {
        type: Boolean,
        default: false
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

// Indexes
adPlacementConfigSchema.index({ blogPostId: 1, 'placements.position': 1 })
adPlacementConfigSchema.index({ category: 1, 'placements.position': 1 })

// Ensure only one config per blog post or category
adPlacementConfigSchema.index(
  { blogPostId: 1 },
  { unique: true, sparse: true }
)
adPlacementConfigSchema.index(
  { category: 1 },
  { unique: true, sparse: true }
)

// Static methods
adPlacementConfigSchema.statics.getConfigForBlogPost = async function (
  blogPostId: mongoose.Types.ObjectId,
  categoryId?: mongoose.Types.ObjectId
) {
  // First try to find post-specific config
  let config = await this.findOne({ blogPostId })
    .populate('placements.advertisementIds')
  
  // If not found, try category config
  if (!config && categoryId) {
    config = await this.findOne({ category: categoryId })
      .populate('placements.advertisementIds')
  }
  
  // If still not found, return default global config
  if (!config) {
    config = await this.findOne({
      blogPostId: { $exists: false },
      category: { $exists: false }
    }).populate('placements.advertisementIds')
  }
  
  return config
}

adPlacementConfigSchema.statics.getAdsForPlacement = async function (
  position: AdPlacement,
  blogPostId?: mongoose.Types.ObjectId,
  categoryId?: mongoose.Types.ObjectId
) {
  // Cast this to the correct model type
  const Model = this as IAdPlacementConfigModel
  const config = await Model.getConfigForBlogPost(blogPostId, categoryId)
  
  if (!config) return []
  
  const placementConfig = config.placements.find(
    (p: any) => p.position === position && p.enabled
  )
  
  if (!placementConfig) return []
  
  return placementConfig.advertisementIds
}

// Validation
adPlacementConfigSchema.pre('save', function (next) {
  // Ensure either blogPostId or category is set, but not both
  if (this.blogPostId && this.category) {
    next(new Error('Cannot set both blogPostId and category'))
  }
  
  // Ensure at least one placement is configured
  if (!this.placements || this.placements.length === 0) {
    next(new Error('At least one placement must be configured'))
  }
  
  next()
})

const AdPlacementConfig = mongoose.model<IAdPlacementConfig, IAdPlacementConfigModel>(
  'AdPlacementConfig',
  adPlacementConfigSchema
)

export default AdPlacementConfig
