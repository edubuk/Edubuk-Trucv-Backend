import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  userId:Types.ObjectId;
  subscriptionPlan: "free" | "basic" | "pro";
  paymentId: string;
  couponCode: string;
  orderId:string;
  endDate:Date;
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
    enum: ["free","basic","pro"],
    default: "free",
  },
  orderId:{
    type:String,
    required:true,
  },
  paymentId: {
    type: String,
  },
  endDate:{
    type:Date,
  },
  couponCode: {
    type: String,
    default: "N/A",
  },
  updatedAt:{
    type:Date,
    default:Date.now
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
});

const Subscription = mongoose.model<IUser>("Subscription", UserSchema);
export default Subscription;
