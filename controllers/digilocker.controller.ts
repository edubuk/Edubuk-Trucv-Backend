import express from "express";
import { Request, Response } from "express";
import { configDotenv } from "dotenv";
import "express-session";
import type { Session } from "express-session";
import crypto from "crypto";
import qs from "qs";
import axios from "axios";
import { LRUCache } from "lru-cache";
import IssuerData from "../states/state";
configDotenv();


function currentIstSeconds() {
  const IST_OFFSET_MS = 0;
  return Math.floor((Date.now() + IST_OFFSET_MS) / 1000).toString();
}


function digilockerHmacConcat(clientId: string, clientSecret: string, ts: string, docType?: string, orgid?: string) {
  if (orgid && docType) {
    console.log({ orgid, docType });
    const raw = clientSecret + clientId + orgid + docType + ts; // concat in this order
    const digest = crypto.createHash('sha256').update(raw).digest('hex'); // hex value
    return digest;
  }
  else if (docType) {
    console.log({ docType });
    const raw = clientSecret + clientId + docType + ts; // concat in this order
    const digest = crypto.createHash('sha256').update(raw).digest('hex'); // hex value
    return digest;
  }

  const raw = clientSecret + clientId + ts; // concat in this order
  const digest = crypto.createHash('sha256').update(raw).digest('hex'); // hex value
  return digest;

}
// OAuth2 Callback → exchange code + verifier for tokens
export const digilockerCallback = async (req: Request, res: Response) => {
  const code = req.query.code;
  console.log("req.query", req.query);
  //const verifier = dlSession(req).pkce_verifier; // stored earlier from frontend
  const verifier = req.cookies.pkce_verifier; // stored earlier from frontend
  console.log("Verifier:", verifier);
  console.log("Code:", code);
  if (!code || !verifier) {
    return res.status(400).send("Missing code or verifier");
  }

  try {
    const response = await fetch(process.env.DIGILOCKER_TOKEN_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        client_id: process.env.DIGILOCKER_CLIENT_ID as string,
        client_secret: process.env.DIGILOCKER_CLIENT_SECRET as string,
        redirect_uri: process.env.DIGILOCKER_REDIRECT_URI as string,
        code_verifier: verifier,
      }),
    });

    const data = await response.json();
    console.log("Token response:", data);

    if (data.access_token) {
      res.status(200).cookie("dl_token", data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      }).redirect(`${process.env.CLIENT_URL}/create-cv`);
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    console.error("Error in token exchange:", err);
    res.status(500).send("Token exchange failed");
  }
};

export const redirectToCallBack = (req: Request, res: Response) => {
  try {
    const code = req.query.code;
    res.redirect(`https://edubuktrucv.com/api/api/dl/redirect?code=${code}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Redirect failed");
  }
};



// Save PKCE verifier (frontend must call before redirect)
export const saveVerifier = (req: Request, res: Response) => {
  const { verifier } = req.body;
  console.log("verifier", verifier);
  if (typeof verifier !== "string") return res.status(400).json({ ok: false, error: "Invalid verifier" });

  res.status(200).cookie("pkce_verifier", verifier, {
    httpOnly: true,
    secure:true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
  .json({ ok: true });
  
};


// Fetch DigiLocker Profile
export const fetchProfile = async (req: Request, res: Response) => {
  //const token = dlSession(req).dl_token;
  const token = req.cookies.dl_token;
  if (!token) return res.status(401).send("Not logged in");

  try {
    const response = await fetch(process.env.DIGILOCKER_PROFILE_URL as string, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in fetching profile:", err);
    res.status(500).send("Failed to fetch profile");
  }
};


// Fetch Issued Documents
export const fetchDocuments = async (req: Request, res: Response) => {
  //const token = dlSession(req).dl_token;
  const token = req.cookies.dl_token;
  console.log("token", token);
  if (!token) return res.status(401).send("Not logged in");

  try {
    const response = await fetch(`${process.env.DIGILOCKER_API_BASE}/1/files/issued`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in fetching documents:", err);
    res.status(500).send("Failed to fetch documents");
  }
};

// Download PDF
// export const downloadPdf = async (req: Request, res: Response) => {
//   const token = req.session.dl_token;
//   const uri = req.query.uri;
//   if (!token || !uri) return res.status(400).send("Missing params");

//   try {
//     const response = await fetch(
//       `${process.env.DIGILOCKER_FILE_URL}?uri=${encodeURIComponent(uri as string)}&format=pdf`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     res.setHeader("Content-Type", "application/pdf");
//     response.body?.pipeTo(res);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to download PDF");
//   }
// };


// fetch issuer

export const fetchIssuer = async () => {
  try {
    const clientId = process.env.DIGILOCKER_CLIENT_ID as string;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET as string;
    const ts = currentIstSeconds().toString();
    const hmac = digilockerHmacConcat(clientId, clientSecret, ts);

    // DigiLocker expects application/x-www-form-urlencoded POST parameters
    const body = qs.stringify({
      clientid: clientId,
      hmac: hmac,
      ts: ts,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    console.log("body", body);
    // POST to /pull/issuers (production URL in docs)
    const resp = await axios.post(`${process.env.DIGILOCKER_API_BASE}/1/pull/issuers`, body, { headers, timeout: 15000 });
    return resp.data;
  } catch (error: any) {
    console.error('Digilocker issuers error', error.response?.data || error.message || error);
    return error.response?.data || error.message;
  }
}


// fetch doctype
export const fetchDocType = async (req: Request, res: Response) => {
  console.log("hiting");
  const orgid = req.query.orgid;
  console.log("orgid", orgid);
  try {
    const clientId = process.env.DIGILOCKER_CLIENT_ID as string;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET as string;
    const ts = currentIstSeconds().toString();
    const hmac = digilockerHmacConcat(clientId, clientSecret, ts, orgid as string);
    const body = qs.stringify({
      clientid: clientId,
      orgid: orgid as string,
      ts: ts,
      hmac: hmac,
    });
    console.log("body", body);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const doctype = await axios.post(`${process.env.DIGILOCKER_API_BASE}/1/pull/doctype`,
      body,
      {
        headers: headers,
        timeout: 15000
      });
    res.json({ ok: true, doctype: doctype.data });
  } catch (err: any) {
    console.error('Digilocker doctype error', err.response?.data || err.message || err);
    res.status(500).json({ ok: false, error: err.response?.data || err.message });
  }
}

export const pullParams = async (req: Request, res: Response) => {
  console.log("hitting pullParams");
  const orgid = req.query.orgid as string | undefined;
  const doctype = req.query.doctype as string;
  if (!orgid || !doctype) {
    return res.status(400).json({ ok: false, error: "Missing required query param: orgid or doctype" });
  }

  try {
    const clientId = process.env.DIGILOCKER_CLIENT_ID as string;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET as string;
    if (!clientId || !clientSecret) {
      return res.status(500).json({ ok: false, error: "Digilocker client credentials not configured" });
    }

    const ts = currentIstSeconds().toString();
    const hmac = digilockerHmacConcat(clientId, clientSecret, ts, doctype, orgid);

    const body = qs.stringify({
      clientid: clientId,
      orgid: orgid,
      doctype: doctype,
      ts: ts,
      hmac: hmac,
    });


    const response = await axios.post(
      `${process.env.DIGILOCKER_API_BASE}/1/pull/parameters`,
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    // Return only serializable parts:
    return res.json({
      ok: true,
      status: response.status,
      data: response.data,         // the useful payload
      headers: response.headers,   // optional
    });
  } catch (err: any) {
    // Safe logging: avoid JSON.stringify on error object containing circular refs
    if (err?.response) {
      // Axios error with response from server
      return res.status(err.response.status ?? 500).json({
        ok: false,
        error: err.response.data ?? err.message ?? "Unknown error",
      });
    }

    // Generic error
    return res.status(500).json({ ok: false, error: err?.message ?? "Internal server error" });
  }
};


export const fetchDocUri = async (req: Request, res: Response) => {
  try {
    //const token = dlSession(req).dl_token;
    const token = req.cookies.dl_token;
    console.log("token", token);
    const orgid = req.query.orgid;
    const doctype = req.query.doctype;
    const {rollno,year}=req.body;
    console.log("rollno", rollno);
    console.log("year", year);
    const dlBody = req.body;
    console.log("data body",dlBody)

    if (!token) {
      return res.status(401).json({ ok: false, error: "Not logged in" });
    }
    let body = null;
      body = qs.stringify({
        orgid:orgid,
        doctype:doctype,
        consent: "Y",
        ...dlBody
    });
    console.log("body", body);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    };
     const response = await axios.post(`${process.env.DIGILOCKER_API_BASE}/1/pull/pulldocument`,
      body,
      {
        headers: headers,
        timeout: 15000
      });
    
    const {data,status} = response;
    return res.status(status).json({ ok: true, message: "document found", data });
  } catch (err: any) {
    console.error('Digilocker pull doc error', err.response?.data || err.message || err);
    res.status(500).json({ ok: false, error: err.response?.data || err.message });
  }
}


export const viewDoc = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.dl_token;
    const docUri = String(req.query.docUri || "");

    if (!token) {
      return res.status(401).json({ ok: false, error: "Not logged in (missing token)" });
    }
    if (!docUri) {
      return res.status(400).json({ ok: false, error: "Missing docUri" });
    }

    const url = `${process.env.DIGILOCKER_API_BASE}/1/file/${encodeURIComponent(docUri)}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "arraybuffer",
      timeout: 15000,
      validateStatus: (s) => s >= 200 && s < 500,
    });

    if (response.status !== 200) {
      // if the server returned JSON, try to include it
      const maybeText = response.data && response.headers["content-type"]?.includes("application/json")
        ? Buffer.from(response.data).toString("utf8")
        : undefined;
      return res.status(response.status).json({
        ok: false,
        error: maybeText || `Upstream responded with status ${response.status}`,
      });
    }

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const base64 = buffer.toString("base64");
    return res.status(200).json({ ok: true, message: "document found", data: base64 });
  } catch (err: any) {
    console.error("Digilocker pull doc error:", err?.response?.data || err?.message || err);
    const status = err?.response?.status || 500;
    const body = err?.response?.data ?? err?.message;
    return res.status(status).json({ ok: false, error: body });
  }
};


// normalize.js
export function normalizeIssuers(rawIssuers = []) {
  //console.log("rawIssuers", rawIssuers);
  return rawIssuers.map((item: any) => {
    const shortName = (item.name || "").replace(/\s+/g, " ").trim();
    const orgId = item.orgid || item.orgId || item.org_id || item.org; // tolerant mapping

    return {
      ...item,
      shortName,
      _nameLower: shortName.toLowerCase(),
      _clientView: {
        orgId,
        name: shortName
      }
    };
  });
}


const cache = new LRUCache({ max: 1000, ttl: 1000 * 60 * 60 })
//console.log("IssuerData", IssuerData.data);
//let issuers = normalizeIssuers(IssuerData.data);
//console.log("issuers", issuers);


export const getIssuer = async (req: Request, res: Response) => {
  try {
    let issuers = normalizeIssuers(IssuerData.data);
    //console.log("issuers",issuers);
    const q = (req.query.q as string || "").trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;
    const cacheKey = `${q}|${limit}|${page}`;

    let matched;
    if (!q) {
      matched = issuers;
    } else {
      const prefix = [];
      const contains = [];
      for (const it of issuers) {
        if (it._nameLower.startsWith(q)) prefix.push(it);
        else if (it._nameLower.includes(q)) contains.push(it);
        if (prefix.length + contains.length >= (offset + limit) + 200) break;
      }
      matched = prefix.concat(contains);
    }

    const pageItems = matched.slice(offset, offset + limit).map(r => r._clientView);

    const payload = { items: pageItems, page, limit };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {

  }

}


// export const fetchIssuer = async (req:Request,res:Response) => {
//   try {
//     const clientId = process.env.DIGILOCKER_CLIENT_ID as string;
//     const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET as string;
//     const ts = currentIstSeconds().toString();
//     const hmac = digilockerHmacConcat(clientId, clientSecret, ts);

//     // DigiLocker expects application/x-www-form-urlencoded POST parameters
//     const body = qs.stringify({
//       clientid: clientId,
//       hmac: hmac,
//       ts: ts,
//     });

//     const headers = {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     };
//     console.log("hitiing");
//     // POST to /pull/issuers (production URL in docs)
//     const resp = await axios.post(`${process.env.DIGILOCKER_API_BASE}/1/pull/issuers`, body, { headers, timeout: 15000 });
//     console.log("resp",resp);
//     return res.status(200).json({ok:true,data:resp.data});
//   } catch (error: any) {
//     console.error('Digilocker issuers error', error.response?.data || error.message || error);
//     return res.status(500).json({ok:false,error:error.message});
//   }
// }






