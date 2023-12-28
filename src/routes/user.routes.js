import { Router } from "express";
import {
  getAccessToken,
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
  updateProfilePicture,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// register route
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
// login
router.route("/login").post(loginUser);
router.route("/get-access-token").get(getAccessToken);

//protected route
router.route("/logout").post(isAuthenticated, logoutUser);
router.route("/update-password").patch(isAuthenticated, updatePassword);
router
  .route("/update-avatar")
  .patch(isAuthenticated, upload.single("avatar"), updateProfilePicture);

export default router;
