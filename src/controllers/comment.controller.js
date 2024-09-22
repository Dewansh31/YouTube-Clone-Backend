import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const allComments = await Comment.find({video : videoId});

    if (!allComments) {
        throw new ApiError(500, "Something went wrong while fetching comments")
    }

    return res.status(201).json(
        new ApiResponse(200, allComments, "Comments fetched Successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Something went wrong while commenting")
    }

    return res.status(201).json(
        new ApiResponse(200, comment, "Commented Successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    const updatedComment = await Comment.updateOne(
        { _id: commentId },  // Filter by _id
        { $set: { 
            content
        } },
    )

    if (!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating the comment")
    }

    return res.status(201).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const deletedComment = await Comment.deleteOne(
        { _id: commentId },  // Filter by _id
    )

    if (!deletedComment) {
        throw new ApiError(500, "Something went wrong while deleting the comment")
    }

    return res.status(201).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
