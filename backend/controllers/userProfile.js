const Post = require("../models/postSchema");
const Event = require("../models/eventSchema");
const User = require("../models/userSchema");

module.exports = {
  async userProfile(req, res) {
    if (!req.params.id) {
      return res.json({ error: "Login First" });
    }
    await User.findOne({ _id: req.params.id })
      .then((fuser) => {
        if (!fuser) {
          return res.json({ error: "No user found" });
        }
        //console.log(fuser);
        res.json({ fuser });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async showPosts(req, res) {
    if (!req.params.userid) {
      return res.json({ error: "Login First" });
    }
    await User.findOne({ _id: req.params.userid }).then((fuser) => {
      //console.log("fuser"+fuser);
      Post.find({ user: req.params.userid })
        .populate("user", "name type")
        .populate("likes.user_id", "name image_URL")
        .populate("comments.user_id", "name image_URL")
        .sort({ createdAt: -1 })
        .then((posts) => {
          if (!posts) {
            return res.json({ error: "No posts found", type: fuser.type });
          }
          //console.log(posts);
          res.json({ posts, type: fuser.type });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  async showEvents(req, res) {
    if (!req.params.id) {
      return res.json({ error: "Login First" });
    }
    await User.findOne({ _id: req.params.id }).then((user) => {
      Event.find({ author: req.params.id })
        .populate("author", "name type")
        .sort({ createdAt: -1 })
        .then((events) => {
          if (!events) {
            return res.json({ error: "No events found", type: user.type });
          }
          res.json({ events, type: user.type });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  async showSkills(req, res) {
    if (!req.params.id) {
      return res.json({ error: "Login First" });
    }
    await User.findOne({ _id: req.params.id })
      .populate("skills.ratings.user_id", "name image_URL")
      .then((user) => {
        if (!user) {
          //console.log(user);
          return res.json({ error: "No skills found" });
        }
        //console.log(user);
        res.json({ user });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async rateSkills(req, res) {
    const { skill_id, rating, skill_name } = req.body;

    User.find(
      {
        _id: req.params.id,
      },
      {
        skills: {
          $elemMatch: {
            _id: skill_id,
            ratings: {
              $elemMatch: {
                user_id: req.user._id,
              },
            },
          },
        },
      }
    ).then((data) => {
      if (data[0].skills[0]) {
        User.updateOne(
          {
            _id: req.params.id,
            "skills._id": skill_id,
          },
          {
            $pull: {
              "skills.$.ratings": {
                user_id: req.user._id,
              },
            },
          }
        ).then();

        User.updateOne(
          {
            _id: req.params.id,
            "skills._id": skill_id,
          },
          {
            $push: {
              "skills.$.ratings": {
                user_id: req.user._id,
                rate: rating,
              },
            },
          }
        ).then(() => {
          User.findByIdAndUpdate(req.params.id, {
            $pull: {
              notifications: {
                message: `${req.user.name} rated your ${skill_name} skill.`,
              },
            },
          }).then(() => {
            User.findByIdAndUpdate(req.params.id, {
              $push: {
                notifications: {
                  senderId: req.user._id,
                  message: `${req.user.name} rated your ${skill_name} skill.`,
                  createdAt: new Date(),
                  link:`/profile`
                },
              },
            }).then();
          });
        });

        res.json({ message: "Skill rating updated" });
      } else {
        User.updateOne(
          {
            _id: req.params.id,
            "skills._id": skill_id,
          },
          {
            $push: {
              "skills.$.ratings": {
                user_id: req.user._id,
                rate: rating,
              },
            },
          }
        )
          .then(() => {
            User.findByIdAndUpdate(req.params.id, {
              $push: {
                notifications: {
                  senderId: req.user._id,
                  message: `${req.user.name} rated your ${skill_name} skill.`,
                  createdAt: new Date(),
                  link:`/profile`
                },
              },
            }).then((data) => res.json(data));
          })
          .catch((err) => console.log(err));
      }
    });
  },
};
