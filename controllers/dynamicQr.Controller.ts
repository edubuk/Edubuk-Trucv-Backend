import { Request,Response } from "express";
import UrlMap from "../models/qr.model";

export const dynamicQrUrlMap = async (req: Request, res: Response) => {
  try {
    const { url, id } = req.body;

    if (!url || !id) {
      return res.status(400).json({ success: false, error: "URL and id are required" });
    }
    await UrlMap.create({ id, url });
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

    const urlMap = await UrlMap.findOne({ id });
    if (!urlMap) {
      return res.status(404).json({ success: false, error: "No URL found for this ID" });
    }   
    res.redirect(urlMap.url);
  } catch (error) {
    console.error("Error redirecting dynamic QR code:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  } 

}