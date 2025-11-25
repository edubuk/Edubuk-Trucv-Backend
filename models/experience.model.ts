import mongoose, { Schema } from "mongoose";


export interface IExperience{
    userId:mongoose.ObjectId,
    expDocId:string,
    companyName:string,
    jobRole:string,
    duration:{from:string,to:string},
    skills:string,
    description:string,
    selfAttested:boolean,
    isEmailSend?:boolean,
    issuerEmailId?:string,
    verified?:boolean,
    status?:string,
    verifiedThrough?:string,
    docUri?:string,
    docHash?:string,
    createdAt:Date,
    updatedAt:Date, 
    updateCount:Number
}

const experienceSchema:Schema<IExperience> = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    expDocId:{type:String,required:true},
    companyName:{type:String,required:true},
    jobRole:{type:String,required:true},
    duration:{from:{type:String,required:true},to:{type:String,required:true}},
    skills:{type:String,required:true},
    description:{type:String,required:true},
    selfAttested:{type:Boolean,required:true},
    isEmailSend:{type:Boolean},
    issuerEmailId:{type:String},
    verified:{type:Boolean},
    docHash:{type:String},
    status:{type:String,enum:["pending","verified","rejected","inProgress"],default:"pending"},
    verifiedThrough:{type:String},
    docUri:{type:String},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
    updateCount:{type:Number,default:0}
})

export const ExperienceDoc = mongoose.model("ExperienceDoc",experienceSchema);