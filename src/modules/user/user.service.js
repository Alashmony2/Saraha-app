import { User } from "./../../DB/model/user.model.js";
import fs from "fs";
import cloudinary from "./../../utils/cloud/cloudinary.js";

export const deleteAccount = async (req, res, next) => {
  //delete user folder from server [cloudinary | local]
  if (req.user.profilePic.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `saraha-app/users/${req.user._id}`
    );
    await cloudinary.api.delete_folder(`saraha-app/users/${req.user._id}`);
  }
  //delete user from DB
  await User.deleteOne({ _id: req.user._id });
  //send response
  return res
    .status(200)
    .json({ message: "User Deleted Successfully", success: true });
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

  // Check if user has an existing profile picture with public_id
  if (user.profilePic && user.profilePic.public_id) {
    // delete old file
    await cloudinary.uploader.destroy(user.profilePic.public_id);
  }

  // upload new file
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `saraha-app/users/${user._id}/profile-picture`,
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
