import { NextFunction, Request, RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { Types } from "mongoose";
import { authMiddleware } from "./jwksAuth";
import { decodeJwt } from "jose";

export const jwtTokenVerification: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Check for OCID token in Authorization header
        const typeReq = req as IGetUserAuthInfoRequest;
        const sessionToken = req.cookies.accessToken;
        //const token = decodeJwt(req.cookies.refreshAccessToken);
        //console.log("sessionToken", sessionToken);
        //console.log("decoded token", token);
        if (sessionToken) {
            //const sessionUser = await verifyJwtToken(sessionToken);
            const {user,iat,exp} = await authMiddleware(sessionToken);    
            if (user) {
                typeReq.user = {
                    _id: user._id as Types.ObjectId,
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    authType: 'SESSION',
                    iat: iat,
                    exp: exp
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