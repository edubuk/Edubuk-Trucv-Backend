import mongoose, { Schema } from "mongoose";

export interface ICoupon {
  code: string;
  discountType: "percent" | "flat" | "free";
  discountValue: number;
  applicablePlans: string[];
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: {type: String, unique: true},                        // unique index on this
  discountType: {type: String, enum: ["percent", "flat","free"]},
  discountValue: {type: Number, default: 0},                     // 50% off OR ₹50 off
  applicablePlans: {type: [String], required: true},     // which plans it works on
  maxUses: {type: Number, required: true, default: null},                          // null = unlimited
  usedCount: {type: Number, default: 0},
  expiresAt: {type: Date, default: null},
  isActive: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
}); 

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;