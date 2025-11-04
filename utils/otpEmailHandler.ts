
import { EmailClient } from "@azure/communication-email";
import { configDotenv } from "dotenv";
configDotenv();
//console.log(process.env["ACS_CONNECTION_STRING"]);
const connectionString = process.env.ACS_CONNECTION_STRING as string; // from Azure portal
const client = new EmailClient(connectionString);
//console.log({client})
export const otpEmailHandler = async(emailId:string,otp:string)=>{
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
        This code will expire in <strong>10 minutes</strong>.
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

  </div>`
    },
    recipients: {
      to: [{ address: emailId, displayName: "Recipient" }]
    }
  };

  const poller = await client.beginSend(message);
  const result = await poller.pollUntilDone();
  return result.status;
    } catch (error) {
      console.log("error",error)
    }
}

// export const sendOtpEmail = async (emailId:string, otp:string) => {
//     const html = `
//   <div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5eaf0;border-radius:10px;">
    
//     <!-- Header -->
//     <div style="text-align:center;padding:25px 20px 10px;">
//       <img 
//         src="https://firebasestorage.googleapis.com/v0/b/cv-on-blockchain.appspot.com/o/1743838131332Logo%20with%20name.png?alt=media&token=30ed7206-368a-4c78-8c9a-8a0d029dba32" 
//         alt="Edubuk Logo" 
//         style="width:120px;margin-bottom:10px;"
//       />
//       <h2 style="font-size:18px;margin:10px 0;color:#03257e;font-weight:600;">
//         Email Verification Code
//       </h2>
//     </div>

//     <!-- Body -->
//     <div style="padding:20px 25px;text-align:left;color:#222;">
//       <p style="margin:0 0 12px; font-size:14px;">Dear <strong>${emailId}</strong>,</p>

//       <p style="margin:0 0 12px; font-size:14px;">
//         Please use the following one-time password (OTP) to verify your email address with <strong>Edubuk</strong>:
//       </p>

//       <p style="font-size:28px;font-weight:bold;color:#03257e;text-align:center;letter-spacing:4px;margin:25px 0;">
//         ${otp}
//       </p>

//       <p style="margin:0 0 12px; font-size:14px;">
//         This code will expire in <strong>10 minutes</strong>.
//       </p>

//       <p style="margin:0; font-size:14px;">
//         For your security, do not share this code with anyone. 
//         Our support team will never ask for your OTP.
//       </p>
//     </div>

//     <!-- Footer -->
//     <div style="background:#03257e;color:#fff;text-align:center;padding:18px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;">
//       <p style="margin:0 0 6px;font-size:14px;">Best regards,</p>
//       <p style="margin:0 0 10px;font-size:16px;font-weight:bold; color:#ffffff;">Team Edubuk</p>
//       <p style="margin:0;font-size:13px; color:#ffffff;">
//         💻 <a href="https://edubukeseal.org" style="color:#ffffff;text-decoration:none;">edubukeseal.org</a> 
//         | 📧 <a href="mailto:support@edubuk.com" style="color:#ffffff;text-decoration:none;">support@edubuk.com</a> 
//         | 📞 +91 9250411261
//       </p>
//       <p style="margin-top:8px;font-size:11px;opacity:0.8;">© 2025 Edubuk. All rights reserved.</p>
//     </div>

//   </div>
// `;

  
//     try {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: "edubuk.notification@gmail.com",
//           pass: process.env.EmailPass,
//         },
//       });
  
//       const info = await transporter.sendMail({
//         from: '"Edubuk" <edubuk.notification@gmail.com>',
//         to: emailId,
//         subject: "Your Edubuk Verification Code",
//         html,
//       });
  
//       return { success: true, info };
//     } catch (error) {
//       console.error("ERROR:WHILE SENDING MAIL", error);
//       return { success: false, error };
//     }
//   };
  