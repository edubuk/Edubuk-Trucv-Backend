import express, { Request, Response } from "express";
import { config } from "dotenv";
import { MongoConnection } from "../database/mongo.connection";
import cvRouter from "../routers/cv.router";
import uploadRouter from "../routers/upload.router";
import qrRoute from "../routers/qr.router";
import bodyParser from "body-parser";
import cors from "cors";
import { verifyGoogleToken } from "../middleware/verifyGoogleToken";

// Initialize dotenv and Express app
config();
const app = express();
MongoConnection();
// allow specific origin
// Middleware
app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/cv", cvRouter);
app.use("/file",uploadRouter);
app.use("/qr", qrRoute);
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Health is ok !",
  });
});
app.get("/api/protected", verifyGoogleToken, (req: Request, res: Response) => {
  res.json({ message: "Access granted", user: req.user });
});

app.listen(process.env.PORT || 5000, () => {
  MongoConnection();
  console.log("Backend running on PORT:", process.env.PORT);
});
// Export the app as a Vercel serverless function
export default app;
