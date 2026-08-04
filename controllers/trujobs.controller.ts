import { Request, Response } from "express";
import { User } from "../models/user.model";
import { CV } from "../models/cv.model";
import { UserCV } from "../models/newCv.model";
import mongoose from "mongoose";

export const trujobsSignInAuthenticator = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const findUser = await User.findOne({ email: email }).select(
      "_id name email phoneNumber yearOfExp profession userImageUrl profileSummary password",
    ); // password because bcrypt requires password for comparison
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
    const user_trucvs = await UserCV.find({ userId: findUser._id });

    if (!user_trucvs) {
      return res.status(403).json({
        success: false,
        message: "CV not found",
      });
    }
    const cvIds = user_trucvs.map((cv) => ({
      id: cv._id,
      title: cv.title,
    }));

    const { password: _, ...userWithoutPassword } = findUser.toObject();

    return res.status(200).json({
      success: true,
      message: "USER AUTHENTICATED",
      cvIds,
      trucv_user: userWithoutPassword,
      user_trucvs,
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
//--------------------------------------- --------------------
export const trujobsSignInAuthenticatorNew = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const findUser = await User.findOne({ email: email }).select(
      "_id name email phoneNumber yearOfExp profession userImageUrl profileSummary password",
    ); // password because bcrypt requires password for comparison
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

    const [cvData] = await User.aggregate([
      {
        $match: {
          _id: findUser._id,
        },
      },
      {
        $lookup: {
          from: "educationdocs",
          localField: "_id",
          foreignField: "userId",
          as: "educations",
        },
      },
      {
        $lookup: {
          from: "experiencedocs",
          localField: "_id",
          foreignField: "userId",
          as: "experiences",
        },
      },
      {
        $lookup: {
          from: "projectdocs",
          localField: "_id",
          foreignField: "userId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "userId",
          as: "skills",
        },
      },
      {
        $lookup: {
          from: "awarddocs",
          localField: "_id",
          foreignField: "userId",
          as: "awards",
        },
      },
      {
        $project: {
          personal: {
            _id: "$_id",
            fullName: "$name",
            email: "$email",
            phoneNumber: "$phoneNumber",
            city: "$address",
            profession: "$profession",
            yearOfExp: "$yearOfExp",
            linkedInUrl: "$linkedInUrl",
            githubUrl: "$githubUrl",
            imgUrl: "$userImageUrl",
            summary: "$profileSummary",
          },
          educations: 1,
          experiences: 1,
          projects: 1,
          skills: 1,
          awards: 1,
        },
      },
    ]);
    if (cvData.educations.length === 0 || !cvData.educations) {
      return res.status(404).json({
        success: false,
        message:
          "No education details found. Please create your complete TruCV.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "USER AUTHENTICATED",
      cvData,
      // cvIds,
      // trucv_user: userWithoutPassword,
      // user_trucvs,
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

export const trujobsSignInAuthenticatorForAutomation = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email are required",
      });
    }

    const findUser = await User.findOne({ email: email }).select(
      "_id name email phoneNumber yearOfExp profession userImageUrl profileSummary password",
    ); // password because bcrypt requires password for comparison
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [cvData] = await User.aggregate([
      {
        $match: {
          _id: findUser._id,
        },
      },
      {
        $lookup: {
          from: "educationdocs",
          localField: "_id",
          foreignField: "userId",
          as: "educations",
        },
      },
      {
        $lookup: {
          from: "experiencedocs",
          localField: "_id",
          foreignField: "userId",
          as: "experiences",
        },
      },
      {
        $lookup: {
          from: "projectdocs",
          localField: "_id",
          foreignField: "userId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "userId",
          as: "skills",
        },
      },
      {
        $lookup: {
          from: "awarddocs",
          localField: "_id",
          foreignField: "userId",
          as: "awards",
        },
      },
      {
        $project: {
          personal: {
            _id: "$_id",
            fullName: "$name",
            email: "$email",
            phoneNumber: "$phoneNumber",
            city: "$address",
            profession: "$profession",
            yearOfExp: "$yearOfExp",
            linkedInUrl: "$linkedInUrl",
            githubUrl: "$githubUrl",
            imgUrl: "$userImageUrl",
            summary: "$profileSummary",
          },
          educations: 1,
          experiences: 1,
          projects: 1,
          skills: 1,
          awards: 1,
        },
      },
    ]);

    if (cvData.educations.length === 0 || !cvData.educations) {
      return res.status(404).json({
        success: false,
        message:
          "No education details found. Please create your complete TruCV.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "USER AUTHENTICATED",
      cvData,
      // cvIds,
      // trucv_user: userWithoutPassword,
      // user_trucvs,
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
//--------------------------------------- --------------------

export const getCandidateTruCVByTrucvId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { trucvId } = req.params;
    if (!trucvId) {
      return res.status(400).json({
        success: false,
        message: "TruCV ID is required",
      });
    }

    const truCV = await UserCV.findById(trucvId);
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

//
export const getCandidateTruCVByUserId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [cvData] = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "educationdocs",
          localField: "_id",
          foreignField: "userId",
          as: "educations",
        },
      },
      {
        $lookup: {
          from: "experiencedocs",
          localField: "_id",
          foreignField: "userId",
          as: "experiences",
        },
      },
      {
        $lookup: {
          from: "projectdocs",
          localField: "_id",
          foreignField: "userId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "userId",
          as: "skills",
        },
      },
      {
        $lookup: {
          from: "awarddocs",
          localField: "_id",
          foreignField: "userId",
          as: "awards",
        },
      },
      {
        $project: {
          personal: {
            _id: "$_id",
            fullName: "$name",
            email: "$email",
            phoneNumber: "$phoneNumber",
            city: "$address",
            profession: "$profession",
            yearOfExp: "$yearOfExp",
            linkedInUrl: "$linkedInUrl",
            githubUrl: "$githubUrl",
            imgUrl: "$userImageUrl",
            summary: "$profileSummary",
          },
          educations: 1,
          experiences: 1,
          projects: 1,
          skills: 1,
          awards: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ success: true, message: "USER TRUCV FETCHED", trucv: cvData });
  } catch (error) {
    console.log("ERROR IN getCandidateTruCVByUserId", error);
    return res.status(500).json({
      success: false,
      message: "ERROR IN getCandidateTruCVByUserId",
      error,
    });
  }
};

export const fetchUserCV = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //console.log("userId",userId);
    const [cvData] = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "educationdocs",
          localField: "_id",
          foreignField: "userId",
          as: "educations",
        },
      },
      {
        $lookup: {
          from: "experiencedocs",
          localField: "_id",
          foreignField: "userId",
          as: "experiences",
        },
      },
      {
        $lookup: {
          from: "projectdocs",
          localField: "_id",
          foreignField: "userId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "userId",
          as: "skills",
        },
      },
      {
        $lookup: {
          from: "awarddocs",
          localField: "_id",
          foreignField: "userId",
          as: "awards",
        },
      },
      {
        $project: {
          personal: {
            _id: "$_id",
            fullName: "$name",
            email: "$email",
            phoneNumber: "$phoneNumber",
            city: "$address",
            profession: "$profession",
            yearOfExp: "$yearOfExp",
            linkedInUrl: "$linkedInUrl",
            githubUrl: "$githubUrl",
            imgUrl: "$userImageUrl",
            summary: "$profileSummary",
          },
          educations: 1,
          experiences: 1,
          projects: 1,
          skills: 1,
          awards: 1,
        },
      },
    ]);
    if (cvData.educations.length === 0 || !cvData.educations) {
      return res.status(404).json({
        success: false,
        message: "No education details found. Please create your complete CV.",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "USER CV FETCHED", trucv: cvData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
