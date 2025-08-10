import { sendEmail } from "../../utils/email/index.js";
import { User } from "./../../DB/model/user.model.js";
import bcrypt from "bcrypt";
export const register = async (req, res, next) => {
  try {
    //get data from request body
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
      password:bcrypt.hashSync(password, 10),
      phoneNumber,
      dob,
    });
    //generate otp
    const otp = Math.floor( Math.random() * 90000 + 10000);
    const otpExpire = Date.now() + 15 * 60 * 1000;
    user.otp = otp;
    user.otpExpire = otpExpire;
    //send verification email
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
  } catch (error) {
    return res
      .status(error.cause || 500)
      .json({ message: error.message, success: false });
  }
};


export const login = async (req, res, next) => {
  try {
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
    //check password
    const isMatch = bcrypt.compareSync(password, userExist.password);
    if (!isMatch) {
      throw new Error("Invalid Credentials", { cause: 401 });
    }
    
    //send response
    return res.status(200).json({
      message: "Login Successfully",
      success: true,
      data:{userExist}
    })
  } catch (error) {
    return res
      .status(error.cause || 500)
      .json({ message: error.message, success: false });

  }
};