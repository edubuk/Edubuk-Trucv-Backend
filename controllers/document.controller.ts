import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { EducationDoc, IEducationDoc } from "../models/education.model";
import { docVerificationEmailHandler } from "../utils/otpEmailHandler";
import mongoose, { isValidObjectId } from "mongoose";
import { ExperienceDoc, IExperience } from "../models/experience.model";
import { ProjectDoc } from "../models/projects.model";
import { AwardDocs } from "../models/award.model";


export const saveDocuments = async (req: Request, res: Response) => {
    try {
        //get document payload
        //check document has valid mongo object if->document already exist
        //skip the already exist data and push in a document
        //perform bulk write
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const { data } = req.body;
        console.log("data", data);

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided"
            })
        }

        const documents = [];
        for (const doc of data) {
            if (!isValidObjectId(doc.id)) {
                documents.push({
                    ...doc,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        }

        if (documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: "These documents already exists."
            })
        }
        const bulkOps = documents.map((doc: IEducationDoc) => ({
            insertOne: {
                document: {
                    ...doc,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        }));
        await EducationDoc.bulkWrite(bulkOps);
        return res.status(201).json({
            success: true,
            message: "Documents saved successfully"
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const issuerEmailHandler = async (req: Request, res: Response) => {
    try {
        const { emailId, documentViewUrl, documentName, applicantName, documentType } = req.body;
        const {skills} = req.query;
        if (!emailId) {
            return res.status(400).json({ success: false, message: "emailId is required" })
        }
        const status = await docVerificationEmailHandler(emailId, documentName, applicantName, documentViewUrl, documentType,skills as string);
        res.status(200).json({
            success: true,
            status: status,
            message: "Mail sent to issuer successfully",
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getEducationDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const documents = await EducationDoc.find({ userId });
        res.status(200).json({
            success: true,
            documents
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const updateDoc = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {id} = req.params;
        const {data} = req.body;
        console.log("data",data);
        if(!isValidObjectId(id)){
            return res.status(400).json({success:false,message:"Invalid document id"})
        }
        const document = await EducationDoc.findById(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        document.level = data.level;
        document.boardNameOrDegree = data.boardNameOrDegree;
        document.institutionName = data.institutionName;
        document.gpa = data.gpa;
        document.duration = data.duration;
        document.selfAttested = data.selfAttested;
        document.isEmailSend = data.isEmailSend;
        document.verified = data.verified;
        document.status = data.status;
        document.docUri = data.docUri;
        document.issuerEmailId = data.issuerEmailId;
        document.verifiedThrough = data.verifiedThrough;
        document.updatedAt = new Date();
        await document.save();                                                    
        res.status(200).json({success:true,message:"Document updated successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

//Experience APIs
export const saveExpDocs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data} = req.body;
        console.log("payload",data);
        if(!Array.isArray(data) || data.length===0)
        {
            return res.status(400).json({
                success:false,
                message:"No data provided"
            })
        }

        const documents = [];
        for(const doc of data)
        {
            if(!isValidObjectId(doc.id))
            {
                documents.push({
                    ...doc,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        }
        
        if(documents.length===0)
        {
            return res.status(400).json({
                success:true,
                message:"These data already exists"
            })
        }

        const bulkOps = documents.map((doc:IExperience)=>({
            insertOne:{
                document:{
                    ...doc,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            }
        }))

        await ExperienceDoc.bulkWrite(bulkOps);
        return res.status(201).json({
            success: true,
            message: "Documents saved successfully"
        })
        
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getExpDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const documents = await ExperienceDoc.find({ userId });
        res.status(200).json({
            success: true,
            documents
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const updateExpDoc = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {id} = req.params;
        const {data} = req.body;    
        console.log("data",data);
        if(!isValidObjectId(id)){
            return res.status(400).json({success:false,message:"Invalid document id"})
        }
        const document = await ExperienceDoc.findById(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        document.companyName = data.companyName;
        document.jobRole = data.jobRole;
        document.duration = data.duration;
        document.skills = data.skills;
        document.description = data.description;
        document.selfAttested = data.selfAttested;
        document.isEmailSend = data.isEmailSend;
        document.verified = data.verified;
        document.status = data.status;
        document.docUri = data.docUri;
        document.issuerEmailId = data.issuerEmailId;
        document.verifiedThrough = data.verifiedThrough;
        document.updatedAt = new Date();
        await document.save();                                                    
        res.status(200).json({success:true,message:"Document updated successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getAllDocs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const id = req.query.userId;
        console.log("id",id);
        const userId = id??typeReq.user._id;
        const [educations,experiences] = await Promise.all([
            EducationDoc.find({userId:userId}).sort({createdAt:-1}),
            ExperienceDoc.find({userId:userId}).sort({createdAt:-1})
        ])
        return res.status(200).json({
            success: true,
            message: "Fetched user documents successfully",
            data: {
              educations,
              experiences,
            },
          });
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const saveProjects = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data} = req.body;
        if(!Array.isArray(data) || data.length===0)
        {
            return res.status(400).json({success:false,message:"No data provided"});
        }
        let documents = [];
        for(const doc of data)
        {
            if(!isValidObjectId(doc.id))
            {
                documents.push({
                    ...doc,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        }

        if(documents.length===0)
        {
            return res.status(400).json({
                success:false,
                message:"These projects already exists"
            })
        }

        const session = await mongoose.startSession();
        await session.withTransaction(async()=>{
            await ProjectDoc.insertMany(documents,{session})
        })
        session.endSession();
        return res.status(201).json({success:true,message:"Projects saved successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getProjectsDocs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const projects = await ProjectDoc.find({userId});
        return res.status(200).json({
            success: true,
            message: "Fetched projects successfully",
            projects
        })
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const updateProjectDoc = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {id} = req.params;
        const {data} = req.body;
        console.log("data",data);
        if(!isValidObjectId(id)){
            return res.status(400).json({success:false,message:"Invalid document id"})
        }
        const document = await ProjectDoc.findById(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        document.projectName = data.projectName;
        document.projectUrl = data.projectUrl;
        document.duration = data.duration;
        document.skills = data.skills;
        document.description = data.description;
        document.selfAttested = data.selfAttested;
        document.updatedAt = new Date();
        await document.save();
        return res.status(200).json({success:true,message:"Document updated successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const saveAwardDoc = async(req:Request,res:Response)=>{
        try {
            const typeReq = req as IGetUserAuthInfoRequest;
            const userId = typeReq.user._id;
            const {data} = req.body;

            if(!Array.isArray(data) || data.length===0)
            {
                return res.status(400).json({success:true,message:"No data provided"});
            }
            let documents = [];
            for(const doc of data)
            {
                if(!isValidObjectId(doc.id))
                {
                    documents.push({
                        ...doc,
                        userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                    )
                }
            }

            if(documents.length===0)
            {
                return res.status(400).json({
                    success:false,
                    message:"These documents alreay exists"
                })
            }

            const session = await mongoose.startSession();
            await session.withTransaction(async()=>{
                await AwardDocs.insertMany(documents,{session})
            })
            session.endSession();

            res.status(201).json({success:true,message:"Documents saved successfully"})
        } catch (error:any) {
            return res.status(500).json({
                success:false,
                message:"Something went wrong",
                error:error.message||error
            })
        }
}

export const getAwardDocs = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const awards = await AwardDocs.find({userId});
        return res.status(200).json({
            success: true,
            message: "Fetched awards successfully",
            awards
        })
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const updateAwardDoc = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {id} = req.params;
        const {data} = req.body;
        console.log("data",data);
        if(!isValidObjectId(id)){
            return res.status(400).json({success:false,message:"Invalid document id"})
        }
        const document = await AwardDocs.findById(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        document.name = data.name;
        document.organisation = data.organisation;
        document.duration = data.duration;
        document.description = data.description;
        document.selfAttested = data.selfAttested;
        document.isEmailSend = data.isEmailSend;
        document.verified = data.verified;
        document.status = data.status;
        document.docUri = data.docUri;
        document.issuerEmail = data.issuerEmail;
        document.updatedAt = new Date();
        await document.save();
        return res.status(200).json({success:true,message:"Document updated successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}