import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();
router.delete("/", userService.deleteAccount);
export default router;
