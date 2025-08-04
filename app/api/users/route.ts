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
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "HR",
    role: "employee",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@company.com",
    department: "Engineering",
    role: "employee",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    verify(token, process.env.JWT_SECRET || "your-secret-key")
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
