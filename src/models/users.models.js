import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
      unique: true,
      lowercase: [true, "username must in lowercase"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, "FullName is required"],
      trim: true,
    },
    avatar: {
      type: String,
      required: [true, "Profile image is required"],
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    watchHistory: [
      {
        type: Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      console.log("Not modified");
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    console.log("error while encrypting password");
    return next(error);
  }
});

// encounter the error when i updated password using update command that why added this pre middleware
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.$set && this._update.$set.password) {
    this._update.$set.password = await bcrypt.hash(
      this._update.$set.password,
      10
    );
  }
  next();
});

// injecting custom method
userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME }
  );
};

userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME }
  );
};

export const User = mongoose.model("User", userSchema);
