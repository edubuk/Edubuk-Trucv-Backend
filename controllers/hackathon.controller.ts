
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { Certification } from "../models/certification.model";

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
    console.log("normal", csvText);
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
    const userId = typeReq.user._id;
    const certification = await Certification.findOne({ userId });
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
