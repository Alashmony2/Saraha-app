import { uploadFiles } from "./../../utils/cloud/cloudinary.js";
import { Message } from "./../../DB/model/message.model.js";
export const sendMessage = async (req, res, next) => {
  //get data from request
  const { content } = req.body;
  const { receiver } = req.params;
  const { files } = req;
  //upload into cloud
  const attachments = await uploadFiles({
    files,
    options: {
      folder: `saraha-app/users/${receiver}/messages`,
      width: 300,
      height: 300,
      crop: "fill",
    },
  });
  //create message
  await Message.create({
    content,
    receiver,
    attachments,
    sender: req.user?._id,
  });
  //send response
  return res.status(201).json({
    message: "Message Sent Successfully",
    success: true,
  });
};
export const getMessage = async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findOne(
    { _id: id, receiver: req.user._id },
    {},
    {
      populate: [
        {
          path: "receiver",
          select: "-password -credentialUpdatedAt -createdAt -updatedAt",
        },
      ],
    }
  );
  if (!message) {
    throw new Error("Message Not Found", { cause: 404 });
  }
  return res
    .status(200)
    .json({ message: "done", success: true, data: message });
};
