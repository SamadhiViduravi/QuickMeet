import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    role: "admin",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    role: "employee",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Sales",
    role: "employee",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    const user = users.find((u) => u.id === decoded.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
