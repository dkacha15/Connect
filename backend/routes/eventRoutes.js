const { Router } = require("express");

const eventctrl = require("../controllers/event");
const requireLogin = require("../middleware/checkToken");

const router = Router();

router.post("/addevent", requireLogin, eventctrl.createEvent);
router.post("/addcustomevent", requireLogin, eventctrl.createCustomEvent);
router.post("/event", requireLogin, eventctrl.viewEvent);
router.post("/interested", requireLogin, eventctrl.interested);
router.post("/getSkills", requireLogin, eventctrl.getSkills);

module.exports = router;
