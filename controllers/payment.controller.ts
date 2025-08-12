
import crypto from "crypto";
import Coupon from "../models/payment.model";
import { Request,Response } from "express";
import Razorpay from "razorpay";
import { config } from "dotenv";
import User from "../models/userCV.model";
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

export const checkout = async (req:Request,res:Response) => {
  try {
  const options = {
    "amount": Number(req.body.amount),
    "currency": "INR",
  };
  
  const order = await instance.orders.create(options);

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


export const paymentVerification = async (req:Request, res:Response) => {
  try {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature,couponCode, userMailId } =
    req.body;
  
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  console.log("body",body);
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  console.log("Auth :",isAuthentic)
  if (isAuthentic) {
    console.log("payment verified");
   //let coupon = await Coupon.findOne({code:couponCode})
      // coupon = new Coupon({ code: couponCode,transactions:[{logginedMailId:userMailId,paymentId:razorpay_payment_id,paymentStatus:true,cvSubmittedStatus:false}] });
      // await coupon.save();
      const user = await User.findOne({email:userMailId});
      if(user)
      {
        console.log("user found");
      user.subscriptionPlan = "Pro";
      user.paymentId = razorpay_payment_id;
      user.couponCode = couponCode;
      await user.save();
      }
      else{
        console.log("user not found");
        const user = new User({email:userMailId,subscriptionPlan:"Pro",paymentId:razorpay_payment_id,couponCode:couponCode,nanoIds:[]});
        await user.save();
      } 
    }
  else{
    return res.status(401).json({
      success:false,
      message:"payment verification failed"
    })
  }
    res.status(200).json({
      success:true,
      paymentId:razorpay_payment_id,
    });
  }catch(error){
    res.status(500).json({
      success:false,
      message:"something went wrong",
      error:error
    })
  }
};


export const checkCvSubmittedStatus= async(req:Request,res:Response)=>{
  try {
    const {paymentId}=req.params;
    const coupon = await Coupon.findOne(
      { 'transactions.paymentId': paymentId },
    );
    if(!coupon)
    {
      return res.status(404).json({
        success: false,
        message: "invalid paymentId",
      });
    }

    const transaction = coupon.transactions.find((tx)=>tx.paymentId===paymentId);

    if(transaction)
    {
      res.status(200).json({
        success:true,
        value:transaction.cvSubmittedStatus
      })
    }
    else
    {
      res.status(404).json({
        success:false,
        message:`No transaction found with paymentId:${paymentId}`
      })
    }
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the transaction status",
    });
  }
}


export const updateCvSubmittedStatus = async(req:Request,res:Response)=>{
  try {
    const {paymentId} = req.body;
    const updatedCVStatus = await Coupon.findOneAndUpdate(
      { "transactions.paymentId": paymentId },
      {
        $set: {
          "transactions.$.cvSubmittedStatus":true,
        },
      },
      { new: true }
    )
    if(updatedCVStatus)
    {
      res.status(200).json({
        success:true,
        message:"cv submitted successfully",
      })
    }
    else
    {
      res.status(404).json({
        success:false,
        message:"invalid paymentId",
      })
    }
  } catch (error) {
    res.status(501).json({
      success:false,
      message:"something went wrong",
      err:error
    })
  }
}

export const couponVerification= async(req:Request,res:Response)=>{
  try {
    const {couponCode,currType} = req.query;
    if(!couponCode || !currType)
    {
      return res.status(400).json({
        success:false,
        message:"coupon code or currency type is missing"
      })
    }
    console.log("couponcode ",couponCode)
    let currPrice=590;
    if(currType!=="INR")
    {
      return res.status(200).json({
        success:false,
        value:currPrice,
        message:"currency type is not INR"
      })
    }
    switch (couponCode) {
      case "CVPRODIS":
        currPrice=236;
        break;
      case "UPLOADITDIS":
        currPrice=236;
        break;
      case "RESUMEDIS":
        currPrice=236;
        break;
      case "CVCODIS":
        currPrice=236;
        break;
      case "CVUPDIS":
        currPrice=236;
        break;
      case "JOBSAVEDIS":
        currPrice=236;
        break;
      case "PROCVDIS":
        currPrice=236;
        break;
      case "UPLOADDIS":
        currPrice=236;
        break;
      case "CARPRODIS":
        currPrice=236;
        break;
      case "CVUPLOADDIS":
        currPrice=236;
        break;
      case "RESUMEPRODIS":
        currPrice=236;
        break;
      case "DISCOUNTCV":
        currPrice=236;
        break;
      case "CAREERUPDIS":
        currPrice=236;
        break;
      case "JOBSCVDIS":
        currPrice=236;
        break;
      case "UPLOADCVDIS":
        currPrice=236;
        break;
      case "RESPACKDIS":
        currPrice=236;
        break;
      case "CAREERCVDIS":
        currPrice=236;
        break;
      case "CVJOBDIS":
        currPrice=236;
        break;
      case "EDUBUKYESWIN":
        currPrice=0;
        break;
      default:
      res.status(200).json({
          success:false,
          value:currPrice
        })
    }
    if(currPrice!==590)
    res.status(200).json({
      success:true,
      value:currPrice
    })
  } catch (error) {
    res.status(501).json({
      success:false,
      message:"error while coupon verification",
      error
    })
  }
}


