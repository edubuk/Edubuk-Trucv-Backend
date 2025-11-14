import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { configDotenv } from "dotenv";
import crypto from 'crypto'
configDotenv();
type Provider = {
    provider: string,
    providerId: string,
    linkedAt: Date,
    accessToken: string,
    refreshToken: string
}

export interface IUser extends Document {
    name: string,
    email: string,
    userImageUrl?: string,
    phoneNumber: string,
    address: string,
    roles: string,
    providers: Provider[],
    password?: string,
    refreshToken?: string,
    uuid: string,
    githubUrl?:string,
    linkedInUrl?:string,
    profession?:string,
    yearOfExp?:string,
    subscriptionPlan?: string,
    createdAt: Date,
    updatedAt: Date,
    lastLoginAt: Date,
    selfAttested:boolean,
    resetPasswordToken:string|undefined,
    resetPasswordExpires:Date|undefined,
    passwordChangedAt:Date,
    isPasswordCorrect: (password: string) => Promise<boolean>,
    generateAccessToken: () => string,
    generateRefreshToken: () => string,
    generateResetPasswordToken:()=>string
}

const ProviderSchema = new Schema<Provider>({
    provider: {
        type: String,
        required: true,
    },
    providerId: {
        type: String,
        required: true,
    },
    linkedAt: {
        type: Date,
        default: Date.now
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }
})

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    phoneNumber: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    roles: {
        type: String,
        enum: ["user", "admin", "hr", "university"],
        default: "user"
    },
    userImageUrl: {
        type: String,
    },
    profession:{
        type:String,
        required:true,
    },
    yearOfExp:{
        type:String,
        required:true,
    },
    selfAttested:{
        type:Boolean
    },
    resetPasswordToken: String,      // hashed token
    resetPasswordExpires: Date,      // expiry time
    passwordChangedAt: Date,
    refreshToken: {
        type: String,
    },
    linkedInUrl:{type:String},
    githubUrl:{type:String},
    providers: {
        type: [ProviderSchema],
        default: []
    },
    password: {
        type: String,
    },
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password as string, 10);
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (
) {
    const payload = {
        _id: this._id,
        name: this.name,
        email: this.email,
        phoneNumber: this.phoneNumber,
        uuid: this.uuid,
        roles: this.roles,
    };

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

    const envExpiry = process.env.ACCESS_TOKEN_EXPIRY ?? "1h";
    const expiresIn: SignOptions["expiresIn"] = /^(\d+)$/.test(envExpiry)
        ? Number(envExpiry)
        : (envExpiry as unknown as SignOptions["expiresIn"]);

    return jwt.sign(payload, secret as string, { expiresIn: expiresIn });
};


userSchema.methods.generateRefreshToken = function () {

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");

    const envExpiry = process.env.REFRESH_TOKEN_EXPIRY ?? "10d";
    const expiresIn: SignOptions["expiresIn"] = /^(\d+)$/.test(envExpiry)
        ? Number(envExpiry)
        : (envExpiry as unknown as SignOptions["expiresIn"]);

    return jwt.sign(
        {
            _id: this._id
        },
        secret as string,
        { expiresIn: expiresIn });
}

userSchema.methods.generateResetPasswordToken = function(){
    const resetToken  = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10*60*1000;
    return resetToken;
}



export const User = mongoose.model<IUser>("TruCvUser", userSchema)