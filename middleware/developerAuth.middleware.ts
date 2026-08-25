import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { Developer } from "../models/developer.model";
import { IGetDeveloperAuthInfoRequest } from "../types/definitionFile";

export const developerAuthMiddleWare: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { developer_token } = req.cookies;
    if (!developer_token) {
      return res.status(401).json({ success: false, message: "No token, sign in to continue" });
    }

    const decoded = jwt.verify(developer_token, process.env.DEVELOPER_JWT_SECRET as string) as { id: string };
    const developer = await Developer.findById(decoded.id).select("+pendingImpersonation");
    if (!developer) {
      return res.status(404).json({ success: false, message: "No developer found" });
    }

    const typeReq = req as IGetDeveloperAuthInfoRequest;
    typeReq.developerId = decoded.id;
    typeReq.developer = developer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
