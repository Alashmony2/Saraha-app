import { Router } from "express";
import * as userService from "./user.service.js";
import { fileUpload } from "../../utils/multer/index.js";
import { fileValidationMiddleware } from "../../middleware/file-validation.middleware.js";

const router = Router();
router.delete("/", userService.deleteAccount);
router.post(
  "/upload-profile-picture",
  fileUpload().single("profilePic"),
  fileValidationMiddleware(),
  userService.uploadProfilePicture
);
export default router;
