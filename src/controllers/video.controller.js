import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFileFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const videos = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            // Unwind the joined channelDetails array (since $lookup returns an array)
            $unwind: "$channelDetails"
          },
    ])

    if (!videos) {
        throw new ApiError(500, "Something went wrong while fetching videos")
    }

    return res.status(201).json(
        new ApiResponse(200, videos, "All videos fetched successfully")
    )  

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbNailPath = req.files?.thumbnail[0]?.path;
   
    // console.log("req.files:",JSON.stringify(req.files));

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbNailPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video and thumbnai are required")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url, 
        duration:videoFile?.duration,
        owner: req.user._id
    })
    
    // console.log("created video details:-",video);

    if (!video) {
        throw new ApiError(500, "Something went wrong while uploading the video")
    }

    return res.status(201).json(
        new ApiResponse(200, video, "Video uploaded Successfully")
    )  
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // const singleVideo = await Video.findOne({_id:videoId})
    const singleVideo = await Video.findById(videoId)

    if (!singleVideo) {
        throw new ApiError(500, "Something went wrong while fetching video")
    }

    return res.status(201).json(
        new ApiResponse(200, singleVideo, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const {title, description} = req.body
   //TODO: update video details like title, description, thumbnail

    const video = await Video.updateOne(
        { _id: videoId },  // Filter by _id
        { $set: { 
            title ,
            description
        } },
    )

    const singleVideo = await Video.findById(videoId)

    if (!singleVideo) {
        throw new ApiError(500, "Something went wrong while updating video")
    }

    return res.status(201).json(
        new ApiResponse(200, singleVideo, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId)

    let videoFileUrl = video.videoFile;
    let thumbnailUrl = video.thumbnail;

    console.log(video);

    const videoToDelete = await Video.deleteOne({ _id: videoId })
    
    if (!videoToDelete) {
        throw new ApiError(500, "Something went wrong while deleting video")
    }

    await deleteFileFromCloudinary([videoFileUrl,thumbnailUrl])

    return res.status(201).json(
        new ApiResponse(200, videoToDelete, "Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params    
    
    const singleVideo = await Video.findById(videoId)

    // console.log("togglePublishStatus me request aya hai!",singleVideo?.isPublished);

    const changedStatus = !singleVideo?.isPublished;

    const video = await Video.updateOne(
        { _id: videoId },  // Filter by _id
        { $set: { isPublished: changedStatus } },
    )

    if (!video) {
        throw new ApiError(500, "Something went wrong while changing video publish status")
    }

    return res.status(201).json(
        new ApiResponse(200, video, "Video publish status changed successfully")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
