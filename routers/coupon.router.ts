import { Router } from "express";
import * as couponController from "../controllers/coupon.controller";

const router = Router();

router.post("/create", couponController.createCoupon);
router.put("/update/:couponId", couponController.updateCoupon);
router.delete("/delete/:couponId", couponController.deleteCoupon);
router.post("/validate", couponController.validateCoupon);
router.get("/list", couponController.getListOfCoupons);
export default router;
