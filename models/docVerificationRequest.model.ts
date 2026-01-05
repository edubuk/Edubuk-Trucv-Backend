import mongoose from "mongoose";

const docVerificationRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "TruCvUser", required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    documentType: { type: String, enum: ["education", "experience", "award"], required: true },
    issuerEmailId: { type: String, required: true },
    token: { type: String, required: true },
    tokenUsed: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const DocVerificationRequest = mongoose.model("DocVerificationRequest", docVerificationRequestSchema);