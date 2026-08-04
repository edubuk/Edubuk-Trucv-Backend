import express from "express";
import {
  getCandidateTruCVByUserId,
  trujobsSignInAuthenticatorForAutomation,
  trujobsSignInAuthenticatorNew,
} from "../controllers/trujobs.controller";

const router = express.Router();

router.post("/authenticate-new", trujobsSignInAuthenticatorNew); //completed

router.post(
  "/authenticate-automation",
  trujobsSignInAuthenticatorForAutomation,
); //completed

router.get("/get-candidate-trucv-by-userId/:userId", getCandidateTruCVByUserId);

export default router;
