import express from "express";
import {
  getUserAllImportedLinkdeinProfiles,
  linkdeinProfileScraper,
} from "../../controllers/scraper/linkdein.scraper.controller";
import { jwtTokenVerification } from "../../middleware/tokenauth";

const router = express.Router();

router.post(
  "/linkdein-profile-scraper",
  jwtTokenVerification,
  linkdeinProfileScraper,
);
router.get(
  "/get-user-all-imported-linkdein-profiles",
  jwtTokenVerification,
  getUserAllImportedLinkdeinProfiles,
);
export default router;
