import { Schema, Types,model } from "mongoose";

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

export const User = model("User", userSchema);
