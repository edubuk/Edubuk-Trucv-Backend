import mongoose, {Schema } from "mongoose";

interface IAward{
    userId:mongoose.ObjectId,
    level:string,
    name:string,
    organisation:string,
    duration:{
        from:string,
        to?:string
    },
    description:string,
    selfAttested:boolean,
    isEmailSend?:boolean,
    issuerEmailId?:string,
    docUri?:string,
    verified?:boolean,
    status?:string,
    docHash?:string,
    verifiedThrough?:string,
    createdAt:Date,
    updatedAt:Date,
    updateCount:Number,
}

const awardSchema:Schema<IAward> = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    level:{
        type:String,
        enum:["Award","Certificate","Course"],
        required:true
    },
    name:{type:String,required:true},
    organisation:{type:String,required:true},
    duration:{
        from:{type:String,required:true},
        to:{type:String}
    },
    description:{type:String,required:true},
    selfAttested:{type:Boolean,required:true},
    isEmailSend:{type:Boolean},
    issuerEmailId:{type:String},
    docUri:{type:String},
    verified:{type:Boolean,required:true},
    status:{type:String,required:true},
    docHash:{type:String},
    verifiedThrough:{type:String},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
    updateCount:{type:Number,default:0}
})

export const AwardDocs = mongoose.model("AwardDocs",awardSchema);