import mongoose, { Schema } from "mongoose";


const hackathonSchema = new Schema({
    hackathonName:{type:String,required:true},
    organization: {type:String,required:true},
    emailId:String,
    startDate:String,
    endDate:String,
    status:{
      type:String,
      enum:["active","inactive","completed"],
      default:"active"
    },
    description:String,
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
})

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
