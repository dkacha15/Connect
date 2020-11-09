const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  primary_email: { type: String, required: true },
  secondary_email: { type: String },
  type: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  confirm: { type: Boolean, default: false },
  image_URL: {
    type: String,
    default: "https://static.thenounproject.com/png/17241-200.png",
  },
  contact: { type: Number, minlength: 10, maxlength: 10 },
  resetToken: { type: String },
  expireToken: { type: Date },
  skills: [
    {
      sname: { type: String },
      strength: { type: Number },
      certificate:{ type:String,default:"" },
      ratings: [
        {
          user_id: { type: mongoose.Types.ObjectId, ref: "User" },
          rate: { type: Number },
        },
      ],
    },
  ],
  chatRoom: [
    {
      chatRoom_id: { type: mongoose.Types.ObjectId, ref: "PersonalChatRoom" },
      user2_id: { type: mongoose.Types.ObjectId, ref: "User" },
      lastMessage_time: { type: Date, default: new Date() },
      lastMessage: { type: String, default: " " },
      lastMessage_sender: { type: mongoose.Types.ObjectId, ref: "User" },
    },
  ],
  groupChatRoom: [
    {
      groupChatRoom_id: { type: mongoose.Types.ObjectId, ref: "GroupChatRoom" },
      admin: { type: mongoose.Types.ObjectId, ref: "User" },
      members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      lastMessage_time: { type: Date, default: new Date() },
      lastMessage: { type: String, default: " " },
      lastMessage_sender: { type: mongoose.Types.ObjectId, ref: "User" },
    },
  ],
  notifications: [
    {
      senderId: { type: mongoose.Types.ObjectId, ref: "User" },
      message: { type: String },
      createdAt: { type: Date, default: new Date() },
      marked: { type: Boolean, default: false },
      link: {type:String}
    },
  ],
  text: { type: String },
});

module.exports = mongoose.model("User", userSchema);
