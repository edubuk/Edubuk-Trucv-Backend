import { Router } from "express";
import { getUsers, updateSubscriptionPlan } from "../controllers/admin.controller";
// import { verifyGoogleToken } from "../middleware/verifyGoogleToken";
// import { jwtTokenVerification } from "../middleware/tokenauth";
// import { isAdmin } from "../middleware/adminAuth";
import { getAllDocs } from "../controllers/document.controller";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { isAdmin } from "../middleware/adminAuth";
import { userCvs } from "../controllers/newCv.controller";

const router = Router();

router.get("/users-list",jwtTokenVerification,isAdmin,getUsers);
router.get("/user-docs",jwtTokenVerification,isAdmin,getAllDocs);
router.get("/user-cvs",jwtTokenVerification,isAdmin,userCvs);
router.put("/updateSubscriptionPlan",jwtTokenVerification,isAdmin,updateSubscriptionPlan);

export default router;