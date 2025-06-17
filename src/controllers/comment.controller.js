import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(401, "Invalid credential");
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
        throw new ApiError(401, "Invalid credential");
    }

    if (!content) {
        throw new ApiError(400, "Can not post empty comment");
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
        throw new ApiError(401, "Invalid credential");
    }

    if (!content) {
        throw new ApiError(400, "Can not post empty comment");
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
        throw new ApiError(500, "Something went wrong while updating comment");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(401, "Invalid credential");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(500, "something went wrong while deleting comment");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
