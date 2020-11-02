const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  interested:{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    btntext:{type: String, required: true, default:"Show Interest"},
  },
  
  poster_url: { type: String, required: true },
  venue: { type: String, required: true },
  registration_link: { type: String, required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model("Event", eventSchema);
