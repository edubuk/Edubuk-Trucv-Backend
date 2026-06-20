import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  userId:Types.ObjectId;
  subscriptionPlan: "free" | "half_yearly" | "yearly";
  status: "active" | "expired" | "cancelled";
  pointsGranted:number;
  paymentId: string;
  couponCode: string;
  orderId:string;
  startDate:Date;
  endDate:Date;
  renewsAt:Date;
  cancelledAt:Date;
  createdAt:Date;
  updatedAt:Date;
}

const UserSchema: Schema = new Schema<IUser>({
  userId: {
    type: Schema.Types.ObjectId,
    ref:"TruCvUser",
    required: true,
  },
  subscriptionPlan: {
    type: String,
    enum: ["free","half_yearly","yearly"],
    default: "free",
  },
  status: {
    type: String,
    enum: ["active","expired","cancelled"],
    default: "expired",
  },
  pointsGranted:{
    type:Number,
    default:0,
  },
  orderId:{
    type:String,
    required:true,
  },
  paymentId: {
    type: String,
  },
  couponCode: {
    type: String,
    default: "N/A",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,         
  },
  renewsAt: {
    type: Date,            
  },
  cancelledAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date
  }
});

const Subscription = mongoose.model<IUser>("Subscription", UserSchema);
export default Subscription;
