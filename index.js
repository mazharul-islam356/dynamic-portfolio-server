require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { MongoClient, ObjectId, GridFSBucket } = require("mongodb")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// multer setup
const multer = require("multer")

const upload = multer({ storage: multer.memoryStorage() }) // store in memory
const getBucket = () => new GridFSBucket(db, { bucketName: "images" })


/* ---------- 1. DB Setup ---------- */
let db
const client = new MongoClient(process.env.MONGO_URI)
async function connectDB() {
  await client.connect()
  db = client.db("portfolioDB")
  console.log("✅ MongoDB connected")
}
connectDB().catch(console.error)

/* ---------- 2. App ---------- */
const app = express()
app.use(cors())
app.use(express.json())

/* ---------- 3. Auth Middleware ---------- */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })

  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = decoded
    next()
  })
}


// image upload


// Upload a single image (used for hero and skills)
app.post("/api/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: "No image file provided" })

    const fileId = new ObjectId()
    await getBucket().openUploadStreamWithId(fileId, file.originalname).end(file.buffer)

    res.json({ fileId: fileId.toString() })
  } catch (err) {
    console.error("Upload error:", err)
    res.status(500).json({ error: "Upload failed" })
  }
})

app.post("/upload", upload.single("image"), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: "No image file provided" })

  const fileId = new ObjectId()
  await getBucket().openUploadStreamWithId(fileId, file.originalname).end(file.buffer)

  res.json({ fileId })
})


/* ---------- 4. Auth Routes ---------- */

// Register
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body
  const existing = await db.collection("users").findOne({ email })
  if (existing) return res.status(409).json({ error: "User already exists" })

  const hashed = await bcrypt.hash(password, 10)
  await db.collection("users").insertOne({ email, password: hashed })
  res.json({ message: "User registered" })
})

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body
  const user = await db.collection("users").findOne({ email })
  if (!user) return res.status(404).json({ error: "User not found" })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: "Invalid password" })

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2d" })
  res.json({ token })
})

/* ---------- 5. Hero Routes ---------- */
app.get("/api/hero", async (_, res) => {
  const hero = await db.collection("hero").findOne({})
  if (!hero) return res.json({})
  res.json(hero)
})




app.put("/api/hero", verifyToken, async (req, res) => {
  const { name, brief, resume, image } = req.body
  await db.collection("hero").deleteMany({})
  await db.collection("hero").insertOne({ name, brief, resume, image })
  res.json({ message: "Hero updated" })
})



/* ---------- 6. Skills Routes ---------- */
app.post("/api/skills", verifyToken, async (req, res) => {
  const { name, iconId } = req.body;

  if (!name || !iconId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const iconUrl = `${process.env.SERVER_URL}/api/images/${iconId}`;
  await db.collection("skills").insertOne({ name, icon: iconUrl });

  res.json({ message: "Skill added" });
});


// Skills - Get all
app.get("/api/skills", async (_, res) => {
  const skills = await db.collection("skills").find().toArray()
  res.json(skills)
})



app.delete("/api/skills/:id", verifyToken, async (req, res) => {
  await db.collection("skills").deleteOne({ _id: new ObjectId(req.params.id) })
  res.json({ message: "Skill deleted" })
})

/* ---------- 7. Projects Routes ---------- */
app.get("/api/projects", async (_, res) => {
  const projects = await db
    .collection("projects")
    .find()
    .sort({ order: 1 })
    .toArray()
  res.json(projects)
})

app.get("/api/images/:id", async (req, res) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid image ID" })
    }

    const stream = getBucket().openDownloadStream(new ObjectId(id))
    stream.on("error", () => {
      res.status(404).json({ error: "Image not found" })
    })
    res.set("Content-Type", "image/jpeg") // or detect content type
    stream.pipe(res)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch image" })
  }
})



app.post("/api/projects", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      github,
      live,
      order,
      stack
    } = req.body

    // Upload image to GridFS
 const file = req.file
if (!file) return res.status(400).json({ error: "Image file missing" })

// Save file to GridFS
const fileId = new ObjectId()
await getBucket().openUploadStreamWithId(fileId, file.originalname).end(file.buffer)

    await db.collection("projects").insertOne({
      title,
      description,
      github,
      live,
      order: Number(order),
      stack: JSON.parse(stack),
      imageId: fileId
    })

    res.json({ message: "Project added" })
  } catch (err) {
    console.error("Upload error:", err)
    res.status(500).json({ error: "Upload failed" })
  }
})


app.delete("/api/projects/:id", verifyToken, async (req, res) => {
  await db.collection("projects").deleteOne({ _id: new ObjectId(req.params.id) })
  res.json({ message: "Project deleted" })
})





/* ---------- 8. Start ---------- */
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`))
