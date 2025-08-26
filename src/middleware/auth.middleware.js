import { Token } from "../DB/model/token.model.js";
import { User } from "../DB/model/user.model.js";
import { verifyToken } from "../utils/token/index.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new Error("token is required", { cause: 401 });
  }
  const payload = verifyToken(token);
  //check into DB
  const blockedToken = await Token.findOne({ token, type: "access" });
  if (blockedToken) {
    throw new Error("Invalid Token", { cause: 401 });
  }
  const userExist = await User.findById(payload.id);
  if (!userExist) {
    throw new Error("User Not Found", { cause: 404 });
  }
  if (userExist.credentialUpdatedAt > new Date(payload.iat * 1000)) {
    throw new Error("token expired", { cause: 401 });
  }
  req.user = userExist;
  return next();
};
