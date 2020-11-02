const User = require("../models/userSchema");
const Classroom = require("../models/groupChatRoom");

module.exports = {
  async searchUser(req, res) {
    let userPattern = new RegExp("^" + req.body.query, "i");
    User.find({ name: { $regex: userPattern } })
      .select("_id name image_URL")
      .then((user) => {
        res.json({ user });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async searchOtherUser(req, res) {
    let userPattern = new RegExp("^" + req.body.query, "i");
    Classroom.findOne({ _id: req.body.chatroom_id }).then((data) => {
      User.find({ _id: { $nin: data.members }, name: { $regex: userPattern } })
        .select("_id name image_URL")
        .then((user) => {
          res.json({ user });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },

  async searchSkilledUser(req,res) {
    let skillPattern = new RegExp("^" + req.body.query, "i");
    User.find({ "skills.sname" : { $regex: skillPattern } })
    .select("_id name image_URL skills.sname")
    .then((user) => {

      res.json({ user ,l:user.length});
    })
    .catch((err) => {
      console.log(err);
    });


  },
  async getAllNotificaions(req, res) {
    User.findById(req.user._id)
      .populate("notifications.senderId", "image_URL")
      .then((user) => {
        res.json({ notifications: user.notifications });
      });
  },

  async markAllNotification(req, res) {
    await User.updateOne(
      {
        _id: req.user._id,
      },
      {
        $set: { "notifications.$[elem].marked": true },
      },
      {
        arrayFilters: [{ "elem.marked": false }],
        multi: true,
      }
    ).then(() => {
      res.json({ message: "Marked all notifications" });
    });
  },

  async getUser(req, res) {
    await User.findOne({
      _id: req.user._id,
    })
      .select("type name image_URL")
      .then((user) => {
        res.json({ user });
      });
  },
};