import { Router } from "express";
import { getUsers, updateSubscriptionPlan } from "../controllers/admin.controller";
// import { verifyGoogleToken } from "../middleware/verifyGoogleToken";
// import { jwtTokenVerification } from "../middleware/tokenauth";
// import { isAdmin } from "../middleware/adminAuth";
import { getAllDocs } from "../controllers/document.controller";

const router = Router();

router.get("/users-list",getUsers);
router.get("/user-docs",getAllDocs);
router.put("/updateSubscriptionPlan",updateSubscriptionPlan);

export default router;