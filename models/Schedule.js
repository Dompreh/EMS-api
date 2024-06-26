const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    Subject: {
      type: String,
      required: true,
    },
    Location: {
      type: String,
      required: true,
    },
    StartTime: {
      type: Date,
      required: true,
    },
    EndTime: {
      type: Date,
      required: true,
    },
    CategoryColor: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

scheduleSchema.plugin(AutoIncrement, {
  inc_field: "Id",
  id: "Schedule",
  start_seq: 1,
});

module.exports = mongoose.model("Schedule", scheduleSchema);
