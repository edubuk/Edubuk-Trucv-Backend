import mongoose, { Schema } from "mongoose";


const walletSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "TruCvUser",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  lifetimeEarned: {
    type: Number,
    default: 0
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      reason: {
        type: String,
        enum: ["subscription_renewal", "doc_verified", "refund", "admin_adjust"],
        required: true
      },
      docId: {
        type: Schema.Types.ObjectId,
        default: null
      },
      docModel: {
        type: String,
        enum: ["Education", "Experience", "Certificate"],
        default: null
      },
      subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
      },
      note: {
        type: String,
        default: ""
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Wallet = mongoose.model("Wallet", walletSchema)
export default Wallet;
