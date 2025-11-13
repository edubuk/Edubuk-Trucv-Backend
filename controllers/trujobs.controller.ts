import { Request, Response } from "express";
import { User } from "../models/user.model";
import { CV } from "../models/cv.model";

export const trujobsSignInAuthenticator = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await findUser.isPasswordCorrect(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // const cvIds = await CV.find({ userId: findUser._id }).select("nanoId");
    const user_trucvs = await CV.find({ userId: findUser._id }).select(
      "personalDetails experience skills profile_summary nanoId"
    );

    const cvIds = user_trucvs.map((cv) => cv.nanoId);
    if (!cvIds) {
      return res.status(403).json({
        success: false,
        message: "CV not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "USER AUTHENTICATED",
      trucv_user: findUser,
      user_trucvs,
      cvIds,
    });
  } catch (error) {
    console.log("ERROR IN trujobsSignInAuthenticator", error);
    return res.status(500).json({
      success: false,
      message: "ERROR IN trujobsSignInAuthenticator",
      error,
    });
  }
};

export const getCandidateTruCVsByUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const userExists = await User.findOne({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user_trucvs = await CV.find({ userId }).select("nanoId createdAt");

    if (!user_trucvs) {
      return res.status(404).json({
        success: false,
        message: "No CVs found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "USER CVs FETCHED",
      trucvs: user_trucvs,
    });
  } catch (error) {
    console.log("ERROR IN getCandidateTruCVsByUserId", error);
    return res.status(500).json({
      success: false,
      message: "ERROR IN getCandidateTruCVsByUserId",
      error,
    });
  }
};
export const getCandidateTruCVByTrucvId = async (
  req: Request,
  res: Response
) => {
  try {
    const { trucvId } = req.params;
    if (!trucvId) {
      return res.status(400).json({
        success: false,
        message: "TruCV ID is required",
      });
    }

    const truCV = await CV.findOne({ nanoId: trucvId });
    if (!truCV) {
      return res.status(404).json({
        success: false,
        message: "TruCV not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "USER CV FETCHED",
      trucv: truCV,
    });
  } catch (error) {
    console.log("ERROR IN getCandidateTruCVByTrucvId", error);
    return res.status(500).json({
      success: false,
      message: "ERROR IN getCandidateTruCVByTrucvId",
      error,
    });
  }
};
