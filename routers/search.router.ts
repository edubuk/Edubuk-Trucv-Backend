import { Router } from "express";
import { searchCVsByFilter } from "../controllers/search.controller";
import { searchProfiles } from "../controllers/searchProfile.controller";

const router = Router();

router.get("/search", searchCVsByFilter);
router.get("/search-profiles", searchProfiles);
export default router;
