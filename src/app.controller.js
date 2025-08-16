import { connectDB } from "./DB/connecting.js";
import { authRouter, userRouter, messageRouter } from "./modules/index.js";
import cors from "cors";
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
  app.use((err, req, res, next) => {
    return res.status(err.cause || 500).json({
      message: err.message,
      success: false,
      stack: err.stack,
    });
  });
}
export default bootstrap;
