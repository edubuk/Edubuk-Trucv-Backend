import mongoose, { Schema, Document } from "mongoose";

export interface ISearchProfile extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;
  email: string;
  city?: string;

  profileSummary?: string;

  skills: string[];
  companies: string[];
  colleges: string[];

  userImage?: string;
  isCvDataPresent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const searchProfileSchema = new Schema<ISearchProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "TruCvUser",
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    city: {
      type: String,
      trim: true,
    },

    profileSummary: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    companies: {
      type: [String],
      default: [],
    },

    colleges: {
      type: [String],
      default: [],
    },

    userImage: {
      type: String,
      default: "",
    },
    isCvDataPresent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SearchProfile = mongoose.model<ISearchProfile>(
  "SearchProfile",
  searchProfileSchema
);