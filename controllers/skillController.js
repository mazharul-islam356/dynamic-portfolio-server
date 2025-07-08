const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

async function getSkills(req, res) {
  const db = getDB();
  const skills = await db.collection("skills").find().toArray();
  res.json(skills);
}

async function addSkill(req, res) {
  const { name, icon } = req.body;
  const db = getDB();
  await db.collection("skills").insertOne({ name, icon });
  res.json({ message: "Skill added" });
}

async function deleteSkill(req, res) {
  const db = getDB();
  await db.collection("skills").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: "Skill deleted" });
}

module.exports = { getSkills, addSkill, deleteSkill };
