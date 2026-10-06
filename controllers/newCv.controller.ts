import { Request,Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { UserCV } from "../models/newCv.model";
import FormData from "form-data";
import axios from "axios";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { ENV } from "../config/env";



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
      url:ENV.CV_PARSER_URL,
      headers: {
        "Ocp-Apim-Subscription-Key":ENV.Ocp_Apim_Subscription_Key,
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


export const getUserRestrictedCv = async(req:Request,res:Response)=>{
    try {
        const userId = req.params.id;
        //console.log({userId})
        const [cvData] = await User.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(userId)  
                }
            },
            {
                $lookup:{
                    from:"educationdocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"educations"
                }

            },
            {
                $lookup:{
                    from:"experiencedocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"experiences"
                }

            },
            {
                $lookup:{
                    from:"projectdocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"projects"
                }

            },
            {
                $lookup:{
                    from:"skills",
                    localField:"_id",
                    foreignField:"userId",
                    as:"skills"
                }

            },
            {
                $lookup:{
                    from:"awarddocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"awards"
                }

            },
            {
                $project: {
                    personal: {
                    _id: "$_id",
                    fullName: "$name",
                    city:"$address",
                    profession:"$profession",
                    yearOfExp:"$yearOfExp",
                    githubUrl:"$githubUrl",
                    imgUrl: "$userImageUrl",
                    summary: "$profileSummary"
                    },
                    educations: 1,
                    experiences: 1,
                    projects: 1,
                    skills: 1,
                    awards: 1
                }
            },
            {
                $unset:[
                    "educations.docUri",
                    "educations.docHash",
                    "educations.issuerEmailId",

                    "experiences.docUri",
                    "experiences.docHash",
                    "experiences.issuerEmailId",

                    "awards.docUri",
                    "awards.docHash",
                    "awards.issuerEmailId",

                    "projects.projectUrl",

                    "skills.endoresBy" 
                ]
            }
        ])
        res.status(200).json({success:true,cvData})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

export const fetchUserCV = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        //console.log("userId",userId);
        const [cvData] = await User.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(userId)  
                }
            },
            {
                $lookup:{
                    from:"educationdocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"educations"
                }

            },
            {
                $lookup:{
                    from:"experiencedocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"experiences"
                }

            },
            {
                $lookup:{
                    from:"projectdocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"projects"
                }

            },
            {
                $lookup:{
                    from:"skills",
                    localField:"_id",
                    foreignField:"userId",
                    as:"skills"
                }

            },
            {
                $lookup:{
                    from:"awarddocs",
                    localField:"_id",
                    foreignField:"userId",
                    as:"awards"
                }

            },
            {
                $project: {
                    personal: {
                    _id: "$_id",
                    fullName: "$name",
                    email:"$email",
                    phoneNumber:"$phoneNumber",
                    city:"$address",
                    profession:"$profession",
                    yearOfExp:"$yearOfExp",
                    linkedInUrl:"$linkedInUrl",
                    githubUrl:"$githubUrl",
                    imgUrl: "$userImageUrl",
                    summary: "$profileSummary"
                    },
                    educations: 1,
                    experiences: 1,
                    projects: 1,
                    skills: 1,
                    awards: 1
                }
            },
        ])
        res.status(200).json({success:true,cvData})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}