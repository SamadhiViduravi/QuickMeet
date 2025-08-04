import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// Mock meetings database (same as in meetings/route.ts)
const meetings = [
  {
    id: "1",
    title: "Weekly Team Standup",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "09:30",
    participants: ["john.doe@company.com", "jane.smith@company.com", "david.brown@company.com"],
    organizer: "john.doe@company.com",
  },
  {
    id: "2",
    title: "Product Planning Meeting",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "15:30",
    participants: ["jane.smith@company.com", "mike.johnson@company.com"],
    organizer: "jane.smith@company.com",
  },
]

const users = [
  { id: "1", name: "John Doe", email: "john.doe@company.com" },
  { id: "2", name: "Jane Smith", email: "jane.smith@company.com" },
  { id: "3", name: "Mike Johnson", email: "mike.johnson@company.com" },
  { id: "4", name: "Sarah Wilson", email: "sarah.wilson@company.com" },
  { id: "5", name: "David Brown", email: "david.brown@company.com" },
]

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function hasTimeConflict(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  return start1Min < end2Min && start2Min < end1Min
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    verify(token, process.env.JWT_SECRET || "your-secret-key")

    const { date, startTime, endTime, participants } = await request.json()

    if (!date || !startTime || !endTime || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const conflicts = []

    // Check for conflicts with existing meetings
    for (const participant of participants) {
      const participantMeetings = meetings.filter(
        (meeting) =>
          meeting.date === date && (meeting.participants.includes(participant) || meeting.organizer === participant),
      )

      for (const meeting of participantMeetings) {
        if (hasTimeConflict(startTime, endTime, meeting.startTime, meeting.endTime)) {
          const user = users.find((u) => u.email === participant)
          conflicts.push({
            user: user?.name || participant,
            meeting: meeting.title,
            time: `${meeting.startTime} - ${meeting.endTime}`,
          })
        }
      }
    }

    return NextResponse.json(conflicts)
  } catch (error) {
    console.error("Conflict check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
