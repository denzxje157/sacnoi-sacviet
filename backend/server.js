import express from "express"
import cors from "cors"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: userMessage }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    )

    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: "Gemini API error" })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log("Backend running on port", PORT)
})
