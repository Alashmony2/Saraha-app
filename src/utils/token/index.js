
import  jwt  from 'jsonwebtoken';
export const verifyToken = (token,secretKey="sdvcxiljkbnamsdxc")=>{
    return jwt.verify(token,secretKey)
}