import { Router } from "express";
import { fileUpload } from "./../../utils/multer/multer.cloud.js";
import { isValid } from "./../../middleware/validation.middleware.js";
import { sendMessageSchema } from "./message.validation.js";
import { sendMessage } from "./message.service.js";

const router = Router();
router.post(
  "/:receiver",
  fileUpload().array("attachments", 2),
  isValid(sendMessageSchema),
  sendMessage
);

export default router;
