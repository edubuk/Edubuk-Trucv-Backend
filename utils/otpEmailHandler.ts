import { EmailClient } from "@azure/communication-email";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { Request,Response } from "express";
import { SkillVerificationReq } from "../models/skillVerificationRequest.model";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
configDotenv();
//console.log(process.env["ACS_CONNECTION_STRING"]);
const connectionString = process.env.ACS_CONNECTION_STRING as string; // from Azure portal
const client = new EmailClient(connectionString);
//console.log({client})
export interface IDocEmail {
    emailId: string;
    level?: string;
    boardNameOrDegree?: string;
    institutionName?: string;
    documentViewUrl?: string;
    skills?: string | undefined;
    organisation?:string,
    companyName?:string,
    duration?:{from?:string,to?:string},
    position?:string,
    id?:mongoose.ObjectId,
    docType:string
}
export const otpEmailHandler = async (emailId: string, otp: string) => {
  try {
    const message = {
      senderAddress: "noreply@edubukeseal.org",
      content: {
        subject: "Your Edubuk Verification Code",
        plainText: "This is a test email sent from ACS Email SDK (Node.js).",
        html: `<div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5eaf0;border-radius:10px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:25px 20px 10px;">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/cv-on-blockchain.appspot.com/o/1743838131332Logo%20with%20name.png?alt=media&token=30ed7206-368a-4c78-8c9a-8a0d029dba32" 
        alt="Edubuk Logo" 
        style="width:120px;margin-bottom:10px;"
      />
      <h2 style="font-size:18px;margin:10px 0;color:#03257e;font-weight:600;">
        Email Verification Code
      </h2>
    </div>

    <!-- Body -->
    <div style="padding:20px 25px;text-align:left;color:#222;">
      <p style="margin:0 0 12px; font-size:14px;">Dear <strong>${emailId}</strong>,</p>

      <p style="margin:0 0 12px; font-size:14px;">
        Please use the following one-time password (OTP) to verify your email address with <strong>Edubuk</strong>:
      </p>

      <p style="font-size:28px;font-weight:bold;color:#03257e;text-align:center;letter-spacing:4px;margin:25px 0;">
        ${otp}
      </p>

      <p style="margin:0 0 12px; font-size:14px;">
        This code will expire in <strong>5 minutes</strong>.
      </p>

      <p style="margin:0; font-size:14px;">
        For your security, do not share this code with anyone. 
        Our support team will never ask for your OTP.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#03257e;color:#fff;text-align:center;padding:18px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;">
      <p style="margin:0 0 6px;font-size:14px;">Best regards,</p>
      <p style="margin:0 0 10px;font-size:16px;font-weight:bold; color:#ffffff;">Team Edubuk</p>
      <p style="margin:0;font-size:13px; color:#ffffff;">
        💻 <a href="https://edubukeseal.org" style="color:#ffffff;text-decoration:none;">edubukeseal.org</a> 
        | 📧 <a href="mailto:support@edubukeseal.org" style="color:#ffffff;text-decoration:none;">support@edubukeseal.org</a> 
        | 📞 +91 9250411261
      </p>
      <p style="margin-top:8px;font-size:11px;opacity:0.8;">© 2025 Edubuk. All rights reserved.</p>
    </div>

  </div>`,
      },
      recipients: {
        to: [{ address: emailId, displayName: "Recipient" }],
      },
    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
};

export const docVerificationEmailHandler = async (
  {emailId,
  level,
  boardNameOrDegree,
  institutionName,
  documentViewUrl,
  skills,
  organisation,
  companyName,
  duration,
  position,
  id,
  docType}:IDocEmail
) => {
  try {
    const currentDate = new Date();
    const html = `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document Verification Request</title>
  </head>
  <body style="background-color: #f8f9fa; padding: 20px; color: #333;">
    <table
      align="center"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="max-width: 600px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    >
      <tr>
        <td style="padding: 20px 30px; text-align: center; background: #03257e; border-radius: 10px 10px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">Edubuk Verification Portal</h2>
        </td>
      </tr>

      <tr>
        <td style="padding: 25px 30px;">
          <p style="font-size: 16px; margin-bottom: 15px;">Dear <strong>Issuer</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            A document has been submitted for verification. Please review the details below and take an appropriate action.
          </p>

          <!-- Document Metadata -->
          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="background-color: #f4f6fa; border-radius: 8px; margin: 20px 0;"
          >
            ${level? `<tr>
              <td style="width: 40%; font-weight: bold;">Document Type:</td>
              <td>${level}</td>
            </tr>`:""}
            ${boardNameOrDegree? `<tr>
              <td style="font-weight: bold;">Board Name/Degree:</td>
              <td>${boardNameOrDegree}</td>
            </tr>`:""}

            ${institutionName? `<tr>
              <td style="font-weight: bold;">Institution Name:</td>
              <td>${institutionName}</td>
            </tr>`:""}
            ${companyName? `<tr>
              <td style="font-weight: bold;">Organisation Name:</td>
              <td>${companyName}</td>
            </tr>`:""}
            ${position? `<tr>
              <td style="font-weight: bold;">Position:</td>
              <td>${position}</td>
            </tr>`:""}
            ${organisation? `<tr>
              <td style="font-weight: bold;">Organisation Name:</td>
              <td>${organisation}</td>
            </tr>`:""}
            
            ${skills
                    ? `
            <tr>
              <td style="font-weight: bold;">Used Skills:</td>
              <td>${skills}</td>
            </tr>
            `
                    : ""
                  }
            
            <tr>
            ${duration? `<tr>
              <td style="font-weight: bold;">Duration:</td>
              <td>${duration?.from}-${duration?.to}</td>
            </tr>`:""}
              <td style="font-weight: bold;">Submitted On:</td>
              <td>${currentDate}</td>
            </tr>

          </table>

          <p style="margin-bottom: 20px;">
            You can review the document securely using the link below:
          </p>

          <p style="text-align: center;">
            <a
              href=${documentViewUrl}
              style="display: inline-block; padding: 10px 20px; background: #006666; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              View Document
            </a>
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;" />

          <!-- Action Buttons -->
          <p style="font-size: 15px; margin-bottom: 15px; text-align: center;">
            Please confirm the document status:
          </p>

          <div style="text-align: center; margin-bottom: 20px;">
            <a
              href="https://trucv.org/issuer/approve/${id}?emailId=${emailId}&docType=${docType}"
              target="_blank"
              
              style="display: inline-block; padding: 10px 20px; margin-right: 10px; background: #28a745; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              ✔ Approve
            </a>
            <a
              href="https://trucv.org/issuer/reject/${id}?emailId=${emailId}&docType=${docType}"
              target="_blank"
              style="display: inline-block; padding: 10px 20px; background: #f14419; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              ✗ Reject
            </a>
          </div>

          <p style="font-size: 14px; color: #555; line-height: 1.5;">
            <strong>Note:</strong> If this document does not belong to your organization or was submitted mistakenly, please
            report it immediately at
            <a href="mailto:support@edubukeseal.org" style="color: #03257e; text-decoration: none;">
              support@edubukeseal.org
            </a>.
          </p>

          <p style="margin-top: 25px; font-size: 13px; color: #888; text-align: center;">
            This email was sent automatically by EduBukeSeal Verification System. Please do not reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const message = {
      senderAddress: "support@edubukeseal.org",
      content: {
        subject: "Candidate Documents Verification",
        plainText: "This is a test email sent from ACS Email SDK (Node.js).",
        html: html,
      },
      recipients: {
        to: [{ address: emailId, displayName: "Recipient" }],
      },
    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
};


export const skillVerificationEmailHandler = async(emailId:string,userName:string,token:string)=>{
  try {
    const html = `<!DOCTYPE html>
    <html lang="en" style="font-family: Arial, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skills Verification Request</title>
  </head>
  <body style="background-color: #f8f9fa; padding: 20px; color: #333;">
    <table
      align="center"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="max-width: 600px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    >
      <tr>
        <td style="padding: 20px 30px; text-align: center; background: #03257e; border-radius: 10px 10px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">Edubuk Verification Portal</h2>
        </td>
      </tr>

      <tr>
        <td style="padding: 25px 30px;">
          <p style="font-size: 16px; margin-bottom: 15px;">Dear <strong>Issuer</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            ${userName} has been requested for verification. Please review the details below and take an appropriate action.
          </p>

          <!-- Document Metadata -->

          <p style="margin-bottom: 20px;">
            You can review the skill and also can change the level securely using the link below:
          </p>


          <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;" />

          <div style="text-align: center; margin-bottom: 20px;">
            <a
              href="https://edubuktrucv.com/verify-skill/${token}"
              target="_blank"
              
              style="display: inline-block; padding: 10px 20px; margin-right: 10px; background: #28a745; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              Proceed to Endorse the Skills ↗
            </a>
          </div>

          <p style="font-size: 14px; color: #555; line-height: 1.5;">
            <strong>Note:</strong> If this document does not belong to your organization or was submitted mistakenly, please
            report it immediately at
            <a href="mailto:support@edubuk.com" style="color: #03257e; text-decoration: none;">
              support@edubuk.com
            </a>.
          </p>

          <p style="margin-top: 25px; font-size: 13px; color: #888; text-align: center;">
            This email was sent automatically by EduBukeSeal Verification System. Please do not reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const message = {
      senderAddress: "support@edubukeseal.org",
      content: {
        subject: "Candidate Skill Verification",
        plainText: "This is a test email sent from ACS Email SDK (Node.js).",
        html: html,
      },
      recipients: {
        to: [{ address: emailId, displayName: "Recipient" }],
      },
    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
}
