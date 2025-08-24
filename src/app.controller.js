import { connectDB } from "./DB/connecting.js";
import fs from 'fs';
import { authRouter, userRouter, messageRouter } from "./modules/index.js";
import cors from "cors";
import { globalErrorHandler } from "./utils/error/index.js";
function bootstrap(app, express) {
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));
  app.use(
    cors({
      origin: "*",
    })
  );
  connectDB();
  app.use("/auth", authRouter);
  app.use("/message", messageRouter);
  app.use("/user", userRouter);
  //global error handler
  app.use(globalErrorHandler)
}
export default bootstrap;
