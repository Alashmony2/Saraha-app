import multer, { diskStorage } from "multer";

export function fileUpload({allowedType = ["image/png", "image/jpeg", "image/webp"]} = {}) {
  const storage = diskStorage({});
  
  const fileFilter = (req, file, cb) => {
    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"), false);
    }
  };
  return multer({ fileFilter, storage });
}
