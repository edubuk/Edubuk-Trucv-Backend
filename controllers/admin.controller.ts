import { Request, Response } from "express";
import { User } from "../models/user.model";
import Subscription from "../models/subscription.model";
import { UserCV } from "../models/newCv.model";
import { DocVerificationRequest } from "../models/docVerificationRequest.model";
import { userDocVerificationEmailHandler } from "../utils/emailHandler";
import { SearchProfile } from "../models/searchProfiles.model";
import { TrackingLink } from "../models/admins/TrackingLink.model";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
export const getUsers = async (req: Request, res: Response) => {
  try {
    //query-> page,limit
    // compute skip & limit
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const email = req.query.email as string;

    if (email) {
      const user = await User.findOne({ email: email }).select(
        "-providers -password -refreshToken",
      );
      console.log({ user });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: [user],
      });
    }

    const users = await User.find()
      .select("-providers -password -refreshToken")
      .skip(skip)
      .limit(limit);
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const total = await User.countDocuments();
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message || error,
    });
  }
};

export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const { subscriptionPlan } = req.body;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    const updateSubscription = await Subscription.findOneAndUpdate(
      { userId: userId },
      {
        $set: { subscriptionPlan: subscriptionPlan, endDate: endDate },
        $setOnInsert: { userId: userId },
      },
      { upsert: true, new: true },
    );
    if (updateSubscription) {
      return res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
      });
    }
  } catch (error) {
    console.log("ERROR:ADMIN_CONTROLLER", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error, success: false });
  }
};

export const allUserCvs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const cvs = await UserCV.find().select("_id").skip(offset).limit(limit);
    const totalCV = await UserCV.countDocuments();
    return res.status(200).json({
      success: true,
      data: cvs,
      totalPage: Math.ceil(totalCV / limit),
      totalCVs: totalCV,
    });
  } catch (error) {
    console.log("ERROR:ADMIN_CONTROLLER", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error, success: false });
  }
};

export const getReqDocForDigiLocker = async (req: Request, res: Response) => {
  try {
    const docHash =
      "5de0e71f3766b54139668853b1c253dcdec61eef1f00fa24ba1ab112081148c0";
    const docRequests = await DocVerificationRequest.find({
      docHash,
      tokenUsed: false,
    });
    return res.status(200).json({
      success: true,
      data: docRequests,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message || error,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { v4: uuidv4 } = await import("uuid");
    const isUser = await User.findOne({ email: data?.email });
    // console.log("email is", data);
    if (isUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        email: data?.email,
        isUser,
      });
    }
    const user = new User({
      email: data.email,
      name: data.name,
      password: data.password,
      phoneNumber: data.phoneNumber,
      address: data.address,
      uuid: uuidv4(),
    });
    await user.save();
    await Subscription.create({
      userId: user._id,
      subscriptionPlan: "pro",
      paymentId: "NA",
      couponCode: "",
      orderId: "NA",
      endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months from now
    });
    await SearchProfile.create({
      userId: user._id,
      name: data.name,
      email: data.email,
      city: data.address,
    });

    res.status(200).json({
      success: true,
      message: "your are registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const sendRequestToLoginAndUploadDocs = async (
  req: Request,
  res: Response,
) => {
  try {
    const { data } = req.body;
    console.log("data", data);
    const status = await userDocVerificationEmailHandler(
      data?.emailId,
      data?.password,
    );
    return res.status(200).json({
      success: true,
      status,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message || error,
    });
  }
};
export const createPartnerTrackingLink = async (req: Request, res: Response) => {
  try {
    const { partnerName, campaignTag } = req.body
    const adminId = (req as any).user?._id
    if (!adminId) {
      return res.status(400).json({ success: false, message: "No admin Id provided" })
    }
    if (!partnerName) {
      return res.status(400).json({ success: false, message: "partnerName is required" })
    }
    if (!/^[A-Z0-9_\-]+$/i.test(partnerName)) {
      return res.status(400).json({
        success: false,
        message: "partnerName may only contain letters, numbers, underscores, or hyphens",
      })
    }

    // ── Check if partnerName already exists ───────────────────────────────────
    const existing = await TrackingLink.findOne({
      partnerName: partnerName.toUpperCase(),
    })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Partner "${partnerName.toUpperCase()}" already has a tracking link. Try a different name.`,
      })
    }

    const payload: Record<string, unknown> = {
      partner: partnerName.toUpperCase(),
      ...(campaignTag && { campaign: campaignTag }),
    }

    const token = jwt.sign(payload, process.env.PARTNER_REFERRAL_SECRET!)
    const url = `${process.env.FRONTEND_BASE_URL}/register/${partnerName}?ref=${token}`

    const link = await TrackingLink.create({
      partnerName: partnerName.toUpperCase(),
      campaignTag: campaignTag || null,
      token,
      url,
      createdBy: adminId,
    })

    return res.status(201).json({ success: true, data: link })
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate token — try again" })
    }
    return res.status(500).json({ success: false, message: "Failed to create link", error: err.message || err })
  }
}

// export const getAllPartnerTrackingLinks =async (req: Request, res: Response) => {
//   try {
//     const links = await TrackingLink.find().sort({ createdAt: -1 })
//     return res.json({ success: true, data: links })
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Failed to fetch links' })
//   }
// }
export const getAllPartnerTrackingLinks = async (req: Request, res: Response) => {
  try {

    const links = await TrackingLink.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: User.collection.name,  // dynamically picks the correct collection name
          let: { partnerName: "$partnerName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toUpper: "$referred_from" },
                    "$$partnerName"
                  ]
                }
              }
            }
          ],
          as: "referredUsers",
        },
      },
      {
        $addFields: {
          total_users: { $size: "$referredUsers" },
        },
      },
      {
        $project: { referredUsers: 0 },
      },
    ])

    return res.json({ success: true, data: links })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch links",
      error: err.message || err,
    })
  }
}

export const deletePartnerTrackingLink = async(req: Request, res: Response) => {
  try {
    if(!req.params.id){
      return res.status(400).json({
        success: false,
        message: "No link ID provided",
      })
    }

    const deleted = await TrackingLink.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Link not found' })
    }
    res.json({ success: true, message: 'Link deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete link' })
  }
}