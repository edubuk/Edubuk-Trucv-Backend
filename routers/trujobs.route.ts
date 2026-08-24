import express from "express";
import {
  checkUserHasCreatedTrucvAndOnboardedOnTrujobs,
  getCandidateDetails,
  getCandidateTruCVByUserId,
  onBoardCandidateOnTruJobsInOneClick,
  onBoardCandidateOnTruJobsInOneClickForJobsMela,
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

router.get("/get-candidate-details/:email", getCandidateDetails);

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

router.post(
  "/onboard-candidate-on-trujobs-via-jobsmela",
  // jwtTokenVerification,
  onBoardCandidateOnTruJobsInOneClickForJobsMela,
);

router.get("/health", (_req, _res) => {
  return _res.json({
    message: "TruJobs Router is healthy in TRUCV",
  });
});

export default router;
