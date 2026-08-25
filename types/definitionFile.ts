import { Request } from "express";
import { Types } from "mongoose";
import { IDeveloper } from "../models/developer.model";

export interface IGetUserAuthInfoRequest extends Request{
    user:{
        _id:Types.ObjectId,
        name:string,
        email:string,
        phoneNumber?:string,
        uuid?:string,
        roles?:string,
        authType:string,
        iat?:number,
        exp?:number
    }
}

export interface IGetDeveloperAuthInfoRequest extends Request{
    developerId: string;
    developer: IDeveloper;
}