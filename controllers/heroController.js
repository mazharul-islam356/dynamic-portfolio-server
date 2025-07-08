const { getDB } = require("../config/db");

async function getHero(req, res) {
  const db = getDB();
  const hero = await db.collection("hero").findOne({});
  res.json(hero || {});
}

async function updateHero(req, res) {
  const { name, brief, image, resume } = req.body;
  const db = getDB();
  await db.collection("hero").deleteMany({});
  await db.collection("hero").insertOne({ name, brief, image, resume });
  res.json({ message: "Hero section updated" });
}

module.exports = { getHero, updateHero };
