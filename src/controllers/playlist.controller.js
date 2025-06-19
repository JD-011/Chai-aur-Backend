import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description || !name.trim() || !description.trim()) {
        throw new ApiError(400, "Both name & description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(
            500,
            "something went wrong while creating the playlist"
        );
    }

    res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully.")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is missing");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const playlists = await Playlist.find({
        owner: userId,
    }).select("-videos -owner -updatedAt");

    if (!playlists) {
        throw new ApiError(
            500,
            "Something went wrong while fetching playlists"
        );
    }

    res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully.")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is missing");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            thumbnail: 1,
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
                name: 1,
                description: 1,
                owner: 1,
                videos: 1,
                createdAt: 1,
            },
        },
    ]);

    if (!playlist[0]) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully.")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id or video id is missing");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added successfully.")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id or video id is missing");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed successfully.")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is missing");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlist id");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist deleted successfully.")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is missing");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if ((!name && !description) || (!name?.trim() && !description?.trim())) {
        throw new ApiError(400, "At least one field is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully.")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
