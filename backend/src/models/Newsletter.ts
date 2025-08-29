import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  preferences?: {
    destinations: boolean;
    travelTips: boolean;
    photography: boolean;
    weeklyDigest: boolean;
  };
  source?: string; // Where they subscribed from
  verificationToken?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  preferences: {
    destinations: { type: Boolean, default: true },
    travelTips: { type: Boolean, default: true },
    photography: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true }
  },
  source: {
    type: String,
    enum: ['homepage', 'blog', 'popup', 'footer', 'manual'],
    default: 'homepage'
  },
  verificationToken: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better performance
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1, isVerified: 1 });
NewsletterSchema.index({ subscribedAt: -1 });

// Update the updatedAt field before saving
NewsletterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
