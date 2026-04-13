import mongoose, { Schema } from "mongoose";


const hackathonSchema = new Schema({
    hackathonName: String,
    organization: String,
    emailId:String,
    status:{
      type:String,
      enum:["active","inactive","completed"],
      default:"active"
    },
    createdAt: Date,
    updatedAt: Date,
})

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
