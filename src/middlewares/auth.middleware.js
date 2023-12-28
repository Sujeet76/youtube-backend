import jwt from "jsonwebtoken";

import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token =
    req?.cookies?.accessToken ||
    req.header("Authorization")?.replace("Barer ", "");
  console.log(token);
  if (!token) {
    throw new ApiError(401, "Unauthorized user");
  }

  const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user = null;

  try {
    user = await User.findById(_id).select("-password -refreshToken");
  } catch (error) {
    console.log("Error while fetching user from middler-ware(auth)");
  }

  if (!user) {
    throw new ApiError(401, "Unauthorized user");
  }

  req.user = user;
  next();
});
