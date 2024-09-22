import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    let userInLikes = await Like.find({ video:videoId, likedBy : req.user._id })
    let isVideoLikedByUser = userInLikes.length == 0 ? false : true

    let likedVideo;
  
    if(isVideoLikedByUser){

        likedVideo = await Like.deleteOne({
            video : videoId,
            likedBy : req.user._id
        })
    
        if (!likedVideo) {
            throw new ApiError(500, "Something went wrong while unliking the video")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedVideo, "Video unliked successfully")
        )
        
    }else{

        likedVideo = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
    
        if (!likedVideo) {
            throw new ApiError(500, "Something went wrong while liking the video")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedVideo, "Video liked successfully")
        )

    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    let userInLikes = await Like.find({ comment:commentId, likedBy : req.user._id })
    let isCommentLikedByUser = userInLikes.length == 0 ? false : true

    let likedComment;
  
    if(isCommentLikedByUser){

        likedComment = await Like.deleteOne({
            comment : commentId,
            likedBy : req.user._id
        })
    
        if (!likedComment) {
            throw new ApiError(500, "Something went wrong while unliking the comment")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedComment, "Comment unliked successfully")
        )
        
    }else{

        likedComment = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })
    
        if (!likedComment) {
            throw new ApiError(500, "Something went wrong while liking the comment")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedComment, "Comment liked successfully")
        )

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    let userInLikes = await Like.find({ tweet : tweetId, likedBy : req.user._id })
    let isTweetLikedByUser = userInLikes.length == 0 ? false : true

    let likedTweet;
  
    if(isTweetLikedByUser){

        likedTweet = await Like.deleteOne({
            tweet : tweetId,
            likedBy : req.user._id
        })
    
        if (!likedTweet) {
            throw new ApiError(500, "Something went wrong while unliking the tweet")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedTweet, "Tweet unliked successfully")
        )
        
    }else{

        likedTweet = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        })
    
        if (!likedTweet) {
            throw new ApiError(500, "Something went wrong while liking the Tweet")
        }
    
        return res.status(201).json(
            new ApiResponse(200, likedTweet, "Tweet liked successfully")
        )

    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
    const likedVideos = await Like.aggregate([
        {
          // Match the playlist by _id
          $match: {
            likedBy: new mongoose.Types.ObjectId(req.user._id),
            video: { $exists: true }
          }
        },
        {
            $lookup: {
              from: 'videos', 
              localField: 'video', 
              foreignField: '_id', 
              as: 'likedVideo' 
            }
          },
          {
            // Unwind the joined likedVideo array (since $lookup returns an array)
            $unwind: "$likedVideo"
          },

          {
            $addFields: {
                LikedAt: "$createdAt"
            }
        },
    
        {
            // Negative projection to exclude fields like __v
            $project: {
                video: 0,                   // Keep original _id from orders
                likedBy: 0,             // Keep fields from the orders collection
                updatedAt: 0,
                createdAt: 0            // Rename customer name
              }
          }
      ]);

    if (!likedVideos) {
        throw new ApiError(500, "No liked videos found.")
    }

    return res.status(201).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
      
      
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}