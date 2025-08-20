import jwt from "jsonwebtoken";
import { User } from "./../../DB/model/user.model.js";
import fs from "fs";
import cloudinary from "./../../utils/cloud/cloudinary.js";
export const deleteAccount = async (req, res, next) => {
  try {
    //get data from req (token)
    const token = req.headers.authorization;
    const payload = jwt.verify(token, "sdvcxiljkbnamsdxc");
    const { id } = payload;
    //delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error("user not found", { cause: 404 });
    }
    //send response
    return res
      .status(200)
      .json({ message: "User Deleted Successfully", success: true });
  } catch (error) {
    return res
      .status(error.cause || 500)
      .json({ message: error.message, success: false });
  }
};

export const uploadProfilePicture = async (req, res, next) => {
  //delete old image
  if (req.user.profilePic) {
    fs.unlinkSync(req.user.profilePic);
  }
  const userExist = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: req.file.path },
    { new: true }
  );

  if (!userExist) {
    throw new Error("User Not Found", { cause: 404 });
  }
  return res.status(200).json({
    message: "Profile Picture Uploaded Successfully",
    success: true,
    data: userExist,
  });
};

export const uploadProfilePictureCloud = async (req, res, next) => {
  const user = req.user;
  const file = req.file;
  // delete old file
  await cloudinary.uploader.destroy(user.profilePic.public_id);
  // upload new file
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `saraha-app/users/${user._id}/profile-picture`,
      // public_id: user.profilePic.public_id,
    }
  );
  await User.updateOne(
    { _id: req.user._id },
    { profilePic: { secure_url, public_id } }
  );
  return res.status(200).json({
    message: "Profile Picture Uploaded Successfully",
    success: true,
    data: { secure_url, public_id },
  });
};
