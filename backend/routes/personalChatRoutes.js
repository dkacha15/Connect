const { Router } = require("express");

const chatCtrl = require("../controllers/personalChat");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.get("/getAllChatroom", requireLogin, chatCtrl.getAllRooms);

router.post(
  "/sendMessage/:sender_id/:receiver_id",
  requireLogin,
  chatCtrl.sendMessage
);

router.get(
  "/getMessage/:sender_id/:receiver_id",
  requireLogin,
  chatCtrl.getAllMessages
);

module.exports = router;
