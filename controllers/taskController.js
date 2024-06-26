const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler')

//@desc get all tasks
//@route GET /tasks
//@access Private
const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find().lean()//you only add lean if the data won't be saved
    if(!tasks.length){
        return res.status(400).json({message:"No tasks found"})
    }

    //Add username to each task before sending the response
    const taskWithUser = await Promise.all(tasks.map(async (task) => {
        const user = await User.findById(task.user).lean().exec()
        return {...task, username: user?.username}
    }))

    res.json(taskWithUser)
})
//@desc create tasks
//@route POST /tasks
//@access Private
const createNewTask = asyncHandler(async (req, res) => {
    const {user, title, text} = req.body

    //confirm data
    if(!user || !title || !text){
        return res.status(400).json({message:"All fields are required"})
    }

    const verifiedUserID = await User.findById(user).lean().exec()
    if(!verifiedUserID?.username){
      return  res.status(400).json({message:"Invalid user ID"})
    }

    //check for duplicate
    const duplicate = await Task.findOne({title}).collation({locale: 'en', strength:2}).lean().exec()
    
    if(duplicate){
        return res.status(409).json({message:"Duplicate task title"})
    }

    const taskObject = {user, title, text}

    //create and store task
    const task = await Task.create(taskObject)

    if(task){
        res.status(201).json({message:`New Task ${task.title} created`})
    }
    else{
        res.status(400).json({message:"Invalid task data received"})
    }

})
//@desc update tasks
//@route PATCH /tasks
//@access Private
const updateTask = asyncHandler(async (req, res) => {
    const{id, user, title, text, completed} = req.body

    //confirm data
    if(!id || !user || !title || !text || typeof completed !== "boolean"){
        return res.status(400).json({message:"All fields are required"})
    }


    const verifiedUserID = await User.findById(user).lean().exec()
    if(!verifiedUserID?.username){
      return  res.status(400).json({message:"Invalid user ID"})
    }


    const task = await Task.findById(id).exec()
    if(!task){
        return res.status(400).json({message:"No task found"})
    }

    //check for duplicate 
    const duplicate = await Task.findOne({title}).collation({locale: 'en', strength:2}).lean().exec()
    //Allow updates to original Task
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message:"Duplicate task title"})
    }

    task.user = user
    task.title = title
    task.text=text
    task.completed=completed

    const updatedTask = await task.save()
    res.json({message:`${updatedTask.title} updated`})

})
//@desc delete tasks
//@route Delete /tasks
//@access Private
const deleteTask = asyncHandler(async (req, res) => {
    const {id} = req.body
    
    if(!id){
        return res.status(400).json({message:"Task ID is required"})
    }

    const task = await Task.findById(id).exec()
    if(!task){
        return res.status(400).json({message:"Task not found"})
    }

    const result = await task.deleteOne()

    const reply = `Task ${task.title} with an ID ${task._id} deleted`

    res.json(reply)

})

module.exports ={
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
}