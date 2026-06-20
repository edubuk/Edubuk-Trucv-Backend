import { Request, Response } from "express";
import Coupon from "../models/coupon.model";

const PLAN_CONFIG = {
    half_yearly: { price:899, points: 200, durationMonths: 6 },
    yearly: { price: 1699, points: 500, durationMonths: 12 },  
} as const;

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const { code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;
         console.log("code", code);
        await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            applicablePlans,
            maxUses,
            expiresAt,
            isActive
        });

        res.status(201).json({success: true, message: "Coupon created successfully" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.code === 11000 ? "Coupon code already exists" : "internal server error", error: error });
    }
}

export const updateCoupon = async (req: Request, res: Response) => {
    try {

        const { couponId } = req.params;
        const { code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;

        await Coupon.findByIdAndUpdate(couponId, {
            code: code.toUpperCase(),
            discountType,
            discountValue,
            applicablePlans,
            maxUses,
            expiresAt,
            isActive
        });

        res.status(200).json({success: true, message: "Coupon updated successfully" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.code === 11000 ? "Coupon code already exists" : "Internal server error", error: error });
    }
}

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.deleteOne({ _id: couponId });

        if (coupon.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        res.status(200).json({ success: true, message: "Coupon deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


// POST /coupons/validate
export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, plan } = req.body;
        const selectedPlan = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) return res.json({ success: false, message: "Invalid coupon code" });
        if (coupon.expiresAt && coupon.expiresAt < new Date())
            return res.json({ success: false, message: "Coupon has expired" });
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
            return res.json({ success: false, message: "Coupon usage limit reached" });
        if (!coupon.applicablePlans.includes(plan))
            return res.json({ success: false, message: `Not valid for ${plan} plan` });

        let discountAmount = 0;
        if (coupon.discountType === "percent") {
            discountAmount = Math.round((selectedPlan.price / 100) * coupon.discountValue);
        } else if (coupon.discountType === "flat") {
            discountAmount = coupon.discountValue;
        }

        const finalAmount =
            coupon.discountType === "free" ? 0 : Math.max(selectedPlan.price - discountAmount, 0);

        return res.json({
            success: true,
            coupon: {
                valid: true,
                code: coupon.code,
                discountType: coupon.discountType,
                discountAmount,
                finalAmount,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const getListOfCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find({});
        res.status(200).json({ success: true, data: { coupons } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}