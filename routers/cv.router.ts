import { Router } from "express";
import { createCv, getUserCVIds, getCv,getCvByNanoId,verifyDoc } from "../controllers/cv.controller";
import { checkout, couponVerification, paymentVerification } from "../controllers/payment.controller";
import { jwtTokenVerification } from "../middleware/auth.middleware";
import { createUserCV, cvParse, DeleteCvData, fetchCvData, userCvs } from "../controllers/newCv.controller";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/create",jwtTokenVerification, createCv);
router.get("/getCv/:id", jwtTokenVerification, getCv);
router.get("/getCvByNanoId/:nanoId",getCvByNanoId);
//router.get("/getCvIds/:email",verifyGoogleToken,getAllCvIds)
router.get("/cv-ids",jwtTokenVerification,getUserCVIds);
router.get("/verifyDoc/:pinataHash/:field/:subfield/:nanoId",verifyDoc);
router.put("/verifyDoc/:pinataHash/:field/:subfield/:nanoId", verifyDoc);
router.get("/coupon_verify",jwtTokenVerification,couponVerification);
router.post("/checkout",jwtTokenVerification,checkout);
router.post("/payment_verification",jwtTokenVerification,paymentVerification);
router.post("/create-cv",jwtTokenVerification,createUserCV);
router.get("/user-cvs",jwtTokenVerification,userCvs);
router.get("/user-cv/:id",fetchCvData);
router.delete("/delete-cv/:id",jwtTokenVerification,DeleteCvData);
router.post("/cv-parse",jwtTokenVerification,upload.single("file"),cvParse);
export default router;
