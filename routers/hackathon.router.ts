import { Router } from "express";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { isEmailPresentInSheet, getCertificationData } from "../controllers/hackathon.controller";

const router = Router();

router.get("/is-email-present",jwtTokenVerification,isEmailPresentInSheet);
router.get("/certification-data",jwtTokenVerification,getCertificationData);
export default router;
