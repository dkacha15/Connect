const { Router } = require("express");

const chatCtrl = require("../controllers/groupChat");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.get("/getGroupChatRooms", requireLogin, chatCtrl.getAllRooms);
router.get("/:chatroom_id/getAllMembers", requireLogin, chatCtrl.getAllMembers);
router.put("/sendGroupMessage/:sender_id", requireLogin, chatCtrl.sendMessage);
router.get(
  "/getGroupMessage/:sender_id/:chatroom_id",
  requireLogin,
  chatCtrl.getAllMessages
);
router.post("/addMember/:chatroom_id", requireLogin, chatCtrl.addMember);
router.post("/createChatRoom", requireLogin, chatCtrl.createChatRoom);
router.put("/:chatroom_id/changePicture", requireLogin, chatCtrl.changePicture);

module.exports = router;
