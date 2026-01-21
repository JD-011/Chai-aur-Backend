import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exist: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // check for user creation
    // remove password & refresh token field from response
    // return res

    let {
        fullName,
        username,
        email,
        password,
        avatar_url,
        email_verified,
        authType,
        googleId,
    } = req.body;

    if (
        [fullName, username, email].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (authType === "google" && !email_verified) {
        throw new ApiError(400, "Email is not verified by Google");
    }

    let existedUser = await User.findOne({
        email: email,
    });

    if (existedUser) {
        throw new ApiError(409, "User with given email already exists");
    }

    if (authType === "google") {
        const users = await User.find({
            username: username,
        });
        username = username + users.length;
    }

    existedUser = await User.findOne({
        username: username,
    });

    if (existedUser) {
        throw new ApiError(409, "User with given username already exists");
    }

    const avatarLocalPath = req.files?.avatar
        ? req.files?.avatar[0]?.path
        : null;
    const coverImageLocalPath = req.files?.coverImage
        ? req.files?.coverImage[0].path
        : null;

    if (!avatarLocalPath && !avatar_url)
        throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar && !avatar_url)
        throw new ApiError(500, "Something went wrong while uploading avatar");

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password: password ? password : undefined,
        avatar: avatar ? avatar.url : avatar_url,
        avatarId: avatar?.public_id,
        coverImage: coverImage?.url,
        coverImageId: coverImage?.public_id,
        authType: authType ? authType : undefined,
        googleId: googleId ? googleId : undefined,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser)
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        createdUser._id
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    res.status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 60 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken,
                },
                "User registered successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email check
    // find the user
    // password check
    // generate access & refresh token
    // send them into cookies & return res

    const { username, email, password, authType, googleId } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    let user;

    if (authType === "google") {
        user = await User.findOne({
            $and: [{ googleId }, { email }],
        });
    } else {
        user = await User.findOne({
            $or: [{ username }, { email }],
        });
    }

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.authType === "local") {
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    res.status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 60 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    res.status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 60 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (user.authType === "local") {
        const isPasswordValid = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid old password");
        }
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, { user: req.user }));
});

const updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) {
        throw new ApiError(400, "username is required");
    }

    const exists = await User.findOne({ username });
    if (exists && username !== req.user.username) {
        throw new ApiError(400, "username already exists");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, user, "Username updated successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

    const avatar = await uploadOnCloudinary(
        avatarLocalPath,
        req.user?.avatarId
    );

    if (!avatar) throw new ApiError(500, "Error while uploading avatar");
    if (!avatar.url) throw new ApiError(500, "Error while uploading avatar");
    if (!avatar.public_id)
        throw new ApiError(500, "Error while uploading avatar");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
                avatarId: avatar.public_id,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, user, "User avatar updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath)
        throw new ApiError(400, "Cover image file is missing");

    const coverImage = await uploadOnCloudinary(
        coverImageLocalPath,
        req.user?.coverImageId
    );

    if (!coverImage)
        throw new ApiError(500, "Error while uploading Cover image");
    if (!coverImage.url)
        throw new ApiError(500, "Error while uploading Cover image");
    if (!coverImage.public_id)
        throw new ApiError(500, "Error while uploading Cover image");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
                coverImageId: coverImage.public_id,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, user, "User cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { userId } = req.query;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                subscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                new mongoose.Types.ObjectId(userId),
                                "$subscribers.subscriber",
                            ],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist");
    }

    res.status(200).json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                let: { watchHistory: "$watchHistory" },
                as: "watchHistory",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$watchHistory"],
                            },
                        },
                    },
                    {
                        $addFields: {
                            order: {
                                $indexOfArray: ["$$watchHistory", "$_id"],
                            },
                        },
                    },
                    { $sort: { order: 1 } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            thumbnail: 1,
                            owner: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                username: 1,
                watchHistory: 1,
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, user[0], "watch history fetched successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUsername,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
