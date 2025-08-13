import { Router } from "express";
import * as authService from "./auth.service.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
const router = Router();

router.post("/register",isValid(registerSchema), authService.register);
router.post("/login", isValid(loginSchema) ,authService.login);
router.post("/verify-account", authService.verifyAccount);
router.post("/resend-otp", authService.resendOTP);
router.post("/google-login", authService.googleLogin);
export default router;
