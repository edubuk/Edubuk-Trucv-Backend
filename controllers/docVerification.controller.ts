import { Request, Response } from "express";
import { EducationDoc } from "../models/education.model";
import { ExperienceDoc } from "../models/experience.model";
import { AwardDocs } from "../models/award.model";
import { SkillVerificationReq } from "../models/skillVerificationRequest.model";
import { SkillDoc } from "../models/skill.model";
import { DocVerificationRequest } from "../models/docVerificationRequest.model";



export const getRequestedData = async(req: Request, res: Response)=>{
  try {
    const {token} = req.params;
    console.log("token",token);
    const requestDoc = await DocVerificationRequest.findOne({token:token});
    if(!requestDoc){
      return res.status(404).json({success:false,message:"Invalid Token"});
    }
    if(requestDoc.tokenUsed){
      return res.status(400).json({success:false,message:"Invalid token. This token has already been used"});
    }

    const models: any = {
      education: EducationDoc,
      experience: ExperienceDoc,
      award: AwardDocs,
    };

    const Model = models[requestDoc.documentType];
    if (!Model) throw new Error("Invalid document type");

    const doc = await Model.findById(requestDoc.documentId);
    if (!doc) throw new Error("Document not found");
    return res.status(200).json({
      success: true,
      doc: doc
    });
  } catch (error) {
    console.log("error",error)
    return res.status(500).json({message:"Internal server error",error:error});
  }
}

export const approveHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    console.log("token",token)
    const requestDoc = await DocVerificationRequest.findOne({token:token});
    console.log("requestDoc",requestDoc);
    if(!requestDoc || requestDoc?.tokenUsed)
    {
      return res.status(400).json({success:false,message:"Invalid token"});
    }
    const models: any = {
      education: EducationDoc,
      experience: ExperienceDoc,
      award: AwardDocs
    }

    const Model = models[requestDoc?.documentType as string];

    if (!Model) {
      return res.status(400).json({success:false,message:"Invalid verification type"});
    }

    const doc = await Model.findById(requestDoc.documentId);
    //console.log("doc",doc);
    if (!doc) {
      return res.status(404).json({success:false,message:"Document not found or issuer emailId is mismatched"});
    }

    doc.status = "verified";
    doc.verified = true;
    doc.verifiedThrough = "Email";
    doc.updatedAt = new Date();
    await doc.save()

    requestDoc.tokenUsed=true,
    requestDoc.verified=true,
    await requestDoc.save();

    return res.status(200).json({success:true,message:"Document approved"})
  } catch (error) {
    return res.status(500).json({success:false,message:"Internal server error",error:error})
  }
}

export const rejectHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const requestDoc = await DocVerificationRequest.findOne({token:token});

    if(!requestDoc || requestDoc.tokenUsed)
    {
      return res.status(400).json({success:false,message:"Invalid token"});

    }

    const models: any = {
      education: EducationDoc,
      experience: ExperienceDoc,
      award: AwardDocs
    }

    const Model = models[requestDoc.documentType as string];

    if (!Model) {
      return res.status(400).json({success:false,message:"Invalid verification type"});
    }

    const doc = await Model.findById(requestDoc.documentId);
    if (!doc) {
      return res.status(404).json({success:false,message:"Document not found or issuer emailId is mismatched"});
    }

    doc.status = "rejected";
    doc.verified = false;
    doc.updatedAt = new Date();
    await doc.save()

    requestDoc.tokenUsed=true,
    requestDoc.verified=false,
    await requestDoc.save();

    return res.status(200).json({success:true,message:"Document rejected"})
  } catch (error) {
    return res.status(500).json({success:false,message:"Internal server error",error:error})
  }
}


export const requestedSkills = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token) {
      res.status(400).json({ sucess: false, message: "unauthorised request" })
    }

    const data = await SkillVerificationReq.findOne({ token: token })
    if (!data) {
      return res.status(404).json({ sucess: false, message: "data not found" })
    }
    res.status(200).json({ success: true, data: data })

  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "internal server error", error: error })
  }
}

export const approveSkills = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { userId } = req.query;
    const { data } = req.body;
    console.log("data",data);
    if (!userId) {
      return res.status(400).json({ sucess: false, message: "unauthorised request" })
    }

    const replica = await SkillVerificationReq.findOne({ token, tokenUsed: false })

    if (!replica) {
      return res.status(404).json({ sucess: false, message: "Inavlid token" })
    }

    const skillNames = replica.skills.map((s: any) => s.skillName);
    console.log("skillNames", skillNames);
    if (!skillNames.length) {
      return res
        .status(400)
        .json({ message: "No skills to verify for this token" });
    }

    const updates = data.skills.map((skill:any) =>
      SkillDoc.updateOne(
        {
          userId: userId,
          skillName: skill.skillName,
        },
        {
          $set: {
            level: skill.level,
            endoresBy: replica.endoresBy,
            endoresThrough: "Email",
            endoresedOn: new Date(),
          },
        }
      )
    );

    const results = await Promise.all(updates);
    replica.tokenUsed = true;
    await replica.save();
    return res.status(200).json({ success: true, message: "Skills verified successfully" })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "internal server error", error: error  })
  }
}




