import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs";

export function fileUpload({
  folder,
  allowedType = ["image/png", "image/jpeg", "image/webp"],
} = {}) {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      let dest = `uploads/${req.user._id}/${folder}`;
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest,{recursive:true});
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, nanoid(5) + "_" + file.originalname);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file formate"), false);
    }
  };
  return multer({ fileFilter, storage });
}
