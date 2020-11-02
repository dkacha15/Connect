const User = require("../models/userSchema");
const ChatRoom = require("../models/groupChatRoom");
const roundTo = require('round-to');
module.exports = {
  async createChatRoom(req, res) {
    const { title, sender_id } = req.body;
    const chatroom = new ChatRoom({
      title,
      members: [sender_id],
      admin: sender_id,
    });
    await chatroom.save().then((data) => {
      if (data) {
        User.updateOne(
          {
            _id: sender_id,
          },
          {
            $push: {
              groupChatRoom: {
                groupChatRoom_id: data._id,
                members: [sender_id],
                lastMessage_sender: null,
                lastMessage_time: new Date(),
                
                admin: sender_id,
              },
            },
          },
          {
            overwrite: true,
            new: true,
          }
        ).then((result) => {
          res.json({ message: true });
        });
      }
    });
  },
  async addMember(req, res) {
    const { chatroom_id } = req.params;
    await ChatRoom.updateOne(
      {
        _id: chatroom_id,
      },
      {
        $push: {
          members: req.body.members,
        },
      },
      {
        overwrite: false,
        new: true,
      }
    ).then();
    await ChatRoom.findOne({
      _id: req.params.chatroom_id,
    }).then(async (data) => {
      await User.updateMany(
        {
          _id: { $in: req.body.members },
        },
        {
          $push: {
            groupChatRoom: {
              groupChatRoom_id: req.params.chatroom_id,
            },
            notifications: {
              senderId: req.user._id,
              message: `${req.user.name} added you in ${data.title}.`,
              createdAt: new Date(),
              link:`/groupChatRoom/${chatroom_id}`
            },
          },
        }
      ).then(async () => {
        await User.updateMany(
          {
            _id: { $in: data.members },
            "groupChatRoom.groupChatRoom_id": req.params.chatroom_id,
          },
          {
            $set: {
              "groupChatRoom.$.members": data.members,
              "groupChatRoom.$.admin": data.admin,
              "groupChatRoom.$.lastMessage_sender": null,
              "groupChatRoom.$.lastMessage_time": new Date(),
            },
          }
        ).then((result) => {
          // console.log(result);
          res.json({ message: true, name: data.admin.name });
        });
      });
    });
  },
  async getAllMessages(req, res) {
    await ChatRoom.findOne({
      _id: req.params.chatroom_id,
    })
      .populate("messages.senderId", "name")
      .then((data) => {
        let messagePattern = new RegExp(data.title);

        User.updateOne(
          {
            _id: req.user._id,
          },
          {
            $pull: {
              notifications: {
                message: { $regex: messagePattern },
              },
            },
          }
        ).then();

        res.json({ message: true, chats: data.messages, title: data.title });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async getAllMembers(req, res) {
    ChatRoom.findOne({
      _id: req.params.chatroom_id,
    })
      .populate("members", "name image_URL")
      .then((data) => {

        res.json({
          message: true,
          members: data.members,
          admin: data.admin,
          image: data.picture,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async changePicture(req, res) {
    ChatRoom.updateOne(
      {
        _id: req.params.chatroom_id,
      },
      {
        picture: req.body.picture,
      },
      {
        overwrite: false,
        new: true,
      }
    ).then((result) => {
      // console.log(result);
      res.json({ message: true });
    });
  },

  async sendMessage(req, res) {
    ChatRoom.updateOne(
      {
        _id: req.body.chatroom_id,
      },
      {
        $push: {
          messages: {
            senderId: req.params.sender_id,
            message: req.body.message,
            message_type: req.body.message_type,
            attachment_URL: req.body.attachment_URL,
            download_URL:req.body.download_URL,
            size:roundTo.up(req.body.size/1024000, 2),
            createdAt: new Date(),
          },
        },
      },
      {
        overwrite: true,
        new: true,
      }
    )
      .then(() => {
        ChatRoom.findOne({
          _id: req.body.chatroom_id,
        }).then((data) => {
          let messagePattern = new RegExp(data.title);

          User.updateMany(
            {
              _id: { $in: data.members },
            },
            {
              $pull: {
                notifications: {
                  message: { $regex: messagePattern },
                },
              },
            }
          ).then(() => {
            User.updateMany(
              {
                _id: { $in: data.members, $ne: req.user._id },
              },
              {
                $push: {
                  notifications: {
                    senderId: req.user._id,
                    message: `${req.user.name} sent a message in ${data.title}.`,
                    createdAt: new Date(),
                    link:`/groupChatRoom/${req.body.chatroom_id}`
                  },
                },
              }
            ).then();
          });

          User.updateMany(
            {
              _id: { $in: data.members },
              "groupChatRoom.groupChatRoom_id": data._id,
            },
            {
              $set: {
                "groupChatRoom.$.lastMessage": req.body.message,
                "groupChatRoom.$.lastMessage_time": new Date(),
                "groupChatRoom.$.lastMessage_sender": req.params.sender_id,
              },
            }
          ).then(() => {
            res.json(true);
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async getAllRooms(req, res) {
    User.findById(req.user._id)
      .populate("groupChatRoom.groupChatRoom_id", "title picture")
      .populate("groupChatRoom.lastMessage_sender", "name")
      .populate("groupChatRoom.admin", "name")
      .then((user) => {
        if (user) {
          //console.log(user.groupChatRoom);
          res.json({ message: "Chatroom Found", chatRoom: user.groupChatRoom });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
