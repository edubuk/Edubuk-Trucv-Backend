import express from "express";
import { linkdeinProfileScraper } from "../../controllers/scraper/linkdein.scraper.controller";
import { jwtTokenVerification } from "../../middleware/tokenauth";

const router = express.Router();

router.post(
  "/linkdein-profile-scraper",
  jwtTokenVerification,
  linkdeinProfileScraper,
);

export default router;
