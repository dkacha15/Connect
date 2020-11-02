const mongoose = require("mongoose");

const peronalChatRoom = new mongoose.Schema({
  user1: { type: mongoose.Types.ObjectId, ref: "User" },
  user2: { type: mongoose.Types.ObjectId, ref: "User" },
  messages: [
    {
      senderId: { type: mongoose.Types.ObjectId, ref: "User" },
      receiverId: { type: mongoose.Types.ObjectId, ref: "User" },
      message: { type: String, default: " " },
      message_type: { type: String, default: "text" },
      attachment_URL: { type: String },
      download_URL:{type:String},
      size:{type:String},
      createdAt: { type: Date, default: Date.now() },
      
    },
  ],
});

module.exports = mongoose.model("PersonalChatRoom", peronalChatRoom);