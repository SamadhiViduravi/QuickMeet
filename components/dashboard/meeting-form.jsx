"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMeeting } from "@/contexts/meeting-context"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react"

export default function MeetingForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: [],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const { createMeeting, checkTimeConflict } = useMeeting()
  const { user, getAllUsers } = useAuth()

  const allUsers = getAllUsers().filter((u) => u.id !== user.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    // Validation
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      setLoading(false)
      return
    }

    if (formData.startTime >= formData.endTime) {
      setMessage({ type: "error", text: "End time must be after start time" })
      setLoading(false)
      return
    }

    // Check for time conflicts
    const hasConflict = checkTimeConflict(formData.date, formData.startTime, formData.endTime)
    if (hasConflict) {
      setMessage({
        type: "error",
        text: "You have a time conflict with another meeting. Please choose a different time.",
      })
      setLoading(false)
      return
    }

    try {
      const result = await createMeeting({
        ...formData,
        participants: [...formData.participants, user.id], // Include organizer
      })

      if (result.success) {
        setMessage({ type: "success", text: "Meeting created successfully!" })
        setFormData({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          participants: [],
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create meeting. Please try again." })
    }

    setLoading(false)
  }

  const handleParticipantChange = (userId, checked) => {
    setFormData((prev) => ({
      ...prev,
      participants: checked ? [...prev.participants, userId] : prev.participants.filter((id) => id !== userId),
    }))
  }

  const formatTime = (time) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Create New Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message.text && (
            <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              {message.type === "error" ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Weekly team standup"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting agenda and details..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Meeting duration: {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label className="flex items-center mb-3">
              <Users className="h-4 w-4 mr-2" />
              Select Participants
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={formData.participants.includes(user.id)}
                    onCheckedChange={(checked) => handleParticipantChange(user.id, checked)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                    {user.name}
                    <span className="text-gray-500 ml-1">({user.email})</span>
                  </Label>
                </div>
              ))}
            </div>
            {formData.participants.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {formData.participants.length + 1} participant(s) selected (including you)
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Meeting..." : "Create Meeting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
