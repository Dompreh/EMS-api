const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose)

const kanbanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    Title: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      required: true,
    },
    Summary: {
      type: String,
      required: true,
    },
    Type: {
      type: String,
      required: true,
    },
    Priority: {
      type: String,
      required: true,
    },
    Tags: {
      type: String,
      required: true,
    },
    Estimate: {
      type: Number,
      required: true,
    },
    Assignee: {
      type: String,
      required: true,
    },
    RankId: {
      type: Number,
      required: true,
    },
    Color: {
      type: String,
      required: true,
    },
    ClassName: {
      type: String,
      required: true,
    },
 
  },
  { timestamps: true }
);

kanbanSchema.plugin(AutoIncrement, {
    inc_field:'Id',
    id:'Task',
    start_seq:1
})

module.exports = mongoose.model("Kanban", kanbanSchema);
