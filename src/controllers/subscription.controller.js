import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    let subscription = await Subscription.findOneAndDelete({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (!subscription) {
        subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        });
    }

    if (!subscription) {
        throw new ApiError(
            500,
            "Something went wrong while toggling subscription"
        );
    }

    res.status(200).json(
        new ApiResponse(200, subscription, "Subscription toggled successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            username: 1,
                            email: 1,
                            avatar: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber",
                },
                subscribedAt: "$createdAt",
            },
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                subscribedAt: 1,
            },
        },
    ]);

    if (!subscribers) {
        throw new ApiError(
            500,
            "something went wrong while fetching subscribers"
        );
    }

    res.status(200).json(
        new ApiResponse(200, subscribers, "subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Invalid credentials");
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            username: 1,
                            email: 1,
                            avatar: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel",
                },
                subscribedAt: "$createdAt",
            },
        },
        {
            $project: {
                _id: 1,
                channel: 1,
                subscribedAt: 1,
            },
        },
    ]);

    if (!channels) {
        throw new ApiError(
            500,
            "something went wrong while fetching subscribed channels"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            channels,
            "subscribed channels fetched successfully"
        )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
