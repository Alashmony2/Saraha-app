import jwt from "jsonwebtoken";
export const verifyToken = (token, secretKey = "sdvcxiljkbnamsdxc") => {
  return jwt.verify(token, secretKey);
};
export const generateToken = ({
  payload,
  secretKey = "sdvcxiljkbnamsdxc",
  options= { expiresIn : "15m" }
}) => {
  return jwt.sign(payload, secretKey, options);
};
