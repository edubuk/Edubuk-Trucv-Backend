import { Request, Response } from "express";
import { ENV } from "../config/env";

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const { code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;
         const result = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/coupons/trucv/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.cookies.accessToken}`
            },
            body: JSON.stringify({
                code: code.toUpperCase(),
                discountType,
                discountValue,
                applicablePlans,
                maxUses,
                expiresAt,
                isActive
            }),
        });

        const data = await result.json();
        res.status(result.status).json(data);

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.code === 11000 ? "Coupon code already exists" : "internal server error", error: error });
    }
}

export const updateCoupon = async (req: Request, res: Response) => {
    try {

        const { couponId } = req.params;
        const { code, discountType, discountValue, applicablePlans, maxUses, expiresAt, isActive } = req.body;
        const result = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/coupons/trucv/update/${couponId}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.cookies.accessToken}`
            },
            body: JSON.stringify({
                code: code.toUpperCase(),
                discountType,
                discountValue,
                applicablePlans,
                maxUses,
                expiresAt,
                isActive
            }),
        });

        const data = await result.json();
        console.log("updateCoupon response", data);
        res.status(result.status).json(data);

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.code === 11000 ? "Coupon code already exists" : "Internal server error", error: error });
    }
}

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { couponId } = req.params;

        const result = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/coupons/trucv/delete/${couponId}`,{
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${req.cookies.accessToken}`
            }
        });

        const data = await result.json();
        console.log("deleteCoupon response", data);
        res.status(result.status).json(data);

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


// POST /coupons/validate
export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, plan } = req.body;
        const result = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/coupons/trucv/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.cookies.accessToken}`
            },
            body: JSON.stringify({
                code,
                plan,
            }),
        });

        const data = await result.json();
        console.log("validateCoupon response", data);
        res.status(result.status).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const getListOfCoupons = async (req: Request, res: Response) => {
    try {
        const couponsResponse = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/coupons/trucv/list`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${req.cookies.accessToken}`
            }
        });
        const data = await couponsResponse.json();
        res.status(couponsResponse.status).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}