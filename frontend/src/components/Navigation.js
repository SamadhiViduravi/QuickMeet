"use client"
import { Link, useLocation } from "react-router-dom"

const Navigation = ({ user, onLogout }) => {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/dashboard">QuickMeet</Link>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/create-meeting" className={location.pathname === "/create-meeting" ? "active" : ""}>
          New Meeting
        </Link>
        <Link to="/calendar" className={location.pathname === "/calendar" ? "active" : ""}>
          Calendar
        </Link>
      </div>

      <div className="nav-user">
        <span className="user-name">Hello, {user?.name}</span>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navigation
