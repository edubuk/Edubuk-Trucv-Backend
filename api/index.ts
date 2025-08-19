import express, { Request, Response } from "express";
import { config } from "dotenv";
import { MongoConnection } from "../database/mongo.connection";
import cvRouter from "../routers/cv.router";
import uploadRouter from "../routers/upload.router";
import qrRoute from "../routers/qr.router";
import adminRouter from "../routers/admin.router";
import bodyParser from "body-parser";
import cors from "cors";

// Initialize dotenv and Express app
config();
const app = express();
MongoConnection();
// allow specific origin
// Middleware
app.use(cors({origin:["http://localhost:5173","http://edubuktrucv.com","https://www.edubuktrucv.com"]}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/cv", cvRouter);
app.use("/file",uploadRouter);
app.use("/qr", qrRoute);
app.use("/admin", adminRouter);
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Health is ok !",
  });
});



app.listen(process.env.PORT || 5000, () => {
  MongoConnection();
  console.log("Backend running on PORT:", process.env.PORT);
});
// Export the app as a Vercel serverless function
export default app;
