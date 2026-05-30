import { Request,Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { UserCV } from "../models/newCv.model";
import FormData from "form-data";
import axios from "axios";



export const createUserCV = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data,title} = req.body;
        //console.log("data",data)
        const cv = await UserCV.create({userId,title,personal:data.personal,educations:data.educations,experiences:data.experiences,skills:data.skills,projects:data.projects,awards:data.awards})
        res.status(200).json({success:true,message:"CV Created Successfully",id:cv._id});
    } catch (error:any) {
        //console.log("error on creating cv",error)
        res.status(500).json({success:false,message:error.message||error||"Internal Server Error"})
    }
}

export const userCvs = async(req:Request,res:Response)=>{
    try {
        const {userIdThroughAdmin} = req.query;
        //console.log("user id",userIdThroughAdmin)
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = userIdThroughAdmin??typeReq.user._id;
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

export const cvParse = async(req:Request,res:Response)=>{
    try {

    const cvFile = (req as any).file;

    if (!cvFile) {
      return res.status(400).json({ error: "No file provided" });
    }

    const data = new FormData();
    data.append(
      "file",
      cvFile.buffer,
      cvFile.originalname
    );

    const response = await axios.request({
      method: "post",
      maxBodyLength: Infinity,
      url: "https://trucv-ai-apim.azure-api.net/CvParser/cv-to-trucv",
      headers: {
        "Ocp-Apim-Subscription-Key": "3e08ad33f2894d6da82e9f25e575794d",
        ...data.getHeaders(),
      },
      data: data,
    });

    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error: any) {
    console.error("CV Parse Error:", error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "CV parsing failed",
    });
  }
}