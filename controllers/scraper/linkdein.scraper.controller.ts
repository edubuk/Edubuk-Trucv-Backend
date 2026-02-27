import { ApifyClient } from "apify-client";
import { Request, Response } from "express";
import OpenAI from "openai";
const client = new ApifyClient({
  token: "apify_api_kDeDJgKPzWo3kRYxFgLtZJmadCWAEm20rFlD",
});

const openAIClient = new OpenAI({
  apiKey: process.env.AZURE_API_KEY,
  baseURL: `${process.env.AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_DEPLOYMENT}`,
  defaultQuery: { "api-version": process.env.AZURE_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_API_KEY },
});

const RESUME_FORMAT_PROMPT = `
You are a resume data formatter. Convert the given LinkedIn profile JSON into the exact resume format below.

TARGET FORMAT:
{
  "personal": {
    "fullName": "string (firstName + lastName)",
    "email": "",
    "phone": "",
    "city": "string (extract city from location.parsed.city or location.linkedinText)",
    "linkedin": "",
    "github": "",
    "summary": "string (Write a professional 3-4 line resume summary based on the person's full profile - their experience, skills, education, and key achievements. Do NOT copy the LinkedIn bio. Write it in third person or first person as a polished resume summary. Example style: 'Results-driven Cloud Architect with 7+ years of experience designing scalable infrastructure on AWS and GCP. Proven track record at Google and NVIDIA in delivering AI inference solutions and leading cross-functional teams. Holds multiple Kubernetes and cloud certifications.')",
  },
  "educations": [
    {
      "level": "string (infer: 'Undergraduate' for Bachelor's, 'Postgraduate' for Master's, 'Doctorate' for PhD, 'Certification' for certificates)",
      "boardNameOrDegree": "string (degree + fieldOfStudy, e.g. 'Bachelor of Science in Computer Science')",
      "institutionName": "string",
      "gpa": "",
      "duration": {
        "from": "YYYY-MM (use startDate.year + '-01' if no month)",
        "to": "YYYY-MM or 'Present'"
      }
    }
  ],
  "experiences": [
    {
      "companyName": "string",
      "jobRole": "string (position)",
      "duration": {
        "from": "YYYY-MM",
        "to": "YYYY-MM or 'Present'"
      },
      "skills": "string (comma-separated skills if available, else extract key tech from description)",
      "description": "string (from description, clean up bullet symbols like ￼)"
    }
  ],
  "skills": [
    {
      "skillName": "string",
      "level": "string (always 'Intermediate' since LinkedIn doesn't provide levels)"
    }
  ],
  "projects": [
    {
      "projectName": "string (from title)",
      "projectUrl": "",
      "duration": {
        "from": "YYYY-MM",
        "to": "YYYY-MM or 'Present' or ''"
      },
      "skills": "string (extract from description if possible)",
      "description": "string"
    }
  ],
  "awards": [
    {
      "level": "string (infer: 'International' for major company certs, 'National' for others)",
      "name": "string (certification title)",
      "organisation": "string (issuedBy)",
      "description": "string (issuedAt)"
    }
  ]
}

RULES:
- For summary: analyze the ENTIRE profile (experience, skills, certifications, achievements) and write a concise 3-4 sentence professional resume summary. Never copy the LinkedIn about section directly.
- Clean all bullet symbols (•, ￼, *) from descriptions
- If a field is not available, use empty string ""
- For duration months, use 2-digit format: "2024-01"
- Skills from certifications become awards entries
- Do NOT include markdown or explanation, return ONLY valid JSON
`;

const transformWithAI = async (linkedinData: any): Promise<any> => {
  const completion = await openAIClient.chat.completions.create({
    model: process.env.AZURE_DEPLOYMENT!,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `${RESUME_FORMAT_PROMPT}\n\nLINKEDIN DATA:\n${JSON.stringify(linkedinData, null, 2)}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No response from OpenAI");

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
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
      },
      photo: profileData.photo,
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
      // AI transform: smarter but costs tokens + adds ~2-3s latency
      transformedData = await transformWithAI(linkedinResponse);
    } else {
      // Manual transform: instant, free, deterministic
      transformedData = transformManually(linkedinResponse);
    }

    return res.status(200).json({
      message: "SUCCESS:WHILE SCRAPINNG LINKDEIN PROFILE",
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
