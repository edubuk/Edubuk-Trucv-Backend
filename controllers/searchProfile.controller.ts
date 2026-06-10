import {User}from '../models/user.model'
import {EducationDoc} from '../models/education.model'
import {ExperienceDoc} from '../models/experience.model'
import {SkillDoc} from '../models/skill.model'
import {SearchProfile} from '../models/searchProfiles.model'
import {Request, Response} from 'express'

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


export const searchProfiles = async (req:Request,res:Response)=>{
    try {
        const searchTerm = (req.query.serachQuery as string)?.trim() || '';
        const limit = 20;
        const page = Number(req.query.page)||1;
        const skip = (page-1)*limit;
        let data;
        if(searchTerm)
        {
            [data] = await SearchProfile.aggregate([
                {
                    $search:{
                        index:'searchProfiles',
                        text:{
                            query:searchTerm,
                            path:{
                                wildcard:'*'
                            },
                            fuzzy:{
                                maxEdits:2
                            }
                        }
                    }
                },
                {
                    $project:{
                            userId:1,
                            name:1,
                            profileSummary:1,
                            userImage:1,
                            score:{$meta:'searchScore'}
                    }
                },
                {
                    $sort:{
                        score:-1
                    }
                },
                {
                    $limit:10
                },
                {
                    $group: {
                        _id: null,
                        profiles: {
                            $push: "$$ROOT",
                        },
                    }
                },
                {
                    $project: {
                    _id: 0,
                    profiles: 1,
                    },
                }
            ])
        }else{
            [data] = await SearchProfile.aggregate([
                {
                    $facet:{
                        profiles:[
                        {
                            $project:{
                                userId:1,
                                name:1,
                                profileSummary:1,
                                userImage:1
                            }
                        },
                        {
                            $sort:{
                                createdAt:-1
                            }
                        },
                        {
                            $skip:skip
                        },
                        {
                            $limit:limit
                        },
                ],
                totalProfiles:[
                    {
                        $count:'count'
                    }
                ]
            }
            }])

        }
        
        return res.status(200).json({
            success:true,
            data
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}
