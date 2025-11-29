import { Router } from "express";
import { digilockerCallback, fetchDocType, fetchDocuments, fetchIssuer, getIssuer, fetchProfile,saveVerifier, pullParams, fetchDocUri, viewDoc } from "../controllers/digilocker.controller";
import { jwtTokenVerification } from "../middleware/tokenauth";
//import { viewDoc } from "../controllers/cv.controller";

const router = Router();

router.get("/callback",jwtTokenVerification, digilockerCallback);
router.post("/save-verifier", saveVerifier);
router.get("/me", fetchProfile);
router.get("/issuers", fetchIssuer);
router.get("/doctype", fetchDocType);
router.get("/issued", fetchDocuments);
router.get("/getIssuer", getIssuer);
router.post("/pullParams", pullParams);
router.post("/fetchDocUri", fetchDocUri);
router.get("/view-doc", viewDoc);



export default router;
