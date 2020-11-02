const { Router } = require("express");

const userCtrl = require("../controllers/userSearch");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.post("/searchUser", requireLogin, userCtrl.searchUser);

router.get("/allNotifications", requireLogin, userCtrl.getAllNotificaions);

router.post("/searchOtherUser", requireLogin, userCtrl.searchOtherUser);
router.post("/searchUserAsPerSkill", requireLogin, userCtrl.searchSkilledUser);
router.get(
  "/markedAllNotifications",
  requireLogin,
  userCtrl.markAllNotification
);

router.get("/getCurrentUser", requireLogin, userCtrl.getUser);

module.exports = router;
