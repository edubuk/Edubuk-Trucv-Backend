import express from "express";
import {
  checkUserHasCreatedTrucvAndOnboardedOnTrujobs,
  getCandidateTruCVByUserId,
  onBoardCandidateOnTruJobsInOneClick,
  trujobsSignInAuthenticatorForAutomation,
  trujobsSignInAuthenticatorNew,
} from "../controllers/trujobs.controller";
import { jwtTokenVerification } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/authenticate-new", trujobsSignInAuthenticatorNew); //completed

router.post(
  "/authenticate-automation",
  trujobsSignInAuthenticatorForAutomation,
); //completed

router.get("/get-candidate-trucv-by-userId/:userId", getCandidateTruCVByUserId);

//  trujobs auto onboarding;
router.get(
  "/check-user-onboarded-on-trujobs",
  jwtTokenVerification,
  checkUserHasCreatedTrucvAndOnboardedOnTrujobs,
);

router.post(
  "/onboard-candidate-on-trujobs",
  jwtTokenVerification,
  onBoardCandidateOnTruJobsInOneClick,
);
export default router;
