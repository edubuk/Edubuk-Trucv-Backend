import mongoose, { Schema } from "mongoose";

const certificationSchema:Schema = new Schema({
    userId:{type:Schema.ObjectId,ref:"TruCvUser"},
    certUrl:{type:String},
    txHash:{type:String},
    qrId: {
      type: String,
    },
    qrUrl: {
      type: String,
    },

});

export const Certification = mongoose.model("Certification", certificationSchema);