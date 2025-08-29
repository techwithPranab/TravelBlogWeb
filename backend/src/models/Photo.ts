import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  location: {
    country: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  photographer: {
    name: string;
    email: string;
    userId?: mongoose.Types.ObjectId;
  };
  tags: string[];
  category: 'landscape' | 'architecture' | 'food' | 'culture' | 'adventure' | 'wildlife' | 'people' | 'other';
  camera?: {
    make?: string;
    model?: string;
    settings?: {
      aperture?: string;
      shutter?: string;
      iso?: string;
      focalLength?: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  likes: number;
  views: number;
  downloads: number;
  isPublic: boolean;
  isFeatured: boolean;
  submittedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  thumbnailUrl: { 
    type: String 
  },
  location: {
    country: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String,
      trim: true
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  photographer: {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true
  }],
  category: { 
    type: String, 
    required: true,
    enum: ['landscape', 'architecture', 'food', 'culture', 'adventure', 'wildlife', 'people', 'other']
  },
  camera: {
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    settings: {
      aperture: { type: String },
      shutter: { type: String },
      iso: { type: String },
      focalLength: { type: String }
    }
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: { 
    type: String,
    trim: true
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  downloads: { 
    type: Number, 
    default: 0 
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  approvedAt: { 
    type: Date 
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

// Index for better query performance
PhotoSchema.index({ status: 1, isPublic: 1, isFeatured: -1 });
PhotoSchema.index({ category: 1, status: 1 });
PhotoSchema.index({ 'location.country': 1, status: 1 });
PhotoSchema.index({ tags: 1, status: 1 });
PhotoSchema.index({ likes: -1, status: 1 });
PhotoSchema.index({ submittedAt: -1 });

// Update the updatedAt field before saving
PhotoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
