const { Router } = require("express");
const router = Router();

const postCtrl = require("../controllers/post");
const requireLogin = require("../middleware/checkToken");

router.post("/createPost", requireLogin, postCtrl.createPost);
router.get("/allPosts", requireLogin, postCtrl.allPosts);
router.put("/likePost", requireLogin, postCtrl.likePost);
router.put("/disLikePost", requireLogin, postCtrl.disLikePost);
router.put("/comment", requireLogin, postCtrl.comment);

module.exports = router;
