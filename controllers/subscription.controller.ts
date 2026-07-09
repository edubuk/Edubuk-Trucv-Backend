import { ENV } from "../config/env";
import { Request,Response } from "express";


export const fetchSubscription = async (req: Request, res: Response) => {
    try {

        const response = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/subscriptions/trucv/fetch`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${req.cookies.accessToken}`,
            },
        });
        const data = await response.json();
        //console.log("fetch subscription response:", data);
        return res.status(response.status).json(data);
        
    } catch (error) {
        //console.error("fetch subscription error:", error);
        return res.status(500).json({ success: false, message: "Error fetching subscription", error });
    }
}


export const updatePoints = async (req: Request, res: Response) => {
    try {

        const response = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/subscriptions/trucv/update-points`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${req.cookies.accessToken}`,
            },
            body: JSON.stringify({
                "points":50,
                "txType":"doc_verified"
            }),
        });
        const data = await response.json();
        //console.log("updated points response:", data);
        return data;

        
    } catch (error) {
        console.error("update points error:", error);
        return res.status(500).json({ success: false, message: "Error updating points", error });
    }
}