import { Request,Response } from "express";
import { Certification } from "../models/certification.model";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";

export const dynamicQrUrlMap = async (req: Request, res: Response) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const { url, id, hackathonName } = req.body;

    if (!url || !id) {
      return res.status(400).json({ success: false, error: "URL and id are required" });
    }
    const data = await Certification.findOne({ qrId: id });
    if (data) {
      return res.status(200).json({ success:true, message: "URL already exists for this ID,Go to next step" });
    }
    await Certification.create({userId:typeReq.user._id, qrId: id, qrUrl: url, hackathonName });
    res.status(200).json({ success: true, message: "Redirect link mapped successfully" });
  } catch (error) {
    console.error("Error generating dynamic QR code:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export const dynamicQrRedirect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "ID is required" });
    }

    const urlMap:any = await Certification.findOne({ qrId: id });
    if (!urlMap) {
      return res.status(404).json({ success: false, error: "No URL found for this ID" });
    }   
    res.redirect(`https://trucvstorage.blob.core.windows.net/uploads/${urlMap.qrUrl}`);
  } catch (error) {
    console.error("Error redirecting dynamic QR code:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  } 

}