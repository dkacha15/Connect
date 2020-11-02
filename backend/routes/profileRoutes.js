const { Router } = require("express");

const profilectrl = require("../controllers/profile");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.post("/myposts", requireLogin, profilectrl.showPosts);
router.post("/myevents", requireLogin, profilectrl.showEvents);
router.post("/myskills", requireLogin, profilectrl.showSkills);
router.post("/myProfile", requireLogin, profilectrl.showProfile);
router.post("/editProfile", requireLogin, profilectrl.editProfile);
router.put("/updateProfile", requireLogin, profilectrl.updateProfile);
router.put("/changePassword", requireLogin, profilectrl.changePassword);
router.put("/changePicture", requireLogin, profilectrl.changePicture);
router.put("/removePicture", requireLogin, profilectrl.removePicture);
module.exports = router;
