const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MONGODB_URL } = require("./config/keys");

const app = express();
const PORT = 5000;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const server = require("http").createServer(app);
const io = require("socket.io")(server);

require("./socket/refresh")(io);

const auth = require("./routes/authRoutes");
const post = require("./routes/postRoutes");
const event = require("./routes/eventRoutes");
const userSearch = require("./routes/userSearchRoutes");
const personalChat = require("./routes/personalChatRoutes");
const profile = require("./routes/profileRoutes");
const userProfile = require("./routes/userProfileRoutes");
const groupChat = require("./routes/groupChatRoutes");

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

mongoose
  .connect(MONGODB_URL, options)
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Connection to the database is fail");
  });

app.use("/api/connect", auth);
app.use("/api/connect", post);
app.use("/api/connect", event);
app.use("/api/connect", userSearch);
app.use("/api/connect", personalChat);
app.use("/api/connect", profile);
app.use("/api/connect", userProfile);
app.use("/api/connect", groupChat);

server.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});
