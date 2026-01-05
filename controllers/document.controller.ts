import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile"
import { EducationDoc } from "../models/education.model";
import { docVerificationEmailHandler, docVerificationNotifyEmailHandler, skillVerificationEmailHandler, skillverificationNotifyEmailHandler } from "../utils/emailHandler";
import mongoose, { isValidObjectId } from "mongoose";
import { ExperienceDoc } from "../models/experience.model";
import { ProjectDoc } from "../models/projects.model";
import { AwardDocs } from "../models/award.model";
import { SkillDoc } from "../models/skill.model";
import { generateVerificationToken } from "../utils/createToken";
import { SkillVerificationReq } from "../models/skillVerificationRequest.model";
import { DocVerificationRequest } from "../models/docVerificationRequest.model";



const isEmpty = (value: any) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
};

//educational documents methods
export const saveDocuments = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = typeReq.user;
        const { data } = req.body;
        const token=generateVerificationToken();

        const doc: any = await EducationDoc.create({ userId: user._id, ...data });
        res.status(200).json({
            success:true,
            message:"Document saved successfully."
        })
        
        //background task
        process.nextTick(async () => {
            try {

                if (!doc.issuerEmailId || !doc.docUri) return;

                const status = await docVerificationEmailHandler({
                    emailId: doc.issuerEmailId,
                    level: doc.level,
                    boardNameOrDegree: doc.boardNameOrDegree,
                    institutionName: doc.institutionName,
                    documentViewUrl: doc.docUri,
                    id: doc._id,
                    docType: "education",
                    token,
                    userEmail: user.email,
                });

                if (status === "Succeeded") {
                    await Promise.all([
                        EducationDoc.updateOne(
                            { _id: doc._id },
                            { isEmailSend: true }
                            ),
                        
                        docVerificationNotifyEmailHandler({
                            emailId: doc.issuerEmailId,
                            level: doc.level,
                            boardNameOrDegree: doc.boardNameOrDegree,
                            institutionName: doc.institutionName,
                            documentViewUrl: doc.docUri,
                            id: doc._id,
                            docType: "education",
                            userEmail: user.email,
                    }),
                        DocVerificationRequest.create({
                            userId: user._id,
                            documentId: doc._id,
                            documentType: "education",
                            issuerEmailId: doc.issuerEmailId,
                            token,
                        }),
                ]);
                }
            } catch (err) {
                console.error("Email background task failed:", err);
            }
        });


        // if (doc._id && doc.issuerEmailId && doc.docUri) {
        //     const status = await docVerificationEmailHandler({ emailId: doc.issuerEmailId, level: doc.level, boardNameOrDegree: doc.boardNameOrDegree, institutionName: doc.institutionName, documentViewUrl: doc.docUri, id: doc._id, docType: "education",token:token,userEmail:user.email })
        //     if (status === "Succeeded") {
        //         doc.isEmailSend = true;
        //         await doc.save();
        //         await docVerificationNotifyEmailHandler({emailId: doc.issuerEmailId, level: doc.level, boardNameOrDegree: doc.boardNameOrDegree, institutionName: doc.institutionName, documentViewUrl: doc.docUri, id: doc._id, docType: "education",userEmail:user.email})
        //         await DocVerificationRequest.create({
        //             userId: user._id,
        //             documentId: doc._id,
        //             documentType: "education",
        //             issuerEmailId: doc.issuerEmailId,
        //             token: token
        //         });
        //         return res.status(200).json({
        //             success: true,
        //             status: status,
        //             message: "Documents saved and email has been sent to issuer",
        //         })
        //     }
        // }
        // return res.status(201).json({
        //     success: true,
        //     message: "Documents saved successfully"
        // })
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


export const updateDoc = async (req: Request, res: Response) => {
    try {
        //const typeReq = req as IGetUserAuthInfoRequest;
        //const userId = typeReq.user._id;
        const { id } = req.params;
        const { data } = req.body;
        console.log("data", data);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid document id" })
        }
        const document = await EducationDoc.findById(id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" })
        }

        const fieldsToUpdate: (keyof typeof data)[] = [
            "level",
            "boardNameOrDegree",
            "institutionName",
            "gpa",
            "duration",
            "selfAttested",
            "isEmailSend",
            "verified",
            "status",
            "docUri",
            "docHash",
            "issuerEmailId",
            "verifiedThrough",
        ];

        fieldsToUpdate.forEach((field) => {
            if (!isEmpty(data[field])) {
                // only assign if value is present/non-empty
                (document as any)[field] = data[field];
            }
        });

        document.updatedAt = new Date();
        // make sure this is a primitive number
        document.updateCount = document.updateCount.valueOf() + 1;

        await document.save();

        res.status(200).json({ success: true, message: "Document updated successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const deleteEduDoc = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const document = await EducationDoc.findByIdAndDelete(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        return res.status(200).json({success:true,message:"Document deleted successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message||error
        })
    }
}


//--------------Experience Documents Methods--------------

export const saveExpDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = typeReq.user;
        const { data } = req.body;
        const token=generateVerificationToken();

        const doc: any = await ExperienceDoc.create({ userId: user._id, ...data });
        res.status(200).json({
            success:true,
            message:"Document Saved Successfully"
        })

        process.nextTick(async()=>{
            try {
                
                if(!doc.issuerEmailId || !doc.docUri) {
                    return;
                }

                const status = await docVerificationEmailHandler({ 
                    emailId: doc.issuerEmailId, 
                    documentViewUrl: doc.docUri, 
                    position: doc.position, 
                    companyName: doc.companyName, 
                    skills: doc.skills, 
                    duration: doc.duration, 
                    id: doc._id, 
                    docType: "experience",
                    token:token,
                    userEmail:user.email 
                })

                if(status === "Succeeded")
                {
                    await Promise.all([
                        ExperienceDoc.updateOne(
                            { _id: doc._id },
                            { isEmailSend: true }
                        ),
                        docVerificationNotifyEmailHandler({
                            emailId: doc.issuerEmailId, 
                            documentViewUrl: doc.docUri, 
                            position: doc.position, 
                            companyName: doc.companyName, 
                            skills: doc.skills, 
                            duration: doc.duration, 
                            id: doc._id, 
                            docType: "experience",
                            userEmail:user.email}),

                        DocVerificationRequest.create({
                            userId: user._id,
                            documentId: doc._id,
                            documentType: "experience",
                            issuerEmailId: doc.issuerEmailId,
                            token:token
                        })
                    ]);

                }
            } catch (error) {
                console.error('Error in emailing background process:', error);
            }
        })
        // if (doc._id && doc.issuerEmailId && doc.docUri) {
        //     const status = await docVerificationEmailHandler({ emailId: doc.issuerEmailId, documentViewUrl: doc.docUri, position: doc.position, companyName: doc.companyName, skills: doc.skills, duration: doc.duration, id: doc._id, docType: "experience",token:token,userEmail:user.email })
        //     if (status === "Succeeded") {
        //         doc.isEmailSend = true;
        //         await doc.save();
        //         await docVerificationNotifyEmailHandler({emailId: doc.issuerEmailId, documentViewUrl: doc.docUri, position: doc.position, companyName: doc.companyName, skills: doc.skills, duration: doc.duration, id: doc._id, docType: "experience",userEmail:user.email})
        //         await DocVerificationRequest.create({
        //             userId: user._id,
        //             documentId: doc._id,
        //             documentType: "experience",
        //             issuerEmailId: doc.issuerEmailId,
        //             token:token
        //         });
        //         return res.status(200).json({
        //             success: true,
        //             status: status,
        //             message: "Documents saved and email has been sent to issuer",
        //         })
        //     }
        // }
        // return res.status(201).json({
        //     success: true,
        //     message: "Documents saved successfully"
        // })

    } catch (error: any) {
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

export const updateExpDoc = async (req: Request, res: Response) => {
    try {
        //const typeReq = req as IGetUserAuthInfoRequest;
        //const userId = typeReq.user._id;
        const { id } = req.params;
        const { data } = req.body;
        //console.log("data", data);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid document id" })
        }
        const document = await ExperienceDoc.findById(id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" })
        }

        const fieldsToUpdate: (keyof typeof data)[] = [
            "companyName",
            "jobRole",
            "duration",
            "skills",
            "description",
            "selfAttested",
            "isEmailSend",
            "verified",
            "status",
            "docUri",
            "docHash",
            "issuerEmailId",
            "verifiedThrough",
        ];

        fieldsToUpdate.forEach((field) => {
            if (!isEmpty(data[field])) {
                // only assign if value is present/non-empty
                (document as any)[field] = data[field];
            }
        });
        document.updatedAt = new Date();
        document.updateCount = document.updateCount.valueOf() + 1;

        await document.save();
        res.status(200).json({ success: true, message: "Document updated successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const deleteExpDoc = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const document = await ExperienceDoc.findByIdAndDelete(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        return res.status(200).json({success:true,message:"Document deleted successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message||error
        })
    }
}

export const getAllDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const id = req.query.userId;
        console.log("id", id);
        const userId = id ?? typeReq.user._id;
        const [educations, experiences,awards] = await Promise.all([
            EducationDoc.find({ userId: userId }).sort({ createdAt: -1 }),
            ExperienceDoc.find({ userId: userId }).sort({ createdAt: -1 }),
            AwardDocs.find({userId:userId}).sort({createdAt:-1})
        ])
        return res.status(200).json({
            success: true,
            message: "Fetched user documents successfully",
            data: {
                educations,
                experiences,
                awards
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

//--------------Projects Documents Methods--------------
export const saveProjects = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const { data } = req.body;
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ success: false, message: "No data provided" });
        }
        let documents = [];
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
                message: "These projects already exists"
            })
        }

        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            await ProjectDoc.insertMany(documents, { session })
        })
        session.endSession();
        return res.status(201).json({ success: true, message: "Projects saved successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getProjectsDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const projects = await ProjectDoc.find({ userId });
        return res.status(200).json({
            success: true,
            message: "Fetched projects successfully",
            projects
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const updateProjectDoc = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const { id } = req.params;
        const { data } = req.body;
        console.log("data", data);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid document id" })
        }
        const document = await ProjectDoc.findById(id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" })
        }
        document.projectName = data.projectName;
        document.projectUrl = data.projectUrl;
        document.duration = data.duration;
        document.skills = data.skills;
        document.description = data.description;
        document.selfAttested = data.selfAttested;
        document.updatedAt = new Date();
        await document.save();
        return res.status(200).json({ success: true, message: "Document updated successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const deleteProjectDoc = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const document = await ProjectDoc.findByIdAndDelete(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        return res.status(200).json({success:true,message:"Document deleted successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message||error
        })
    }
}


//--------------Award Documents Methods--------------
export const saveAwardDoc = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = typeReq.user;
        const { data } = req.body;
        const token=generateVerificationToken();
        //console.log("payload", data);
        const doc: any = await AwardDocs.create({ userId: user._id, ...data })
        res.status(200).json({
            success:true,
            message:"Document saved successfully."
        })

        process.nextTick(async()=>{
            try {
                if(!doc.issuerEmailId || !doc.docUri) {
                    return;
                }
                const status: any = await docVerificationEmailHandler({ 
                    emailId: doc.issuerEmailId, 
                    documentViewUrl: doc.docUri, 
                    level: doc.level, 
                    organisation: doc.organisation, 
                    duration: doc?.duration, 
                    id: doc._id, 
                    docType: "award",
                    token:token,
                    userEmail:user.email 
                });
                //console.log("status", status);
                if (status === "Succeeded") {
                    doc.isEmailSend = true;
                    await doc.save();
                    await docVerificationNotifyEmailHandler({emailId: doc.issuerEmailId, documentViewUrl: doc.docUri, level: doc.level, organisation: doc.organisation, duration: doc?.duration, id: doc._id, docType: "award",userEmail:user.email})
                    await DocVerificationRequest.create({
                        userId: user._id,
                        documentId: doc._id,
                        documentType: "award",
                        issuerEmailId: doc.issuerEmailId,
                        token:token
                    });
                }
            } catch (error) {
                console.error('Error in award document email process:', error);
            }
        })
        // const status: any = await docVerificationEmailHandler({ emailId: doc.issuerEmailId, documentViewUrl: doc.docUri, level: doc.level, organisation: doc.organisation, duration: doc?.duration, id: doc._id, docType: "award",token:token,userEmail:user.email })
        // //console.log("status", status);
        // if (status === "Succeeded") {
        //     doc.isEmailSend = true;
        //     await doc.save();
        //     await docVerificationNotifyEmailHandler({emailId: doc.issuerEmailId, documentViewUrl: doc.docUri, level: doc.level, organisation: doc.organisation, duration: doc?.duration, id: doc._id, docType: "award",userEmail:user.email})
        //     await DocVerificationRequest.create({
        //         userId: user._id,
        //         documentId: doc._id,
        //         documentType: "award",
        //         issuerEmailId: doc.issuerEmailId,
        //         token:token
        //     });

        //}
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const getAwardDocs = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const awards = await AwardDocs.find({ userId });
        return res.status(200).json({
            success: true,
            message: "Fetched awards successfully",
            awards
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

export const updateAwardDoc = async (req: Request, res: Response) => {
    try {
        //const typeReq = req as IGetUserAuthInfoRequest;
        //const userId = typeReq.user._id;
        const { id } = req.params;
        const { data } = req.body;
        console.log("data", data);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid document id" })
        }
        const document = await AwardDocs.findById(id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" })
        }

        const fieldsToUpdate: (keyof typeof data)[] = [
            "level",
            "name",
            "organisation",
            "duration",
            "description",
            "selfAttested",
            "isEmailSend",
            "verified",
            "status",
            "docUri",
            "docHash",
            "issuerEmailId",
            "verifiedThrough",
        ];

        fieldsToUpdate.forEach((field) => {
            if (!isEmpty(data[field])) {
                (document as any)[field] = data[field];
            }
        });
        document.updatedAt = new Date();
        document.updateCount = document.updateCount.valueOf() + 1;

        await document.save();
        return res.status(200).json({ success: true, message: "Document updated successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const deleteAwardDoc = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const document = await AwardDocs.findByIdAndDelete(id);
        if(!document){
            return res.status(404).json({success:false,message:"Document not found"})
        }
        return res.status(200).json({success:true,message:"Document deleted successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message||error
        })
    }
}



//----------Skill documents methods----------


export const saveSkills = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const userId = typeReq.user._id;
    const { data } = req.body;

    console.log("data", data);

    const incomingSkills = data?.skills;

    if (!Array.isArray(incomingSkills) || incomingSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skills must be a non-empty array",
      });
    }

        let documents = [];
        for (const doc of incomingSkills) {
            if (!isValidObjectId(doc.id)) {
                documents.push({
                    userId,
                    ...doc,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        }

        if (documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: "These skills already exists"
            })
        }
        console.log("documents", documents);
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            await SkillDoc.insertMany(documents, { session })
        })
        session.endSession();
        return res.status(201).json({ success: true, message: "Skills saved successfully" })
  } catch (error: any) {
     if (error.code === 11000) {
      console.log("error",error)
      return res.status(400).json({
        success: false,
        message: "some of the skills already exists",
      });
    }
    console.log("error",error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};



export const updateSkills = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data } = req.body;
        const doc = await SkillDoc.findById(id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" })
        }
        doc.skillName=data.skillName;
        doc.level = data.level;
        doc.selfAttested = data.selfAttested;
        doc.endoresBy = data.endoresBy;
        doc.endoresThrough = data.endoresThrough;
        doc.endoresedOn = new Date();
        await doc.save();
        return res.status(200).json({ success: true, message: "Skills updated successfully" })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const deleteSkillDoc = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const document = await SkillDoc.findByIdAndDelete(id);
        if(!document){
            return res.status(404).json({success:false,message:"Skill not found"})
        }
        return res.status(200).json({success:true,message:"Skill deleted successfully"})
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message||error
        })
    }
}



export const getSkills = async (req: Request, res: Response) => {
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const skills = await SkillDoc.find({ userId });
        return res.status(200).json({ success: true, message: "Skills fetched successfully", skills })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}

// export const endureSkills = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const { data } = req.body;
//         const doc = await SkillDoc.findById(id);
//         if (!doc) {
//             return res.status(404).json({ success: false, message: "Document not found" })
//         }
//         doc.skill.forEach((skill) => {
//             if (skill.skillName === data.skillName) {
//                 skill.level = data.level;
//                 skill.selfAttested = data.selfAttested;
//                 skill.endoresBy = data.endoresBy;
//                 skill.endoresThrough = data.endoresThrough;
//                 skill.endoresedOn = new Date();
//             }
//         })
//         await doc.save();
//         return res.status(200).json({ success: true, message: "Skills updated successfully" })
//     } catch (error: any) {
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             error: error.message || error
//         })
//     }
// }

export const skillVerificationHandler = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const userId = typeReq.user._id;
        const {data} = req.body;
        const {emailId} = req.params;
        console.log("data",data);
        if(!Array.isArray(data.skills) || data.skills.length===0){
            return res.status(400).json({
                success: false,
                message: "No data provided"
            })
        }
        const token = generateVerificationToken();
        const status = await skillVerificationEmailHandler(emailId,typeReq.user.name,token);
        if(status === "Succeeded"){
            await SkillVerificationReq.create({userId:userId,token:token,skills:data.skills,endoresBy:emailId});
            await skillverificationNotifyEmailHandler(emailId,typeReq.user.name,typeReq.user.email);
            return res.status(200).json({success:true,message:"Email has been sent successfully"})
        }
        return res.status(400).json({success:false,message:"something went wrong. Please check the entered email id"})
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })
    }
}


export const resendEmailHandler = async(req:Request,res:Response)=>{
    try {
        const typeReq = req as IGetUserAuthInfoRequest;
        const user = typeReq.user;
        const {id} = req.params;
        const {docType} = req.query;
        const {data}= req.body;
        //console.log("object id",objectId)
        //const realId = typeof id === "string" ? id : id.id; 
        if (!id || !docType || !data?.issuerEmailId || !data?.docUri || !data?.docHash) {
            return res.status(400).json({ success: false, message: "all data not provided" });
        }
        const models:any = {
            education:EducationDoc,
            experience:ExperienceDoc,
            award:AwardDocs
        }

        const doc = await models[docType as string].findById(id);
          if (docType==="education") {
            const status = await docVerificationEmailHandler({ emailId: data.issuerEmailId, level: doc.level, boardNameOrDegree: doc.boardNameOrDegree, institutionName: doc.institutionName, documentViewUrl: data.docUri, id: doc._id, docType: "education" })
            if (status === "Succeeded") {
                doc.isEmailSend = true;
                doc.issuerEmailId = data.issuerEmailId;
                doc.docUri = data.docUri;
                doc.docHash = data.docHash;
                await doc.save();
                await docVerificationNotifyEmailHandler({emailId: data.issuerEmailId, level: doc.level, boardNameOrDegree: doc.boardNameOrDegree, institutionName: doc.institutionName, documentViewUrl: data.docUri, id: doc._id, docType: "education",userEmail:user.email })
                return res.status(200).json({
                    success: true,
                    status: status,
                    message: "Email has been sent to issuer",
                })
            }
        }
          if (docType==="experience") {
            const status = await docVerificationEmailHandler({ emailId: data.issuerEmailId, documentViewUrl: data.docUri, position: doc.position, companyName: doc.companyName, skills: doc.skills, duration: doc.duration, id: doc._id, docType: "experience" })
            if (status === "Succeeded") {
                doc.isEmailSend = true;
                doc.issuerEmailId = data.issuerEmailId;
                doc.docUri = data.docUri;
                doc.docHash = data.docHash;
                await doc.save();
                await docVerificationNotifyEmailHandler({emailId: data.issuerEmailId, documentViewUrl: data.docUri, position: doc.position, companyName: doc.companyName, skills: doc.skills, duration: doc.duration, id: doc._id, docType: "experience", userEmail:user.email})
                return res.status(200).json({
                    success: true,
                    status: status,
                    message: "Email has been sent to issuer",
                })
            }
        }
          if (docType==="award") {
            const status: any = await docVerificationEmailHandler({ emailId: data.issuerEmailId, documentViewUrl: data.docUri, level: doc.level, organisation: doc.organisation, duration: doc?.duration, id: doc._id, docType: "award" })
            if (status === "Succeeded") {
                doc.isEmailSend = true;
                doc.issuerEmailId = data.issuerEmailId;
                doc.docUri = data.docUri;
                doc.docHash = data.docHash;
                await doc.save();
                await docVerificationNotifyEmailHandler({emailId: data.issuerEmailId, documentViewUrl: data.docUri, level: doc.level, organisation: doc.organisation, duration: doc?.duration, id: doc._id, docType: "award",userEmail:user.email})
                return res.status(200).json({
                    success: true,
                    status: status,
                    message: "Email has been sent to issuer",
                })
            }
        }
        return res.status(400).json({success:false,message:"something went wrong"});
    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message || error
        })  
    }
}
