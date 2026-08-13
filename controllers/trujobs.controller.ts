import { Request, Response } from "express";
import { User } from "../models/user.model";
import { CV } from "../models/cv.model";
import { UserCV } from "../models/newCv.model";
import mongoose from "mongoose";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";

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

export const checkUserHasCreatedTrucvAndOnboardedOnTrujobs = async (
  req: Request,
  res: Response,
) => {
  try {
    const typeReq = req as IGetUserAuthInfoRequest;
    const findUser = await User.findById(typeReq.user?._id).select(
      "_id name email phoneNumber yearOfExp profession userImageUrl profileSummary",
    );
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
        trujobs_onboarded_status: false,
        has_complete_trucv: false,
        message:
          "No education details found. Please create your complete TruCV.",
      });
    }

    // call trujobs server to check whether the user is onboarded or not
    let accountExist = false;
    try {
      const trujobsReq = await fetch(
        `http://localhost:8002/api/v1/trucv/check-in-trujobs/is-candidate-onboarded?email=${encodeURIComponent(
          typeReq.user?.email ?? "",
        )}&trucv_user_id=${typeReq.user?._id}`,
      );

      if (trujobsReq.ok) {
        const trujobsRes = (await trujobsReq.json()) as {
          accountExist?: boolean;
        };
        accountExist = Boolean(trujobsRes?.accountExist);
      } else {
        console.log(
          "TRUJOBS ONBOARDING CHECK FAILED WITH STATUS",
          trujobsReq.status,
        );
      }
    } catch (trujobsError) {
      console.log("ERROR CALLING TRUJOBS ONBOARDING CHECK", trujobsError);
    }

    return res.status(200).json({
      success: true,
      message: "Checked Successfull",
      trujobs_onboarded_status: accountExist,
      has_complete_trucv: true,
      accountExist,
      cvData,
    });
  } catch (error) {
    console.log(
      "ERROR IN checkUserHasCreatedTrucvAndOnboardedOnTrujobs",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "ERROR IN checkUserHasCreatedTrucvAndOnboardedOnTrujobs",
      error,
    });
  }
};
export const onBoardCandidateOnTruJobsInOneClick = async (
  req: Request,
  res: Response,
) => {
  try {
    if (
      !process.env.TRUJOBS_API_BASE_URL ||
      !process.env.JOBS_MELA_API_BASE_URL
    ) {
      return res.status(400).json({
        success: false,
        message:
          "TRUJOBS_API_BASE_URL or JOBS_MELA_API_BASE_URL is not defined in the environment",
      });
    }
    const typeReq = req as IGetUserAuthInfoRequest;

    const findUser = await User.findById(typeReq.user?._id).select(
      "_id email referred_from",
    );
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

    // call trujobs server to onboard the candidate using their TruCV data
    const trujobsReq = await fetch(
      `${process.env.TRUJOBS_API_BASE_URL}/api/v1/trucv/candidate-onboard-via-trucv`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: findUser.email,
          referred_from: findUser.referred_from,
          cvData,
        }),
      },
    );

    const trujobsRes = (await trujobsReq.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      ai_server_resume_id?: string;
      trujobs_candidate_id?: string;
    } | null;

    if (!trujobsReq.ok) {
      console.log(
        "TRUJOBS ONBOARDING FAILED WITH STATUS",
        trujobsReq.status,
        trujobsRes,
      );
      return res.status(502).json({
        success: false,
        message:
          trujobsRes?.message || "Failed to onboard candidate on TruJobs.",
      });
    }

    //  update candidate status for trujobs onboarding ;
    await User.findByIdAndUpdate(findUser._id, {
      is_onboarded_on_trujobs: true,
    });

    // For JOBS_MELA users, the ai_server_resume_id is required to fetch job matches.
    if (findUser.referred_from === "JOBS_MELA") {
      if (!trujobsRes?.ai_server_resume_id) {
        return res.status(400).json({
          success: false,
          message: "AI SERVER RESUME ID NOT RECIEVED FROM TRUJOBS",
        });
      }

      // notify JOBS_MELA of the recommended jobs and auto-apply result
      if (!process.env.JOBS_MELA_API_BASE_URL) {
        console.log("JOBS_MELA_API_BASE_URL is not defined in the environment");
        return res.status(400).json({
          success: false,
          message: "JOBS_MELA_API_BASE_URL is not defined in the environment",
        });
      }

      // the candidate's job preference drives the job-match filters below
      type JobPreference = {
        location?: string[];
        work_type?: string[];
        employment_type?: string[];
        min_score?: number;
      };
      let job_preference: JobPreference | null = null;
      // subscription plan drives how many matches we return (free -> 5, starter -> 10)
      let plan: string | null = null;

      // fetch the candidate's job preference from JOBS_MELA and store it
      const jobPreferenceUrl = `${process.env.JOBS_MELA_API_BASE_URL}/api/v1/trucv-trujobs/job-preference/${findUser.email}`;
      console.log("CALLING JOBS_MELA JOB-PREFERENCE URL ->", jobPreferenceUrl);

      const jobPreferenceReq = await fetch(jobPreferenceUrl);
      const jobPreferenceRes = (await jobPreferenceReq
        .json()
        .catch(() => null)) as {
        job_preference?: unknown;
        plan?: string;
      } | null;
      console.log(
        "RAW JOBS_MELA JOB-PREFERENCE RESPONSE ->",
        JSON.stringify(jobPreferenceRes),
      );

      // 404 => candidate has no preference set yet; skip preference sync and continue
      if (jobPreferenceReq.status === 404) {
        console.log(
          "NO JOB PREFERENCE FOUND ON JOBS_MELA, SKIPPING PREFERENCE SYNC",
        );
      } else if (!jobPreferenceReq.ok) {
        console.log(
          "JOBS_MELA JOB-PREFERENCE CALL FAILED WITH STATUS",
          jobPreferenceReq.status,
          jobPreferenceRes,
        );
        return res.status(502).json({
          success: false,
          message: "Failed to fetch job preference from JOBS_MELA.",
          jobPreferenceStatus: jobPreferenceReq.status,
          jobPreferenceRes,
        });
      } else {
        // JOBS_MELA may return { job_preference: {...} } or the preference object directly
        job_preference = (jobPreferenceRes?.job_preference ??
          jobPreferenceRes ??
          null) as JobPreference | null;
        plan = jobPreferenceRes?.plan ?? null;
        console.log("JOB PREFERENCE FETCHED FROM JOBS_MELA", job_preference);
        console.log("PLAN FROM JOBS_MELA", plan);

        // update the candidate's job preference on TruJobs
        const trujobsPreferenceUrl = `${process.env.TRUJOBS_API_BASE_URL}/api/candidate/update-candidate-preference/jobs-mela`;
        console.log(
          "CALLING TRUJOBS UPDATE-CANDIDATE-PREFERENCE URL ->",
          trujobsPreferenceUrl,
        );

        console.log("preference from jobs mela", job_preference);

        const trujobsPreferenceReq = await fetch(trujobsPreferenceUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trujobs_candidateID: trujobsRes?.trujobs_candidate_id,
            job_preference,
          }),
        });

        const trujobsPreferenceRes = await trujobsPreferenceReq
          .json()
          .catch(() => null);

        if (!trujobsPreferenceReq.ok) {
          console.log(
            "TRUJOBS UPDATE-CANDIDATE-PREFERENCE CALL FAILED WITH STATUS",
            trujobsPreferenceReq.status,
            trujobsPreferenceRes,
          );
          return res.status(502).json({
            success: false,
            message: "Failed to update candidate preference on TruJobs.",
            trujobsPreferenceStatus: trujobsPreferenceReq.status,
            trujobsPreferenceRes,
          });
        }

        console.log(
          "TRUJOBS UPDATE-CANDIDATE-PREFERENCE CALL SUCCEEDED",
          trujobsPreferenceRes,
        );
      }

      // build the job-match filters from the candidate's preference
      const filters = {
        location: job_preference?.location ?? [],
        work_type: job_preference?.work_type ?? [],
        // employment_type: job_preference?.employment_type ?? [],
        // min_score: 55,
      };
      console.log("JOB-MATCHES FILTERS ->", JSON.stringify(filters));

      const job_matches_req = await fetch(
        `${process.env.TRUJOBS_API_BASE_URL}/api/candidate/get-job-matches/jobs-mela/${trujobsRes.ai_server_resume_id}?page=1&page_size=40`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filters }),
        },
      );
      const job_matches = (await job_matches_req.json().catch(() => null)) as {
        matches?: Array<{
          job_id?: string;
          similarity_score?: number;
        }>;
      } | null;

      const matches = job_matches?.matches ?? [];

      // number of matches to return depends on plan: starter -> 10, free (default) -> 5
      const match_limit = plan === "starter" ? 10 : 5;

      // top matches ranked by similarity_score (highest first)
      const top_matches = [...matches]
        .sort(
          (a, b) =>
            (b?.similarity_score ?? -Infinity) -
            (a?.similarity_score ?? -Infinity),
        )
        .slice(0, match_limit);

      const jobsMelaUrl = `${process.env.JOBS_MELA_API_BASE_URL}/api/v1/trucv-trujobs/recommended-jobs/${findUser.email}`;
      console.log("CALLING JOBS_MELA RECOMMENDED-JOBS URL ->", jobsMelaUrl);

      const jobsMelaReq = await fetch(jobsMelaUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matches: top_matches,
        }),
      });

      const jobsMelaRes = await jobsMelaReq.json().catch(() => null);

      if (!jobsMelaReq.ok) {
        console.log(
          "JOBS_MELA RECOMMENDED-JOBS CALL FAILED WITH STATUS",
          jobsMelaReq.status,
          jobsMelaRes,
        );
        return res.status(502).json({
          success: false,
          message: "Failed to notify JOBS_MELA of recommended jobs.",
          jobsMelaStatus: jobsMelaReq.status,
          jobsMelaRes,
        });
      }

      console.log("JOBS_MELA RECOMMENDED-JOBS CALL SUCCEEDED", jobsMelaRes);

      return res.status(200).json({
        success: true,
        message: "Candidate onboarded on TruJobs successfully.",
        trujobs: trujobsRes,
        job_matches,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate onboarded on TruJobs successfully.",
      trujobs: trujobsRes,
    });
  } catch (error) {
    console.log("ERROR IN onBoardCandidateOnTruJobsInOneClick", error);
    return res.status(500).json({
      success: false,
      message: "ERROR IN onBoardCandidateOnTruJobsInOneClick",
      error,
    });
  }
};
