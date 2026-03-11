import { ApifyClient } from "apify-client";
import { Request, Response } from "express";
import OpenAI from "openai";
import Scraper from "../../models/scrapers/scraper.model";
const client = new ApifyClient({
  token: process.env.APIFY_CLIENT,
});

const openAIClient = new OpenAI({
  apiKey: process.env.AZURE_API_KEY,
  baseURL: `${process.env.AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_DEPLOYMENT}`,
  defaultQuery: { "api-version": process.env.AZURE_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_API_KEY },
});

const RESUME_FORMAT_PROMPT = `
You are a resume data formatter. Convert the given profile JSON into the exact resume format below.

CRITICAL RULES - READ FIRST:
- YOU MUST include EVERY SINGLE item from the input. No exceptions.
- If the input has 9 certifications, output ALL 9. If it has 15 skills, output ALL 15.
- NEVER skip, merge, truncate, or summarize array items.
- NEVER assume an item is a duplicate — include everything as-is.
- Count the items in input, count your output. They MUST match.
- If you are unsure whether to include something — INCLUDE IT.

TARGET FORMAT:
{
  "personal": {
    "fullName": "string (firstName + lastName)",
    "email": "",
    "phone": "",
    "city": "string (extract city from location)",
    "linkedin": "",
    "github": "",
    "imgUrl":"string"
    "summary": "string (Write a professional 3-4 line resume summary based on the person's FULL profile - their experience, skills, education, and key achievements. Do NOT copy any existing bio or summary. Write it as a polished resume summary. Example style: 'Results-driven Cloud Architect with 7+ years of experience designing scalable infrastructure on AWS and GCP. Proven track record at Google and NVIDIA in delivering AI inference solutions and leading cross-functional teams. Holds multiple Kubernetes and cloud certifications.')"
  },
  "educations": [
    {
      "level": "string (infer: 'Undergraduate' for Bachelor's, 'Postgraduate' for Master's, 'Doctorate' for PhD, 'Certification' for certificates, 'Graduation' for B.Tech/B.E)",
      "boardNameOrDegree": "string (degree + fieldOfStudy, e.g. 'Bachelor of Science in Computer Science')",
      "institutionName": "string",
      "gpa": "",
      "duration": {
        "from": "YYYY-MM-DD",
        "to": "YYYY-MM-DD or 'Present'"
      },
      "selfAttested": false,
      "docUri": "",
      "issuerEmailId": "",
      "isEmailSend": false,
      "verified": false,
      "status": "pending"
    }
  ],
  "experiences": [
    {
      "companyName": "string",
      "jobRole": "string",
      "duration": {
        "from": "YYYY-MM-DD",
        "to": "YYYY-MM-DD or 'present'"
      },
      "skills": "string (comma-separated skills extracted from description or skills field)",
      "description": "string (clean description, remove bullet symbols like •, *, ￼)",
      "selfAttested": false,
      "isEmailSend": false,
      "docUri": "",
      "issuerEmailId": "",
      "verified": false,
      "status": "pending"
    }
  ],
  "skills": [
    {
      "skillName": "string",
      "level": "string (use 'intermediate' as default unless profile explicitly states otherwise)",
      "selfAttested": false,
      "endoresBy": "",
      "endoresThrough": ""
    }
  ],
  "projects": [
    {
      "projectName": "string",
      "projectUrl": "",
      "duration": {
        "from": "YYYY-MM-DD",
        "to": "YYYY-MM-DD or 'Present' or ''"
      },
      "skills": "string (comma-separated, extract from description if needed)",
      "description": "string",
      "selfAttested": false
    }
  ],
  "awards": [
    {
      "level": "string (infer: 'Certificate' for certifications, 'International' for major certs like AWS/Google/Microsoft, 'National' for others)",
      "name": "string",
      "organisation": "string",
      "duration": {
        "from": "YYYY-MM-DD",
        "to": ""
      },
      "description": "string",
      "selfAttested": false,
      "issuerEmailId": "",
      "docUri": "",
      "isEmailSend": false,
      "verified": false,
      "status": "pending"
    }
  ]
}

STRICT COMPLETENESS RULES:
- AWARDS / CERTIFICATIONS: Every single certification and award from the input MUST appear in the awards array. Count them before you respond.
- EXPERIENCES: Every single job/internship/role MUST appear. Do not merge roles at the same company into one.
- SKILLS: Every single skill listed MUST appear. Do not group or combine skills.
- PROJECTS: Every single project MUST appear.
- EDUCATIONS: Every single education entry MUST appear.
- Before finalizing your response, verify: input count vs output count for each section. If they don't match, fix it before responding.

FORMATTING RULES:
- SUMMARY: Analyze the ENTIRE profile (all experiences, skills, projects, certifications, achievements) and write a concise 3-4 sentence professional resume summary. Never copy any existing bio or summary verbatim. Highlight years of experience, key tech stack, notable achievements, and current focus areas.
- FIXED FIELDS — always output these exact values, never change them:
    - educations, experiences, awards: "selfAttested": false, "docUri": "", "issuerEmailId": "", "isEmailSend": false, "verified": false, "status": "pending"
    - skills: "selfAttested": false, "endoresBy": "", "endoresThrough": ""
    - projects: "selfAttested": false
- Clean all bullet symbols (•, *, ￼, –) from descriptions
- If a field is not available, use empty string ""
- For duration dates, use format "YYYY-MM-DD" (e.g. "2024-01-01"); use "-01" for missing day/month
- All certifications go into the awards array with level: "Certificate"
- Return ONLY valid JSON — no markdown, no explanation, no code fences
`;

const transformWithAI = async (linkedinData: any): Promise<any> => {
  const completion = await openAIClient.chat.completions.create({
    model: process.env.AZURE_DEPLOYMENT!,
    max_tokens: 8192, // ← increase this
    messages: [
      {
        role: "system", // ← move prompt to system role
        content: RESUME_FORMAT_PROMPT,
      },
      {
        role: "user",
        content: `Convert this LinkedIn profile data to the required resume format:\n\n${JSON.stringify(linkedinData, null, 2)}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No response from OpenAI");

  // Check if response was cut off
  const finishReason = completion.choices[0]?.finish_reason;
  if (finishReason === "length") {
    throw new Error(
      "AI response was truncated due to token limit. Increase max_tokens.",
    );
  }

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error("JSON parse failed. Raw AI response:", text);
    console.error("Parse error:", parseError);
    throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
  }
};

// Fallback: manual transform (fast, no AI cost, but less smart)
const transformManually = (linkedinData: any) => {
  const degreeMap: Record<string, string> = {
    bachelor: "Undergraduate",
    master: "Postgraduate",
    phd: "Doctorate",
    doctor: "Doctorate",
    "graduate certificate": "Certification",
    associate: "Associate",
  };

  const inferLevel = (degree: string = "") => {
    const lower = degree.toLowerCase();
    for (const [key, val] of Object.entries(degreeMap)) {
      if (lower.includes(key)) return val;
    }
    return "Undergraduate";
  };

  const toYearMonth = (dateObj: any): string => {
    if (!dateObj) return "";
    if (dateObj.text === "Present") return "Present";
    const year = dateObj.year || "";
    const month = dateObj.month ? String(dateObj.month).padStart(2, "0") : "01";
    return year ? `${year}-${month}` : "";
  };

  const cleanText = (text: string = "") =>
    text
      .replace(/[￼•]/g, "")
      .replace(/\n\s*\n/g, "\n")
      .trim();

  return {
    personal: {
      fullName:
        `${linkedinData.personalInfo?.name || ""} ${linkedinData.personalInfo?.lastName || ""}`.trim(),
      email: "",
      phone: "",
      city:
        linkedinData.personalInfo?.location?.parsed?.city ||
        linkedinData.personalInfo?.location?.linkedinText ||
        "",
      linkedin: "",
      github: "",
      summary: cleanText(linkedinData.profileSummary || ""),
    },

    educations: (linkedinData.education || []).map((edu: any) => ({
      level: inferLevel(edu.degree),
      boardNameOrDegree: [edu.degree, edu.fieldOfStudy]
        .filter(Boolean)
        .join(" in "),
      institutionName: edu.schoolName || "",
      gpa: edu.insights?.match(/[\d.]+\/[\d.]+/)?.[0] || "",
      duration: {
        from: edu.startDate?.year ? `${edu.startDate.year}-01` : "",
        to: edu.endDate?.year ? `${edu.endDate.year}-01` : "",
      },
    })),

    experiences: (linkedinData.experiecne || []).map((exp: any) => ({
      companyName: exp.companyName || "",
      jobRole: exp.position || "",
      duration: {
        from: toYearMonth(exp.startDate),
        to:
          exp.endDate?.text === "Present"
            ? "Present"
            : toYearMonth(exp.endDate),
      },
      skills: (exp.skills || []).join(", "),
      description: cleanText(exp.description || ""),
    })),

    skills: (linkedinData.skills || []).map((skill: any) => ({
      skillName: skill.name || "",
      level: "Intermediate",
    })),

    projects: (linkedinData.projects || []).map((proj: any) => ({
      projectName: proj.title || "",
      projectUrl: proj.link || "",
      duration: {
        from: toYearMonth(proj.startDate),
        to:
          proj.endDate?.text === "Present"
            ? "Present"
            : toYearMonth(proj.endDate),
      },
      skills: "",
      description: cleanText(proj.description || ""),
    })),

    awards: (linkedinData.certifications || []).map((cert: any) => ({
      level: "International",
      name: cert.title || "",
      organisation: cert.issuedBy || "",
      description: cert.issuedAt || "",
    })),
  };
};

export const linkdeinProfileScraper = async (req: Request, res: Response) => {
  const { profileUrl, useAI } = req.query;
  let data_formatted_from = "AI";
  if (!profileUrl) {
    return res.status(400).json({ message: "ERROR:Profile Url is missing" });
  }

  try {
    const input = {
      profileScraperMode: "Profile details no email ($4 per 1k)",
      queries: [profileUrl],
    };

    const run = await client.actor("LpVuK3Zozwuipa5bp").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const profileData: any = items[0];

    // Build the raw LinkedIn response object
    const linkedinResponse = {
      personalInfo: {
        name: profileData.firstName,
        lastName: profileData.lastName,
        location: profileData.location,
        imgUrl: profileData.photo,
      },
      profileSummary: profileData.about,
      currentlyWorkingAt: profileData.currentPosition,
      experiecne: profileData.experience,
      education: profileData.education,
      certifications: profileData.certifications,
      projects: profileData.projects,
      skills: profileData.skills,
      courses: profileData.courses,
    };

    // Choose transformation strategy
    let transformedData;
    if (useAI === "true") {
      try {
        transformedData = await transformWithAI(linkedinResponse);
      } catch (aiError) {
        console.warn("AI transform failed, falling back to manual:", aiError);
        transformedData = transformManually(linkedinResponse);
        data_formatted_from = "Manual";
      }
    } else {
      transformedData = transformManually(linkedinResponse);
      data_formatted_from = "Manual";
    }
    if (transformedData) {
      const scraper = await Scraper.create({
        userId: (req as any).user._id,
        linkdeinScrapedUrl: profileUrl as string,
        scrapedData: transformedData,
      });

      if (!scraper) {
        return res.status(500).json({
          message: "ERROR:WHILE CREATING SCRAPER RECORD IN DB",
        });
      }
    }
    return res.status(200).json({
      message: "SUCCESS:WHILE SCRAPINNG LINKDEIN PROFILE",
      data_formatted_from,
      data: transformedData, // structured resume format
      raw: linkedinResponse, // keep raw if needed
    });
  } catch (error) {
    console.log("ERROR:WHILE SCRAPINNG LINKDEIN PROFILE VIA APIFY", error);
    return res.status(500).json({
      message: "ERROR:WHILE SCRAPINNG LINKDEIN PROFILE",
      error,
    });
  }
};
