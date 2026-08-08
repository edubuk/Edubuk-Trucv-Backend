// controllers/pipeline.controller.ts
import { Request, Response } from "express";
import { User } from "../models/user.model";
import Subscription from "../models/subscription.model";
import { EducationDoc } from "../models/education.model";
import { ExperienceDoc } from "../models/experience.model";
import { ProjectDoc } from "../models/projects.model";
import { AwardDocs } from "../models/award.model";
import { SkillDoc } from "../models/skill.model";
import { pipelineWelcomeEmailHandler } from "../utils/emailHandler";
import mongoose,{ClientSession} from "mongoose";
// import { generatePipelinePassword } from "../utils/pipelinePassword";

// ---------- parsedCv sanitizer (pipeline-only) ----------
// The CV parser intentionally leaves unknown fields as "" (the frontend form
// makes a human fill them). The pipeline has no human, and Mongoose
// `required:true` rejects "", so we (1) drop items with no identity and
// (2) fill required-but-empty leftovers with a visible, editable "N/A".

const orNA = (v: unknown): string =>
  typeof v === "string" && v.trim() ? v.trim() : "N/A";

const fixDuration = (d: any) => ({
  from: orNA(d?.from),
  to: typeof d?.to === "string" ? d.to : "",
});

const withId = (item: any) => ({
  ...item,
  id:
    typeof item?.id === "string" && item.id.trim()
      ? item.id
      : `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
});

const hasText = (v: unknown): boolean =>
  typeof v === "string" && v.trim().length > 0;

export function sanitizeParsedCv(cv: any) {
  return {
    ...cv,
    educations: (Array.isArray(cv?.educations) ? cv.educations : [])
      .filter((e: any) => hasText(e?.institutionName) || hasText(e?.boardNameOrDegree))
      .map((e: any) =>
        withId({
          ...e,
          level: orNA(e.level),
          boardNameOrDegree: orNA(e.boardNameOrDegree),
          institutionName: orNA(e.institutionName),
          gpa: orNA(e.gpa),
          duration: fixDuration(e.duration),
        })
      ),
    experiences: (Array.isArray(cv?.experiences) ? cv.experiences : [])
      .filter((x: any) => hasText(x?.companyName) || hasText(x?.jobRole))
      .map((x: any) =>
        withId({
          ...x,
          companyName: orNA(x.companyName),
          jobRole: orNA(x.jobRole),
          skills: orNA(x.skills), // comma-separated string by data-model convention
          duration: fixDuration(x.duration),
        })
      ),
    skills: (Array.isArray(cv?.skills) ? cv.skills : [])
      .filter((s: any) => hasText(s?.skillName))
      .map((s: any) => withId({ ...s, level: orNA(s.level) })),
    projects: (Array.isArray(cv?.projects) ? cv.projects : [])
      .filter((p: any) => hasText(p?.projectName))
      .map((p: any) =>
        withId({
          ...p,
          skills: orNA(p.skills),
          duration: fixDuration(p.duration),
        })
      ),
    awards: (Array.isArray(cv?.awards) ? cv.awards : [])
      .filter((a: any) => hasText(a?.name))
      .map((a: any) =>
        withId({
          ...a,
          level: orNA(a.level),
          organisation: orNA(a.organisation),
          duration: fixDuration(a.duration),
        })
      ),
  };
}

// ---------- builder docs (what the CV-builder edits) ----------
// The product keeps TWO stores: UserCv (the rendered CV) and per-section
// document collections (EducationDoc/ExperienceDoc/Skill/ProjectDoc/AwardDocs)
// that the CV-builder loads & edits (GET /doc/*-docs). Organic users populate
// the doc store while typing in the builder; pipeline users skip the builder,
// so we must write the doc store too — otherwise their builder opens empty.
// Mirrors the frontend's autoSave/autoSaveParsedData mappings.

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const AWARD_LEVELS = ["Award", "Certificate", "Course"];

async function createBuilderDocs(userId: any, cleanCv: any,session:ClientSession) {

  if (cleanCv.educations.length > 0) {
    await EducationDoc.insertMany(
        cleanCv.educations.map((e: any) => ({
          userId,
          level: e.level,
          boardNameOrDegree: e.boardNameOrDegree,
          institutionName: e.institutionName,
          gpa: e.gpa,
          duration: e.duration,
          selfAttested: true,
          isEmailSend: false,
          verified: false,
          status: "pending",
        })),{session}
      )
  }

  if (cleanCv.experiences.length > 0) {
    await ExperienceDoc.insertMany(
        cleanCv.experiences.map((x: any) => ({
          userId,
          companyName: x.companyName,
          jobRole: x.jobRole,
          duration: x.duration,
          skills: x.skills,
          description: x.description ?? "",
          selfAttested: true,
          isEmailSend: false,
          verified: false,
          status: "pending",
        })),{session}
      )
  }

  if (cleanCv.skills.length > 0) {
    await SkillDoc.insertMany(
    cleanCv.skills.map((s: any) => {
        const lvl = String(s.level || "").toLowerCase();

        return {
        userId,
        skillName: s.skillName,
        level: SKILL_LEVELS.includes(lvl) ? lvl : "beginner",
        selfAttested: true,
        endoresBy: "",
        endoresThrough: "",
        };
    }),
    { session }
);
  }

  if (cleanCv.projects.length > 0) {
    await ProjectDoc.insertMany(
        cleanCv.projects.map((p: any) => ({
          userId,
          projectName: p.projectName,
          projectUrl: p.projectUrl ?? "",
          duration: p.duration,
          skills: p.skills,
          description: p.description ?? "",
          selfAttested: true,
        })),{session})
  }

  if (cleanCv.awards.length > 0) {
    await AwardDocs.insertMany(
        cleanCv.awards.map((a: any) => ({
          userId,
          // enum ["Award","Certificate","Course"]; parser emits e.g. "International"
          level: AWARD_LEVELS.includes(a.level) ? a.level : "Certificate",
          name: a.name,
          organisation: a.organisation,
          duration: a.duration,
          description: a.description ?? "",
          selfAttested: true,
          isEmailSend: false,
          verified: false,
          status: "pending",
          verifiedThrough: "",
        })),{session})
  }

}


export const ingestPipelineCandidate = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const { name, email, role, parsedCv } = req.body ?? {};
    // ---- validate input ----
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "email is required" });
    }
    if (!parsedCv || !parsedCv.personal) {
      return res.status(400).json({ success: false, message: "parsedCv.personal is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const safeName: string = (name && String(name).trim()) || parsedCv?.personal?.fullName || normalizedEmail.split("@")[0];

    // ---- sanitize parser output (parser leaves unknowns as ""; Mongoose required rejects "") ----
    const cleanCv = sanitizeParsedCv(parsedCv);

    // ---- DEDUP: never create a second account for an existing email ----
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({
        success: true,
        created: false,
        deduped: true,
        userId: existing._id,
        message: "User already exists — skipped (no duplicate, no email)",
      });
    }

    // ---- create the tagged pipeline user (password hashed by pre-save hook) ----
    const { v4: uuidv4 } = await import("uuid");
    //const plainPassword = generatePipelinePassword(safeName, normalizedEmail);
    let userID:string|null = null;
    await session.withTransaction(async () => {
    const user = new User({
      name: safeName,
      email: normalizedEmail,
      password: normalizedEmail.split("@")[0],          // hashed on save()
      phoneNumber: parsedCv?.personal?.phone ?? "",
      address: parsedCv?.personal?.city ?? "",
      uuid: uuidv4(),
      isCreatedByPipeline: true,        // ← the tag
    });
    await user.save({session});

    await Subscription.create({
      userId: user._id,
      subscriptionPlan: "pro",
      paymentId: "NA",
      couponCode: "",
      orderId: "NA",
      endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
    },{session});

    await createBuilderDocs(user._id, cleanCv, session)
    userID = (user._id as any).toString();

    })


    // ---- email login credentials (best-effort; user already exists if this fails) ----
    let emailStatus: string | undefined;
    try {
      emailStatus = await pipelineWelcomeEmailHandler(normalizedEmail, safeName, normalizedEmail.split("@")[0], role);
    } catch (mailErr) {
      console.error("pipeline email failed for", normalizedEmail, mailErr);
    }

    return res.status(201).json({
      success: true,
      created: true,
      userId: userID,
      emailStatus,
      message: "Pipeline user created",
    });
  } catch (error: any) {
    console.error("pipeline ingest error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Pipeline ingest failed" });
  }finally{
    await session.endSession();
  }
};

/**
 * Optional convenience: GET /api/v1/pipeline/stats  (guarded)
 * Returns the two honest numbers for quick checks.
 */
export const pipelineStats = async (_req: Request, res: Response) => {
  try {
    const [total, pipeline] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isCreatedByPipeline: true }),
    ]);
    return res.status(200).json({
      success: true,
      totalAccounts: total,
      pipelineAccounts: pipeline,
      organicAccounts: total - pipeline,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "stats failed" });
  }
};