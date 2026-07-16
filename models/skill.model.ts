import mongoose, {Schema } from "mongoose";

export interface ISkill{
    userId:mongoose.ObjectId,
    skillName:string,
    level:string,
    selfAttested:boolean,
    endorserProfile?:string,
    endoresBy?:string,
    endoresThrough?:string,
    endoresedOn?:Date,
    createdAt:Date,
}

const skillDocs = new Schema({
    userId : {type:Schema.ObjectId,ref:"TruCvUser"},
    skillName:{type:String},
    level:{type:String,enum:["beginner","intermediate","advanced","expert"],default:"beginner"},
    selfAttested:{type:Boolean,default:false,required:true},
    endorserProfile:{type:String},
    endoresBy:{type:String},
    endoresThrough:{type:String},
    endoresedOn:{type:Date},
    createdAt:{type:Date,default:new Date()},
    updatedAt:{type:Date,default:new Date()},
})

export const SkillDoc =  mongoose.model("Skill",skillDocs);