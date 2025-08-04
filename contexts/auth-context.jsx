"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

// Mock users database
const mockUsers = [
  { id: 1, email: "john.doe@company.com", password: "password123", name: "John Doe", role: "employee" },
  { id: 2, email: "jane.smith@company.com", password: "password123", name: "Jane Smith", role: "admin" },
  { id: 3, email: "mike.wilson@company.com", password: "password123", name: "Mike Wilson", role: "employee" },
  { id: 4, email: "sarah.johnson@company.com", password: "password123", name: "Sarah Johnson", role: "employee" },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored JWT token
    const token = localStorage.getItem("jwt_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate API call to Spring Boot backend
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      // Simulate JWT token generation
      const mockToken = `jwt_${foundUser.id}_${Date.now()}`
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password

      localStorage.setItem("jwt_token", mockToken)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)
      return { success: true }
    } else {
      return { success: false, error: "Invalid credentials" }
    }
  }

  const register = async (userData) => {
    // Simulate user registration
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: "employee",
    }

    mockUsers.push(newUser)

    // Auto login after registration
    const mockToken = `jwt_${newUser.id}_${Date.now()}`
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password

    localStorage.setItem("jwt_token", mockToken)
    localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))
    setUser(userWithoutPassword)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem("jwt_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  const getAllUsers = () => {
    return mockUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
