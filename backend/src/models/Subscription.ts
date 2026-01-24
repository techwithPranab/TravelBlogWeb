import mongoose, { Document, Schema, Model } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  subscriptionType: 'free' | 'premium'
  subscriptionStartDate: Date
  subscriptionEndDate?: Date
  itinerariesUsed: number
  itinerariesLimit: number
  paymentId?: string
  paymentStatus?: 'pending' | 'completed' | 'failed'
  amount?: number
  currency?: string
  autoRenew: boolean
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Instance methods
  isActive(): boolean
  canCreateItinerary(): boolean
  getRemainingItineraries(): number
  incrementUsage(): Promise<void>
  resetUsage(): Promise<void>
}

export interface ISubscriptionModel extends Model<ISubscription> {
  createFreeSubscription(userId: mongoose.Types.ObjectId): Promise<ISubscription>
  upgradeToPremium(userId: mongoose.Types.ObjectId, paymentId: string, amount: number): Promise<ISubscription | null>
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    subscriptionType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
      required: true
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    subscriptionEndDate: {
      type: Date
    },
    itinerariesUsed: {
      type: Number,
      default: 0,
      required: true
    },
    itinerariesLimit: {
      type: Number,
      default: 5, // Free tier default
      required: true
    },
    paymentId: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'INR'
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Indexes
subscriptionSchema.index({ userId: 1 })
subscriptionSchema.index({ subscriptionType: 1 })
subscriptionSchema.index({ subscriptionEndDate: 1 })

// Methods
subscriptionSchema.methods.isActive = function (): boolean {
  if (this.subscriptionType === 'free') {
    return true
  }
  if (this.subscriptionType === 'premium') {
    if (!this.subscriptionEndDate) return false
    return new Date() < this.subscriptionEndDate && !this.cancelledAt
  }
  return false
}

subscriptionSchema.methods.canCreateItinerary = function (): boolean {
  return this.isActive() && this.itinerariesUsed < this.itinerariesLimit
}

subscriptionSchema.methods.getRemainingItineraries = function (): number {
  return Math.max(0, this.itinerariesLimit - this.itinerariesUsed)
}

subscriptionSchema.methods.incrementUsage = async function (): Promise<void> {
  this.itinerariesUsed += 1
  await this.save()
}

subscriptionSchema.methods.resetUsage = async function (): Promise<void> {
  this.itinerariesUsed = 0
  await this.save()
}

// Static methods
subscriptionSchema.statics.createFreeSubscription = async function (
  userId: mongoose.Types.ObjectId
): Promise<ISubscription> {
  return await this.create({
    userId,
    subscriptionType: 'free',
    subscriptionStartDate: new Date(),
    itinerariesUsed: 0,
    itinerariesLimit: 5
  })
}

subscriptionSchema.statics.upgradeToPremium = async function (
  userId: mongoose.Types.ObjectId,
  paymentId: string,
  amount: number
): Promise<ISubscription | null> {
  const subscription = await this.findOne({ userId })
  if (!subscription) return null

  const now = new Date()
  const endDate = new Date()
  endDate.setFullYear(endDate.getFullYear() + 1) // 1 year from now

  subscription.subscriptionType = 'premium'
  subscription.subscriptionStartDate = now
  subscription.subscriptionEndDate = endDate
  subscription.itinerariesLimit = 40
  subscription.paymentId = paymentId
  subscription.paymentStatus = 'completed'
  subscription.amount = amount
  subscription.currency = 'INR'
  subscription.cancelledAt = undefined

  await subscription.save()
  return subscription
}

export default mongoose.model<ISubscription, ISubscriptionModel>('Subscription', subscriptionSchema)
