
import crypto from "crypto";
import { Request, Response } from "express";
import Razorpay from "razorpay";
import { config } from "dotenv";
import Subscription from "../models/subscription.model";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
config();

const keyId = process.env.RZP_KEY_ID;
const keySecret = process.env.RZP_SECRET_KEY;
if (!keyId || !keySecret) {
  throw new Error(
    "Razorpay key ID or secret is missing in environment variables"
  );
}
const instance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const checkout = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    if (Number(req.body.amount) < 175) {
      return res.status(400).json({
        success: false,
        message: "amount is less than subscription plan",
      });
    }
    const options = {
      "amount": Number(req.body.amount),
      "currency": "INR",
    };

    const order = await instance.orders.create(options);
    console.log("order", order);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not created"
      })
    }
    await Subscription.findOneAndUpdate({ userId: typeReq.user._id }, { orderId: order.id }, { upsert: true });
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error,
    });
  }
};


export const paymentVerification = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("body", body);
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    console.log("Auth :", isAuthentic)
    if (!isAuthentic) {
      return res.status(401).json({
        success: false,
        message: "Payment verification failed"
      })
    }
    const subscription = await Subscription.findOne({ userId: typeReq.user._id });
    if (subscription) {
      console.log("user found");
      subscription.subscriptionPlan = "pro";
      subscription.paymentId = razorpay_payment_id;
      subscription.couponCode = couponCode;
      subscription.endDate = endDate;
      await subscription.save();
    }
    res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error
    })
  }
};



export const couponVerification = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const { couponCode, currType } = req.query;

    //Validate required fields
    if (!couponCode || !currType) {
      return res.status(400).json({
        success: false,
        message: "Coupon code, currency type is missing",
      });
    } 
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    const couponUser = await Subscription.findOne({ couponCode: couponCode as string });
    if (couponUser) {
      return res.status(400).json({
        success: false,
        applied: false,
        value: 175,
        message: "This coupon is already used",
      });
    }


    //Define Free Coupons
    const freeCoupons = ["INNOVARI100", "INNOVARIFREE", "INNOVARIZERO", "INNOVARIGRATIS", "INNOVARIFREEPASS", "INNOVARICOMP", "INNOVARIFREEPASS", "INNOVARICOMP", "EDUBUKFREE", "EDUBUK100", "EDUBUKTEST1", "EDUBUKTEST2", "EDUBUKTEST3"];

    //Handle Free Coupons
    if (freeCoupons.includes(couponCode as string)) {
      const user = await Subscription.findOne({ userId: typeReq.user._id });
      if (user) {
        user.subscriptionPlan = "pro";
        user.paymentId = "FREE";
        user.couponCode = couponCode as string;
        user.endDate = endDate;
        await user.save();
      }
      else {
        // Create new user with Pro subscription
        await new Subscription({
          userId: typeReq.user._id,
          orderId:"none",
          subscriptionPlan: "pro",
          paymentId: "FREE",
          couponCode: couponCode,
          endDate: endDate,
        }).save();
      }
      return res.status(200).json({
        success: true,
        applied: true,
        value: 0,
        message: "This one's on us! Enjoy your free access.",
      });
    }

    //Paid Coupons Logic
    let currPrice = 175;

    if (currType !== "INR") {
      return res.status(200).json({
        success: false,
        applied: false,
        value: currPrice,
        message: "Currency type is not INR",
      });
    }

    switch (couponCode) {
      case "CVPRODIS":
        currPrice = 236;
        break;
      case "UPLOADITDIS":
        currPrice = 236;
        break;
      case "RESUMEDIS":
        currPrice = 236;
        break;
      case "CVCODIS":
        currPrice = 236;
        break;
      case "CVUPDIS":
        currPrice = 236;
        break;
      case "JOBSAVEDIS":
        currPrice = 236;
        break;
      case "PROCVDIS":
        currPrice = 236;
        break;
      case "UPLOADDIS":
        currPrice = 236;
        break;
      case "CARPRODIS":
        currPrice = 236;
        break;
      case "CVUPLOADDIS":
        currPrice = 236;
        break;
      case "RESUMEPRODIS":
        currPrice = 236;
        break;
      case "DISCOUNTCV":
        currPrice = 10;
        break;
      case "CAREERUPDIS":
        currPrice = 10;
        break;
      case "JOBSCVDIS":
        currPrice = 236;
        break;
      case "UPLOADCVDIS":
        currPrice = 10;
        break;
      case "RESPACKDIS":
        currPrice = 236;
        break;
      case "CAREERCVDIS":
        currPrice = 236;
        break;
      case "CVJOBDIS":
        currPrice = 236;
        break;
      case "EDUBUKYESWIN":
        currPrice = 0;
        break;
      default:
        return res.status(200).json({
          success: false,
          applied: false,
          value: currPrice,
          message: "Invalid coupon code",
        });
    }

    return res.status(200).json({
      success: true,
      applied: true,
      value: currPrice,
    });
  } catch (error) {
    console.error("Error in couponVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error while coupon verification",
      error,
    });
  }
};



