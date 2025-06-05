import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes:

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router.route("/update-account-details").post(verifyJWT, updateAccountDetails);

router.route("/update-avatar").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
    ]),
    verifyJWT,
    updateUserAvatar
);

router.route("/update-cover-image").post(
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    verifyJWT,
    updateUserAvatar
);

export default router;
