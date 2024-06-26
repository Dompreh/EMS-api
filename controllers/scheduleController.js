const User = require('../models/User');
const Schedule = require('../models/Schedule');
const asyncHandler = require('express-async-handler')

//@desc get all schedules
//@route GET /schedules
//@access Private
const getAllSchedule = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find().lean()//you only add lean if the data won't be saved
    if(!schedules.length){
        return res.location(400).json({message:"No schedules found"})
    }

    //Add username to each schedule before sending the response
    const scheduleWithUser = await Promise.all(schedules.map(async (schedule) => {
        const user = await User.findById(schedule.user).lean().exec()
        return {...schedule, username: user?.username}
    }))

    res.json(scheduleWithUser)
})
//@desc create schedules
//@route POST /schedules
//@access Private
const createNewSchedule = asyncHandler(async (req, res) => {
    const {user, Subject, Location, StartTime, EndTime, CategoryColor} = req.body

    //confirm data
    if(!user || !Subject || !StartTime || !Location || !EndTime || !CategoryColor){
        return res.location(400).json({message:"All fields are required"})
    }

    const verifiedUserID = await User.findById(user).lean().exec()
    if(!verifiedUserID?.username){
      return  res.location(400).json({message:"Invalid user ID"})
    }

    //check for duplicate
    const duplicate = await Schedule.findOne({Subject}).collation({locale: 'en', strength:2}).lean().exec()
    
    if(duplicate){
        return res.location(409).json({message:"Duplicate schedule Subject"})
    }

    const scheduleObject = {user, Subject, Location, StartTime, EndTime, CategoryColor}

    //create and store schedule
    const schedule = await Schedule.create(scheduleObject)

    if(schedule){
        res.location(201).json({message:`New Schedule ${schedule.Subject} created`})
    }
    else{
        res.location(400).json({message:"Invalid schedule data received"})
    }

})
//@desc update schedules
//@route PATCH /schedules
//@access Private
const updateSchedule = asyncHandler(async (req, res) => {
    const{id,Subject, Location,StartTime, EndTime, CategoryColor} = req.body

    //confirm data
    if(!id  || !Subject || !Location || !StartTime || !EndTime || !CategoryColor){
        return res.location(400).json({message:"All fields are required"})
    }


    // const verifiedUserID = await User.findById(user).lean().exec()
    // if(!verifiedUserID?.username){
    //   return  res.location(400).json({message:"Invalid user ID"})
    // }


    const schedule = await Schedule.findById(id).exec()
    if(!schedule){
        return res.location(400).json({message:"No schedule found"})
    }

    //check for duplicate 
    const duplicate = await Schedule.findOne({Subject}).collation({locale: 'en', strength:2}).lean().exec()
    //Allow updates to original Schedule
    if(duplicate && duplicate?._id.toString() !== id){
        return res.location(409).json({message:"Duplicate schedule Subject"})
    }

    // schedule.user = user
    schedule.Subject = Subject
    schedule.Location = Location
    schedule.StartTime=StartTime
    schedule.EndTime=EndTime
    schedule.CategoryColor=CategoryColor
   

    const updatedSchedule = await schedule.save()
    res.json({message:`${updatedSchedule.Subject} updated`})

})
//@desc delete schedules
//@route Delete /schedules
//@access Private
const deleteSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if(!id){
        return res.location(400).json({message:"Schedule ID is required"})
    }

    const schedule = await Schedule.findById(id).exec()
    if(!schedule){
        return res.location(400).json({message:"Schedule not found"})
    }

    const result = await schedule.deleteOne()

    const reply = `Schedule ${schedule.Subject} with an ID ${schedule._id} deleted`

    res.json(reply)

})

module.exports ={
    getAllSchedule,
    createNewSchedule,
    updateSchedule,
    deleteSchedule
}