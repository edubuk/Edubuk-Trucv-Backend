
import { Request, Response } from "express";
import { ENV } from "../config/env";


export const checkout = async (req: Request, res: Response) => {
  try {
    const { plan, code } = req.body;
    console.log("plan", plan);
    console.log("code", code);
    //const testToken = req.headers.authorization?.split(" ")[1];
    const response = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/payments/trucv/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${req.cookies.accessToken}`
      },
      body: JSON.stringify({
        couponCode:code,
        plan,
      }),
    });

    const data = await response.json();
    console.log("data", data);
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("checkout error:", error);
    return res.status(500).json({ success: false, message: "Error creating order", error });
  }
};

export const paymentVerification = async (req: Request, res: Response) => { 

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,plan,couponCode} = req.body;
    //console.log("couponCode",couponCode);
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const response  = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/payments/trucv/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${req.cookies.accessToken}`
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        couponCode,
      }),
    });

    const data = await response.json();
    console.log("data", data);
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("paymentVerification error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error
    });
  }
};


export const getPaymentRecord = async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ENV.SUBSCRIPTION_API_BASEURL}/api/v1/payments/trucv/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${req.cookies.accessToken}`
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("getPaymentRecord error:", error);
    return res.status(500).json({ success: false, message: "Error getting payment record", error });
  }
};






