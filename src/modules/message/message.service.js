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
    options: { folder: `saraha-app/users/${receiver}/messages` },
  });
  //create message
  await Message.create({
    content,
    receiver,
    attachments,
    sender:req.user?._id
  });
  //send response
  return res.status(201).json({
    message: "Message Sent Successfully",
    success: true,
  });
};
