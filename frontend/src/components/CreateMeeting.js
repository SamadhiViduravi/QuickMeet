"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Navigation from "./Navigation"

const CreateMeeting = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: [],
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [conflicts, setConflicts] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data.filter((u) => u.id !== user?.id))
    } catch (error) {
      setError("Failed to fetch users")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleParticipantChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setConflicts([])

    // Validate end time is after start time
    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.post("/api/meetings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate("/dashboard")
    } catch (error) {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts)
        setError("Time conflicts detected with existing meetings")
      } else {
        setError(error.response?.data?.message || "Failed to create meeting")
      }
    } finally {
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <div className="create-meeting">
      <Navigation user={user} onLogout={onLogout} />

      <div className="create-meeting-content">
        <div className="create-meeting-header">
          <h1>Schedule New Meeting</h1>
          <p>Create a new meeting and invite participants</p>
        </div>

        <form onSubmit={handleSubmit} className="meeting-form">
          {error && (
            <div className="error-message">
              {error}
              {conflicts.length > 0 && (
                <div className="conflicts-list">
                  <h4>Conflicting meetings:</h4>
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="conflict-item">
                      {conflict.title} on {conflict.date} from {conflict.startTime} to {conflict.endTime}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Meeting Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter meeting title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter meeting description or agenda"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={getTomorrowDate()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Participants</label>
            <div className="participants-list">
              {users.map((user) => (
                <div key={user.id} className="participant-item">
                  <label className="participant-label">
                    <input
                      type="checkbox"
                      checked={formData.participants.includes(user.id)}
                      onChange={() => handleParticipantChange(user.id)}
                    />
                    <span className="participant-info">
                      <strong>{user.name}</strong>
                      <span className="participant-email">{user.email}</span>
                      <span className="participant-department">{user.department}</span>
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/dashboard")} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating Meeting..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMeeting
