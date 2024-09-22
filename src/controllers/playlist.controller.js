import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    const playlist = {
        name,
        description,
        videos: [],
        owner: req.user._id // Replace with actual User ObjectId
    };

    const createdPlaylist = await Playlist.create(playlist)

    if (!createdPlaylist) {
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPlaylist, "Playlist created Successfully")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    const userPlaylist = await Playlist.find({owner:userId})

    if (!userPlaylist) {
        throw new ApiError(500, "Something went wrong while fetching user playlists")
    }

    return res.status(201).json(
        new ApiResponse(200, userPlaylist, "Playlists fetched successfully")
    )  

})

/* ------------------------------------------------------------------------------
const getPlaylistById = asyncHandler(async (req, res) => {                       
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while fetching playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )  
})
-------------------------------------------------------------------------------- */

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlist = await Playlist.aggregate([
        {
          // Match the playlist by _id
          $match: {
            _id: new mongoose.Types.ObjectId(playlistId)
          }
        },
        {
            $lookup: {
              from: 'videos', 
              localField: 'videos', 
              foreignField: '_id', 
              as: 'videoDetails' 
            }
          },
        {
          $lookup: {
            from: 'users', 
            localField: 'owner', 
            foreignField: '_id', 
            as: 'ownerDetails' 
          }
        },
        {
            // Negative projection to exclude fields like __v
            $project: {
              'videos': 0, 
              'ownerDetails.refreshToken': 0,
              'ownerDetails.watchHistory': 0,
              'ownerDetails.password': 0,
            }
          }
      ]);

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while fetching playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )  
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Add the video ObjectId to the videos array
    playlist.videos.push(videoId);

    // Save the updated playlist
    await playlist.save();

    return res.status(201).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )  

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    // Find the playlist by its ID and remove the video from the videos array
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true } // Return the updated playlist after the operation
    );

    if (!playlist) {
        throw new ApiError(500, "Invalid playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, playlist, "Video deleted from playlist successfully")
    )  

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const deletedPlaylist = await Playlist.deleteOne(
        { _id: playlistId },  // Filter by _id
    )

    if (!deletedPlaylist) {
        throw new ApiError(500, "Something went wrong while deleting the playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistId },  // Filter by _id
        { $set: { 
            name,
            description
        } },
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating the playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
