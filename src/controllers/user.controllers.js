import Joi from "joi";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
      .regex(/^[a-zA-Z]+$/)
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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
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
