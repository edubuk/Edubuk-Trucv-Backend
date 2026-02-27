import express from "express";
import { linkdeinProfileScraper } from "../../controllers/scraper/linkdein.scraper.controller";

const router = express.Router();

router.get("/linkdein-profile-scraper", linkdeinProfileScraper);

export default router;
