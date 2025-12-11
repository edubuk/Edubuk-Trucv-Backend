import { Request,Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { UserCV } from "../models/newCv.model";



export const createUserCV = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data,title} = req.body;
        console.log("data",data)
        const cv = await UserCV.create({userId,title,personal:data.personal,educations:data.educations,experiences:data.experiences,skills:data.skills,projects:data.projects,awards:data.awards})
        res.status(200).json({success:true,message:"CV Created Successfully"});
    } catch (error:any) {
        console.log(error)
        res.status(500).json({success:false,message:error.message||error||"Internal Server Error"})
    }
}

export const userCvs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const cv = await UserCV.find({userId}).select("_id title")
        res.status(200).json({success:true,data:cv})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const fetchCvData = async(req:Request,res:Response)=>{
    try {
        const id = req.params.id;
        const cv = await UserCV.findById(id);
        res.status(200).json({success:true,data:cv})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const DeleteCvData = async(req:Request,res:Response)=>{
    try {
        const id = req.params.id;
        const cv = await UserCV.findByIdAndDelete(id);
        res.status(200).json({success:true,message:"CV Deleted Successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}