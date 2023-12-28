import Joi from "joi";
import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateRefreshAndAccessToken = (user) => {
  try {
    const refreshToken = user.getRefreshToken();
    const accessToken = user.getAccessToken();

    user.refreshToken = refreshToken;

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  /**
   * steps involved while register uer
   * 1.take data from frontend
   * 2.validate data which come from frontend
   * 3.check if user exist
   * 4.check of image , avatar
   * 5.upload image to cloudinary
   * 6. encrypt password
   * 7.crate user in db
   * 8.remove password and refresh token from response
   * 9.check for user is created or not
   * 10.return response
   */
  const { fullName, username, password, email } = req.body;

  const registrationSchema = Joi.object({
    fullName: Joi.string()
      .min(5)
      .regex(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/)
      .required()
      .messages({
        "string.min": "Full name should have a minimum length of {#limit}",
        "string.pattern.base":
          "Full name should only contain alphabetic characters",
        "any.required": "Full name is required",
      }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    username: Joi.string().min(5).required().messages({
      "string.min": "Username should have a minimum length of {#limit}",
      "any.required": "Username is required",
    }),
    password: Joi.string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
      )
      .required()
      .messages({
        "string.min": "Password should have a minimum length of {#limit}",
        "string.pattern.base":
          "Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character",
        "any.required": "Password is required",
      }),
  });
  await registrationSchema.validateAsync({
    fullName,
    username,
    password,
    email,
  });

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  } else {
    coverImage = await uploadToCloudinary(coverImageLocalPath);
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully 🚀"));
});

export const loginUser = asyncHandler(async (req, res) => {
  /**
   * steps involved while login uer
   * 1.take data from req
   * 2.validate data which come from frontend
   * 3.check if user exist and password in correct
   * 4.Generate refresh token and access token
   * 5.return response
   */
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  console.log({ username, password, email });
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = user.isCorrectPassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credential");
  }

  const { refreshToken, accessToken } = generateRefreshAndAccessToken(user);
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Login successful", {
        user: updatedUser,
        refreshToken,
        accessToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  /**
   * steps
   * 1. check user is valid
   * 2. remove refresh token from the user
   * 3.remove access and refresh token from cookies
   * 4.logout user
   */
  try {
    const { user } = req;

    await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, "Logout successful"));
  } catch (error) {
    throw new ApiError(500, "Error while logout");
  }
});

export const getAccessToken = asyncHandler(async (req, res) => {
  const userRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!userRefreshToken) {
    throw new ApiError(404, "Refresh token is required");
  }

  try {
    const { _id } = jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(_id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (userRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const { accessToken, refreshToken } = generateRefreshAndAccessToken(user);
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed", {
          refreshToken,
          accessToken,
        })
      );
  } catch (error) {
    console.log("error while parsing token");
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
