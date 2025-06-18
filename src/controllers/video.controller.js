import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const options = {
        page,
        limit,
    };

    const matchStage = {
        isPublished: true,
    };
    const sortStage = {};

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    if (sortBy) {
        sortStage[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
        sortStage.createdAt = -1;
    }

    const pipeline = [
        { $match: matchStage },
        { $sort: sortStage },
        "__PREPAGINATE__",
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
    ];

    Video.aggregatePaginate(pipeline, options)
        .then((result) => {
            res.status(200).json(
                new ApiResponse(200, result, "Videos fetched successfully.")
            );
        })
        .catch((err) => {
            throw new ApiError(500, err.message);
        });
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "VideoFile and Thumbnail are required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(
            500,
            "Something went wrong while uploading video and thumbnail"
        );
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        videoFileId: videoFile.public_id,
        thumbnail: thumbnail.url,
        thumbnailId: thumbnail.public_id,
        owner: req.user?._id,
        title,
        description,
        duration: videoFile.duration,
    });

    if (!video) {
        throw new ApiError(500, "something went wrong while uploading video");
    }

    res.status(201).json(
        new ApiResponse(201, video, "Video uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Invalid credential");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid credential");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
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
    ]);

    if (!video) {
        throw new ApiError(500, "Something went wrong while fetching video");
    }

    res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(401, "Invalid credential");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid credential");
    }

    const thumbnailLocalPath = req.file?.path;

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const update = {};

    if (title && title.trim() !== "") update.title = title;
    if (description && description.trim() !== "")
        update.description = description;
    if (thumbnail) {
        update.thumbnail = thumbnail.url;
        update.thumbnailId = thumbnail.public_id;
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: update,
    });

    if (!video) {
        throw new ApiError(500, "Something went wrong while updating video");
    }

    if (thumbnail) {
        await deleteFromCloudinary(video.thumbnailId, "image");
    }

    res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(401, "Invalid credential");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid credential");
    }

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(500, "Something went wrong while deleteing video");
    }

    await deleteFromCloudinary(video.videoFileId, "video");
    await deleteFromCloudinary(video.thumbnailId, "image");

    res.status(200).json(
        new ApiResponse(200, video, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Invalid credential");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid credential");
    }

    const video = await Video.findOneAndUpdate(
        { _id: videoId },
        [{ $set: { isPublished: { $not: "$isPublished" } } }],
        { new: true }
    );

    if (!video) {
        throw new ApiError(
            500,
            "Something went wrong while toggling publish status"
        );
    }

    res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
