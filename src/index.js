import express from "express";
import bootstrap from "./app.controller.js";
import { User } from "./DB/model/user.model.js";
import schedule from "node-schedule";
import { deleteFolder } from "./utils/cloud/cloudinary.js";
import { Message } from "./DB/model/message.model.js";
import { Token } from "./DB/model/token.model.js";

// Schedule job to delete soft-deleted users after 90 days
schedule.scheduleJob("1 50 4 * * *", async () => {
  const users = await User.find({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });
  for (const user of users) {
    if (user.profilePic.public_id) {
      await deleteFolder(`saraha-app/users/${user._id}`);
    }
  }
  await User.deleteMany({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });
  await Message.deleteMany({
    receiver: { $in: users.map((user) => user._id) },
  });
});

// Schedule job to delete expired refresh tokens after 7 days
schedule.scheduleJob("0 25 4 * * *", async () => {
  // Delete refresh tokens that have expired more than 7 days ago
  await Token.deleteMany({
    type: "refresh",
    expiresAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
});

const app = express();
const port = process.env.PORT;
bootstrap(app, express);
app.listen(port, () => {
  console.log("app is running on port", port);
});
