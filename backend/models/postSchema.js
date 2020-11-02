const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  caption: { type: String, required: true },
  image_URL: { type: String },
  attachment_type: { type: String, default: "text" },
  download_URL: { type: String, default: "text" },
  file:{ type: String, required: true},
  size:{ type: Number},
  likes: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  comments: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment_text: { type: String },
      createdAt: { type: Date, default: new Date() },
    },
  ],
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Posts", postSchema);
