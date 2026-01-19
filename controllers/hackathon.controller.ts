
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

  const match = csvText
    .split("\n")
    .map(row => row.split(","))
    .some(columns =>
      columns.some(
        cell => cell.trim().toLowerCase() === normalizedEmail
      )
    );
  res.status(200).json({ success: true, match: match });
   } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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
