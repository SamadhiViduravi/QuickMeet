"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Search, Plus, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
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

interface User {
  id: string
  name: string
  email: string
  department: string
  role: string
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchMeetings()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }
  }

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.participants.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const upcomingMeetings = filteredMeetings
    .filter((meeting) => {
      const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`)
      return meetingDate > new Date()
    })
    .slice(0, 5)

  const todaysMeetings = filteredMeetings.filter((meeting) => {
    const today = new Date().toISOString().split("T")[0]
    return meeting.date === today
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">QuickMeet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Badge variant="secondary">{user?.role}</Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search meetings or participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/meetings/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Meeting
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysMeetings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meetings */}
        {todaysMeetings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your meetings for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-gray-600">
                        {meeting.startTime} - {meeting.endTime}
                      </p>
                      <div className="flex items-center mt-2">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{meeting.participants.length} participants</span>
                      </div>
                    </div>
                    <Badge variant="outline">Today</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming meetings found</p>
                <Link href="/meetings/create">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule a Meeting
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.startTime} - {meeting.endTime}
                      </p>
                      <div className="flex items-center mt-2">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{meeting.participants.join(", ")}</span>
                      </div>
                      {meeting.description && <p className="text-sm text-gray-500 mt-1">{meeting.description}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {new Date(`${meeting.date}T${meeting.startTime}`) > new Date(Date.now() + 24 * 60 * 60 * 1000)
                          ? "Upcoming"
                          : "Soon"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
