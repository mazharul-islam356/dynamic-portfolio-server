const router = require("express").Router();
const { getProjects, addProject, deleteProject } = require("../controllers/projectController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", getProjects);
router.post("/", verifyToken, addProject);
router.delete("/:id", verifyToken, deleteProject);

module.exports = router;
