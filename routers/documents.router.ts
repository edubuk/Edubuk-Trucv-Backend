import { Router } from "express";
import { jwtTokenVerification } from "../middleware/tokenauth";
import { deleteAwardDoc, deleteEduDoc, deleteExpDoc, deleteProjectDoc, deleteSkillDoc, getAllDocs, getAwardDocs, getExpDocs, getProjectsDocs, getSkills, saveAwardDoc, saveExpDocs, saveProjects, saveSkills, updateAwardDoc, updateDoc, updateExpDoc, updateProjectDoc } from "../controllers/document.controller";
import { saveDocuments } from "../controllers/document.controller";
import { getEducationDocs } from "../controllers/document.controller";
const router = Router();


// router.post("/email-issuer",jwtTokenVerification,issuerEmailHandler);
router.post("/save-eduDoc",jwtTokenVerification,saveDocuments);
router.get("/education-docs",jwtTokenVerification,getEducationDocs);
router.patch("/update-eduDoc/:id",jwtTokenVerification,updateDoc);
router.delete("/delete-eduDoc/:id",jwtTokenVerification,deleteEduDoc);

router.post("/save-expDoc",jwtTokenVerification,saveExpDocs);
router.get("/experience-docs",jwtTokenVerification,getExpDocs);
router.put("/update-expDoc/:id",jwtTokenVerification,updateExpDoc);
router.delete("/delete-expDoc/:id",jwtTokenVerification,deleteExpDoc);

router.get("/user-docs",jwtTokenVerification,getAllDocs);

router.post("/save-projects",jwtTokenVerification,saveProjects);
router.get("/projects-docs",jwtTokenVerification,getProjectsDocs);
router.put("/update-projDoc/:id",jwtTokenVerification,updateProjectDoc);
router.delete("/delete-projDoc/:id",jwtTokenVerification,deleteProjectDoc);

router.post("/save-awards",jwtTokenVerification,saveAwardDoc);
router.get("/award-docs",jwtTokenVerification,getAwardDocs);
router.put("/update-awardDoc/:id",jwtTokenVerification,updateAwardDoc);
router.delete("/delete-awardDoc/:id",jwtTokenVerification,deleteAwardDoc);

router.post("/save-skills",jwtTokenVerification,saveSkills);
router.get("/skill-docs",jwtTokenVerification,getSkills);
router.delete("/delete-skillDoc/:id",jwtTokenVerification,deleteSkillDoc);
export default router;