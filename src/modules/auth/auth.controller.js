import { Router } from "express";
import * as authService from "./auth.service.js";
const router = Router();

router.post("/register", authService.register);
router.post("/login", authService.login);
router.post("/verify-account", authService.verifyAccount);
router.post("/resend-otp", authService.resendOTP);
router.post("/google-login", authService.googleLogin);
export default router;
