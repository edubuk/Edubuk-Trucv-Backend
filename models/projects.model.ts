import mongoose, { Schema } from "mongoose";


export interface IProject{
    userId:mongoose.ObjectId,
    projectName:string,
    projectUrl?:string,
    duration:{from:string,to?:string},
    skills:string,
    description:string,
    selfAttested:boolean,
    createdAt:Date,
    updatedAt:Date,
}

const projectSchema:Schema<IProject> = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    projectName:{type:String},
    projectUrl:{type:String},
    duration:{from:{type:String},to:{type:String}},
    skills:{type:String},
    description:{type:String},
    selfAttested:{type:Boolean},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
})

export const ProjectDoc = mongoose.model("ProjectDoc",projectSchema);