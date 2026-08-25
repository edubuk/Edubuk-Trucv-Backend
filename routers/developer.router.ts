import { Router } from "express";
import * as developerController from "../controllers/developer.controller";
import { developerAuthMiddleWare } from "../middleware/developerAuth.middleware";

const router = Router();

router.post("/sign-in", developerController.developerSignIn);
router.get("/auth", developerAuthMiddleWare, developerController.checkValidDeveloperUser);
router.get("/me", developerAuthMiddleWare, developerController.getCurrentDeveloper);
router.post("/logout", developerController.logoutDeveloper);

router.post("/debug/request", developerAuthMiddleWare, developerController.requestDebugSession);
router.post("/debug/confirm", developerAuthMiddleWare, developerController.confirmDebugSession);

export default router;
