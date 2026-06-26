import mongoose, { Document, Schema } from 'mongoose'

export interface ITrackingLink extends Document {
  partnerName: string
  campaignTag?: string
  token: string
  url: string
  expiresAt: Date
  createdBy: string // admin user ID
  createdAt: Date
  updatedAt: Date
}

const TrackingLinkSchema = new Schema<ITrackingLink>(
  {
    partnerName: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    campaignTag: {
      type: String,
      trim: true,
      default: null,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Index for fast lookup when verifying ?ref= tokens on login
TrackingLinkSchema.index({ token: 1 })
TrackingLinkSchema.index({ partnerName: 1 })

export const TrackingLink = mongoose.model<ITrackingLink>(
  'TrackingLink',
  TrackingLinkSchema
)