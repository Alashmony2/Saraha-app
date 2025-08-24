import { Router } from "express";
import * as authService from "./auth.service.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema, resetPasswordSchema } from "./auth.validation.js";
import { isAuthenticated } from './../../middleware/auth.middleware.js';
const router = Router();

router.post("/register",isValid(registerSchema), authService.register);
router.post("/login", isValid(loginSchema) ,authService.login);
router.post("/verify-account", authService.verifyAccount);
router.post("/send-otp", authService.sendOTP);
router.post("/google-login", authService.googleLogin);
router.patch("/reset-password",isValid(resetPasswordSchema), authService.resetPassword);
router.post("/logout",isAuthenticated, authService.logout);
export default router;
