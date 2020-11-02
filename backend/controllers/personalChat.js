const User = require("../models/userSchema");
const ChatRoom = require("../models/personalChatRoom");
const roundTo = require('round-to');
module.exports = {
  async sendMessage(req, res) {
    const { sender_id, receiver_id } = req.params;

    ChatRoom.find({
      $or: [
        {
          user1: sender_id,
          user2: receiver_id,
        },
        {
          user1: receiver_id,
          user2: sender_id,
        },
      ],
    })
      .then((result) => {
        if (result.length > 0) {
          User.updateOne(
            {
              _id: req.user._id,
              "chatRoom.chatRoom_id": result[0]._id,
            },
            {
              $set: {
                "chatRoom.$.lastMessage": req.body.message,
                "chatRoom.$.lastMessage_time": new Date(),
                "chatRoom.$.lastMessage_sender": sender_id,
              },
            },
            {
              overwrite: true,
            }
          ).then();

          User.updateOne(
            {
              _id: receiver_id,
              "chatRoom.chatRoom_id": result[0]._id,
            },
            {
              $set: {
                "chatRoom.$.lastMessage": req.body.message,
                "chatRoom.$.lastMessage_time": new Date(),
                "chatRoom.$.lastMessage_sender": sender_id,
              },
            },
            {
              overwrite: true,
            }
          ).then();

          User.findByIdAndUpdate(receiver_id, {
            $pull: {
              notifications: {
                message: `${req.user.name} sent you a message.`,
              },
            },
          }).then(() => {
            User.findByIdAndUpdate(receiver_id, {
              $push: {
                notifications: {
                  senderId: req.user._id,
                  message: `${req.user.name} sent you a message.`,
                  createdAt: new Date(),
                  link:`/chatroom/${req.user._id}`
                },
              },
            }).then();
          });

          ChatRoom.updateOne(
            {
              _id: result[0]._id,
            },
            {
              $push: {
                messages: {
                  senderId: sender_id,
                  receiverId: receiver_id,
                  message: req.body.message,
                  message_type: req.body.message_type,
                  attachment_URL: req.body.attachment_URL,
                  download_URL:req.body.download_URL,
                  size:String(roundTo.up(req.body.size/1024000, 2)),
                  createdAt: new Date(),
                },
              },
            }
          )
            .then(() => res.json({ message: "Message added" }))
            .catch((err) => {
              console.log(err);
            });
        } else {
          const chatRoom = new ChatRoom({
            user1: sender_id,
            user2: receiver_id,
            messages: [
              {
                senderId: sender_id,
                receiverId: receiver_id,
                message: req.body.message,
                message_type: req.body.message_type,
                attachment_URL: req.body.attachment_URL,
                download_URL:req.body.download_URL,
                size:roundTo.up(req.body.size/1024000, 2),
                createdAt: new Date(),
              },
            ],
          });

          User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                chatRoom: {
                  chatRoom_id: chatRoom._id,
                  user2_id: receiver_id,
                  lastMessage_time: new Date(),
                  lastMessage: req.body.message,
                  lastMessage_sender: sender_id,
                },
              },
            }
          ).then();

          User.update(
            {
              _id: receiver_id,
            },
            {
              $push: {
                chatRoom: {
                  chatRoom_id: chatRoom._id,
                  user2_id: req.user._id,
                  lastMessage_time: new Date(),
                  lastMessage: req.body.message,
                  lastMessage_sender: sender_id,
                },
                notifications: {
                  senderId: req.user._id,
                  message: `${req.user.name} sent you a message.`,
                  createdAt: new Date(),
                  link:`/chatroom/${req.user._id}`
                },
              },
            }
          ).then();

          chatRoom
            .save()
            .then(() => {
              res.json({ message: "Room created" });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async getAllRooms(req, res) {
    User.findById(req.user._id)
      .populate("chatRoom.user2_id", "name image_URL")
      .then((user) => {
        if (user) {
          res.json({ message: "Chatroom Found", chatRoom: user.chatRoom });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async getAllMessages(req, res) {
    const { sender_id, receiver_id } = req.params;

    User.findOne({
      _id: receiver_id,
    })
      .select("name image_URL")
      .then((user) => {
        User.findByIdAndUpdate(sender_id, {
          $pull: {
            notifications: {
              message: `${user.name} sent you a message.`,
            },
          },
        }).then();

        ChatRoom.findOne({
          $or: [
            {
              user1: sender_id,
              user2: receiver_id,
            },
            {
              user1: receiver_id,
              user2: sender_id,
            },
          ],
        }).then((chats) => {
          if (!chats) {
            return res.json({ error: "No messages found", user });
          }
          res.json({ message: "Messages returned", chats, user });
        });
      });
  },
};
