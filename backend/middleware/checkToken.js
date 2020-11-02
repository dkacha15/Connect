const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/keys");
const User = require("../models/userSchema");

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;
  const authorization = req.cookies.access_token;
  if (!authorization) {
    return res.json({ error: "You must be logged in" });
  }
  const token = authorization.replace("bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.json({ error: "You must be logged in" });
    }

    const { _id } = payload;
    User.findById(_id).then((userData) => {
      req.user = userData;
      next();
    });
  });
};
