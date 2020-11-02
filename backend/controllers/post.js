const Post = require("../models/postSchema");
const User = require("../models/userSchema");
const roundTo = require('round-to');
module.exports = {
  async createPost(req, res) {
    const { caption, image_URL , attachment_type, file, download_URL, size} = req.body;

    if (!caption || !image_URL) {
      return res.json({ error: "All fields are required." });
    }

    const post = new Post({
      user: req.user._id,
      caption,
      image_URL,
      attachment_type,
      file,
      download_URL,
      size:roundTo.up(size/1024000, 2),
      createdAt: new Date(),
    });

    await post
      .save()
      .then((result) => {
        res.json({ message: "Post Created", post: result });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async allPosts(req, res) {
    await Post.find()
      .populate("user", "name type image_URL")
      .populate("likes.user_id", "name image_URL")
      .populate("comments.user_id", "name image_URL")
      .sort({ createdAt: -1 })
      .then((posts) => {
        if (!posts) {
          return res.json({ error: "No posts found" });
        }
        res.json({ posts });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async likePost(req, res) {
    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {
          likes: {
            user_id: req.user._id,
          },
        },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.json({ error: err });
      } else {
        if (String(result.user) !== String(req.user._id)) {
          User.findByIdAndUpdate(result.user, {
            $push: {
              notifications: {
                senderId: req.user._id,
                message: `${req.user.name} liked your post.`,
                createdAt: new Date(),
                link:"/profile"
              },
            },
          }).then();
        }

        res.json(result);
      }
    });
  },

  async disLikePost(req, res) {
    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: {
          likes: {
            user_id: req.user._id,
          },
        },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.json({ error: err });
      } else {
        User.find(
          {
            _id: result.user,
          },
          {
            notifications: {
              $elemMatch: {
                message: `${req.user.name} liked your post.`,
              },
            },
          }
        ).then((data) => {
          if (data[0].notifications[0]) {
            User.findByIdAndUpdate(result.user, {
              $pull: {
                notifications: {
                  _id: data[0].notifications[0]._id,
                },
              },
            }).then();
          }
        });
        res.json(result);
      }
    });
  },

  async comment(req, res) {
    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {
          comments: {
            user_id: req.user._id,
            comment_text: req.body.comment_text,
            createdAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        console.log(err);
        return res.json({ error: err });
      } else {
        if (String(result.user) !== String(req.user._id)) {
          User.find(
            {
              _id: result.user,
            },
            {
              notifications: {
                $elemMatch: {
                  message: `${req.user.name} commented on your post.`,
                },
              },
            }
          ).then((data) => {
            if (data[0].notifications[0]) {
              User.findByIdAndUpdate(result.user, {
                $pull: {
                  notifications: {
                    _id: data[0].notifications[0]._id,
                  },
                },
              }).then();

              User.findByIdAndUpdate(result.user, {
                $push: {
                  notifications: {
                    senderId: req.user._id,
                    message: `${req.user.name} commented on your post.`,
                    createdAt: new Date(),
                    link:"/profile"
                  },
                },
              }).then();
            } else {
              User.findByIdAndUpdate(result.user, {
                $push: {
                  notifications: {
                    senderId: req.user._id,
                    message: `${req.user.name} commented on your post.`,
                    createdAt: new Date(),
                    link:"/profile"
                  },
                },
              }).then();
            }
          });
        }

        res.json(result);
      }
    });
  },
};
