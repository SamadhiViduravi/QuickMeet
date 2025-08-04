import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"

// Mock user database - In production, use a real database
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    password: "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
    department: "Engineering",
    role: "admin",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    password: "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
    department: "Marketing",
    role: "employee",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    password: "$2a$10$rOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
    department: "Sales",
    role: "employee",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, department, role } = await request.json()

    if (!name || !email || !password || !department) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password (for demo, we'll skip this)
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password: "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ", // hashedPassword
      department,
      role: role || "employee",
    }

    users.push(newUser)

    // Create JWT token
    const token = sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Set cookie
    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
