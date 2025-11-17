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
    projectName:{type:String,required:true},
    projectUrl:{type:String},
    duration:{from:{type:String,required:true},to:{type:String}},
    skills:{type:String,required:true},
    description:{type:String,required:true},
    selfAttested:{type:Boolean,required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
})

export const ProjectDoc = mongoose.model("ProjectDoc",projectSchema);