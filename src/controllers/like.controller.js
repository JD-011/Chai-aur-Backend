import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    let like = await Like.findOneAndDelete({
        likedBy: req.user._id,
        video: videoId,
    });

    if (!like) {
        like = await Like.create({
            likedBy: req.user._id,
            video: videoId,
        });
    }

    if (!like) {
        throw new ApiError(
            500,
            "Something went wrong while toggling video like"
        );
    }

    res.status(200).json(
        new ApiResponse(200, like, "Video like toggled successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    let like = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (!like) {
        like = await Like.create({
            likedBy: req.user?._id,
            comment: commentId,
        });
    }

    if (!like) {
        throw new ApiError(
            500,
            "Something went wrong while toggling comment like"
        );
    }

    res.status(200).json(
        new ApiResponse(200, like, "Comment like toggled successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    let like = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (!like) {
        like = await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId,
        });
    }

    if (!like) {
        throw new ApiError(
            500,
            "Something went wrong while toggling tweet like"
        );
    }

    res.status(200).json(
        new ApiResponse(200, like, "Tweet like toggled successfully")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(req.user._id)) {
        throw new ApiError(401, "Invalid credentials");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $ne: null },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        fullName: 1,
                                        username: 1,
                                        email: 1,
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
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                video: {
                    $first: "$video",
                },
            },
        },
        {
            $project: {
                _id: 1,
                video: 1,
                updatedAt: 1,
            },
        },
    ]);

    if (!likedVideos) {
        throw new ApiError(
            500,
            "Something went wrong while fetching liked videos"
        );
    }

    res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
