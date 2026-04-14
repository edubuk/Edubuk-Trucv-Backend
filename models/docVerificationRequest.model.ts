import mongoose from "mongoose";

const docVerificationRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "TruCvUser", required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    documentType: { type: String, enum: ["education", "experience", "award"], required: true },
    issuerEmailId: { type: String},
    docName:{ type: String, required: true },
    docHash:{ type: String, required: true },
    verified:{ type: Boolean, default: false },
    userWalletAddress: { type: String},
    token: { type: String, required: true },
    tokenUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const DocVerificationRequest = mongoose.model("DocVerificationRequest", docVerificationRequestSchema);