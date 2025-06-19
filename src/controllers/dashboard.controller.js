import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    const channelStats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
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
            $addFields: {
                subscribers: {
                    $size: "$subscribers",
                },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes",
                        },
                    },
                    {
                        $addFields: {
                            likes: {
                                $size: "$likes",
                            },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                subscribers: 1,
                views: { $sum: "$videos.views" },
                likes: { $sum: "$videos.likes" },
            },
        },
    ]);

    if (!channelStats[0]) {
        throw new ApiError(404, "Channel not found.");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            channelStats[0],
            "Channel stat fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes",
                },
            },
        },
        {
            $project: {
                _id: 1,
                thumbnail: 1,
                title: 1,
                isPublished: 1,
                createdAt: 1,
                likes: 1,
            },
        },
    ]);

    if (!videos) {
        throw new ApiError(500, "Something went wrong while retrieving videos");
    }

    res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
