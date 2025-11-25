import { Request, Response } from "express";
import { EducationDoc } from "../models/education.model";
import { ExperienceDoc } from "../models/experience.model";
import { AwardDocs } from "../models/award.model";
import { SkillVerificationReq } from "../models/skillVerificationRequest.model";
import { SkillDoc } from "../models/skill.model";

function renderSuccess() {
  return `
    <html>
      <body style="font-family: Arial; text-align:center; margin-top:50px;">
        <h1 style="color: green;">✔ Document Verified Successfully</h1>
        <p style="font-size:16px;">Thank you! The document is now verified.</p>
      </body>
    </html>
  `;
}
function renderReject() {
  return `
    <html>
      <body style="font-family: Arial; text-align:center; margin-top:50px">
        <h1 style="color: red;"> ❌ Document Rejected Successfully</h1>
        <p style="font-size:16px;">Thank you! The document is now rejected.</p>
      </body>
    </html>
  `;
}

function renderError(message: string) {
  return `
    <html>
      <body style="font-family: Arial; text-align:center; margin-top:50px;">
        <h1 style="color: red;">❌ Verification Failed</h1>
        <p style="font-size:16px;">${message}</p>
      </body>
    </html>
  `;
}


export const approveHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emailId, docType } = req.query;

    const models: any = {
      education: EducationDoc,
      experience: ExperienceDoc,
      award: AwardDocs
    }

    const Model = models[docType as string];

    if (!Model) {
      return res.status(400).send(renderError("Invalid verification type."));
    }

    const doc = await Model.findById(id);
    if (!doc || emailId !== doc.issuerEmailId) {
      return res.status(404).send(renderError("Document not found or issuer emailId is mismatched."));
    }

    doc.status = "verified";
    doc.verifiedThrough = "Email";
    doc.updatedAt = new Date();
    await doc.save()
    return res.status(200).send(renderSuccess())
  } catch (error) {
    return res.status(500).send(renderError("Internal server error"))
  }
}

export const rejectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emailId, docType } = req.query;

    const models: any = {
      education: EducationDoc,
      experience: ExperienceDoc,
      award: AwardDocs
    }

    const Model = models[docType as string];

    if (!Model) {
      return res.status(400).send(renderError("Invalid verification type."));
    }

    const doc = await Model.findById(id);
    if (!doc || emailId !== doc.issuerEmailId) {
      return res.status(404).send(renderError("Document not found or issuer emailId is mismatched."));
    }

    doc.status = "rejected";
    doc.updatedAt = new Date();
    await doc.save()
    return res.status(200).send(renderReject())
  } catch (error) {
    return res.status(500).send(renderError("Internal server error"))
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
    res.status(500).json({ success: false, message: "internal server error" })
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
    res.status(500).json({ success: false, message: "internal server error" })
  }
}




