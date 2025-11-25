import mongoose, { Schema } from "mongoose";

const SkillVerificationRequestSchema = new Schema({
    userId : {type:Schema.ObjectId,ref:"TruCvUser"},
    token:{type:String,required:true},
    skills:[{
        skillName:{type:String,required:true},
        level:{type:String,enum:["beginner","intermediate","advanced","expert"],default:"beginner"},
    }],
    endoresBy:{type:String},
    createdAt:{type:Date,default:new Date()},
    tokenUsed:{type:Boolean,default:false},
}, { timestamps: true });


export const SkillVerificationReq = mongoose.model("SkillVerificationRequest",SkillVerificationRequestSchema)