import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/auth/login")
  }

  try {
    verify(token.value, process.env.JWT_SECRET || "your-secret-key")
    redirect("/dashboard")
  } catch {
    redirect("/auth/login")
  }
}
