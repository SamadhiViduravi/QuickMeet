"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMeeting } from "@/contexts/meeting-context"
import { useAuth } from "@/contexts/auth-context"
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { getMeetingsByUser, getMeetingsByDate } = useMeeting()
  const { user, getAllUsers } = useAuth()

  const allUsers = getAllUsers()
  const userMeetings = getMeetingsByUser(user.id)

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDateObj.toISOString().split("T")[0]
      const dayMeetings = getMeetingsByDate(dateStr).filter(
        (meeting) => meeting.participants.includes(user.id) || meeting.organizer === user.id,
      )

      days.push({
        date: new Date(currentDateObj),
        dateStr,
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split("T")[0],
        meetings: dayMeetings,
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }, [currentDate, userMeetings, user.id, getMeetingsByDate])

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getParticipantNames = (participantIds) => {
    return participantIds
      .map((id) => {
        const user = allUsers.find((u) => u.id === id)
        return user ? user.name.split(" ")[0] : "Unknown"
      })
      .join(", ")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${day.isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                  } ${day.isToday ? "text-blue-600" : ""}`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {day.meetings.slice(0, 2).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                      title={`${meeting.title} - ${formatTime(meeting.startTime)}`}
                    >
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(meeting.startTime)}
                      </div>
                      <div className="font-medium truncate">{meeting.title}</div>
                    </div>
                  ))}
                  {day.meetings.length > 2 && (
                    <div className="text-xs text-gray-500">+{day.meetings.length - 2} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Today's Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date().toISOString().split("T")[0]
            const todayMeetings = getMeetingsByDate(today).filter(
              (meeting) => meeting.participants.includes(user.id) || meeting.organizer === user.id,
            )

            if (todayMeetings.length === 0) {
              return <p className="text-gray-500">No meetings scheduled for today</p>
            }

            return (
              <div className="space-y-3">
                {todayMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-gray-600">{meeting.description}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        <Users className="h-4 w-4 ml-3 mr-1" />
                        {getParticipantNames(meeting.participants)}
                      </div>
                    </div>
                    <Badge variant="secondary">{meeting.organizer === user.id ? "Organizer" : "Participant"}</Badge>
                  </div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
