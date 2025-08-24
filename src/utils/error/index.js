import { Token } from "../../DB/model/token.model.js";
import { generateToken, verifyToken } from "../token/index.js";
import  fs  from 'fs';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
};

export const globalErrorHandler = async (err, req, res, next) => {
  if(req.file){
        fs.unlinkSync(req.file.path);
  }
  if (err.message == "jwt expired") {
    const refreshToken = req.headers.refreshtoken;
    const payload = verifyToken(refreshToken);
    const tokenExist = await Token.findOneAndDelete({
      token: refreshToken,
      user: payload.id,
      type: "refresh",
    });
    if(!tokenExist){
      throw new Error("invalid refresh token",{cause:401})
    }
    
    const accessToken = generateToken({
      payload:{id:payload.id},
      options:{expiresIn:"15m"}
    })
    const newRefreshToken = generateToken({
      payload:{id:payload.id},
      options:{expiresIn:"7d"}
    })
    await Token.create({
      token:newRefreshToken,
      user:payload.id,
      type:"refresh",
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
      error:err
    });
    return next(err);
};

///////////////

// export const globalErrorHandler = async (err, req, res, next) => {
//   if (req.file) {
//     fs.unlinkSync(req.file.path);
//   }

//   if (err.message == "jwt expired") {
//     const refreshToken = req.headers.refreshtoken;
//     if (!refreshToken) {
//       return res.status(401).json({
//         message: "Refresh token must be provided",
//         success: false
//       });
//     }

//     const payload = verifyToken(refreshToken);

//     const tokenExist = await Token.findOneAndDelete({
//       token: refreshToken,
//       userId: payload.id,
//       type: "refresh",
//     });//{}|null

//     if (!tokenExist) {
//       return res.status(401).json({
//         message: "Invalid refresh token",
//         success: false
//       });
//     }

//     const accessToken = generateToken({
//       payload: { id: payload.id },
//       options: { expiresIn: "15m" }
//     });

//     const newRefreshToken = generateToken({
//       payload: { id: payload.id },
//       options: { expiresIn: "7d" }
//     });

//     await Token.create({
//       token: newRefreshToken,
//       userId: payload.id,
//       type: "refresh",
//     });

//     return res.status(200).json({
//       message: "Token Refreshed Successfully",
//       success: true,
//       data: { accessToken, refreshToken: newRefreshToken }
//     });
//   }

//   return res.status(err.cause || 500).json({
//     message: err.message,
//     success: false,
//     globalErrorHandler: true,
//     stack: err.stack,
//     error: err
//   });
// };


