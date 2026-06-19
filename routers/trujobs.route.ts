import express from "express";
import {
  getCandidateTruCVByTrucvId,
  getCandidateTruCVByUserId,
  trujobsSignInAuthenticator,
  trujobsSignInAuthenticatorNew,
} from "../controllers/trujobs.controller";

const router = express.Router();

router.post("/authenticate-new", trujobsSignInAuthenticatorNew);//completed

router.get(
  "/get-candidate-trucv-by-userId/:userId",
  getCandidateTruCVByUserId,
);

export default router;
