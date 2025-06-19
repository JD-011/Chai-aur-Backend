import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video id is missing");
    }

    const options = {
        page,
        limit,
    };

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        "__PREPAGINATE__",
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ];

    Comment.aggregatePaginate(pipeline, options)
        .then((result) => {
            res.status(200).json(
                new ApiResponse(200, result, "Comments fetched successfully")
            );
        })
        .catch((err) => {
            throw new ApiError(500, err.message);
        });
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, "video id is missing");
    }

    if (!content) {
        throw new ApiError(400, "Comment can not be empty");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!comment) {
        throw new ApiError(500, "something went wrong while posting comment");
    }

    res.status(201).json(
        new ApiResponse(201, comment, "Comment posted successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new ApiError(400, "Comment id is missing");
    }

    if (!content) {
        throw new ApiError(400, "Comment can not be empty");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment id is missing");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
