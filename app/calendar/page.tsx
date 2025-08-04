"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, CalendarIcon } from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  participants: string[]
  organizer: string
  description?: string
}

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings")
      if (response.ok) {
        const meetingsData = await response.json()
        setMeetings(meetingsData)
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getMeetingsForDate = (date: string) => {
    return meetings.filter((meeting) => meeting.date === date)
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const selectedDateMeetings = selectedDate ? getMeetingsForDate(selectedDate) : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2 h-24"></div>
                    }

                    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dayMeetings = getMeetingsForDate(dateString)
                    const isToday = dateString === new Date().toISOString().split("T")[0]
                    const isSelected = selectedDate === dateString

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateString)}
                        className={`p-2 h-24 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                          isToday ? "bg-blue-50 border-blue-200" : "border-gray-200"
                        } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                      >
                        <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                          {day}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayMeetings.slice(0, 2).map((meeting, idx) => (
                            <div key={idx} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                              {meeting.startTime} {meeting.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-gray-500">+{dayMeetings.length - 2} more</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? `Meetings for ${new Date(selectedDate).toLocaleDateString()}` : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateMeetings.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateMeetings.map((meeting) => (
                        <div key={meeting.id} className="p-4 border rounded-lg">
                          <h3 className="font-medium">{meeting.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {meeting.startTime} - {meeting.endTime}
                          </p>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {meeting.participants.length} participants
                            </Badge>
                          </div>
                          {meeting.description && <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>}
                          <div className="mt-2 text-xs text-gray-500">Organized by {meeting.organizer}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No meetings scheduled for this date</p>
                      <Link href="/meetings/create">
                        <Button className="mt-4" size="sm">
                          Schedule Meeting
                        </Button>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click on a date to view meetings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
