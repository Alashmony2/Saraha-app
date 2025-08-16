import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";

export function fileUpload() {
  const storage = diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
      cb(null, nanoid(5) + "_" + file.originalname);
    },
  });
  return multer({ storage });
}
