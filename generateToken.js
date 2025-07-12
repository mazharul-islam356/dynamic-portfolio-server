const jwt = require("jsonwebtoken")

const payload = {
  email: "testuser@example.com",
}

const secret = "your_super_secret_key" // must match your backend JWT_SECRET

const token = jwt.sign(payload, secret, { expiresIn: "2d" })

console.log("Generated JWT Token:")
console.log(token)
