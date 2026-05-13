import { Router } from "express";
import { approveHandler, approveSkills, getRequestedData, rejectHandler, requestedSkills } from "../controllers/docVerification.controller";
import { jwtTokenVerification } from "../middleware/auth.middleware";
import { skillVerificationHandler } from "../controllers/document.controller";

const router = Router();

router.patch("/approve/:token", approveHandler);
router.patch("/reject/:token", rejectHandler);
router.post("/send-email-forSkills/:emailId",jwtTokenVerification,skillVerificationHandler)
router.get("/requested-skills/:token",requestedSkills)
router.put("/approve-skills/:token",approveSkills)
router.get("/fetch-requested-doc/:token",getRequestedData)
export default router;