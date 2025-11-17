import express, { Request, Response } from "express";
import { config } from "dotenv";
import { MongoConnection } from "../database/mongo.connection";
import cvRouter from "../routers/cv.router";
import uploadRouter from "../routers/upload.router";
import qrRoute from "../routers/qr.router";
import userRouter from "../routers/user.router";
import adminRouter from "../routers/admin.router";
import bodyParser from "body-parser";
import digilockerRouter from "../routers/digilocker.router";
import cors from "cors";
import { swaggerSpec, swaggerUiSetup } from "../swagger";
import trujobsRouter from "../routers/trujobs.route";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import docRouter from "../routers/education.router";
import IssuerData from "../states/state";
import { fetchIssuer } from "../controllers/digilocker.controller";
import session from "express-session";
// Initialize dotenv and Express app
config();
const app = express();
MongoConnection();
// allow specific origin
// Middleware
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


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    name: 'sid', // cookie name
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true for HTTPS
      httpOnly: true,
      sameSite: 'none', // needed for cross-domain requests
      maxAge: 24 * 60 * 60 * 1000*7, // 1 day
    },
  })
)

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
app.use("/api/dl",digilockerRouter)
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Health is ok !",
  });
});

cron.schedule("*/5 * * * *", () => {
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
