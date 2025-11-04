import { NextFunction,Request,RequestHandler,Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { config } from "dotenv";
import { Types } from "mongoose";
config();
export const jwtTokenVerification:RequestHandler = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        //token from cookies or header
        // verify token
        // get user id from decoded token
        //find user
        //next
        const typeReq = req as IGetUserAuthInfoRequest;
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        console.log("token",token)
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized token"
            })
        }
        if(!process.env.ACCESS_TOKEN_SECRET){
            return res.status(500).json({
                success:false,
                message:"SECRET Token not available"
            })
        }

        const decodedToken:any = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken._id as string).select("-password -refreshToken -providers");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid access token"
            })
        }
        typeReq.user = {
            _id:user._id as Types.ObjectId,
            name:user.name as string,
            email:user.email as string,
            phoneNumber:user.phoneNumber as string,
            uuid:user.uuid as string,
            roles:user.roles as string
        };
        next();
        
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong during verifying token",
            error:error.message || error
        })
    }
}