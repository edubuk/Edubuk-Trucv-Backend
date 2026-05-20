import { Request, Response } from "express";
import { EducationDoc } from "../models/education.model";
import { ExperienceDoc } from "../models/experience.model";
import { AwardDocs } from "../models/award.model";
import mongoose from "mongoose";
// GET /api/users/:userId/verification-status

interface VerificationStatusResponse {
  overallStats: {
    totalVerified: number;
    totalDocuments: number;
    percentage: number;
  };
  categories: {
    education: CategoryStats;
    experience: CategoryStats;
    awards: CategoryStats;
  };
  lastUpdated: string;
}

interface CategoryStats {
  verified: number;
  total: number;
  percentage: number;
  pending: number;
  rejected: number;
  selfAttested: number;
}

// controllers/verificationController.ts

export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Parallel aggregation queries for all document types
    const [educationStats, experienceStats, awardsStats] = await Promise.all([
      getVerificationStats(userId, EducationDoc),
      getVerificationStats(userId, ExperienceDoc),
      getVerificationStats(userId, AwardDocs),
    ]);

    const overallStats = calculateOverallStats([
      educationStats,
      experienceStats,
      awardsStats,
    ]);

    const response: VerificationStatusResponse = {
      overallStats,
      categories: {
        education: educationStats,
        experience: experienceStats,
        awards: awardsStats,
      },
      lastUpdated: new Date().toISOString(),
    };

    res.json({success:true,data:response});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
};

// Helper function for education stats
const getVerificationStats = async (userId: string, collection: any): Promise<CategoryStats> => {
  const stats = await collection.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: {
          $sum: {
            $cond: [{ $eq: ["$status", "verified"] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
          },
        },
        selfAttested: {
          $sum: {
            $cond: [{ $eq: ["$status", "selfAttested"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return { verified: 0, total: 0, percentage: 0, pending: 0, rejected: 0, selfAttested: 0 };
  }

  const { total, verified, pending, rejected, selfAttested } = stats[0];
  const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

  return { verified, total, percentage, pending, rejected, selfAttested };
};


const calculateOverallStats = (categories: CategoryStats[]) => {
  const totalVerified = categories.reduce((sum, cat) => sum + cat.verified, 0);
  const totalDocuments = categories.reduce((sum, cat) => sum + cat.total, 0);
  const percentage = totalDocuments > 0 
    ? Math.round((totalVerified / totalDocuments) * 100) 
    : 0;

  return { totalVerified, totalDocuments, percentage };
};