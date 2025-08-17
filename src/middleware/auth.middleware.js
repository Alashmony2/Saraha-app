import { User } from "../DB/model/user.model.js";
import { verifyToken } from "../utils/token/index.js";

export const isAuthenticated = async (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      throw new Error("token is required",{cause:401});
    }
    const payload = verifyToken(token);
    const userExist = await User.findById(payload.id);
    if(!userExist){
      throw new Error("User Nor Found",{cause:404});
    }
    req.user = userExist;
    next()
  }