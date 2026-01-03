import mongoose, { isValidObjectId } from "mongoose";
import { Dislike } from "../models/dislike.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoDislike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is missing");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    let dislike = await Dislike.findOneAndDelete({
        dislikedBy: req.user._id,
        video: videoId,
    });

    if (!dislike) {
        await Like.findOneAndDelete({
            likedBy: req.user._id,
            video: videoId,
        });
        dislike = await Dislike.create({
            dislikedBy: req.user._id,
            video: videoId,
        });
    }

    if (!dislike) {
        throw new ApiError(
            500,
            "Something went wrong while toggling video dislike"
        );
    }

    res.status(200).json(
        new ApiResponse(200, dislike, "Video dislike toggled successfully")
    );
});

const toggleCommentDislike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment id is missing");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    let dislike = await Dislike.findOneAndDelete({
        comment: commentId,
        dislikedBy: req.user?._id,
    });

    if (!dislike) {
        await Like.findOneAndDelete({
            comment: commentId,
            likedBy: req.user?._id,
        });
        dislike = await Dislike.create({
            dislikedBy: req.user?._id,
            comment: commentId,
        });
    }

    if (!dislike) {
        throw new ApiError(
            500,
            "Something went wrong while toggling comment dislike"
        );
    }

    res.status(200).json(
        new ApiResponse(200, dislike, "Comment dislike toggled successfully")
    );
});

const toggleTweetDislike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is missing");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    let dislike = await Dislike.findOneAndDelete({
        tweet: tweetId,
        dislikedBy: req.user?._id,
    });

    if (!dislike) {
        await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: req.user?._id,
        });
        dislike = await Dislike.create({
            dislikedBy: req.user?._id,
            tweet: tweetId,
        });
    }

    if (!dislike) {
        throw new ApiError(
            500,
            "Something went wrong while toggling tweet dislike"
        );
    }

    res.status(200).json(
        new ApiResponse(200, dislike, "Tweet dislike toggled successfully")
    );
});

const getDislikedVideos = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!isValidObjectId(req.user._id)) {
        throw new ApiError(401, "Invalid user id");
    }

    const dislikedVideos = await Dislike.aggregate([
        {
            $match: {
                dislikedBy: new mongoose.Types.ObjectId(req.user._id),
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

    if (!dislikedVideos) {
        throw new ApiError(
            500,
            "Something went wrong while fetching disliked videos"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            dislikedVideos,
            "Disliked videos fetched successfully"
        )
    );
});

export {
    toggleCommentDislike,
    toggleTweetDislike,
    toggleVideoDislike,
    getDislikedVideos,
};
