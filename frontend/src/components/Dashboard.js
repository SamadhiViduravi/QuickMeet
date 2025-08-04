"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Navigation from "./Navigation"

const Dashboard = ({ user, onLogout }) => {
  const [meetings, setMeetings] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/meetings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMeetings(response.data)
    } catch (error) {
      setError("Failed to fetch meetings")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMeetings()
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`/api/meetings/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMeetings(response.data)
    } catch (error) {
      setError("Search failed")
    }
  }

  const deleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchMeetings()
    } catch (error) {
      setError("Failed to delete meeting")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const upcomingMeetings = meetings
    .filter((meeting) => new Date(`${meeting.date}T${meeting.startTime}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="dashboard">
        <Navigation user={user} onLogout={onLogout} />
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Navigation user={user} onLogout={onLogout} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your meetings and schedule new ones</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{meetings.length}</h3>
            <p>Total Meetings</p>
          </div>
          <div className="stat-card">
            <h3>{upcomingMeetings.length}</h3>
            <p>Upcoming Meetings</p>
          </div>
          <div className="stat-card">
            <h3>{meetings.filter((m) => m.organizer === user?.id).length}</h3>
            <p>Organized by You</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/create-meeting" className="action-button primary">
            Schedule New Meeting
          </Link>
          <Link to="/calendar" className="action-button secondary">
            View Calendar
          </Link>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search meetings by title, description, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="meetings-section">
          <h2>Upcoming Meetings</h2>
          {upcomingMeetings.length === 0 ? (
            <div className="no-meetings">
              <p>No upcoming meetings scheduled</p>
              <Link to="/create-meeting" className="action-button primary">
                Schedule Your First Meeting
              </Link>
            </div>
          ) : (
            <div className="meetings-list">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-card">
                  <div className="meeting-header">
                    <h3>{meeting.title}</h3>
                    {meeting.organizer === user?.id && (
                      <button onClick={() => deleteMeeting(meeting.id)} className="delete-button">
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="meeting-description">{meeting.description}</p>
                  <div className="meeting-details">
                    <span className="meeting-date">📅 {formatDate(meeting.date)}</span>
                    <span className="meeting-time">
                      🕐 {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </span>
                    <span className="meeting-organizer">👤 Organized by {meeting.organizerName}</span>
                  </div>
                  <div className="meeting-participants">
                    <strong>Participants:</strong> {meeting.participantNames.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="meetings-section">
          <h2>All Meetings</h2>
          <div className="meetings-list">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                <div className="meeting-header">
                  <h3>{meeting.title}</h3>
                  {meeting.organizer === user?.id && (
                    <button onClick={() => deleteMeeting(meeting.id)} className="delete-button">
                      Delete
                    </button>
                  )}
                </div>
                <p className="meeting-description">{meeting.description}</p>
                <div className="meeting-details">
                  <span className="meeting-date">📅 {formatDate(meeting.date)}</span>
                  <span className="meeting-time">
                    🕐 {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </span>
                  <span className="meeting-organizer">👤 Organized by {meeting.organizerName}</span>
                </div>
                <div className="meeting-participants">
                  <strong>Participants:</strong> {meeting.participantNames.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
