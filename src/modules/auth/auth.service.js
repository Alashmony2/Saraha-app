import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../../utils/email/index.js";
import { generateOTP } from "../../utils/otp/index.js";
import { User } from "./../../DB/model/user.model.js";
import { comparePassword, hashPassword } from "../../utils/hash/index.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/token/index.js";
import { Token } from './../../DB/model/token.model.js';

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
  user.otp = {
    code: otp.toString(),
    expiresAt: new Date(otpExpire),
  };
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
  const { otp, email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // Check if user is banned
  if (user.otpBannedUntil && user.otpBannedUntil > new Date()) {
    const remainingTime = Math.ceil(
      (user.otpBannedUntil - new Date()) / 1000 / 60
    );
    return next(
      new Error(
        `Account temporarily locked. Please try again after ${remainingTime} minutes`,
        { cause: 429 }
      )
    );
  }

  // Check if OTP exists and is not expired
  if (
    !user.otp?.code ||
    !user.otp?.expiresAt ||
    new Date() > user.otp.expiresAt
  ) {
    // Increment failed attempts
    user.failedOtpAttempts += 1;

    // Check if we've reached maximum attempts
    if (user.failedOtpAttempts >= 5) {
      user.otpBannedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes ban
      await user.save();
      return next(
        new Error(
          "Too many failed attempts. Your account is temporarily locked for 5 minutes.",
          { cause: 429 }
        )
      );
    }

    await user.save();
    const remainingAttempts = 5 - user.failedOtpAttempts;
    return next(
      new Error(
        `Invalid or expired OTP. ${remainingAttempts} attempts remaining.`,
        { cause: 400 }
      )
    );
  }

  // Verify OTP
  if (user.otp.code !== otp) {
    // Increment failed attempts
    user.failedOtpAttempts += 1;

    // Check if we've reached maximum attempts
    if (user.failedOtpAttempts >= 5) {
      user.otpBannedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes ban
      await user.save();
      return next(
        new Error(
          "Too many failed attempts. Your account is temporarily locked for 5 minutes.",
          { cause: 429 }
        )
      );
    }

    await user.save();
    const remainingAttempts = 5 - user.failedOtpAttempts;
    return next(
      new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`, {
        cause: 400,
      })
    );
  }

  // If  OTP is valid
  // Update user to mark as verified and clear OTP data
  user.isVerified = true;
  user.otp = undefined;
  user.failedOtpAttempts = 0;
  user.otpBannedUntil = null;
  await user.save();

  return res.status(200).json({
    message: "Account verified successfully",
    success: true,
  });
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
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // Check if user is banned from requesting OTP
  if (user.otpBannedUntil && user.otpBannedUntil > new Date()) {
    const remainingTime = Math.ceil(
      (user.otpBannedUntil - new Date()) / 1000 / 60
    );
    return next(
      new Error(
        `Too many failed attempts. Please try again after ${remainingTime} minutes`,
        { cause: 429 }
      )
    );
  }

  // Generate OTP
  const { otp, otpExpire } = generateOTP(2 * 60 * 1000); // 2 minutes expiration
  const otpExpiry = new Date(otpExpire);

  // Update user with new OTP and reset failed attempts if ban has expired
  user.otp = {
    code: otp.toString(), // Ensure OTP is a string
    expiresAt: otpExpiry,
  };
  user.failedOtpAttempts = 0;
  user.otpBannedUntil = null;

  await user.save();

  // Send email with OTP
  await sendEmail({
    to: email,
    subject: "New OTP",
    html: `<p>Your new OTP to verify your account is ${otp}. This code will expire in 2 minutes.</p>`,
  });

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
  const accessToken = generateToken({
    payload: { id: userExist._id},
    options:{expiresIn:"5s"}
  });

  const refreshToken = generateToken({
    payload: { id: userExist._id },
    options:{expiresIn:"7d"}
  });

  // Save refresh token to database
  await Token.create({
    token:refreshToken,
    user:userExist._id,
    type:"refresh",
  })

  return res.status(200).json({
    message: "Login successful",
    data:{accessToken,refreshToken},
    user: {
      id: userExist._id,
      email: userExist.email,
      fullName: userExist.fullName,
    },
    success:true,
  });
};
export const resetPassword = async (req, res, next) => {
  //get data from request
  const { email, otp, newPassword } = req.body;
  //check user existence
  const userExist = await User.findOne({ email });

  if (!userExist) {
    throw new Error("User not found", { cause: 404 });
  }
  //check otp isValid
  if (userExist.otp.code != otp) {
    throw new Error("Invalid OTP", { cause: 401 });
  }
  //check otp is expired
  if (userExist.otpExpire < Date.now()) {
    throw new Error("OTP Expired", { cause: 401 });
  }
  //update user
  userExist.password = hashPassword(newPassword);
  userExist.credentialUpdatedAt = Date.now()
  //save user
  await userExist.save();
  //destroy all refresh token
  await Token.deleteMany({user:userExist._id,type:"refresh"})
  //send response
  return res.status(200).json({
    message: "Password Reset Successfully",
    success: true,
  });
};
export const logout = async (req, res, next) => {
  // Get data from request
  const token = req.headers.authorization;
  //store token into DB
  await Token.create({token,user:req.user._id})
  //send response
  return res.status(200).json({
    message: "Logout Successfully",
    success: true,
  });

};
