import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";

export function fileUpload(allowedType = ["image/png","image/jpeg","image/webp"]) {
  const storage = diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
      cb(null, nanoid(5) + "_" + file.originalname);
    },
  });
  const fileFilter = (req,file,cb)=>{
    if(allowedType.includes(file.mimetype)){
      cb(null,true);
    }else{
      cb(new Error("Invalid file formate"),false);
    }
  };
  return multer({ fileFilter , storage });
}
