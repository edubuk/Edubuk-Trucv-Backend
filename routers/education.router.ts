import { Router } from "express";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { getAllDocs, getExpDocs, issuerEmailHandler, saveExpDocs, updateDoc, updateExpDoc } from "../controllers/document.controller";
import { saveDocuments } from "../controllers/document.controller";
import { getEducationDocs } from "../controllers/document.controller";
const router = Router();


router.post("/email-issuer",jwtTokenVerification,issuerEmailHandler);
router.post("/save-doc",jwtTokenVerification,saveDocuments);
router.get("/education-docs",jwtTokenVerification,getEducationDocs);
router.put("/update-doc/:id",jwtTokenVerification,updateDoc);
router.post("/save-expDoc",jwtTokenVerification,saveExpDocs);
router.get("/experience-docs",jwtTokenVerification,getExpDocs);
router.put("/update-expDoc/:id",jwtTokenVerification,updateExpDoc);
router.get("/user-docs",jwtTokenVerification,getAllDocs);

export default router;