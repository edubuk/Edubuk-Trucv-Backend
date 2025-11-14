import mongoose, { Schema } from "mongoose";

export interface IEducationDoc extends Document {
  userId:mongoose.ObjectId;
  eduDocId:string,
  level:string,
  boardNameOrDegree:string,
  institutionName:string,
  gpa:string,
  duration:{from:string,to:string},
  selfAttested:boolean,
  isEmailSend?:boolean,
  issuerEmailId?:string,
  verified?:boolean,
  status?:string,
  verifiedThrough?:string,
  docUri?:string,
  createdAt:Date,
  updatedAt:Date,
}

const educationSchema:Schema<IEducationDoc> = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    eduDocId:{type:String,required:true},
    level:{type:String,required:true},
    boardNameOrDegree:{type:String},
    institutionName:{type:String,required:true},
    gpa:{type:String,required:true},
    duration:{from:{type:String,required:true},to:{type:String,required:true}},
    selfAttested:{type:Boolean,required:true},
    isEmailSend:{type:Boolean},
    issuerEmailId:{type:String},
    verified:{type:Boolean},
    status:{type:String,enum:["pending","verified","rejected","inProgress"],default:"pending"},
    verifiedThrough:{type:String},
    docUri:{type:String},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
}, { timestamps: true })

export const EducationDoc = mongoose.model("EducationDoc",educationSchema);