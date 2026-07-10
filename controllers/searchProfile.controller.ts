import { User } from '../models/user.model'
import { EducationDoc } from '../models/education.model'
import { ExperienceDoc } from '../models/experience.model'
import { SkillDoc } from '../models/skill.model'
import { SearchProfile } from '../models/searchProfiles.model'
import { Request, Response } from 'express'
import dummyProfiles from '../utils/dummyProfiles.json';
import { ProjectDoc } from '../models/projects.model'

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
      isCvDataPresent: experiences.length > 0 || educations.length > 0,
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
    let profiles: any[] = [];
    let data;

    if (searchTerm) {
      profiles = await SearchProfile.find(
        {
          isCvDataPresent:true,
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
        .lean()

      data = {
        profiles,
        executionStats: profiles
      };
    } else {
      // it handles pagination with dummy profiles--- do not change it without discussion
      const dummyCount = dummyProfiles.length;
      if(skip < dummyCount) {
        const dummyPart = dummyProfiles.slice(skip,skip+limit).map((p)=>({...p,isDummy:true}));
        const remainingSlots = limit - dummyPart.length;
        let dbPart: any[] = [];
        if(remainingSlots>0)
        {
          [data] = await SearchProfile.aggregate([
            {
              $match:{
                isCvDataPresent: true
              }

            },
            {
              $facet:{
                profiles:[
                 
                  {
                    $sort:{
                      createdAt:-1
                    }
                  },
                  {
                    $limit:remainingSlots
                  },
                  {
                    $project: {
                      userId: 1,
                      name: 1,
                      profileSummary: 1,
                      userImage: 1,
                      createdAt: 1,
                    },
                  },
                  
                ],
                totalProfiles: [
                  {
                    $count: "count",
                  },
                ],
              }
            }
          ])
          profiles = [...dummyPart, ...data.profiles];
        }
      }
      else{
          const dbSkip = skip - dummyCount;
          [data] = await SearchProfile.aggregate([
            {
              $match:{
                isCvDataPresent: true
              }
            },
            {
              $facet:{
                profiles:[
                  {
                    $sort:{
                      createdAt:-1
                    }
                  },
                  {
                    $skip:dbSkip
                  },
                  {
                    $limit:limit
                  },
                  {
                    $project: {
                      userId: 1,
                      name: 1,
                      profileSummary: 1,
                      userImage: 1,
                      createdAt: 1,
                    },
                  },
                  
                ],
                totalProfiles: [
                  {
                    $count: "count",
                  },
                ],
              }
            }
          ])
          profiles =  data.profiles;
        }

      data = {
        profiles: profiles,
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
