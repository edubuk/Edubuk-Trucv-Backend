import { Router } from "express";
import { fetchSubscription, updatePoints } from "../controllers/subscription.controller";

const subscriptionRouter = Router();


subscriptionRouter.get("/fetch", fetchSubscription);

subscriptionRouter.patch("/update-points", updatePoints);

export default subscriptionRouter;