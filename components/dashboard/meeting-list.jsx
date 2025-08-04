"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMeeting } from "@/contexts/meeting-context"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, Users, Trash2, Edit, AlertTriangle } from "lucide-react"

export default function MeetingList() {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { getMeetingsByUser, deleteMeeting } = useMeeting()
  const { user, getAllUsers } = useAuth()

  const userMeetings = getMeetingsByUser(user.id).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`)
    const dateB = new Date(`${b.date}T${b.startTime}`)
    return dateA - dateB
  })

  const allUsers = getAllUsers()

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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
    return participantIds.map((id) => {
      const participant = allUsers.find((u) => u.id === id)
      return participant ? participant.name : "Unknown User"
    })
  }

  const handleDelete = async (meetingId) => {
    await deleteMeeting(meetingId)
    setDeleteConfirm(null)
  }

  const isPastMeeting = (date, endTime) => {
    const meetingEnd = new Date(`${date}T${endTime}`)
    return meetingEnd < new Date()
  }

  const upcomingMeetings = userMeetings.filter((meeting) => !isPastMeeting(meeting.date, meeting.endTime))

  const pastMeetings = userMeetings.filter((meeting) => isPastMeeting(meeting.date, meeting.endTime))

  const MeetingCard = ({ meeting, isPast = false }) => (
    <Card key={meeting.id} className={`${isPast ? "opacity-75" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{meeting.title}</h3>
              <Badge variant={meeting.organizer === user.id ? "default" : "secondary"}>
                {meeting.organizer === user.id ? "Organizer" : "Participant"}
              </Badge>
              {isPast && <Badge variant="outline">Past</Badge>}
            </div>

            {meeting.description && <p className="text-gray-600 mb-3">{meeting.description}</p>}

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(meeting.date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {getParticipantNames(meeting.participants).join(", ")}
              </div>
            </div>
          </div>

          {meeting.organizer === user.id && !isPast && (
            <div className="flex space-x-2 ml-4">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(meeting.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {deleteConfirm === meeting.id && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Are you sure you want to delete this meeting?
              <div className="flex space-x-2 mt-2">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(meeting.id)}>
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Meetings ({upcomingMeetings.length})
        </h2>

        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">No upcoming meetings scheduled</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Past Meetings ({pastMeetings.length})
          </h2>

          <div className="space-y-4">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} isPast={true} />
            ))}
            {pastMeetings.length > 5 && (
              <Card>
                <CardContent className="p-4 text-center text-gray-500">
                  And {pastMeetings.length - 5} more past meetings...
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
