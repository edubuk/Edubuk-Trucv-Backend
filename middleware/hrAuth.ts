import { NextFunction, Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { User } from "../models/user.model";

export const isHR = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = await User.findById(typeReq.user._id);
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }
        if(user.roles==="hr")
        {
            next();
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong during verifying token",
            error:error.message || error
        })
    }
}