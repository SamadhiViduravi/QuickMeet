import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Register for QuickMeet</CardTitle>
          <CardDescription>Create an account to start scheduling meetings.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="register" />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline" prefetch={false}>
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
