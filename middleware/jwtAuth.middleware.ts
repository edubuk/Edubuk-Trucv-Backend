import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { User } from "../models/user.model";

export const verifyJwtToken = async (token:string) => {
    try {
        if(!process.env.ACCESS_TOKEN_SECRET){
            console.log("ACCESS_TOKEN_SECRET not found");
            return null;
        }
        const decodedToken:any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
        );

        const user = await User.findById(decodedToken._id as string).select("-password -refreshToken -providers");
        return user;
    } catch (err: any) {
        return null
    }
}