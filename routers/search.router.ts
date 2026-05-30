import { Router } from "express";
import { searchCVsByFilter } from "../controllers/search.controller";

const router = Router();

router.get("/search", searchCVsByFilter);

export default router;
