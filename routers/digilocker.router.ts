import { Router } from "express";
import { digilockerCallback, fetchDocType, fetchDocuments, fetchIssuer, getIssuer, fetchProfile, fetchXCert, saveVerifier } from "../controllers/digilocker.controller";
//import { viewDoc } from "../controllers/cv.controller";

const router = Router();

router.get("/callback", digilockerCallback);
router.post("/save-verifier", saveVerifier);
router.get("/me", fetchProfile);
router.get("/issuers", fetchIssuer);
router.get("/doctype", fetchDocType);
router.get("/XCert", fetchXCert);
router.get("/issued", fetchDocuments);
router.get("/getIssuer", getIssuer);
//router.get("/view-doc", viewDoc);
//router.get("/dl/file", fetchFile);


export default router;
