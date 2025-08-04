"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Navigation from "./Navigation"

const Calendar = ({ user, onLogout }) => {
  const [meetings, setMeetings] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("month") // 'month' or 'week'
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

  const getDaysInMonth = (date) => {
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
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getMeetingsForDate = (date) => {
    if (!date) return []
    const dateString = date.toISOString().split("T")[0]
    return meetings.filter((meeting) => meeting.date === dateString)
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

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

  if (loading) {
    return (
      <div className="calendar">
        <Navigation user={user} onLogout={onLogout} />
        <div className="loading">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="calendar">
      <Navigation user={user} onLogout={onLogout} />

      <div className="calendar-content">
        <div className="calendar-header">
          <h1>Meeting Calendar</h1>
          <div className="calendar-controls">
            <div className="view-toggle">
              <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>
                Month
              </button>
              <button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>
                Week
              </button>
            </div>
            <div className="navigation-controls">
              <button onClick={() => (view === "month" ? navigateMonth(-1) : navigateWeek(-1))}>← Previous</button>
              <span className="current-period">
                {view === "month"
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString()}`}
              </span>
              <button onClick={() => (view === "month" ? navigateMonth(1) : navigateWeek(1))}>Next →</button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {view === "month" ? (
          <div className="calendar-grid month-view">
            <div className="calendar-header-row">
              {dayNames.map((day) => (
                <div key={day} className="calendar-header-cell">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-body">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div key={index} className={`calendar-cell ${!date ? "empty" : ""}`}>
                  {date && (
                    <>
                      <div className="date-number">{date.getDate()}</div>
                      <div className="meetings-preview">
                        {getMeetingsForDate(date)
                          .slice(0, 2)
                          .map((meeting) => (
                            <div key={meeting.id} className="meeting-preview">
                              <span className="meeting-time">{formatTime(meeting.startTime)}</span>
                              <span className="meeting-title">{meeting.title}</span>
                            </div>
                          ))}
                        {getMeetingsForDate(date).length > 2 && (
                          <div className="more-meetings">+{getMeetingsForDate(date).length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="calendar-grid week-view">
            <div className="calendar-header-row">
              {dayNames.map((day) => (
                <div key={day} className="calendar-header-cell">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-body">
              {getWeekDays(currentDate).map((date, index) => (
                <div key={index} className="calendar-cell week-cell">
                  <div className="date-number">
                    {date.getDate()}
                    <span className="month-indicator">
                      {date.getMonth() !== currentDate.getMonth() && ` ${monthNames[date.getMonth()].slice(0, 3)}`}
                    </span>
                  </div>
                  <div className="meetings-list">
                    {getMeetingsForDate(date).map((meeting) => (
                      <div key={meeting.id} className="meeting-item">
                        <div className="meeting-time">
                          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </div>
                        <div className="meeting-title">{meeting.title}</div>
                        <div className="meeting-organizer">by {meeting.organizerName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar
