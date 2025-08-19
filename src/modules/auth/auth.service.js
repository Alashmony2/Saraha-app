import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../../utils/email/index.js";
import { generateOTP } from "../../utils/otp/index.js";
import { User } from "./../../DB/model/user.model.js";
import { comparePassword, hashPassword } from "../../utils/hash/index.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  //get data from request
  const { fullName, email, password, phoneNumber, dob } = req.body;
  //check user existence
  const userExist = await User.findOne({
    $or: [
      {
        $and: [
          { email: { $exists: true } },
          { email: { $ne: null } },
          { email },
        ],
      },
      {
        $and: [
          { phoneNumber: { $exists: true } },
          { phoneNumber: { $ne: null } },
          { phoneNumber },
        ],
      },
    ],
  });
  if (userExist) {
    throw new Error("User already exists", { cause: 409 });
  }
  //prepare user data
  const user = new User({
    fullName,
    email,
    password: hashPassword(password),
    phoneNumber,
    dob,
  });
  //generate otp
  const otp = Math.floor(Math.random() * 90000 + 10000);
  const otpExpire = Date.now() + 15 * 60 * 1000;
  user.otp = otp;
  user.otpExpire = otpExpire;
  //send verification email
  if (email)
    await sendEmail({
      to: email,
      subject: "verify your email",
      html: `<p>Your otp to verify your account is ${otp}</p>`,
    });
  //create User
  await user.save();
  return res.status(201).json({
    message: "User Created Successfully",
    success: true,
  });
};
export const verifyAccount = async (req, res, next) => {
  //get data from request
  const { otp, email } = req.body;
  //check user otp & otpExpire
  const userExist = await User.findOne({
    email,
    otp,
    otpExpire: { $gt: Date.now() },
  });
  if (!userExist) {
    throw new Error("Invalid OTP or OTP Expired", { cause: 400 });
  }
  //update user --> isVerify = true
  userExist.isVerified = true;
  userExist.otp = undefined;
  userExist.otpExpire = undefined;
  //save user
  await userExist.save();
  //send response
  return res
    .status(200)
    .json({ message: "User Verified Successfully", success: true });
};
export const googleLogin = async (req, res, next) => {
  //get data from req
  const { idToken } = req.body;
  //verify id token
  const client = new OAuth2Client(
    "1040812342569-b8ov4tbtkn79j4t6hf9ujuemdotj4ufj.apps.googleusercontent.com"
  );
  const ticket = await client.verifyIdToken({ idToken });
  const payload = ticket.getPayload();
  //check User
  let userExist = await User.findOne({ email: payload.email });
  if (!userExist) {
    userExist = await User.create({
      fullName: payload.name,
      email: payload.email,
      phoneNumber: payload.phone_number,
      dob: payload.birthdate,
      isVerified: true,
      userAgent: "google",
    });
  }
  //generate token
  const token = jwt.sign(
    { id: userExist._id, name: userExist.fullName },
    "sdvcxiljkbnamsdxc",
    { expiresIn: "15m" }
  );
  //send response
  return res.status(200).json({
    message: "User Logged In Successfully",
    success: true,
    data: { token },
  });
};
export const sendOTP = async (req, res, next) => {
  //get data from req
  const { email } = req.body;
  //generate new OTP && OTPExpire
  const { otp, otpExpire } = generateOTP();
  // update user
  const userExist = await User.findOneAndUpdate({ email }, { otp, otpExpire });
  if(!userExist){
    throw new Error("User Not Found", { cause: 404 });
  }
  //send email
  await sendEmail({
    to: email,
    subject: "New OTP",
    html: `<p>Your new otp to verify your account is ${otp}</p>`,
  });
  //sen response
  return res.status(200).json({
    message: "OTP Sent Successfully",
    success: true,
  });
};
export const login = async (req, res, next) => {
  //get data from request body
  const { email, phoneNumber, password } = req.body;
  //check user existence
  const userExist = await User.findOne({
    $or: [
      {
        $and: [
          { email: { $exists: true } },
          { email: { $ne: null } },
          { email },
        ],
      },
      {
        $and: [
          { phoneNumber: { $exists: true } },
          { phoneNumber: { $ne: null } },
          { phoneNumber },
        ],
      },
    ],
  });
  if (!userExist) {
    throw new Error("Invalid Credentials", { cause: 401 });
  }
  if (userExist.isVerified == false) {
    throw new Error("Verify Account First", { cause: 401 });
  }
  //check password
  const isMatch = comparePassword(password, userExist.password);
  if (!isMatch) {
    throw new Error("Invalid Credentials", { cause: 401 });
  }
  //generate token
  const token = jwt.sign(
    { id: userExist._id, name: userExist.fullName },
    "sdvcxiljkbnamsdxc",
    { expiresIn: "15m" }
  );
  //send response
  return res.status(200).json({
    message: "Login Successfully",
    success: true,
    data: { token },
  });
};
export const resetPassword = async(req,res,next)=>{
  //get data from request
  const {email,otp,newPassword} = req.body;
  //check user existence
  const userExist = await User.findOne({email});

  if(!userExist){
    throw new Error("User not found",{cause:404})
  }
  //check otp isValid
  if(userExist.otp != otp){
    throw new Error("Invalid OTP",{cause:401})
  }
  //check otp is expired
  if(userExist.otpExpire < Date.now()){
    throw new Error("OTP Expired",{cause:401})
  }
  //update user
  userExist.password = hashPassword(newPassword);
  //save user
  await userExist.save();
  //send response
  return res.status(200).json({
    message: "Password Reset Successfully",
    success: true,
  });
}