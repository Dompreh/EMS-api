const User = require('../models/User');
const Kanban = require('../models/Kanban');
const asyncHandler = require('express-async-handler')

//@desc get all kanbans
//@route GET /kanbans
//@access Private
const getAllKanban = asyncHandler(async (req, res) => {
    const kanbans = await Kanban.find().lean()//you only add lean if the data won't be saved
    if(!kanbans.length){
        return res.status(400).json({message:"No kanbans found"})
    }

    //Add username to each kanban before sending the response
    const kanbanWithUser = await Promise.all(kanbans.map(async (kanban) => {
        const user = await User.findById(kanban.user).lean().exec()
        return {...kanban, username: user?.username}
    }))

    res.json(kanbanWithUser)
})
//@desc create kanbans
//@route POST /kanbans
//@access Private
const createNewKanban = asyncHandler(async (req, res) => {
    const {user, Title, Status, Summary, Type, Priority, Tags, Estimate, Assignee, RankId, Color, ClassName} = req.body

    //confirm data
    if(!user || !Title || !Summary || !Status || !Type || !Priority || !Tags || !Estimate || !Assignee || !RankId || !Color || !ClassName ){
        return res.status(400).json({message:"All fields are required"})
    }

    const verifiedUserID = await User.findById(user).lean().exec()
    if(!verifiedUserID?.username){
      return  res.status(400).json({message:"Invalid user ID"})
    }

    //check for duplicate
    const duplicate = await Kanban.findOne({Title}).collation({locale: 'en', strength:2}).lean().exec()
    
    if(duplicate){
        return res.status(409).json({message:"Duplicate kanban Title"})
    }

    const kanbanObject = {user, Title, Status, Summary, Type, Priority, Tags, Estimate, Assignee, RankId, Color, ClassName}

    //create and store kanban
    const kanban = await Kanban.create(kanbanObject)

    if(kanban){
        res.status(201).json({message:`New Kanban ${kanban.Title} created`})
    }
    else{
        res.status(400).json({message:"Invalid kanban data received"})
    }

})
//@desc update kanbans
//@route PATCH /kanbans
//@access Private
const updateKanban = asyncHandler(async (req, res) => {
    const{id,Title, Status,Summary, Type, Priority, Tags, Estimate, Assignee, RankId, Color, ClassName} = req.body

    //confirm data
    if(!id  || !Title || !Status || !Summary || !Type || !Priority || !Tags || !Estimate || !Assignee || !RankId || !Color || !ClassName){
        return res.status(400).json({message:"All fields are required"})
    }


    // const verifiedUserID = await User.findById(user).lean().exec()
    // if(!verifiedUserID?.username){
    //   return  res.status(400).json({message:"Invalid user ID"})
    // }


    const kanban = await Kanban.findById(id).exec()
    if(!kanban){
        return res.status(400).json({message:"No kanban found"})
    }

    //check for duplicate 
    const duplicate = await Kanban.findOne({Title}).collation({locale: 'en', strength:2}).lean().exec()
    //Allow updates to original Kanban
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message:"Duplicate kanban Title"})
    }

    // kanban.user = user
    kanban.Title = Title
    kanban.Status = Status
    kanban.Summary=Summary
    kanban.Type=Type
    kanban.Priority=Priority
    kanban.Tags=Tags
    kanban.Estimate=Estimate
    kanban.Assignee=Assignee
    kanban.RankId=RankId
    kanban.Color=Color
    kanban.ClassName=ClassName

    const updatedKanban = await kanban.save()
    res.json({message:`${updatedKanban.Title} updated`})

})
//@desc delete kanbans
//@route Delete /kanbans
//@access Private
const deleteKanban = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if(!id){
        return res.status(400).json({message:"Kanban ID is required"})
    }

    const kanban = await Kanban.findById(id).exec()
    if(!kanban){
        return res.status(400).json({message:"Kanban not found"})
    }

    const result = await kanban.deleteOne()

    const reply = `Kanban ${kanban.Title} with an ID ${kanban._id} deleted`

    res.json(reply)

})

module.exports ={
    getAllKanban,
    createNewKanban,
    updateKanban,
    deleteKanban
}