import { Router } from "express";
import { dynamicQrUrlMap, dynamicQrRedirect } from "../controllers/dynamicQr.Controller";

const router = Router();

//router
router.post("/url-map", dynamicQrUrlMap);
router.get("/:id", dynamicQrRedirect);

export default router;