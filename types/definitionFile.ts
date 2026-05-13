import { Request } from "express";
import { Types } from "mongoose";

export interface IGetUserAuthInfoRequest extends Request{
    user:{
        _id:Types.ObjectId,
        name:string,
        email:string,
        phoneNumber?:string,
        uuid?:string,
        roles?:string,
        authType:string
    }
}