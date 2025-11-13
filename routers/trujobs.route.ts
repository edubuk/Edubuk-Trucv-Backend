import express from "express";
import {
  getCandidateTruCVByTrucvId,
  getCandidateTruCVsByUserId,
  trujobsSignInAuthenticator,
} from "../controllers/trujobs.controller";

const router = express.Router();

router.post("/authenticate", trujobsSignInAuthenticator);
router.get("/get-candidate-trucvs/:userId", getCandidateTruCVsByUserId);
router.get(
  "/get-candidate-trucv-by-trucvid/:trucvId",
  getCandidateTruCVByTrucvId
);

export default router;
