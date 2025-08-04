"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMeeting } from "@/contexts/meeting-context"
import { useAuth } from "@/contexts/auth-context"
import { Search, Calendar, Clock, Users } from "lucide-react"

export default function SearchMeetings() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const { searchMeetings } = useMeeting()
  const { user, getAllUsers } = useAuth()

  const allUsers = getAllUsers()

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchMeetings(query)
      setResults(searchResults)
    } else {
      setResults([])
    }
  }, [query, searchMeetings])

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

  const highlightText = (text, query) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const isPastMeeting = (date, endTime) => {
    const meetingEnd = new Date(`${date}T${endTime}`)
    return meetingEnd < new Date()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by meeting title, description, or participant name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {query.trim() && (
            <p className="text-sm text-gray-600 mt-2">
              {results.length} meeting(s) found for "{query}"
            </p>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((meeting) => (
            <Card key={meeting.id} className={isPastMeeting(meeting.date, meeting.endTime) ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{highlightText(meeting.title, query)}</h3>
                      <Badge variant={meeting.organizer === user.id ? "default" : "secondary"}>
                        {meeting.organizer === user.id ? "Organizer" : "Participant"}
                      </Badge>
                      {isPastMeeting(meeting.date, meeting.endTime) && <Badge variant="outline">Past</Badge>}
                    </div>

                    {meeting.description && (
                      <p className="text-gray-600 mb-3">{highlightText(meeting.description, query)}</p>
                    )}

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
                        <span>
                          {getParticipantNames(meeting.participants).map((name, index) => (
                            <span key={index}>
                              {highlightText(name, query)}
                              {index < meeting.participants.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No meetings found matching your search criteria.</p>
            <p className="text-sm mt-2">Try searching for meeting titles, descriptions, or participant names.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
