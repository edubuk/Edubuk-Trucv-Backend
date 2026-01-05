import { Router } from "express";
import { approveHandler, approveSkills, rejectHandler, requestedSkills } from "../controllers/docVerification.controller";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { skillVerificationHandler } from "../controllers/document.controller";

const router = Router();

router.get("/approve/:token", approveHandler);
router.get("/reject/:token", rejectHandler);
router.post("/send-email-forSkills/:emailId",jwtTokenVerification,skillVerificationHandler)
router.get("/requested-skills/:token",requestedSkills)
router.put("/approve-skills/:token",approveSkills)
export default router;