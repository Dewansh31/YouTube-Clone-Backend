import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if (
        [content].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Content is required")
    }
 
    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res.status(201).json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    const userTweets = await Tweet.find({
        owner : userId
    })

    if (!userTweets) {
        throw new ApiError(500, "Something went wrong while fetching tweets")
    }

    return res.status(201).json(
        new ApiResponse(200, userTweets, "Tweets fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    const updatedTweet = await Tweet.updateOne(
        { _id: tweetId },  // Filter by _id
        { $set: { 
            content
        } },
    )

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet")
    }

    return res.status(201).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    const deletedTweet = await Tweet.deleteOne(
        { _id: tweetId },  // Filter by _id
    )

    if (!deletedTweet) {
        throw new ApiError(500, "Something went wrong while deleting the tweet")
    }

    return res.status(201).json(
        new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
