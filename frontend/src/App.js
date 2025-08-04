"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import CreateMeeting from "./components/CreateMeeting"
import Calendar from "./components/Calendar"
import "./App.css"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (token, userData) => {
    setToken(token)
    setUser(userData)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route
            path="/register"
            element={!token ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-meeting"
            element={token ? <CreateMeeting user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={token ? <Calendar user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
