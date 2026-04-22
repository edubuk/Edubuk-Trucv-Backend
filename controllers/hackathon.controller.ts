
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { Certification } from "../models/certification.model";
import { validateEmail } from "../utils/utilFunctions";
import { Hackathon } from "../models/hackathon.model";
import asyncHandler from "../utils/asyncHandler";


export const registerHackathon =(async(req:Request,res:Response)=>{
  try {
  const {data} = req.body;
  console.log(data);
  if(!data.hackathonName || !data.organization || !data.emailId){
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if(!validateEmail(data.emailId)){
    return res.status(400).json({ success: false, message: "Invalid email" });
  }

  // const hackathon = await Certification.findOne({ emailId });
  // if(hackathon){
  //   return res.status(400).json({ success: false, message: "Hackathon already registered with this " });
  // }

  const hackathon = await Hackathon.create({
    hackathonName: data.hackathonName,
    organization: data.organization,
    emailId: data.emailId,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
    description: data.description,
  });

  return res.status(200).json({ success: true, hackathon });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message||"Internal server error" });
  }
  
} )

export const deleteHackathon = (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findByIdAndDelete(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }
    return res.status(200).json({ success: true, message: "Hackathon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message||"Internal server error" });
  }
})

export const getHackathons = async (req: Request, res: Response) => {
  try {
    const hackathons = await Hackathon.find();
    return res.status(200).json({ success: true, hackathons });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message||"Internal server error" });
  }
}

export const updateHackathonStatus = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    const { data } = req.body;
    const hackathon = await Hackathon.findByIdAndUpdate(hackathonId, data);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }
    return res.status(200).json({ success: true, hackathon });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message||"Internal server error" });
  }
}

export const isEmailPresentInSheet = async (
  req: Request,
  res: Response
) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const userEmailId = typeReq.user.email;
    const url = `https://docs.google.com/spreadsheets/d/1l1Mw-_ht-SBF7TS1GDG7euQENlBvAjzdOwjT-7nd1QU/export?format=csv`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Google Sheet");
    }

    const csvText = await response.text();

    const normalizedEmail = userEmailId.trim().toLowerCase();
    // console.log("normal", csvText);
    const matchData = csvText.split("\n").find(
      row => row.trim().toLowerCase() === normalizedEmail
    );
    if (!matchData) {
      return res.status(200).json({ success: true, match: false });
    }
    // const data = matchData.split(",");
    // console.log("data", data[0],data[1],data[2],data[3]);
    return res.status(200).json({ success: true, match: true});
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

}


export const getCertificationData = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const user = typeReq.user;
    console.log("user", user);
    const certification = await Certification.findOne({ userId: user._id });
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: "Certification not found"
      });
    }
    res.status(200).json({ success: true, certification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const getHackathonCertificateList = async (req: Request, res: Response) => {
  try {
    const hackathonName = req.query.hackathonName as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const data = await Certification.find(hackathonName ? { hackathonName } : {}).limit(limit).skip(offset);

    const totalCertificate = await Certification.countDocuments(hackathonName ? { hackathonName } : {});

    res.status(200).json({
      success: true,
      data,
      pagination: {
        limit,
        pageSize: limit,
        totalPages: Math.ceil(totalCertificate / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalCertificate / limit),
        hasPrevPage: page > 1,
        totalCertificate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const getHackathonCertificatesById = async (req: Request, res: Response) => {
  try {
   
    const hackathonId = req.params.hackathonId as string;
     console.log("hackathonId", hackathonId);
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const data = await Certification.find({ hackathonId }).limit(limit).skip(offset);

    const totalCertificate = await Certification.countDocuments({ hackathonId });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        limit,
        pageSize: limit,
        totalPages: Math.ceil(totalCertificate / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalCertificate / limit),
        hasPrevPage: page > 1,
        totalCertificate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
