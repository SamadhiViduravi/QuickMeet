"use client"

import { createContext, useContext, useState } from "react"
import { useAuth } from "./auth-context"

const MeetingContext = createContext()

// Mock meetings database
const mockMeetings = [
  {
    id: 1,
    title: "Weekly Team Standup",
    description: "Weekly team sync and updates",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "10:00",
    participants: [1, 2, 3],
    organizer: 1,
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: 2,
    title: "Project Planning Session",
    description: "Planning for Q1 projects",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "15:30",
    participants: [1, 4],
    organizer: 1,
    createdAt: "2024-01-10T11:00:00Z",
  },
]

export function MeetingProvider({ children }) {
  const [meetings, setMeetings] = useState(mockMeetings)
  const { user, getAllUsers } = useAuth()

  const createMeeting = async (meetingData) => {
    const newMeeting = {
      id: meetings.length + 1,
      ...meetingData,
      organizer: user.id,
      createdAt: new Date().toISOString(),
    }

    setMeetings((prev) => [...prev, newMeeting])
    return { success: true, meeting: newMeeting }
  }

  const updateMeeting = async (id, meetingData) => {
    setMeetings((prev) => prev.map((meeting) => (meeting.id === id ? { ...meeting, ...meetingData } : meeting)))
    return { success: true }
  }

  const deleteMeeting = async (id) => {
    setMeetings((prev) => prev.filter((meeting) => meeting.id !== id))
    return { success: true }
  }

  const getMeetingsByUser = (userId) => {
    return meetings.filter((meeting) => meeting.participants.includes(userId) || meeting.organizer === userId)
  }

  const getMeetingsByDate = (date) => {
    return meetings.filter((meeting) => meeting.date === date)
  }

  const checkTimeConflict = (date, startTime, endTime, excludeMeetingId = null) => {
    const userMeetings = getMeetingsByUser(user.id)
    const dayMeetings = userMeetings.filter((meeting) => meeting.date === date && meeting.id !== excludeMeetingId)

    return dayMeetings.some((meeting) => {
      const meetingStart = meeting.startTime
      const meetingEnd = meeting.endTime

      return startTime < meetingEnd && endTime > meetingStart
    })
  }

  const searchMeetings = (query) => {
    const allUsers = getAllUsers()
    const userMeetings = getMeetingsByUser(user.id)

    return userMeetings.filter((meeting) => {
      const titleMatch = meeting.title.toLowerCase().includes(query.toLowerCase())
      const descriptionMatch = meeting.description.toLowerCase().includes(query.toLowerCase())

      // Search by participant names
      const participantNames = meeting.participants
        .map((pId) => {
          const participant = allUsers.find((u) => u.id === pId)
          return participant ? participant.name : ""
        })
        .join(" ")
      const participantMatch = participantNames.toLowerCase().includes(query.toLowerCase())

      return titleMatch || descriptionMatch || participantMatch
    })
  }

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        getMeetingsByUser,
        getMeetingsByDate,
        checkTimeConflict,
        searchMeetings,
      }}
    >
      {children}
    </MeetingContext.Provider>
  )
}

export const useMeeting = () => {
  const context = useContext(MeetingContext)
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider")
  }
  return context
}
