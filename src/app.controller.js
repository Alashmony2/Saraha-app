import { connectDB } from "./DB/connecting.js";
import { authRouter, userRouter, messageRouter } from "./modules/index.js";
import cors from "cors";
import { globalErrorHandler } from "./utils/error/index.js";
import { rateLimit } from "express-rate-limit";
function bootstrap(app, express) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    handler: (req, res, next, options) => {
      throw new Error(options.message, { cause: options.statusCode });
    },
    skipSuccessfulRequests: true,
    identifier: (req, res, next) => {
      return req.ip;
    },
  });
  app.use("/auth", limiter);
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
  app.use(globalErrorHandler);
}
export default bootstrap;
