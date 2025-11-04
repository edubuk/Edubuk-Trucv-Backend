
import { EmailClient } from "@azure/communication-email";
import { configDotenv } from "dotenv";
configDotenv();
//console.log(process.env["ACS_CONNECTION_STRING"]);
const connectionString = process.env.ACS_CONNECTION_STRING as string; // from Azure portal
const client = new EmailClient(connectionString);
//console.log({client})
export const sendResetLinkEMail = async (emailId: string, resetToken: string) => {
    try {
        // change this to your client URL (frontend route that accepts the raw token)
        const CLIENT_URL = process.env.CLIENT_URL || "https://edubuktrucv.com";
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
        src="https://firebasestorage.googleapis.com/v0/b/cv-on-blockchain.appspot.com/o/1743838131332Logo%20with%20name.png?alt=media&token=30ed7206-368a-4c78-8c9a-8a0d029dba32"
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


