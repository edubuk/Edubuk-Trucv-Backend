import {Request,Response} from 'express';
import { UserCV } from "../models/newCv.model";


export const searchCVsByFilter = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, city, college, company, skill } = req.query;

    const orConditions: Record<string, any>[] = [];

    if (typeof name === "string" && name.trim()) {
      orConditions.push({
        "personal.fullName": {
          $regex: "^" + name.trim(),
          $options: "i",
        },
      });
    }

    if (typeof city === "string" && city.trim()) {
      orConditions.push({
        "personal.city": {
          $regex: city.trim(),
          $options: "i",
        },
      });
    }

    if (typeof college === "string" && college.trim()) {
      orConditions.push({
        "educations.institutionName": {
          $regex: college.trim(),
          $options: "i",
        },
      });
    }

    if (typeof company === "string" && company.trim()) {
      orConditions.push({
        "experiences.companyName": {
          $regex: company.trim(),
          $options: "i",
        },
      });
    }

    if (typeof skill === "string" && skill.trim()) {
      orConditions.push({
        "skills.skillName": {
          $regex: skill.trim(),
          $options: "i",
        },
      });
    }

    const query =
      orConditions.length > 0
        ? { $or: orConditions }
        : {};

    const users = await UserCV.find(query)
      .select({
        userId: 1,
        "personal.fullName": 1,
        "personal.summary": 1,
        "personal.imgUrl": 1,
      })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || error,
    });
  }
};