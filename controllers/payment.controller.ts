
import crypto from "crypto";
import { Request, Response } from "express";
import Razorpay from "razorpay";
import { config } from "dotenv";
import Subscription from "../models/subscription.model";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import mongoose, { ObjectId } from "mongoose";
import Wallet from "../models/wallet.model";
import Coupon, { ICoupon } from "../models/coupon.model";
config();

const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 6);

const PLAN_CONFIG = {
    half_yearly: { price:899, points: 200, durationMonths: 6 },
    yearly: { price: 1699, points: 500, durationMonths: 12 },  
} as const;

type PlanKey = keyof typeof PLAN_CONFIG;

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
    const { plan, couponCode } = req.body;

    if (!plan || !PLAN_CONFIG[plan as PlanKey]) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }

    const selectedPlan = PLAN_CONFIG[plan as PlanKey];

    // ── validate coupon first if provided ───────────────────────
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

      if (!couponDoc) {
        return res.status(400).json({ success: false, message: "Invalid coupon code" });
      }
      if (couponDoc.expiresAt && couponDoc.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }
      if (couponDoc.maxUses !== null && couponDoc.usedCount >= couponDoc.maxUses) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }
      if (!couponDoc.applicablePlans.includes(plan)) {
        return res.status(400).json({ success: false, message: `Coupon not valid for ${plan} plan` });
      }

      // ── free coupon — skip Razorpay entirely ─────────────────
      if (couponDoc.discountType === "free") {
        return await activateFreePlan(typeReq.user._id, plan, couponDoc, res);
      }
    }

    // ── paid flow continues as normal ───────────────────────────
    let finalAmount = selectedPlan.price;
    let discountAmount = 0;

    if (couponDoc) {
      if (couponDoc.discountType === "percent") {
        discountAmount = Math.round(finalAmount * couponDoc.discountValue / 100);
      } else {
        discountAmount = couponDoc.discountValue * 100;
      }
      finalAmount = Math.max(finalAmount - discountAmount, 0) as 899 | 1699;
    }

    const order = await instance.orders.create({
      amount: finalAmount,
      currency: "INR",
      notes: {
        userId: typeReq.user._id.toString(),
        plan,
        couponCode: couponCode || null,
        originalAmount: selectedPlan.price,
        discountAmount,
        email: typeReq.user.email
      }
    });

    return res.status(200).json({
      success: true,
      order,
      pricing: {
        original: selectedPlan.price,
        discount: discountAmount,
        final: finalAmount,
        couponApplied: !!couponCode
      }
    });

  } catch (error) {
    console.error("checkout error:", error);
    return res.status(500).json({ success: false, message: "Error creating order", error });
  }
};

export const paymentVerification = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } = req.body;

    //verify signature 
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(401).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    //everything DB-related runs inside one transaction
    await session.withTransaction(async () => {

      //idempotency check inside transaction
      const alreadyProcessed = await Subscription.findOne(
        { paymentId: razorpay_payment_id },
        null,
        { session }
      );
      if (alreadyProcessed) return; // already handled, exit transaction cleanly

      const userId = typeReq.user._id;
      const POINTS_FOR_PLAN = 100;
    
      //upsert subscription
      await Subscription.findOneAndUpdate(
        { userId },
        {
          $set: {
            subscriptionPlan: "pro",
            status: "active",
            pointsGranted: POINTS_FOR_PLAN,
            paymentId: razorpay_payment_id,
            couponCode: couponCode || null,
            startDate: new Date(),
            endDate,
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true, session } 
      );

      //credit wallet
      await Wallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: POINTS_FOR_PLAN },
          $push: {
            transactions: {
              _id: new mongoose.Types.ObjectId(),
              type: "credit",
              amount: POINTS_FOR_PLAN,
              reason: "subscription_renewal",
              razorpayPaymentId: razorpay_payment_id,
              createdAt: new Date()
            }
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true, new: true, session } 
      );

    }); 

    return res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error("paymentVerification error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error
    });
  } finally {
    session.endSession(); 
  }
};


const activateFreePlan = async(userId:mongoose.Types.ObjectId,plan:string,couponDoc:ICoupon,res:Response)=>{
  try {
    const POINTS_FOR_PLAN = 100;
    await Subscription.findOneAndUpdate(
      {userId},
      {
        $inc: { balance: POINTS_FOR_PLAN },
        $set:{
          subscriptionPlan: "pro",
            status: "active",
            pointsGranted: POINTS_FOR_PLAN,
            paymentId:"N/A",
            couponCode: couponDoc.code,
            startDate: new Date(),
            endDate:endDate,
            updatedAt: new Date()
        }
      }
    )
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error
    });
  }
  
}


// export const couponVerification = async (req: Request, res: Response) => {
//   try {
//     const typeReq = req as IGetUserAuthInfoRequest;
//     const { couponCode, currType } = req.query;

//     //Validate required fields
//     if (!couponCode || !currType) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code, currency type is missing",
//       });
//     } 
//     const endDate = new Date();
//     endDate.setMonth(endDate.getMonth() + 6);
//     const couponUser = await Subscription.findOne({ couponCode: couponCode as string });
//     if (couponUser) {
//       return res.status(400).json({
//         success: false,
//         applied: false,
//         value: 175,
//         message: "This coupon is already used",
//       });
//     }


//     //Define Free Coupons
//     const freeCoupons = ["INNOVARI100", "INNOVARIFREE", "INNOVARIZERO", "INNOVARIGRATIS", "INNOVARIFREEPASS", "INNOVARICOMP", "INNOVARIFREEPASS", "INNOVARICOMP", "EDUBUKFREE", "EDUBUK100", "EDUBUKTEST1", "EDUBUKTEST2", "EDUBUKTEST3"];

//     //Handle Free Coupons
//     if (freeCoupons.includes(couponCode as string)) {
//       const user = await Subscription.findOne({ userId: typeReq.user._id });
//       if (user) {
//         user.subscriptionPlan = "pro";
//         user.paymentId = "FREE";
//         user.couponCode = couponCode as string;
//         user.endDate = endDate;
//         await user.save();
//       }
//       else {
//         // Create new user with Pro subscription
//         await new Subscription({
//           userId: typeReq.user._id,
//           orderId:"none",
//           subscriptionPlan: "pro",
//           paymentId: "FREE",
//           couponCode: couponCode,
//           endDate: endDate,
//         }).save();
//       }
//       return res.status(200).json({
//         success: true,
//         applied: true,
//         value: 0,
//         message: "This one's on us! Enjoy your free access.",
//       });
//     }

//     //Paid Coupons Logic
//     let currPrice = 175;

//     if (currType !== "INR") {
//       return res.status(200).json({
//         success: false,
//         applied: false,
//         value: currPrice,
//         message: "Currency type is not INR",
//       });
//     }

//     switch (couponCode) {
//       case "CVPRODIS":
//         currPrice = 236;
//         break;
//       case "UPLOADITDIS":
//         currPrice = 236;
//         break;
//       case "RESUMEDIS":
//         currPrice = 236;
//         break;
//       case "CVCODIS":
//         currPrice = 236;
//         break;
//       case "CVUPDIS":
//         currPrice = 236;
//         break;
//       case "JOBSAVEDIS":
//         currPrice = 236;
//         break;
//       case "PROCVDIS":
//         currPrice = 236;
//         break;
//       case "UPLOADDIS":
//         currPrice = 236;
//         break;
//       case "CARPRODIS":
//         currPrice = 236;
//         break;
//       case "CVUPLOADDIS":
//         currPrice = 236;
//         break;
//       case "RESUMEPRODIS":
//         currPrice = 236;
//         break;
//       case "DISCOUNTCV":
//         currPrice = 10;
//         break;
//       case "CAREERUPDIS":
//         currPrice = 10;
//         break;
//       case "JOBSCVDIS":
//         currPrice = 236;
//         break;
//       case "UPLOADCVDIS":
//         currPrice = 10;
//         break;
//       case "RESPACKDIS":
//         currPrice = 236;
//         break;
//       case "CAREERCVDIS":
//         currPrice = 236;
//         break;
//       case "CVJOBDIS":
//         currPrice = 236;
//         break;
//       case "EDUBUKYESWIN":
//         currPrice = 0;
//         break;
//       default:
//         return res.status(200).json({
//           success: false,
//           applied: false,
//           value: currPrice,
//           message: "Invalid coupon code",
//         });
//     }

//     return res.status(200).json({
//       success: true,
//       applied: true,
//       value: currPrice,
//     });
//   } catch (error) {
//     console.error("Error in couponVerification:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error while coupon verification",
//       error,
//     });
//   }
// };



