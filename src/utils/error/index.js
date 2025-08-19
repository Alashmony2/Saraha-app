import { Token } from "../../DB/model/token.model.js";
import { generateToken, verifyToken } from "../token/index.js";

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
};

export const globalErrorHandler = async (err, req, res, next) => {
  if (err.message == "jwt expired") {
    const refreshToken = req.headers.refreshToken;
    const payload = verifyToken(refreshToken);
    const tokenExist = await Token.findOneAndDelete({
      token: refreshToken,
      userId: payload.id,
      type: "refresh",
    });
    if(!tokenExist){
      throw new Error("invalid token",{cause:401})
    }
    
    const accessToken = generateToken({
      payload:{id:payload.id},
      expireTime:"15m"
    })
    const newRefreshToken = generateToken({
      payload:{id:payload.id},
      expireTime:"7d"
    })
    const decoded = jwt.decode(refreshToken);
    await Token.create({
      token:newRefreshToken,
      userId:payload.id,
      type:"refresh",
      expiresAt: new Date(decoded.exp * 1000),
    })
    return res.status(200).json({
      message:"Token Refreshed Successfully",
      success:true,
      data:{accessToken,refreshToken:newRefreshToken}
    })
  }
  res
    .status(err.cause || 500)
    .json({
      message: err.message,
      success: false,
      globalErrorHandler: true,
      stack: err.stack,
    });
    return next(err);
};
