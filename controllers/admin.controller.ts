import { Request, Response } from "express";
import User from "../models/userCV.model";

export const adminController = async (req:Request,res:Response) => {
    const userData= req.user;
    //console.log("userData",userData);
    const ALLOWED_EMAIL = JSON.parse(process.env.ADMIN_EMAILS || "[]");
    //console.log("ALLOWED_EMAIL",ALLOWED_EMAIL);
    try {
        if(ALLOWED_EMAIL.includes(userData.email)){
            const getAllUser = await User.find();
            if(!getAllUser){
                return res.status(404).json({message:"No User Found",success:false})
            }
            return res.status(200).json({message:"User Found",data:getAllUser,success:true})
        }
        return res.status(401).json({message:"Unauthorized",success:false})
    } catch (error) {
        console.log("ERROR:ADMIN_CONTROLLER",error)
        return res.status(500).json({message:"Something went wrong",error:error,success:false})
    }
}

