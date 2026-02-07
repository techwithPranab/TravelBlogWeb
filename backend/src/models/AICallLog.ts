import mongoose, { Schema, Document } from 'mongoose'

export interface IAICallLog extends Document {
  userId: mongoose.Types.ObjectId
  itineraryId?: mongoose.Types.ObjectId
  modelName: string
  prompt: string
  parameters: {
    source: string
    destinations: string[]
    travelMode: string
    duration: number
    budget: string
    interests: string[]
    travelStyle: string
    adults?: number
    children?: number
    totalPeople?: number
  }
  // Original raw AI response (string), helpful when parse fails
  rawResponse?: string
  // Parsed response object (if available)
  parsedResponse?: any
  // Whether the raw response required automated repair to become valid JSON
  wasRepaired?: boolean
  // A truncated version of the repaired response string (if any)
  repairedResponse?: string
  response: any
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
  status: 'success' | 'failed' | 'partial'
  errorMessage?: string
  responseTime: number // in milliseconds
  createdAt: Date
  updatedAt: Date
}

const AICallLogSchema = new Schema<IAICallLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    itineraryId: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      index: true
    },
    modelName: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true
    },
    parameters: {
      source: { type: String, required: true },
      destinations: [{ type: String, required: true }],
      travelMode: { type: String, required: true },
      duration: { type: Number, required: true },
      budget: { type: String, required: true },
      interests: [{ type: String }],
      travelStyle: { type: String, required: true },
      adults: { type: Number },
      children: { type: Number },
      totalPeople: { type: Number }
    },
    // Raw text returned by the AI (useful for debugging parse failures)
    rawResponse: { type: String },
    // Parsed object (if parsing succeeded)
    parsedResponse: { type: Schema.Types.Mixed },
    response: {
      type: Schema.Types.Mixed,
      required: true
    },
    // Whether we had to repair the raw AI response to parse it
    wasRepaired: { type: Boolean, default: false },
    repairedResponse: { type: String },
    tokenUsage: {
      promptTokens: { type: Number },
      completionTokens: { type: Number },
      totalTokens: { type: Number }
    },
    cost: {
      type: Number
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      required: true
    },
    errorMessage: {
      type: String
    },
    responseTime: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// Indexes
AICallLogSchema.index({ userId: 1, createdAt: -1 })
AICallLogSchema.index({ itineraryId: 1 })
AICallLogSchema.index({ status: 1 })

export default mongoose.model<IAICallLog>('AICallLog', AICallLogSchema)
