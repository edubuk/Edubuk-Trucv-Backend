import { Router } from "express";
import { searchProfiles } from "../controllers/searchProfile.controller";

const router = Router();

router.get("/search-profiles", searchProfiles);
export default router;
