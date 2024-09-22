import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    let userInSubscription = await Subscription.find({ channel:channelId, subscriber : req.user._id })
    let isChannelSubscribedByUser = userInSubscription.length == 0 ? false : true

    let subscribedChannel;
  
    if(isChannelSubscribedByUser){

        subscribedChannel = await Subscription.deleteOne({
            subscriber : req.user._id,
            channel : channelId
        })
    
        if (!subscribedChannel) {
            throw new ApiError(500, "Something went wrong while unsubscribing the channel")
        }
    
        return res.status(201).json(
            new ApiResponse(200, subscribedChannel, "Channel unsubscribed successfully")
        )
        
    }else{

        subscribedChannel = await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })
    
        if (!subscribedChannel) {
            throw new ApiError(500, "Something went wrong while subscribing the channel")
        }
    
        return res.status(201).json(
            new ApiResponse(200, subscribedChannel, "Channel subscribed successfully")
        )

    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    
    const channelSubcribers = await Subscription.aggregate([
        {
          // Match the playlist by _id
          $match: {
            channel: new mongoose.Types.ObjectId(channelId)
          }
        },
        {
            $lookup: {
              from: 'users', 
              localField: 'subscriber', 
              foreignField: '_id', 
              as: 'subscriberDetails' 
            }
          },
          {
            // Unwind the joined customerInfo array (since $lookup returns an array)
            $unwind: "$subscriberDetails"
          },
          {
            $project:{
                subscriberDetails : 1,
                _id : 0
            }
          }
      ]);

    if (!channelSubcribers) {
        throw new ApiError(500, "Something went wrong while fetching channel subscribers")
    }

    return res.status(201).json(
        new ApiResponse(200, channelSubcribers, "Channel subscribers fetched successfully")
    )  
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

        
    const subscribedChannels = await Subscription.aggregate([
        {
          // Match the playlist by _id
          $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
          }
        },
        {
            $lookup: {
              from: 'users', 
              localField: 'channel', 
              foreignField: '_id', 
              as: 'subscribedchannelDetail' 
            }
          },
          {
            // Unwind the joined customerInfo array (since $lookup returns an array)
            $unwind: "$subscribedchannelDetail"
          },
          {
            $project:{
                subscribedchannelDetail : 1,
                _id : 0
            }
          }
      ]);

    if (!subscribedChannels) {
        throw new ApiError(500, "Something went wrong while fetching subscribed channels")
    }

    return res.status(201).json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}