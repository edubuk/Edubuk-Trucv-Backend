import express, { Request, Response } from "express";
import { configDotenv } from "dotenv";
configDotenv();
import { MongoConnection } from "../database/mongo.connection";
import bodyParser from "body-parser";
import digilockerRouter from "../routers/digilocker.router";
import cors from "cors";
import { swaggerSpec, swaggerUiSetup } from "../swagger";
import cookieParser from "cookie-parser";
import cron from "node-cron";
//import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import docRouter from "../routers/documents.router";
import cvRouter from "../routers/cv.router";
import uploadRouter from "../routers/upload.router";
import qrRoute from "../routers/qr.router";
import userRouter from "../routers/user.router";
import adminRouter from "../routers/admin.router";
import trujobsRouter from "../routers/trujobs.route";
import approvalRouter from "../routers/approval.router";
import verifierRouter from "../routers/verifier.router";
import IssuerData from "../states/state";
import { fetchIssuer } from "../controllers/digilocker.controller";
import hackathonRouter from "../routers/hackathon.router";
import certificationRouter from "../routers/certification.router";
import ApifyScraperRouter from "../routers/scraper/apify-scraper-route";
import searchRouter from "../routers/search.router";
import couponRouter from "../routers/coupon.router";
import subscriptionRouter from "../routers/subscription.router";
import mongoSanitize from "express-mongo-sanitize";
//import backfillSearchProfiles from "../controllers/backfillSearchProfiles.controller";

const app = express();
MongoConnection();
// allow specific origin
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://edubuktrucv.com",
      "https://www.edubuktrucv.com",
      "https://dev-frontend.edubuktrucv.com",
      "https://www.dev-frontend.edubuktrucv.com",
      "https://static-web-app.edubuktrujobs.com",
      "https://www.static-web-app.edubuktrujobs.com",
      "https://eni.edubuktrucv.com",
      "https://www.eni.edubuktrucv.com",
      "https://edubuktrujobs.com",
      "https://www.edubuktrujobs.com",
      "https://www.trucv.org",
      "https://trucv.org",
      "https://educhain.edubuktrucv.com",
      "https://www.educhain.edubuktrucv.com",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(mongoSanitize());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // React needs this
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://digilocker.meripehchaan.gov.in/public/oauth2",
        "https://ochub.com",
      ],
      fontSrc: ["'self'", "data:"],
      frameSrc: ["'self'"],
      frameAncestors: [ // THIS IS THE KEY ONE
        "'self'",
        "https://hub.sandbox.opencampus.xyz",
        "http://localhost:3000"
      ]
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// app.use(
//   rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 500, // limit each IP to 500 requests per 5 minutes
//   })
// );
//add
app.get('/api/dl/callback', (req, res, next) => {
  // Remove ALL helmet headers
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  
  // Set permissive headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/api-docs", swaggerUiSetup.serve, swaggerUiSetup.setup(swaggerSpec));
app.use("/api/v1/scraper", ApifyScraperRouter);
app.use("/api/v1/doc", docRouter);
app.use("/api/v1/cv", cvRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/file", uploadRouter);
app.use("/api/v1/qr", qrRoute);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/trujobs", trujobsRouter);
app.use("/api/dl", digilockerRouter);
app.use("/api/v1/issuer", approvalRouter);
app.use("/api/v1/hackathon", hackathonRouter);
app.use("/api/v1/certification", certificationRouter);
app.use("/api/v1/verifier", verifierRouter);    
app.use("/api/v1/search", searchRouter);  
app.use("/api/v1/coupons", couponRouter);    
app.use("/api/v1/subscription", subscriptionRouter); 

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Trucv-Backend-Prod Health is ok !",
  });
});

cron.schedule(
  "03 15 1 * *",
  () => {
    (async () => {
      const issuers = await fetchIssuer();
      IssuerData.data = issuers.issuers;
      IssuerData.lastFetched = Date.now();
      //console.log("issuers",issuers);
      //console.log("IssuerData",IssuerData);
    })();
  },
  { timezone: "Asia/Kolkata" },
);



app.listen(process.env.PORT || 5000, () => {
  MongoConnection();
  console.log("Backend running on PORT:", process.env.PORT);
});
// Export the app as a Vercel serverless function
export default app;

