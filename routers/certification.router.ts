import { Router } from "express";
import { uploadCertificate } from "../controllers/skaleTx.controller";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { dynamicQrUrlMap } from "../controllers/dynamicQr.Controller";


const router = Router();

router.put("/register-on-chain",jwtTokenVerification, uploadCertificate );
router.put("/dynamicQrUrlMap", jwtTokenVerification, dynamicQrUrlMap);
export default router;
