import { Router } from "express";
import { createCv, getAllCvIds, getCv,getCvByNanoId,verifyDoc } from "../controllers/cv.controller";
import { checkCvSubmittedStatus, checkout, couponVerification, paymentVerification, updateCvSubmittedStatus } from "../controllers/payment.controller";
import { getOrderHistory} from "../controllers/oktoapi.controller";
import { rawTransaction } from "../controllers/rawTransaction";
import { pdfMakerController } from "../controllers/pdfMaker.controller";
import { verifyGoogleToken } from "../middleware/verifyGoogleToken";

const router = Router();

router.post("/create",verifyGoogleToken, createCv);
router.get("/getCv/:id", getCv);
router.get("/getCvByNanoId/:nanoId", getCvByNanoId);
router.get("/getCvIds/:email",verifyGoogleToken,getAllCvIds)
router.get("/verifyDoc/:pinataHash/:field/:subfield/:nanoId",verifyDoc);
router.put("/verifyDoc/:pinataHash/:field/:subfield/:nanoId", verifyDoc);
router.get("/coupon_verify",couponVerification);
router.post("/checkout",checkout);
router.post("/payment_verification",paymentVerification);
router.get("/check_cv_status/:paymentId",checkCvSubmittedStatus);
router.put("/update_cv_status",updateCvSubmittedStatus);
router.post("/exerawtx",rawTransaction);
router.get("/gettxstatus/:intentId/:intentType",getOrderHistory);
//router.get("/get_bulkorder_details/:twUserId/:bulkOrderId",getBulkOrderDetails)
router.post("/pdfmaker",verifyGoogleToken,pdfMakerController);
export default router;
