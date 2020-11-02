const { Router } = require("express");

const authctrl = require("../controllers/auth");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.post("/signup", authctrl.createUser);
router.post("/login", authctrl.loginUser);
router.get("/verify/:token", authctrl.validateEmail);
router.post("/resend-verification", authctrl.resendEmail);
router.post("/changePassMailer", authctrl.changePassMailer);
router.put("/changePass", authctrl.changePass);
router.get("/logOut", requireLogin, authctrl.logOutUser);

module.exports = router;
