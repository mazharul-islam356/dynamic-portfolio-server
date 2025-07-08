const router = require("express").Router();
const { getHero, updateHero } = require("../controllers/heroController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", getHero);
router.put("/", verifyToken, updateHero);

module.exports = router;
