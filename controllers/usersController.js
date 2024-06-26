const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users.length){
        return res.status(400).json({message:"No users found"})
    }
    res.json(users)

})
//@desc create user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, role} = req.body

    //confirm data
    if(!username || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    //Check for duplicate
    const duplicate =await User.findOne({username}).collation({locale: 'en', strength:2}).lean().exec()
 
    if(duplicate){
        return res.status(409).json({message:"Duplicate username"})
    }

    //Hash password
    const hashPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject =(!Array.isArray(role) || !role.length) ?{username, "password":hashPwd}:  {username, "password":hashPwd, role}

    //Create and store new user
    const user = await User.create(userObject)

    if(user){
        res.status(201).json({message:`New user ${username} created`})
    }
    else{
        res.status(400).json({message:`Invalid user data received`}) 
    }


})
//@desc update user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const {id, username,role, active, password} = req.body

    //confirm data
    if(!id || !username || !Array.isArray(role) || !role.length || typeof active !== "boolean"){
        return res.status(400).json({message: "All fields are required"})
    }

    const user = await User.findById(id).exec()
    if(!user){
        return res.status(404).json({message: "User not found"})
    }

    //Check for duplicate
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength:2}).lean().exec()
    //Allow updates to original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message:"Duplicate username"})
    }

    user.username = username
    user.role = role
    user.active = active

    if(password){
        //Hash.password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated`})

})
//@desc delete users
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
const {id} = req.body

if(!id){
    return res.status(400).json({message:"User ID is required"})
}

const task = await Task.findOne({user:id}).lean().exec()

if(task){
    return res.status(400).json({message:"User has assigned notes"})
}

const user = await User.findById(id).exec()
if(!user){
    return res.status(400).json({message:"User not found"})
}

const result = await user.deleteOne()

const reply = `Username ${user.username} with an ID ${user._id} deleted`

res.json(reply)

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}

//express-async-errors does the samething a async handler does in a simpler way.You just need to require it in the server component