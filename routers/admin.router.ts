import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { verifyGoogleToken } from "../middleware/verifyGoogleToken";

const router = Router();

router.get("/getAllUser",verifyGoogleToken, adminController);

export default router;