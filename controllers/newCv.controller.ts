import { Request,Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { UserCV } from "../models/newCv.model";



export const createUserCV = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data} = req.body;
        console.log("data",data)
        const cv = await UserCV.create({userId,personal:data.personal,educations:data.educations,experiences:data.experiences,skills:data.skills,projects:data.projects,awards:data.awards})
        res.status(200).json({success:true,message:"CV Created Successfully"});
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

export const userCvs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const cv = await UserCV.find({userId}).select("_id")
        res.status(200).json({success:true,data:cv})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}