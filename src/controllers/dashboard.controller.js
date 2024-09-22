import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const allVideos = await Video.find({
        owner : req.user._id
    })
    // 1. total number of videos of user
    const totalVideos = allVideos.length

    return res.status(201).json(
        new ApiResponse(200, totalVideos, "videos fetched successfully")
    )

    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const allVideos = await Video.find({
        owner : req.user._id
    })

    if (!allVideos) {
        throw new ApiError(500, "Something went wrong while fetching videos")
    }

    return res.status(201).json(
        new ApiResponse(200, allVideos, "videos fetched successfully")
    )
    
})

export {
    getChannelStats, 
    getChannelVideos
    }