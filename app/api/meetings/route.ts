import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// Mock meetings database
const meetings = [
  {
    id: "1",
    title: "Weekly Team Standup",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "09:30",
    participants: ["john.doe@company.com", "jane.smith@company.com", "david.brown@company.com"],
    organizer: "john.doe@company.com",
    description: "Weekly team sync to discuss progress and blockers",
  },
  {
    id: "2",
    title: "Product Planning Meeting",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "15:30",
    participants: ["jane.smith@company.com", "mike.johnson@company.com"],
    organizer: "jane.smith@company.com",
    description: "Planning session for Q1 product roadmap",
  },
  {
    id: "3",
    title: "Client Presentation",
    date: "2024-01-17",
    startTime: "10:00",
    endTime: "11:00",
    participants: ["mike.johnson@company.com", "sarah.wilson@company.com"],
    organizer: "mike.johnson@company.com",
    description: "Quarterly business review with key client",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Filter meetings where user is participant or organizer
    const userMeetings = meetings.filter(
      (meeting) => meeting.participants.includes(decoded.email) || meeting.organizer === decoded.email,
    )

    return NextResponse.json(userMeetings)
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    const { title, date, startTime, endTime, participants, description } = await request.json()

    if (!title || !date || !startTime || !endTime || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate time
    if (startTime >= endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    const newMeeting = {
      id: String(meetings.length + 1),
      title,
      date,
      startTime,
      endTime,
      participants,
      organizer: decoded.email,
      description: description || "",
    }

    meetings.push(newMeeting)

    return NextResponse.json(newMeeting, { status: 201 })
  } catch (error) {
    console.error("Create meeting error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
