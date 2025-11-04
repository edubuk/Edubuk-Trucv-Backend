import { Router } from "express";
import { getUsers, updateSubscriptionPlan } from "../controllers/admin.controller";
import { verifyGoogleToken } from "../middleware/verifyGoogleToken";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { isAdmin } from "../middleware/adminAuth";

const router = Router();

router.get("/users-list",jwtTokenVerification,isAdmin, getUsers);
router.put("/updateSubscriptionPlan",jwtTokenVerification,isAdmin, updateSubscriptionPlan);

export default router;