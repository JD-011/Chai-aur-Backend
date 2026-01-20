import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
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
                        $lookup: {
                            from: "dislikes",
                            localField: "_id",
                            foreignField: "video",
                            as: "dislikes",
                        },
                    },
                    {
                        $addFields: {
                            likes: {
                                $size: "$likes",
                            },
                            dislikes: {
                                $size: "$dislikes",
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
                dislikes: { $sum: "$videos.dislikes" },
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
            $sort: {
                createdAt: -1,
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
            $lookup: {
                from: "dislikes",
                localField: "_id",
                foreignField: "video",
                as: "dislikes",
            },
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes",
                },
                dislikes: {
                    $size: "$dislikes",
                },
            },
        },
        {
            $project: {
                _id: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                isPublished: 1,
                createdAt: 1,
                likes: 1,
                dislikes: 1,
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
