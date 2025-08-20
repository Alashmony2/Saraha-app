import { Router } from "express";
import * as userService from "./user.service.js";
import { fileUpload } from "../../utils/multer/multer.local.js";
import { fileUpload as fileUploadCloud } from "./../../utils/multer/multer.cloud.js";
import { fileValidationMiddleware } from "../../middleware/file-validation.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const router = Router();
router.delete("/", userService.deleteAccount);
router.post(
  "/upload-profile-picture",
  isAuthenticated,
  fileUpload({ folder: "profile-pictures" }).single("profilePic"),
  fileValidationMiddleware(),
  userService.uploadProfilePicture
);
router.post(
  "/upload-profile-cloud",
  isAuthenticated,
  fileUploadCloud().single("profilePicture"),
  userService.uploadProfilePictureCloud
);
export default router;
