const router = require("express").Router();
const { getSkills, addSkill, deleteSkill } = require("../controllers/skillController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", getSkills);
router.post("/", verifyToken, addSkill);
router.delete("/:id", verifyToken, deleteSkill);

module.exports = router;
