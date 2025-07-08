const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

async function getProjects(req, res) {
  const db = getDB();
  const projects = await db.collection("projects").find().sort({ order: 1 }).toArray();
  res.json(projects);
}

async function addProject(req, res) {
  const { title, description, image, github, live, order, stack } = req.body;
  const db = getDB();
  await db.collection("projects").insertOne({
    title,
    description,
    image,
    github,
    live,
    order: parseInt(order),
    stack,
  });
  res.json({ message: "Project added" });
}

async function deleteProject(req, res) {
  const db = getDB();
  await db.collection("projects").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: "Project deleted" });
}

module.exports = { getProjects, addProject, deleteProject };
