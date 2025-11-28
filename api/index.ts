import express, { Request, Response } from "express";
import { config } from "dotenv";
import { MongoConnection } from "../database/mongo.connection";
import bodyParser from "body-parser";
import digilockerRouter from "../routers/digilocker.router";
import cors from "cors";
import { swaggerSpec, swaggerUiSetup } from "../swagger";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import docRouter from "../routers/education.router";
import cvRouter from "../routers/cv.router";
import uploadRouter from "../routers/upload.router";
import qrRoute from "../routers/qr.router";
import userRouter from "../routers/user.router";
import adminRouter from "../routers/admin.router";
import trujobsRouter from "../routers/trujobs.route";
import approvalRouter from "../routers/approval.router"
import IssuerData from "../states/state";
import { fetchIssuer } from "../controllers/digilocker.controller";

// Initialize dotenv and Express app
config();
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
      "https://static-web-app.edubuktrujobs.com",
      "https://www.static-web-app.edubuktrujobs.com",
      "https://edubuktrujobs.com",
      "https://www.edubuktrujobs.com",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // limit each IP to 100 requests per 15 minutes
  })
);


app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   session({
//     name: process.env.SESSION_NAME || "sid",
//     secret: process.env.SESSION_SECRET || "default-secret", // MUST be set in production
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",  // requires HTTPS
//       httpOnly: true,                                // prevents XSS cookie access
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     },

//     proxy: process.env.NODE_ENV === "production", // trust reverse proxy (NGINX/Cloudflare)
//   })
// );

// Routes
app.use("/api-docs", swaggerUiSetup.serve, swaggerUiSetup.setup(swaggerSpec));
app.use("/api-docs",swaggerUiSetup.serve,swaggerUiSetup.setup(swaggerSpec));
app.use("/doc",docRouter);
app.use("/cv", cvRouter);
app.use("/user", userRouter);
app.use("/file", uploadRouter);
app.use("/qr", qrRoute);
app.use("/admin", adminRouter);
app.use("/trujobs", trujobsRouter);
app.use("/api/dl",digilockerRouter);
app.use("/issuer",approvalRouter)
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Health is ok and ci/cd is implemented !",
  });
});

cron.schedule("0 2 * * *", () => {
  (async()=>{
    const issuers = await fetchIssuer();
    IssuerData.data = issuers.issuers;
    IssuerData.lastFetched = Date.now();
    //console.log("issuers",issuers);
    //console.log("IssuerData",IssuerData);
  })();
},{timezone:"Asia/Kolkata"})

app.listen(process.env.PORT || 5000, () => {
  MongoConnection();
  console.log("Backend running on PORT:", 5000);
});
// Export the app as a Vercel serverless function
export default app;
