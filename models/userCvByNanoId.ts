import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  documentIds: Types.ObjectId[]; 
}

const UserSchema: Schema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  documentIds: [{
    type: Schema.Types.ObjectId,
    ref: "CV",
  }],
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
