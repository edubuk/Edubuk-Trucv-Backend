import { Request, Response } from "express";
import Coupon from "../models/coupon.model";

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const { code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;

        await Coupon.create({
            code,
            discountType,
            discountValue,
            applicablePlans,
            maxUses,
            expiresAt,
            isActive
        });

        res.status(201).json({ message: "Coupon created successfully" });

    } catch (error:any) {
        res.status(500).json({ message: error.code===11000 ? "Coupon code already exists" : "internal server error", error:error });
    }
}

export const updateCoupon = async (req: Request, res: Response) => {
    try {

        const { couponId } = req.params;
        const {code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;

        await Coupon.updateOne({ _id: couponId }, {
            code,
            discountType,
            discountValue,
            applicablePlans,
            maxUses,
            expiresAt,
            isActive
        });

        res.status(200).json({ message: "Coupon updated successfully" });

    } catch (error:any) {
        res.status(500).json({ message:error.code===11000 ? "Coupon code already exists" : "Internal server error", error:error });
    }
}

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { couponId } = req.params;

        await Coupon.deleteOne({ _id: couponId });

        res.status(200).json({ message: "Coupon deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
