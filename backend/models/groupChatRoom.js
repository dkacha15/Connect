const mongoose = require("mongoose");

const groupChatRoom = new mongoose.Schema({
  title: { type: String, default: " " },
  admin: { type: mongoose.Types.ObjectId, ref: "User" },
  picture: {
    type: String,
    default: "https://static.thenounproject.com/png/17241-200.png",
  },
  members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  messages: [
    {
      senderId: { type: mongoose.Types.ObjectId, ref: "User" },
      message: { type: String, default: " " },
      message_type: { type: String, default: "text" },
      attachment_URL: { type: String },
      download_URL:{type:String},
      size:{type:String},
      createdAt: { type: Date, default: Date.now() },
    },
  ],
});

module.exports = mongoose.model("GroupChatRoom", groupChatRoom);
