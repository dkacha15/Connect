module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("refreshPost", (data) => {
      io.emit("refreshPostPage", {});
    });

    socket.on("refreshPersonalChatRoom", (data) => {
      io.emit("refreshPersonalChatPage", {});
    });

    socket.on("refreshPersonalMessages", (data) => {
      io.emit("refreshPersonalMessagePage", {});
    });

    socket.on("refreshGroupChatRoom", (data) => {
      io.emit("refreshGroupChatPage", {});
    });

    socket.on("refreshGroupMessages", (data) => {
      io.emit("refreshGroupMessagePage", {});
    });

    socket.on("refreshProfile", (data) => {
      io.emit("refreshProfilePage", {});
    });

    socket.on("refreshNotifications", () => {
      io.emit("refreshNotificationsModal", {});
    });

    socket.on("refresh", (data) => {
      io.emit("refreshPage", {});
    });
  });
};
