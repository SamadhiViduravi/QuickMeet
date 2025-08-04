"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  department: string
}

interface Conflict {
  user: string
  meeting: string
  time: string
}

export default function CreateMeetingPage() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    participants: [] as string[],
  })
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (formData.date && formData.startTime && formData.endTime && formData.participants.length > 0) {
      checkConflicts()
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.participants])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const checkConflicts = async () => {
    try {
      const response = await fetch("/api/meetings/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          participants: formData.participants,
        }),
      })
      if (response.ok) {
        const conflictsData = await response.json()
        setConflicts(conflictsData)
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (conflicts.length > 0) {
      setError("Please resolve time conflicts before creating the meeting")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create meeting")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addParticipant = (userEmail: string) => {
    if (!formData.participants.includes(userEmail)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, userEmail],
      })
    }
    setSearchTerm("")
  }

  const removeParticipant = (userEmail: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== userEmail),
    })
  }

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((user) => !formData.participants.includes(user.email))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Meeting</CardTitle>
            <CardDescription>Schedule a meeting with your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Weekly Team Standup"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting agenda and details..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Participants</Label>

                {/* Selected Participants */}
                {formData.participants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.participants.map((email) => {
                      const user = users.find((u) => u.email === email)
                      return (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {user?.name || email}
                          <button
                            type="button"
                            onClick={() => removeParticipant(email)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}

                {/* Search Users */}
                <Input
                  placeholder="Search employees to add..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* User List */}
                {searchTerm && filteredUsers.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredUsers.slice(0, 5).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addParticipant(user.email)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.email} • {user.department}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conflict Warnings */}
              {conflicts.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Time Conflicts Detected:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="text-sm">
                          {conflict.user} has "{conflict.meeting}" at {conflict.time}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || conflicts.length > 0} className="flex-1">
                  {loading ? "Creating Meeting..." : "Create Meeting"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
