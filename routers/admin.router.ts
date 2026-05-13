import { Router } from "express";
import { allUserCvs, getReqDocForDigiLocker, getUsers, updateSubscriptionPlan } from "../controllers/admin.controller";
import { getAllDocs } from "../controllers/document.controller";
import { jwtTokenVerification } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/adminAuth";
import { userCvs } from "../controllers/newCv.controller";
import { getHackathonCertificateList, registerHackathon, deleteHackathon, getHackathonCertificatesById, updateHackathonStatus } from "../controllers/hackathon.controller";

const router = Router();

router.get("/users-list",jwtTokenVerification,isAdmin,getUsers);
router.get("/user-docs",jwtTokenVerification,isAdmin,getAllDocs);
router.get("/user-cvs",jwtTokenVerification,isAdmin,userCvs);
router.put("/updateSubscriptionPlan",jwtTokenVerification,isAdmin,updateSubscriptionPlan);
router.get("/hackathon-certificate-list",jwtTokenVerification,isAdmin,getHackathonCertificateList);
router.get("/all-user-cvs",jwtTokenVerification,isAdmin,allUserCvs);
router.get("/get-requested-doc",jwtTokenVerification,isAdmin,getReqDocForDigiLocker);
router.post("/register-hackathon",jwtTokenVerification,isAdmin,registerHackathon);
router.delete("/delete-hackathon/:id",jwtTokenVerification,isAdmin,deleteHackathon);
router.get("/get-hackathon-certificates/:hackathonId",jwtTokenVerification,isAdmin,getHackathonCertificatesById);
router.put("/update-hackathon-status/:hackathonId",jwtTokenVerification,isAdmin,updateHackathonStatus);

export default router;