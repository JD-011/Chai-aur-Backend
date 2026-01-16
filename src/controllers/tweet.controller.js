import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (!isValidObjectId(req.user._id)) {
        throw new ApiError(401, "Invalid user id");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while posting the tweet");
    }

    res.status(201).json(
        new ApiResponse(201, tweet, "Tweet posted successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { UserId } = req.query;

    if (!userId) {
        throw new ApiError(400, "User id is missing");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
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
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeCount",
            },
        },
        {
            $lookup: {
                from: "dislikes",
                localField: "_id",
                foreignField: "tweet",
                as: "dislikeCount",
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$tweet", "$$tweetId"],
                                    },
                                    {
                                        $eq: [
                                            "$likedBy",
                                            new mongoose.Types.ObjectId(UserId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $limit: 1 },
                ],
                as: "liked",
            },
        },
        {
            $lookup: {
                from: "dislikes",
                let: { tweetId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$tweet", "$$tweetId"],
                                    },
                                    {
                                        $eq: [
                                            "$dislikedBy",
                                            new mongoose.Types.ObjectId(UserId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $limit: 1 },
                ],
                as: "disliked",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likeCount: {
                    $size: "$likeCount",
                },
                dislikeCount: {
                    $size: "$dislikeCount",
                },
                liked: {
                    $cond: {
                        if: { $gt: [{ $size: "$liked" }, 0] },
                        then: true,
                        else: false,
                    },
                },
                disliked: {
                    $cond: {
                        if: { $gt: [{ $size: "$disliked" }, 0] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1,
                likeCount: 1,
                dislikeCount: 1,
                liked: 1,
                disliked: 1,
                createdAt: 1,
            },
        },
    ]);

    if (!tweets) {
        throw new ApiError(500, "something went wrong while fetching tweets");
    }

    res.status(200).json(
        new ApiResponse(200, tweets, "User's tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is missing");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is missing");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
