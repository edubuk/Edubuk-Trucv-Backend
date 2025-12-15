import mongoose,{Schema,Document} from "mongoose";

export interface IOtp extends Document{
    email:string,
    otpHash:string,
    expiresAt:Date,
    used:boolean,
    createdAt:Date,
    updatedAt:Date
}

const OTPSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otpHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    used:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:()=>new Date(),
    }
},{timestamps:true})

// Index for automatic deletion of expired OTPs
OTPSchema.index({expiresAt:1},{expireAfterSeconds:0})

export const Otp = mongoose.model<IOtp>("Otp",OTPSchema)