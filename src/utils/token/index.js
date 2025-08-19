
import  jwt  from 'jsonwebtoken';
export const verifyToken = (token,secretKey="sdvcxiljkbnamsdxc")=>{
    return jwt.verify(token,secretKey)
}
export const generateToken = ({payload,secretKey="sdvcxiljkbnamsdxc",expireTime="15m"})=>{
    return jwt.sign(payload,secretKey,{expiresIn:expireTime})
}

