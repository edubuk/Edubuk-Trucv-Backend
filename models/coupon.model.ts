import mongoose, { Schema } from "mongoose";

interface ICoupon {
  code: string;
  discountType: "percent" | "flat";
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
  discountType: {type: String, enum: ["percent", "flat"]},
  discountValue: {type: Number, default: 0},                     // 50% off OR ₹50 off
  applicablePlans: {type: [String], required: true},     // which plans it works on
  maxUses: {type: Number, default: null},                          // null = unlimited
  usedCount: {type: Number, default: 0, max: 10},
  expiresAt: {type: Date, default: null},
  isActive: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
}); 

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;