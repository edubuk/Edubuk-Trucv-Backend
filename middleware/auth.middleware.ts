import { NextFunction, Request, RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { Types } from "mongoose";
import { verifyOCIDToken } from "./ocidAuth.middleware";
import { verifyJwtToken } from "./jwtAuth.middleware";

export const jwtTokenVerification: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Check for OCID token in Authorization header
        const typeReq = req as IGetUserAuthInfoRequest;
        const authHeader = req.headers.authorization;
        //console.log("authHeader", authHeader);
        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json({
                success: false,
                message: "SECRET Token not available"
            })
        }
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const ocidToken = authHeader.split(' ')[1];
            //console.log("ocidToken", ocidToken);
            // Validate OCID token via JWKS
            const ocidUser = await verifyOCIDToken(ocidToken);
            //console.log("ocidUser", ocidUser);
            if (ocidUser) {
                typeReq.user = {
                    _id: ocidUser._id as Types.ObjectId,
                    name: ocidUser.name as string,
                    email: ocidUser.email as string,
                    roles: ocidUser.roles as string,
                    authType: 'OCID'
                };
                return next();
            }
        }

        // Check for session token in cookies
        const sessionToken = req.cookies.accessToken;
        //console.log("sessionToken", sessionToken);
        if (sessionToken) {
            const sessionUser = await verifyJwtToken(sessionToken);
            if (sessionUser) {
                typeReq.user = {
                    _id: sessionUser._id as Types.ObjectId,
                    name: sessionUser.name,
                    email: sessionUser.email,
                    roles: sessionUser.roles,
                    authType: 'SESSION'
                }
                return next();
            }
        }

        // No valid auth found
        return res.status(401).json({ success: false, message: 'Invalid token' });
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ success: false, message: 'Invalid authentication', error: error as Error });
    }
}