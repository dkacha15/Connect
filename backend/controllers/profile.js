const Post = require("../models/postSchema");
const User = require("../models/userSchema");
const Event = require("../models/eventSchema");
const { count } = require("../models/postSchema");
const bcrypt = require("bcrypt");

module.exports = {
  async showPosts(req, res) {
    // console.log(req.body);
    const { id } = req.body;

    if (!id) {
      return res.json({ error: "Login First" });
    }

    await Post.find({ user: id })
      .populate("user", "name type")
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
  async showEvents(req, res) {
    const { id } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }
    await Event.find({ author: id })
      .populate("author", "name type")
      .sort({ createdAt: -1 })
      .then((events) => {
        if (!events) {
          return res.json({ error: "No events found" });
        }
        res.json({ events });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async showSkills(req, res) {
    const { id } = req.body;

    if (!id) {
      return res.json({ error: "Login First" });
    }

    await User.find({ _id: id })
      .populate("skills.ratings.user_id", "name image_URL")
      .then((user) => {
        if (!user) {
          // console.log(user);
          return res.json({ error: "No events found" });
        }
        // console.log(user);
        res.json({ user });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async showProfile(req, res) {
    // console.log(req.body);
    const { id } = req.body;

    if (!id) {
      return res.json({ error: "Login First" });
    }

    await User.find({ _id: id })
      .populate("skills.ratings.user_id", "name image_URL")
      .then((user) => {
        if (!user) {
          return res.json({ error: "No events found" });
        }
        res.json({ user });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async editProfile(req, res) {
    // console.log(req.body);
    const { id } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }

    await User.find({ _id: id })
      .then((founduser) => {
        if (!founduser) {
          return res.json({ error: "No user found" });
        }
        res.json({ founduser });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async updateProfile(req, res) {
    const { id, primary_email, contact, skill, strength } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }
    if (skill !== undefined) {
      await User.findByIdAndUpdate(
        id,
        {
          primary_email,
          contact,
          $push: {
            skills: {
              sname: skill,
              strength: strength,
            },
          },
        },
        {
          new: true,
        }
      ).exec((err, founduser) => {
        if (err) {
          // console.log(err);
          return res.json({ error: err });
        } else {
          // console.log(founduser);
          res.json({ founduser });
        }
      });
    } else {
      await User.findByIdAndUpdate(
        id,
        { primary_email, contact },
        {
          new: true,
        }
      ).exec((err, founduser) => {
        if (err) {
          // console.log(err);
          return res.json({ error: err });
        } else {
          // console.log(founduser);
          res.json({ founduser });
        }
      });
    }
  },
  async changePassword(req, res) {
    const { id, password } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        {
          new: true,
        }
      ).exec((err, founduser) => {
        if (err) {
          //console.log(err);
          return res.json({ error: err });
        } else {
          //console.log(founduser);
          res.json({ founduser });
        }
      });
    });
  },
  async changePicture(req, res) {
    const { id, image_URL } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }
    // console.log(image_URL);

    await User.findByIdAndUpdate(
      id,
      {
        image_URL,
      },
      {
        new: true,
      }
    ).exec((err, founduser) => {
      if (err) {
        // console.log(err);
        return res.json({ error: err });
      } else {
        // console.log(founduser);
        res.json({ founduser });
      }
    });
  },
  async removePicture(req, res) {
    const { id } = req.body;
    if (!id) {
      return res.json({ error: "Login First" });
    }

    await User.findByIdAndUpdate(
      id,
      {
        image_URL: "https://static.thenounproject.com/png/17241-200.png",
      },
      {
        new: true,
      }
    ).exec((err, founduser) => {
      if (err) {
        // console.log(err);
        return res.json({ error: err });
      } else {
        // console.log(founduser);
        res.json({ founduser });
      }
    });
  },

  async addCertificate(req,res){
    const {skill_id,url} = req.body;

    User.find(
      {
      _id:req.user._id,
      },
      {
        skills:{
          $elemMatch:{
            _id:skill_id
          }
        }
      }).then((data)=>{
        if(data[0].skills[0]){
          User.updateOne(
            {
              _id:req.user._id,
              "skills._id":skill_id
            },
            {
              $set:{
                "skills.$.certificate":url,
              }
            }
          ).then(
            res.json({message:"Certificate added"})
          )
        }
      })
  }
};
