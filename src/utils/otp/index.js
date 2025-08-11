/**
 * 
 * @param {*} expireTime - in millisecond
 * @returns object {otp,otpExpire}
 */
export const generateOTP = (expireTime = 15 * 60 * 1000)=>{
    const otp = Math.floor(Math.random() * 90000 + 10000);
    const otpExpire = Date.now() + expireTime;
    return {otp,otpExpire};
}