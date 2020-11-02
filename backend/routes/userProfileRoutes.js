const { Router } = require("express");

const userprofilectrl = require("../controllers/userProfile");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.get("/posts/:userid", requireLogin, userprofilectrl.showPosts);
router.get("/events/:id", requireLogin, userprofilectrl.showEvents);
router.get("/skills/:id", requireLogin, userprofilectrl.showSkills);
router.get("/profile/:id", requireLogin, userprofilectrl.userProfile);
router.post("/skillRating/:id", requireLogin, userprofilectrl.rateSkills);

module.exports = router;
