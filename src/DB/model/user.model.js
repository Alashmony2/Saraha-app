import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: function () {
        if (this.phoneNumber) {
          return false;
        }
        return true;
      },
      trim: true,
      lowercase: true,
      // unique:true
    },
    password: {
      type: String,
      required: function () {
        if (this.userAgent == "google") {
          return false;
        }
        return true;
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        if (this.email) {
          return false;
        }
        return true;
      },
      trim: true,
      // unique:true,
    },
    dob: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    failedOtpAttempts: {
      type: Number,
      default: 0,
    },
    otpBannedUntil: Date,
    userAgent: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    //case local profilePic: String
    //case cloud profilePic: {secure_url: String, public_id: String}
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    credentialUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

schema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

schema.virtual("fullName").set(function (value) {
  const [firstName, lastName] = value.split(" ");
  this.firstName = firstName;
  this.lastName = lastName;
});

schema.virtual("age").get(function () {
  return new Date().getFullYear() - new Date(this.dob).getFullYear();
});

export const User = model("User", schema);
