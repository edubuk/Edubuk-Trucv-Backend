import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";
export interface IEducationDoc extends Document {
  userId:mongoose.ObjectId;
  eduDocId:string,
  level:string,
  boardNameOrDegree:string,
  institutionName:string,
  gpa:string,
  duration:{from:string ,to:string},
  selfAttested:boolean,
  isEmailSend?:boolean,
  issuerEmailId?:string,
  verified?:boolean,
  status?:string,
  verifiedThrough?:string,
  docUri?:string,
  docHash?:string,
  orgId?:string,
  createdAt:Date,
  updatedAt:Date,   
  updateCount:Number,
}

const educationSchema:Schema<IEducationDoc> = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    eduDocId:{type:String},
    level:{type:String},
    boardNameOrDegree:{type:String},
    institutionName:{type:String},
    gpa:{type:String},
    duration:{from:{type:String},to:{type:String}},
    selfAttested:{type:Boolean},
    isEmailSend:{type:Boolean},
    issuerEmailId:{type:String},
    verified:{type:Boolean},
    docHash:{type:String},
    status:{type:String,enum:["pending","verified","rejected","selfAttested"],default:"pending"},
    verifiedThrough:{type:String},
    docUri:{type:String},
    orgId:{type:String},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
    updateCount:{type:Number,default:0}
}, { timestamps: true })

export const EducationDoc = mongoose.model("EducationDoc",educationSchema);
