import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { jwtTokenVerification } from "../middleware/auth.middleware";
//import { getUserCVIds } from "../controllers/cv.controller";

const router = Router();


/**
 * @swagger
 * /user/generateOtp:
 *   post:
 *     summary: Generate OTP and send to user's email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request or failed to send OTP
 */
router.post("/generateOtp", userController.generateOtp);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request or failed to register user
 */
router.post("/register", userController.registerUser);
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid request or failed to login user
 */
router.post("/login", userController.loginUser);
/**
 * @swagger
 * /api/logout:
 *   put:
 *     summary: Logout a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Invalid request or failed to logout user
 */
router.put("/logout",jwtTokenVerification, userController.logoutUser)

router.post("/refresh-token", userController.refreshAccessToken)

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *       400:
 *         description: Invalid request or failed to fetch user details
 */

router.get("/profile",jwtTokenVerification, userController.getUser)

/**
 * @swagger
 * /api/user-docs:
 *   get:
 *     summary: Get user documents
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *       400:
 *         description: Invalid request or failed to fetch documents
 */

router.get("/user-docs", userController.userDocs)


/**
 * @swagger
 * /user/subscription:
 *   get:
 *     summary: Get user subscription
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription fetched successfully
 *       400:
 *         description: Invalid request or failed to fetch subscription
 */

router.get("/subscription",jwtTokenVerification, userController.userSubscription)

/**
 * @swagger
 * /user/password-reset-link:
 *   post:
 *     summary: Get reset password link
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset password link sent successfully
 *       400:
 *         description: Invalid email or user not found
 *       500:
 *         description: Internal server error
 */
router.post("/password-reset-link", userController.sendResetLink);

/**
 * @swagger
 * /user/update-password:
 *   post:
 *     summary: Update user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a06481aab0ff121410bdaaa2d823ab285dddef6b3a1a162248b6f06a068d59e8"
 *               password:
 *                 type: string
 *                 example: "abdc@#133"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post("/update-password", userController.updatePassword);

router.delete("/delete-userData",jwtTokenVerification,userController.deleteUserData)

router.put("/update-userInfo",userController.updateUserInfo)

router.post("/ocid-register",jwtTokenVerification,userController.ocidRegisterUser)

export default router;