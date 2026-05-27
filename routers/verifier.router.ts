import { Router } from "express";
import { verifyProfile } from "../controllers/profileVerification.controller";

const router = Router();

router.post("/verify-profile", verifyProfile);

export default router;