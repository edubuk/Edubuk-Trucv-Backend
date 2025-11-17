import { Router } from "express";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { getAllDocs, getAwardDocs, getExpDocs, getProjectsDocs, issuerEmailHandler, saveAwardDoc, saveExpDocs, saveProjects, updateAwardDoc, updateDoc, updateExpDoc, updateProjectDoc } from "../controllers/document.controller";
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
router.post("/save-projects",jwtTokenVerification,saveProjects);
router.get("/projects-docs",jwtTokenVerification,getProjectsDocs);
router.put("/update-projDoc/:id",jwtTokenVerification,updateProjectDoc);
router.post("/save-awards",jwtTokenVerification,saveAwardDoc);
router.get("/award-docs",jwtTokenVerification,getAwardDocs);
router.put("/update-awardDoc/:id",jwtTokenVerification,updateAwardDoc);
export default router;