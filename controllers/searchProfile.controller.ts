import { User } from '../models/user.model'
import { EducationDoc } from '../models/education.model'
import { ExperienceDoc } from '../models/experience.model'
import { SkillDoc } from '../models/skill.model'
import { SearchProfile } from '../models/searchProfiles.model'
import { Request, Response } from 'express'
import dummyProfiles from '../utils/dummyProfiles.json';
export async function syncSearchProfile(userId: string) {

  const [user, skills, experiences, educations] =
    await Promise.all([
      User.findById(userId),
      SkillDoc.find({ userId }),
      ExperienceDoc.find({ userId }),
      EducationDoc.find({ userId }),
    ]);

  await SearchProfile.findOneAndUpdate(
    { userId },
    {
      name: user?.name,
      email: user?.email,
      city: user?.address,

      skills: skills.map(
        s => s.skillName
      ),

      companies: experiences.map(
        e => e.companyName
      ),

      colleges: educations.map(
        e => e.institutionName
      ),

      profileSummary: user?.profileSummary,
      userImage: user?.userImageUrl
    },
    {
      upsert: true
    }
  );
}


export const searchProfiles = async (
  req: Request,
  res: Response
) => {
  try {
    const searchTerm =
      (req.query.serachQuery as string)?.trim() || "";

    const limit = 20;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let data;

    if (searchTerm) {
      const profiles = await SearchProfile.find(
        {
          $text: {
            $search: searchTerm,
          },
        },
        {
          score: {
            $meta: "textScore",
          },
          userId: 1,
          name: 1,
          profileSummary: 1,
          userImage: 1,
        }
      )
        .sort({
          score: {
            $meta: "textScore",
          },
        })
        .limit(10)
        .lean();

      data = {
        profiles,
      };
    } else {
      [data] = await SearchProfile.aggregate([
        {
          $facet: {
            profiles: [
              {
                $project: {
                  userId: 1,
                  name: 1,
                  profileSummary: 1,
                  userImage: 1,
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              }
            ],
            totalProfiles: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const dbProfiles = data.profiles || [];

      const mergedProfiles = [
        ...dummyProfiles.map((p) => ({
          ...p,
          isDummy: true,
        })),
        ...dbProfiles,
      ];

      const paginatedProfiles = mergedProfiles.slice(skip, skip + limit);
      data = {
        profiles: paginatedProfiles,
        totalProfiles: [
          {
            count: dummyProfiles.length + (data.totalProfiles[0]?.count || 0),
          },
        ],
      };
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
