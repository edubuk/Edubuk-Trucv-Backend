import { Schema,Types,model } from "mongoose";

interface ICertificate{
    userId:Types.ObjectId;
    docType:"Education"|"Experience"|"Skills"|"Awards"|"Courses"|"Projects";
    title:string;
    organisation:string;
    docUrl:string;
    meta?:Record<string, any>;
    verified?:boolean;
    status?:string;
    verifiedBy?:string;
    verifiedThrough?:string;
    verifiedAt?:Date;
}

const certificateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "TruCvUser", required: true, index: true },
  docType: { type: String, required: true, index: true },
  title: { type: String },
  organisation: { type: String },
  docUrl: { type: String },
  meta: { type: Schema.Types.Mixed, default: {} },
  verified: { type: Boolean, default: false, index: true },
  status:{type:String,enum:["pending","verified","rejected"],default:"pending"},
  verifiedBy: String,
  verifiedThrough: String,
  verifiedAt: Date,
}, { timestamps: true });

export const Certificate = model("Certificate", certificateSchema);

