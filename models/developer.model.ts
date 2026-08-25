import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IPendingImpersonation {
  candidateId: mongoose.Types.ObjectId;
  candidateEmail: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IDeveloper extends Document {
  email: string;
  password: string;
  pendingImpersonation: IPendingImpersonation | null;
  isPasswordCorrect: (password: string) => Promise<boolean>;
}

const developerSchema = new Schema<IDeveloper>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    pendingImpersonation: {
      type: new Schema<IPendingImpersonation>(
        {
          candidateId: { type: Schema.Types.ObjectId, ref: "TruCvUser", required: true },
          candidateEmail: { type: String, required: true },
          tokenHash: { type: String, required: true },
          expiresAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

developerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 10);
  }
  next();
});

developerSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const Developer = mongoose.model<IDeveloper>("Developer", developerSchema);
