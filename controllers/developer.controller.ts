import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Developer } from "../models/developer.model";
import { User } from "../models/user.model";
import { IGetDeveloperAuthInfoRequest } from "../types/definitionFile";
import { generateAccessRefreshToken } from "./user.controller";
import { sendDeveloperDebugConfirmationEmail } from "../utils/emailHandler";

const isProd = process.env.NODE_ENV === "production";
const DEBUG_CONFIRMATION_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const developerSignIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const developer = await Developer.findOne({ email: email.toLowerCase().trim() });
    if (!developer) {
      return res.status(404).json({ success: false, message: "Developer not found" });
    }

    const isMatch = await developer.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: developer._id }, process.env.DEVELOPER_JWT_SECRET as string, { expiresIn: "7d" });

    res
      .status(200)
      .cookie("developer_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, message: "Signed in successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message || error });
  }
};

export const checkValidDeveloperUser = (req: Request, res: Response) => {
  const typeReq = req as IGetDeveloperAuthInfoRequest;
  return res.status(200).json({ success: !!typeReq.developerId });
};

export const getCurrentDeveloper = (req: Request, res: Response) => {
  const typeReq = req as IGetDeveloperAuthInfoRequest;
  return res.status(200).json({ success: true, developer: { email: typeReq.developer.email } });
};

export const logoutDeveloper = (_req: Request, res: Response) => {
  res
    .status(200)
    .clearCookie("developer_token", { httpOnly: true, secure: isProd, sameSite: "lax" })
    .json({ success: true, message: "Logged out successfully" });
};

export const requestDebugSession = async (req: Request, res: Response) => {
  try {
    const { candidateEmail, developerEmail } = req.body;
    if (!candidateEmail || !developerEmail) {
      return res.status(400).json({ success: false, message: "Both emails are required" });
    }

    const typeReq = req as IGetDeveloperAuthInfoRequest;
    const developer = typeReq.developer;

    if (developerEmail.trim().toLowerCase() !== developer.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: "Email doesn't match your account" });
    }

    const candidate = await User.findOne({ email: candidateEmail.trim().toLowerCase() });
    if (!candidate) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }

    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const hashedConfirmationToken = crypto.createHash("sha256").update(confirmationToken).digest("hex");

    await Developer.findByIdAndUpdate(developer._id, {
      pendingImpersonation: {
        candidateId: candidate._id,
        candidateEmail: candidate.email,
        tokenHash: hashedConfirmationToken,
        expiresAt: new Date(Date.now() + DEBUG_CONFIRMATION_WINDOW_MS),
      },
    });

    const confirmUrl = `${process.env.FRONTEND_BASE_URL}/developer/debug/confirm?token=${confirmationToken}`;
    await sendDeveloperDebugConfirmationEmail({
      developerEmail: developer.email,
      candidateEmail: candidate.email,
      confirmUrl,
    });

    return res.status(200).json({ success: true, message: "Confirmation email sent!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message || error });
  }
};

export const confirmDebugSession = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Missing confirmation link" });
    }

    const typeReq = req as IGetDeveloperAuthInfoRequest;
    const developer = typeReq.developer;
    const pending = developer.pendingImpersonation;

    if (!pending) {
      return res.status(400).json({ success: false, message: "No debug session pending" });
    }

    if (pending.expiresAt < new Date()) {
      await Developer.findByIdAndUpdate(developer._id, { pendingImpersonation: null });
      return res.status(400).json({ success: false, message: "Link expired, request again" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    if (hashedToken !== pending.tokenHash) {
      return res.status(400).json({ success: false, message: "Invalid confirmation link" });
    }

    const candidate = await User.findById(pending.candidateId);
    if (!candidate) {
      await Developer.findByIdAndUpdate(developer._id, { pendingImpersonation: null });
      return res.status(404).json({ success: false, message: "Candidate no longer exists" });
    }

    // single-use: clear before minting the session
    await Developer.findByIdAndUpdate(developer._id, { pendingImpersonation: null });

    const { accessToken, refreshToken } = await generateAccessRefreshToken(candidate._id as string);

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: isProd, sameSite: "lax" })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "lax" })
      .cookie("debugSession", "1", { httpOnly: false, secure: isProd, sameSite: "lax" })
      .json({ success: true, message: "Debug session started", candidate: { email: candidate.email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message || error });
  }
};
