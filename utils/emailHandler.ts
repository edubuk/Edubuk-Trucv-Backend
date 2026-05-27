import { EmailClient } from "@azure/communication-email";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

const connectionString = process.env.ACS_CONNECTION_STRING as string; // from Azure portal
const client = new EmailClient(connectionString);

export interface IDocEmail {
  emailId: string;
  level?: string;
  boardNameOrDegree?: string;
  institutionName?: string;
  documentViewUrl?: string;
  skills?: string | undefined;
  organisation?: string,
  companyName?: string,
  duration?: { from?: string, to?: string },
  position?: string,
  id?: mongoose.ObjectId,
  docType: string,
  userEmail?: string,
  token?: string
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
        src="https://miitserverlessafba.blob.core.windows.net/edubuklogo/Edubuk_Logo-removebg-preview.png" 
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
        💻 <a href="https://edubuktrucv.com" style="color:#ffffff;text-decoration:none;">edubuktrucv.com</a> 
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

export const sendResetLinkEMail = async (emailId: string, resetToken: string) => {
  try {
    // change this to your client URL (frontend route that accepts the raw token)
    const CLIENT_URL = process.env.CLIENT_URL || "https://edubuktrucv.com/";
    const resetUrl = `${CLIENT_URL.replace(/\/$/, "")}/password-reset?token=${encodeURIComponent(
      resetToken
    )}`;

    const message = {
      senderAddress: "noreply@edubukeseal.org",
      content: {
        subject: "Reset your Edubuk password",
        plainText: `Hi ${emailId},

You (or someone using your email) requested a password reset for your Edubuk account.
Use the link below to reset your password (this link will expire in 1 hour):

${resetUrl}

If you didn't request this, please ignore this email.

— Team Edubuk
https://edubukeseal.org`,

        html: `
  <div style="max-width:600px;margin:auto;font-family:Arial, Helvetica, sans-serif;background:#ffffff;border:1px solid #e5eaf0;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#f7fbff;padding:28px 22px 18px;text-align:center;">
      <img
        src="https://miitserverlessafba.blob.core.windows.net/edubuklogo/Edubuk_Logo-removebg-preview.png"
        alt="Edubuk Logo"
        style="width:120px;display:block;margin:0 auto 8px;"
      />
      <h1 style="font-size:18px;margin:0;color:#03257e;font-weight:700;letter-spacing:0.2px;">Reset your Edubuk password</h1>
      <p style="margin:8px 0 0;color:#495057;font-size:13px;">A secure link to reset your password has been generated.</p>
    </div>

    <!-- Body -->
    <div style="padding:22px 26px;color:#222;">
      <p style="margin:0 0 12px;font-size:14px;">Hi <strong>${emailId}</strong>,</p>

      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
        We received a request to reset the password for your Edubuk account. Click the button below to choose a new password.
        This link is single-use and will expire in <strong>1 hour</strong>.
      </p>

      <!-- Button -->
      <div style="text-align:center;margin:20px 0;">
        <a
          href="${resetUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display:inline-block;
            text-decoration:none;
            padding:12px 22px;
            border-radius:8px;
            font-weight:600;
            font-size:15px;
            color:#ffffff;
            background: linear-gradient(180deg, #f14419 0%, #d73712 100%);
            box-shadow: 0 6px 18px rgba(241,68,25,0.18);
          "
        >Reset password</a>
      </div>

      <p style="margin:0 0 12px;font-size:13px;color:#4b5563;">
        If the button doesn't work, copy & paste the link below into your browser:
      </p>

      <p style="word-break:break-all;font-size:13px;margin:8px 0 18px;color:#06466a;">
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color:#03257e;text-decoration:none;">${resetUrl}</a>
      </p>

      <p style="margin:0 0 8px;font-size:13px;color:#4b5563;">
        For your safety, do not share this link with anyone. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#03257e;color:#ffffff;text-align:center;padding:18px 16px;">
      <p style="margin:0;font-size:14px;">Best regards,</p>
      <p style="margin:6px 0 8px;font-size:15px;font-weight:700;">Team Edubuk</p>
      <p style="margin:0;font-size:13px;">
        💻 <a href="https://edubukeseal.org" style="color:#ffffff;text-decoration:underline;">edubukeseal.org</a>
        &nbsp; | &nbsp; 📧 <a href="mailto:support@edubukeseal.org" style="color:#ffffff;text-decoration:underline;">support@edubukeseal.org</a>
      </p>
      <p style="margin-top:10px;font-size:11px;opacity:0.85;">© ${new Date().getFullYear()} Edubuk. All rights reserved.</p>
    </div>
  </div>
        `,
      },
      recipients: {
        to: [{ address: emailId, displayName: "Recipient" }],
      },
    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
    console.log("Send result:", result);
  } catch (error) {
    console.log("error", error);
  }
};

export const docVerificationEmailHandler = async (
  { emailId,
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
    docType, token, userEmail }: IDocEmail
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
            A document has been submitted for verification by ${userEmail}. Please review the details below and take an appropriate action.
          </p>

          <!-- Document Metadata -->
          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="background-color: #f4f6fa; border-radius: 8px; margin: 20px 0;"
          >
            ${level ? `<tr>
              <td style="width: 40%; font-weight: bold;">Document Type:</td>
              <td>${level}</td>
            </tr>`: ""}
            ${boardNameOrDegree ? `<tr>
              <td style="font-weight: bold;">Board Name/Degree:</td>
              <td>${boardNameOrDegree}</td>
            </tr>`: ""}

            ${institutionName ? `<tr>
              <td style="font-weight: bold;">Institution Name:</td>
              <td>${institutionName}</td>
            </tr>`: ""}
            ${companyName ? `<tr>
              <td style="font-weight: bold;">Organisation Name:</td>
              <td>${companyName}</td>
            </tr>`: ""}
            ${position ? `<tr>
              <td style="font-weight: bold;">Position:</td>
              <td>${position}</td>
            </tr>`: ""}
            ${organisation ? `<tr>
              <td style="font-weight: bold;">Organisation Name:</td>
              <td>${organisation}</td>
            </tr>`: ""}
            
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
            ${duration ? `<tr>
              <td style="font-weight: bold;">Duration:</td>
              <td>${duration?.from}-${duration?.to}</td>
            </tr>`: ""}
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
            <br>
            <span style="font-size: 14px; font-weight: bold; margin-bottom: 15px; text-align: center; color:#f14419;">Note: This action is not reversible</span>
          </p>

          <div style="text-align: center; margin-bottom: 20px;">
            <a
              href="https://edubuktrucv.com/verify-document/${token}"
              target="_blank"
              
              style="display: inline-block; padding: 10px 20px; margin-right: 10px; background: #28a745; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              Review Document and Take Action ↗
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
            This is an automated email sent by the Edubuk Verification System.
            Please do not reply to this email.
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

export const docVerificationNotifyEmailHandler = async (
  { emailId,
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
    docType,
    userEmail,
  }: IDocEmail
) => {
  try {
    const currentDate = new Date();
    const html = `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, Helvetica, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document Verification Notification</title>
  </head>

  <body style="margin: 0; padding: 20px; background-color: #f4f6f8; color: #333;">
    <table
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);"
    >
      <!-- Header -->
      <tr>
        <td
          style="padding: 20px 30px; text-align: center; background-color: #03257e; border-radius: 10px 10px 0 0;"
        >
          <h2 style="margin: 0; color: #ffffff; font-size: 22px;">
            Edubuk Verification Portal
          </h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 28px 30px;">
          <p style="font-size: 16px; margin: 0 0 12px;">
            Dear <strong>Recipient</strong>,
          </p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            This email is to inform you that a document verification request has been
            initiated by a candidate through the <strong>Edubuk platform</strong>.
          </p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
            You are receiving this message for transparency and recognition purposes,
            so that the Issuer is aware that the request has been submitted by the
            candidate using Edubuk.
          </p>

          <!-- Metadata -->
          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="background-color: #f4f6fa; border-radius: 8px; margin: 20px 0; font-size: 14px;"
          >
            ${level ? `
            <tr>
              <td style="width: 40%; font-weight: bold;">Document Type</td>
              <td>${level}</td>
            </tr>` : ""}

            ${boardNameOrDegree ? `
            <tr>
              <td style="font-weight: bold;">Board / Degree</td>
              <td>${boardNameOrDegree}</td>
            </tr>` : ""}

            ${institutionName ? `
            <tr>
              <td style="font-weight: bold;">Institution Name</td>
              <td>${institutionName}</td>
            </tr>` : ""}

            ${companyName ? `
            <tr>
              <td style="font-weight: bold;">Organization Name</td>
              <td>${companyName}</td>
            </tr>` : ""}

            ${position ? `
            <tr>
              <td style="font-weight: bold;">Position / Role</td>
              <td>${position}</td>
            </tr>` : ""}

            ${organisation ? `
            <tr>
              <td style="font-weight: bold;">Organization</td>
              <td>${organisation}</td>
            </tr>` : ""}

            ${skills ? `
            <tr>
              <td style="font-weight: bold;">Skills Used</td>
              <td>${skills}</td>
            </tr>` : ""}

            ${duration ? `
            <tr>
              <td style="font-weight: bold;">Duration</td>
              <td>${duration.from} – ${duration.to}</td>
            </tr>` : ""}

            <tr>
              <td style="font-weight: bold;">Submitted On</td>
              <td>${currentDate}</td>
            </tr>
          </table>

          <!-- Important Clarification -->
          <p style="font-size: 14.5px; line-height: 1.6; margin: 18px 0;">
            <strong>Important:</strong> This email is for notification purposes only.
            No action is required from this message.
          </p>

          <p style="font-size: 14.5px; line-height: 1.6; margin: 0 0 22px;">
            A separate email has been sent to
            <strong>${emailId}</strong> with instructions to review the document
            and take appropriate verification action.
          </p>

          <!-- Read-only CTA -->
          <div style="text-align: center; margin: 26px 0;">
            <a
              href="${documentViewUrl}"
              style="display: inline-block; padding: 12px 26px; background-color: #006666; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold;"
            >
              View Submitted Document (Read-Only)
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

          <!-- Trust / Security -->
          <p style="font-size: 13.5px; color: #555; line-height: 1.6;">
            <strong>Security Notice:</strong> If this document does not belong to your
            organization or appears to have been submitted incorrectly, please report
            it immediately at
            <a
              href="mailto:support@edubukeseal.org"
              style="color: #03257e; text-decoration: none;"
            >
              support@edubukeseal.org
            </a>.
          </p>

          <p
            style="margin-top: 28px; font-size: 12.5px; color: #888; text-align: center;"
          >
            This is an automated notification sent by the Edubuk Verification System.
            Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    const message = {
      senderAddress: "support@edubukeseal.org",
      content: {
        subject: "Acknowledgement: Candidate Documents Verification",
        plainText: "This is an acknowledgement email sent from Edubuk Verification System.",
        html: html,
      },
      recipients: {
        to: [{ address: userEmail ?? emailId, displayName: "Candidate" }],
        cc: [{ address: emailId, displayName: "Issuer" }],
      },

    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
};

export const skillVerificationEmailHandler = async (emailId: string, userName: string, token: string) => {
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
            You can review the skill using the link below:
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
            This is an automated email sent by the Edubuk Verification System.
            Please do not reply to this email.
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

export const skillverificationNotifyEmailHandler = async (
  emailId: string, userName: string, userEmail: string
) => {
  try {
    const currentDate = new Date();
    const html = `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, Helvetica, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skill Verification Notification</title>
  </head>

  <body style="margin: 0; padding: 20px; background-color: #f4f6f8; color: #333;">
    <table
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);"
    >
      <!-- Header -->
      <tr>
        <td
          style="padding: 20px 30px; text-align: center; background-color: #03257e; border-radius: 10px 10px 0 0;"
        >
          <h2 style="margin: 0; color: #ffffff; font-size: 22px;">
            Edubuk Verification Portal
          </h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 28px 30px;">
          <p style="font-size: 16px; margin: 0 0 12px;">
            Dear <strong>Recipient</strong>,
          </p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            This email is to inform you that a skill endoresment request has been
            initiated by a candidate through the <strong>Edubuk platform</strong>.
          </p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
            You are receiving this message for transparency and recognition purposes,
            so that the Issuer is aware that the request has been submitted by the
            candidate using Edubuk.
          </p>

          <!-- Important Clarification -->
          <p style="font-size: 14.5px; line-height: 1.6; margin: 18px 0;">
            <strong>Important:</strong> This email is for notification purposes only.
            No action is required from this message.
          </p>

          <p style="font-size: 14.5px; line-height: 1.6; margin: 0 0 22px;">
            A separate email has been sent to
            <strong>${emailId}</strong> with instructions to review the document
            and take appropriate verification action.
          </p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

          <!-- Trust / Security -->
          <p style="font-size: 13.5px; color: #555; line-height: 1.6;">
            <strong>Security Notice:</strong> If this request does not belong to your
            organization or appears to have been submitted incorrectly, please report
            it immediately at
            <a
              href="mailto:support@edubukeseal.org"
              style="color: #03257e; text-decoration: none;"
            >
              support@edubukeseal.org
            </a>.
          </p>

          <p
            style="margin-top: 28px; font-size: 12.5px; color: #888; text-align: center;"
          >
            This is an automated notification sent by the Edubuk Verification System.
            Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    const message = {
      senderAddress: "support@edubukeseal.org",
      content: {
        subject: "Candidate Documents Verification",
        plainText: "This is a test email sent from ACS Email SDK (Node.js).",
        html: html,
      },
      recipients: {
        to: [{ address: userEmail ?? emailId, displayName: "Candidate" }],
        cc: [{ address: emailId, displayName: "Issuer" }],
      },

    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
};


export const userDocVerificationEmailHandler = async (
  emailId: string, password:string
) => {
  try {
    const currentDate = new Date();
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Welcome to TruCV</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    
    <!-- Main Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f8fb;">
        <tr>
            <td style="padding: 20px 0;">
                
                <!-- Email Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" align="center">
                    
                    <!-- Header Section -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #03257e 0%, #024a8f 100%); background-color: #03257e; padding: 40px 30px; text-align: center;">
                            
                            <!-- Logo -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; padding: 15px;">
                                            <tr>
                                                <td>
                                                    <!-- Replace with your logo URL -->
                                                    <img src="https://edubuktrucv.com/assets/truCV2-CgxWe8kD.png" alt="TruCV Logo" width="120" height="auto" style="display: block; border: 0;" />
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 15px 0 5px 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">TruCV</h1>
                                        <p style="margin: 0; font-size: 14px; color: #ffffff; opacity: 0.9;">Blockchain-Powered Credential Verification</p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Body Section -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #03257e;">Welcome to TruCV! 👋</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.8;">
                                            We're excited to have you on board! Your account has been successfully created, and you're just a few steps away from securing and verifying your professional credentials on the blockchain.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Credentials Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f9ff; border-left: 4px solid #03257e; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        
                                        <!-- Title -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #03257e;">🔐 Your Login Credentials</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Email Credential -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px;">
                                            <tr>
                                                <td style="padding: 12px;">
                                                    <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #006666; font-weight: 600;">EMAIL ADDRESS</p>
                                                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #03257e; font-family: 'Courier New', monospace; word-break: break-all;">${emailId}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Password Credential -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
                                            <tr>
                                                <td style="padding: 12px;">
                                                    <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #006666; font-weight: 600;">TEMPORARY PASSWORD</p>
                                                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #03257e; font-family: 'Courier New', monospace; word-break: break-all;">${password}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff7ed; border-left: 4px solid #f14419; border-radius: 8px; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #f14419; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ IMPORTANT SECURITY NOTICE</p>
                                        <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                                            This is a temporary password. For your security, please change it immediately after your first login. Keep your credentials confidential and never share them with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Getting Started Steps -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #03257e;">Getting Started in 4 Easy Steps</h3>
                                    </td>
                                </tr>
                                
                                <!-- Step 1 -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="36" valign="top">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="36" height="36" style="background-color: #006666; border-radius: 50%;">
                                                                    <tr>
                                                                        <td align="center" valign="middle">
                                                                            <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 16px; padding: 10px;">1</p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td width="15"></td>
                                                            <td>
                                                                <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #03257e;">Log In to Your Account</p>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5;">Click the button below and use the credentials provided above to access your TruCV dashboard.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Step 2 -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="36" valign="top">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="36" height="36" style="background-color: #006666; border-radius: 50%;">
                                                                    <tr>
                                                                        <td align="center" valign="middle">
                                                                            <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 16px; padding: 10px;">2</p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td width="15"></td>
                                                            <td>
                                                                <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #03257e;">Upload Your Documents</p>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5;">Navigate to "My Documents", Click on 'Request Verification' button to upload your education certificates, work experience letters, and awards.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Step 3 -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="36" valign="top">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="36" height="36" style="background-color: #006666; border-radius: 50%;">
                                                                    <tr>
                                                                        <td align="center" valign="middle">
                                                                            <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 16px; padding: 10px;">3</p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td width="15"></td>
                                                            <td>
                                                                <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #03257e;">Enter Issuer or any refrence Email Id</p>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5;">Enter the email id of the issuer or any reference email id that can verify your uploaded documents. For example, if you uploaded a degree certificate, you can enter the email id of the university that issued the certificate. if you uploaded your experience certificate, you can enter the email id of your previous employer. etc.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Step 4 -->
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="36" valign="top">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="36" height="36" style="background-color: #006666; border-radius: 50%;">
                                                                    <tr>
                                                                        <td align="center" valign="middle">
                                                                            <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 16px; padding: 10px;">4</p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td width="15"></td>
                                                            <td>
                                                                <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #03257e;">Request Verification</p>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.5;">Click on 'Send Email' button and our system will automatically send verification requests to your document issuers via email for authentication.</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: #006666;">
                                                    <a href="https://edubuktrucv.com/dashboard?tab=docs" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
                                                        Access My Documents →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; font-size: 13px; color: #718096;">Click here to start uploading and verifying your credentials</p>
                                    </td>
                                </tr>
                            </table>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: #03257e;">
                                                    <a href="https://edubuktrucv.com/document-verification-guide" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
                                                        Check Complete Documents Verification Guide →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; font-size: 13px; color: #718096;">Click here to check all the steps of document verification along with images</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Benefits Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3f2; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #03257e;">Why Verify Your Credentials with TruCV?</h3>
                                                </td>
                                            </tr>
                                            
                                            <!-- Benefit 1 -->
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="18" valign="top">
                                                                <p style="margin: 0; font-size: 18px; color: #006666;">✓</p>
                                                            </td>
                                                            <td width="10"></td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                                                                    <strong>Blockchain Security:</strong> Your credentials are securely stored and tamper-proof on the blockchain
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Benefit 2 -->
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="18" valign="top">
                                                                <p style="margin: 0; font-size: 18px; color: #006666;">✓</p>
                                                            </td>
                                                            <td width="10"></td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                                                                    <strong>Instant Verification:</strong> Employers can instantly verify your credentials without contacting issuers
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Benefit 3 -->
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="18" valign="top">
                                                                <p style="margin: 0; font-size: 18px; color: #006666;">✓</p>
                                                            </td>
                                                            <td width="10"></td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                                                                    <strong>Lifetime Access:</strong> Access your verified credentials anytime, anywhere, forever
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <!-- Benefit 4 -->
                                            <tr>
                                                <td>
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="18" valign="top">
                                                                <p style="margin: 0; font-size: 18px; color: #006666;">✓</p>
                                                            </td>
                                                            <td width="10"></td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                                                                    <strong>Career Advancement:</strong> Stand out with verified, trustworthy credentials that boost your profile
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Support Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px; text-align: center;">
                                        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #03257e;">Need Help?</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a5568;">Our support team is here to assist you every step of the way.</p>
                                        <a href="mailto:support@edubukeseal.org" style="color: #006666; text-decoration: none; font-weight: 600; font-size: 14px;">support@edubukeseal.org</a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer Section -->
                    <tr>
                        <td style="background-color: #f7f8fb; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <p style="margin: 0; font-size: 13px; color: #718096; line-height: 1.6;">
                                            This email was sent to ${emailId} for document upload and verification<br/>
                                            If this email id does not belongs to you, please contact us immediately.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tr>
                                                <td style="padding: 0 10px;">
                                                    <a href="https://www.linkedin.com/company/edubuk-ai-web3/" style="color: #03257e; text-decoration: none; font-size: 14px; font-weight: 500;">LinkedIn</a>
                                                </td>
                                                <td style="padding: 0 10px;">
                                                    <a href="https://x.com/edubuktrust" style="color: #03257e; text-decoration: none; font-size: 14px; font-weight: 500;">Twitter</a>
                                                </td>
                                                <td style="padding: 0 10px;">
                                                    <a href="https://edubuk.com" style="color: #03257e; text-decoration: none; font-size: 14px; font-weight: 500;">Website</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                                            © 2024 TruCV by Edubuk. All rights reserved.<br/>
                                            Blockchain-powered credential verification platform.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`

    const message = {
      senderAddress: "support@edubukeseal.org",
      content: {
        subject: "Candidate Documents Verification",
        plainText: "This is a test email sent from ACS Email SDK (Node.js).",
        html: html,
      },
      recipients: {
        to: [{ address:emailId, displayName: "Candidate" }],
      },

    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();
    return result.status;
  } catch (error) {
    console.log("error", error);
  }
};
