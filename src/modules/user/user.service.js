import { User } from "./../../DB/model/user.model.js";
import fs from "fs";
import cloudinary from "./../../utils/cloud/cloudinary.js";
import { Token } from "../../DB/model/token.model.js";

export const deleteAccount = async (req, res, next) => {
  await User.updateOne(
    { _id: req.user._id },
    { deletedAt: Date.now(), credentialUpdatedAt: Date.now() }
  );
  await Token.deleteMany({ user: req.user._id });
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
      width: 300,
      height: 300,
      crop: "fill",
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
export const getProfile = async (req, res, next) => {
  const user = await User.findOne(
    { _id: req.user._id },
    {},
    { populate: [{ path: "messages" }] }
  );
  return res.status(200).json({ message: "done", success: true, data: {user} });
};
