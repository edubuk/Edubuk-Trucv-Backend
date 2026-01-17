import { Router } from "express";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { isEmailPresentInSheet } from "../controllers/hackathon.controller";

const router = Router();

router.get("/is-email-present",jwtTokenVerification,isEmailPresentInSheet);

export default router;
