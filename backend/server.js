const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const fs = require("fs-extra")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = "your-secret-key-change-in-production"

// Middleware
app.use(cors())
app.use(express.json())

// Data storage paths
const DATA_DIR = path.join(__dirname, "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const MEETINGS_FILE = path.join(DATA_DIR, "meetings.json")

// Ensure data directory and files exist
async function initializeData() {
  await fs.ensureDir(DATA_DIR)

  if (!(await fs.pathExists(USERS_FILE))) {
    await fs.writeJson(USERS_FILE, [])
  }

  if (!(await fs.pathExists(MEETINGS_FILE))) {
    await fs.writeJson(MEETINGS_FILE, [])
  }
}

// Helper functions
async function readUsers() {
  return await fs.readJson(USERS_FILE)
}

async function writeUsers(users) {
  await fs.writeJson(USERS_FILE, users, { spaces: 2 })
}

async function readMeetings() {
  return await fs.readJson(MEETINGS_FILE)
}

async function writeMeetings(meetings) {
  await fs.writeJson(MEETINGS_FILE, meetings, { spaces: 2 })
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Routes

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, department } = req.body

    const users = await readUsers()

    // Check if user already exists
    if (users.find((user) => user.email === email)) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      department,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    await writeUsers(users)

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, department: newUser.department },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const users = await readUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "24h" })

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, department: user.department },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all users (for participant selection)
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await readUsers()
    const publicUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
    }))
    res.json(publicUsers)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create meeting
app.post("/api/meetings", authenticateToken, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, participants } = req.body

    const meetings = await readMeetings()

    // Check for time conflicts
    const newMeetingStart = new Date(`${date}T${startTime}`)
    const newMeetingEnd = new Date(`${date}T${endTime}`)

    const conflicts = meetings.filter((meeting) => {
      const meetingStart = new Date(`${meeting.date}T${meeting.startTime}`)
      const meetingEnd = new Date(`${meeting.date}T${meeting.endTime}`)

      // Check if any participant has a conflict
      const hasParticipantConflict = meeting.participants.some((p) => participants.includes(p) || p === req.user.id)

      if (!hasParticipantConflict) return false

      // Check time overlap
      return newMeetingStart < meetingEnd && newMeetingEnd > meetingStart
    })

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Time conflict detected",
        conflicts: conflicts.map((c) => ({ title: c.title, date: c.date, startTime: c.startTime, endTime: c.endTime })),
      })
    }

    const newMeeting = {
      id: uuidv4(),
      title,
      description,
      date,
      startTime,
      endTime,
      participants: [...participants, req.user.id],
      organizer: req.user.id,
      createdAt: new Date().toISOString(),
    }

    meetings.push(newMeeting)
    await writeMeetings(meetings)

    res.status(201).json({ message: "Meeting created successfully", meeting: newMeeting })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get meetings
app.get("/api/meetings", authenticateToken, async (req, res) => {
  try {
    const meetings = await readMeetings()
    const users = await readUsers()

    // Filter meetings where user is participant or organizer
    const userMeetings = meetings.filter(
      (meeting) => meeting.participants.includes(req.user.id) || meeting.organizer === req.user.id,
    )

    // Populate participant names
    const populatedMeetings = userMeetings.map((meeting) => ({
      ...meeting,
      organizerName: users.find((u) => u.id === meeting.organizer)?.name || "Unknown",
      participantNames: meeting.participants.map((pId) => users.find((u) => u.id === pId)?.name || "Unknown"),
    }))

    res.json(populatedMeetings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Search meetings
app.get("/api/meetings/search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query
    const meetings = await readMeetings()
    const users = await readUsers()

    const userMeetings = meetings.filter(
      (meeting) => meeting.participants.includes(req.user.id) || meeting.organizer === req.user.id,
    )

    const filteredMeetings = userMeetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query.toLowerCase()) ||
        meeting.description.toLowerCase().includes(query.toLowerCase()) ||
        users
          .find((u) => u.id === meeting.organizer)
          ?.name.toLowerCase()
          .includes(query.toLowerCase()),
    )

    const populatedMeetings = filteredMeetings.map((meeting) => ({
      ...meeting,
      organizerName: users.find((u) => u.id === meeting.organizer)?.name || "Unknown",
      participantNames: meeting.participants.map((pId) => users.find((u) => u.id === pId)?.name || "Unknown"),
    }))

    res.json(populatedMeetings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete meeting
app.delete("/api/meetings/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const meetings = await readMeetings()

    const meetingIndex = meetings.findIndex((m) => m.id === id && m.organizer === req.user.id)

    if (meetingIndex === -1) {
      return res.status(404).json({ message: "Meeting not found or unauthorized" })
    }

    meetings.splice(meetingIndex, 1)
    await writeMeetings(meetings)

    res.json({ message: "Meeting deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Initialize data and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
