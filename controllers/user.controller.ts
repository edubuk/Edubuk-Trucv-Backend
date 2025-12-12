import { Request, Response } from "express";
import { User } from "../models/user.model";
import crypto from "crypto";
import { Otp } from "../models/otp.model";
import bcrypt from "bcrypt";
import { otpEmailHandler} from "../utils/otpEmailHandler";
//import { v4 as uuidv4 } from "uuid";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { Certificate } from "../models/userDoc.model";
import Subscription from "../models/subscription.model";
import { sendResetLinkEMail } from "../utils/sendResetEmail";
import { CV } from "../models/cv.model";

config();

const generateAccessRefreshToken = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
}

export const generateOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({email:email});
        if(user)
        {
            return res.status(400).json({
                success:false,
                message:"user already registered"
            })
        }
        const digits = "0123456789";
        const bytes = crypto.randomBytes(6);
        let otp = "";
        for (let i = 0; i < 6; i++) {
            otp += digits[bytes[i] % 10];
        }
        //console.log("otp", otp);
        const otpHash = await bcrypt.hash(otp, 10);
        const otpObj = new Otp({ email, otpHash, expiresAt: Date.now() + 300000, used: false });
        await otpObj.save();
        const status = await otpEmailHandler(email, otp);
        res.status(200).json({
            success: true,
            status:status,
            message: "Otp sent successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, otp, name, password, phoneNumber,address } = req.body;
        const { v4: uuidv4 } = await import("uuid");
        const isUser = await User.findOne({email})
        if(isUser)
        {
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }
        const otpData = await Otp.findOne({ email });
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }
        const isMatch = await bcrypt.compare(otp, otpData.otpHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }
        if (otpData.used) {
            return res.status(400).json({
                success: false,
                message: "Otp already used"
            })
        }
        const user = new User({ email, name, password, phoneNumber,address, uuid: uuidv4() });
        await user.save();
        otpData.used = true;
        await otpData.save();
        res.status(200).json({
            success: true,
            message: "your are registered successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}


export const loginUser = async (req: Request, res: Response) => {
    //req body->data
    //find user by email
    //check password
    //accesss and refresh token
    //send cookies
    const { email, password } = req.body;
    //console.log("email",email)
    //console.log("password",password)
    try {
        if (!email && !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id as string);
        //console.log("accessToken",accessToken)
        //console.log("refreshToken",refreshToken)
        const loggedInUser = await User.findById(user._id).select("-providers -password -refreshToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",     
                maxAge: 1000 * 60 * 60 * 15,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",     
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .json({
                success: true,
                message: "Logged In successfully",
                loggedInUser
            })


    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const logoutUser = async(req:Request,res:Response)=>{
    //user
    //update refreshToken
    //reset cookie
    const typeReq = req as IGetUserAuthInfoRequest
    try {
        await User.findByIdAndUpdate(typeReq.user._id,{
            $set:{"refreshToken":undefined}
        })

        const options={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite: "none",     
            maxAge: 1000 * 60 * 60 * 15,
        }

        res.status(200).clearCookie("accessToken",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite: "none",     
            maxAge: 1000 * 60 * 60 * 15,
        }).clearCookie("refreshToken",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite: "none",     
            maxAge: 1000 * 60 * 60 * 24 * 7,
        }).json({
            success:true,
            message:"Logged out successfully"
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message || error
        })
    }
}


export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // verify token and handle errors correctly
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      );
      console.log("refresh token verified",decodedToken)
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Invalid refresh token",
      });
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      user._id as string
    );

    const isProd = process.env.NODE_ENV === "production";

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax" as const,
       maxAge: 1000 * 60 * 15,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax" as const,
       maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .json({
        success: true,
        message: "Access token refreshed",
      });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};


export const getUser = async(req:Request,res:Response)=>{
    try {
        const reqType = req as IGetUserAuthInfoRequest;
        const user = await User.findById(reqType.user._id).select("-providers -password -refreshToken");
        if(!user){
            res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"User fetched successfully",
            user:user
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message || error
        })
    }
}

export const userDocs = async(req:Request,res:Response)=>{
    try {
        const id = req.query.userId;
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = id??typeReq.user._id;
        const user = await User.findById(userId);
        if(!user)
        {
            return res.status(401).json({
                status:false,
                message:"user not found",
            })
        }
        const docs = await Certificate.find({userId:userId});
        if(!docs)
        {
            return res.status(401).json({
                success:false,
                message:"No doucment found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Documents fetched successfully",
            docs
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message || error
        })
    }
}

export const updateUserInfo = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = await User.findById(typeReq.user._id);
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
        const {name,phoneNumber,address,userImageUrl,linkedInUrl,githubUrl,selfAttested,yearOfExp,profession,profileSummary} = req.body;
        user.name = name;
        user.phoneNumber = phoneNumber;
        user.address = address;
        user.userImageUrl = userImageUrl || "";
        user.linkedInUrl=linkedInUrl;
        user.githubUrl=githubUrl;
        user.selfAttested=selfAttested;
        user.yearOfExp=yearOfExp;
        user.profession=profession;
        user.profileSummary=profileSummary;
        await user.save();
        return res.status(200).json({
            success:true,
            message:"User updated successfully",
            user
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message || error
        })
    }
}

export const userSubscription = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId=req.query.id??typeReq.user._id
        console.log("userId",req.query.id)
        const subscription = await Subscription.findOne({userId:userId});
        if(!subscription)
        {
            return res.status(400).json({
                success:false,
                message:"Subscription not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Subscription fetched successfully",
            subscription
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message || error
        })
    }
}


export const sendResetLink = async(req:Request,res:Response)=>{
    try {
        // find user through email
        //generate forget token
        // save token 
        // send reset link via email
        const {email} = req.body;
        const user = await User.findOne({email:req.body.email});
        if(!user)
        {
            return res.status(400).json({success:false,message:"we could not find the user with given email"});
        }
        const token = user.generateResetPasswordToken();// this will save the user token and expiry time
        await user.save({validateBeforeSave:false})
        const status = await sendResetLinkEMail(email,token);
        res.status(200).json({
            success:true,
            status:status,
            message:"reset link send"
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"internal server error",
        })
    }
}

export const updatePassword = async(req:Request,res:Response)=>{
    try {
        const {token,password} = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({resetPasswordToken:hashedToken,resetPasswordExpires:{$gt:Date.now()}});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"token is invalid or has expired"
            })
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.passwordChangedAt = new Date();
        user.save();
        res.status(200).json({
            success:true,
            message:"password updated successfully"
        })

    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"internal server error",
            error:error | error.message
        })
    }
}

export const deleteUserData = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const user = await User.findById(userId);
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
        await Promise.all([
            Subscription.deleteMany({userId:userId}),
            Certificate.deleteMany({userId:userId}),
            CV.deleteMany({userId:userId})
        ]);

        const result = await User.deleteOne({_id:userId});
        if (result.deletedCount === 0) {
            return res.status(401).json({
                success:false,
                message:"User not found or already deleted"
            })
        }
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
            deletedId : userId
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:"internal server error",
            error:error | error.message
        })
    }
} 

