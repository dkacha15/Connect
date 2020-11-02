const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userSchema");
const { JWT_SECRET, EMAIL, PASS } = require("../config/keys");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  //host: 'smtp.gmail.com',
  service: "gmail",
  // port: 587,
  // ignoreTLS: false,
  // secure: false,
  auth: {
    user: EMAIL,
    pass: PASS,
  },
});

module.exports = {
  async createUser(req, res) {
    const { name, primary_email, secondary_email, type, password } = req.body;
    let secondaryEmail;

    if (secondary_email === "@ddu.ac.in") {
      secondaryEmail = "";
    } else {
      secondaryEmail = secondary_email;
    }

    if (!name || !primary_email || !type || !password) {
      return res.json({ error: "All fields are required" });
    }

    await User.findOne({
      $or: [{ primary_email }, { secondary_email }],
    })
      .then((userExists) => {
        if (userExists) {
          return res.json({ error: "User already exists" });
        }

        bcrypt.hash(password, 12).then((hasedPassword) => {
          const user = new User({
            name,
            primary_email,
            secondary_email: secondaryEmail,
            type,
            password: hasedPassword,
          });

          user
            .save()
            .then(() => {
              const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
                expiresIn: "24h",
              });
              // console.log(token);
              const url = "/api/connect/verify/" + token;
              let mailOptions = {
                from: '"CONNECT" <complect.with.connect@gmail.com>',
                to: user.primary_email,
                subject: "Email Confirmation",
                html:
                  "<h1>Greetings from Connect!</h1> <br/> Click on the link to verify your email: <br/> <a href=http://localhost:5000" +
                  url +
                  ">Click Here</a>",
              };
              transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  // console.log("Email Sent");
                  res.json({
                    message: "Register Successfully",
                    token,
                    user: {
                      id: user._id,
                      name: user.name,
                      type: user.type,
                      name: user.name,
                    },
                  });
                  // res.json({
                  //   message: "Register Successfully",
                  //   token,
                  //   user: { id: user._id, name: user.name, type: user.type },
                  // });
                }
              });
            })
            .catch((err) => {
              console.log(err);
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ error: "All fields are required" });
    }

    await User.findOne({
      $or: [{ primary_email: email }, { secondary_email: email }],
    }).then((saveUser) => {
      if (!saveUser) {
        return res.json({ error: "Email or Password is incorrect" });
      }
      if (!saveUser.confirm) {
        return res.json({ error: "Email Confirmation Not Done" });
      }
      bcrypt
        .compare(password, saveUser.password)
        .then((doMatch) => {
          if (doMatch) {
            const token = jwt.sign({ _id: saveUser._id }, JWT_SECRET, {
              expiresIn: "24h",
            });

            res.cookie("access_token", "bearer " + token, {
              maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({
              message: "Login Successfull",
              token,
              user: {
                id: saveUser._id,
                name: saveUser.name,
                type: saveUser.type,
                name: saveUser.name,
              },
            });
          } else {
            return res.json({ error: "Email or Password is incorrect" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },

  async validateEmail(req, res) {
    try {
      // console.log("Successfully registered User");
      // console.log(req.params);
      const user = jwt.verify(req.params.token, JWT_SECRET);
      // console.log("Successfully registered User" + user._id);
      let founduser = await User.findOneAndUpdate(
        { _id: user._id },
        { confirm: true }
      ).then((founduser) => {
        // console.log(founduser);
        // res.json({
        //     message: "Register Successfully",
        //     token:req.params.token,
        //     user: { id: founduser._id, name: founduser.name,
        //         type: founduser.type,},
        //   });
        res.redirect("http://localhost:3000");
      });
    } catch (e) {
      console.log(e);
    }
  },

  async resendEmail(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.json({ error: "Email is required" });
    }
    await User.findOne({
      $or: [{ primary_email: email }, { secondary_email: email }],
    })
      .then((saveUser) => {
        if (!saveUser) {
          return res.json({ error: "User not found,please register" });
        } else {
          const token = jwt.sign({ _id: saveUser._id }, JWT_SECRET, {
            expiresIn: "24h",
          });
          const url = "/api/connect/verify/" + token;
          let mailOptions = {
            from: '"CONNECT" <complect.with.connect@gmail.com>',
            to: saveUser.primary_email,
            subject: "Email Confirmation",
            html:
              "<h1>Greetings from Connect!</h1> <br/> Click on the link to verify your email: <br/> <a href=http://localhost:5000" +
              url +
              ">Click Here</a>",
          };
          transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              // console.log("Email Sent");
              res.json({
                message: "Register Successfully",
                token,
                user: {
                  id: saveUser._id,
                  name: saveUser.name,
                  type: saveUser.type,
                },
              });
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async changePassMailer(req, res) {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
      }
      const token = buffer.toString("hex");
      User.findOne({
        $or: [{ primary_email: email }, { secondary_email: email }],
      }).then((saveUser) => {
        if (!saveUser.confirm){
          res.json({message:false,reason:"Email Confirmation Not Done"});
        }
        else{
        saveUser.resetToken = token;
        saveUser.expireToken = Date.now() + 3600000;
        saveUser.save().then((result) => {
          const url = "http://localhost:3000/reset-password/" + token;
          let mailOptions = {
            from: '"CONNECT" <complect.with.connect@gmail.com>',
            to: email,
            subject: "Password Reset",
            html:
              "<h1>Greetings from Connect!</h1> <br/> Click on the link to reset your password: <br/> <a href=" +
              url +
              ">Click Here</a> <br/> <p>Note: The link will expire in one hour</p>",
          };
          transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              res.json({
                message: true,
              });
            }
          });
        });
      }
      });
    });
  },

  async changePass(req, res) {
    const { token, password } = req.body;

    bcrypt.hash(password, 12).then((hashedPassword) => {
      User.findOneAndUpdate(
        {
          resetToken: token,
          expireToken: { $gt: Date.now() },
        },
        {
          password: hashedPassword,
          resetToken: undefined,
          expireToken: undefined,
        },
        {
          new: true,
        }
      ).exec((err, founduser) => {
        if (!founduser) {
          return res.json({ error: "Session expired!" });
        } else {
          return res.json({ message: true });
        }
      });
    });
  },

  async logOutUser(req, res) {
    res.clearCookie("access_token");
    res.json({ message: "Logout Successfully" });
  },
};
