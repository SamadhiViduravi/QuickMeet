"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { PlusIcon, LogOutIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Meeting {
  id: string
  topic: string
  startTime: string
  endTime: string
  participants: string[]
  organizerId: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated") {
      fetchMeetings()
    }
  }, [status, router])

  useEffect(() => {
    if (date) {
      const selectedDate = format(date, "yyyy-MM-dd")
      const dailyMeetings = meetings.filter(
        (meeting) => format(new Date(meeting.startTime), "yyyy-MM-dd") === selectedDate,
      )
      setFilteredMeetings(dailyMeetings)
    } else {
      setFilteredMeetings(meetings)
    }
  }, [date, meetings])

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const results = meetings.filter(
      (meeting) =>
        meeting.topic.toLowerCase().includes(query) ||
        meeting.participants.some((p) => p.toLowerCase().includes(query)) ||
        format(new Date(meeting.startTime), "yyyy-MM-dd HH:mm").toLowerCase().includes(query),
    )
    setFilteredMeetings(results)
  }, [searchQuery, meetings])

  const fetchMeetings = async () => {
    if (!session?.accessToken) return

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/meetings`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMeetings(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Failed to fetch meetings",
          description: errorData.message || "An error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to the backend.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false, callbackUrl: "/" })
    router.push("/")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold">QuickMeet Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {session?.user?.name || session?.user?.email}!
          </span>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6 md:flex-row">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <div className="mt-4">
                <Link href="/dashboard/create-meeting">
                  <Button className="w-full">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Meeting
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Meetings for {date ? format(date, "PPP") : "All Dates"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search meetings by topic, participant, or date/time..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredMeetings.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No meetings found for this date or search query.
                </p>
              ) : (
                <div className="grid gap-4">
                  {filteredMeetings.map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <h3 className="text-lg font-semibold">{meeting.topic}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(meeting.startTime), "MMM dd, yyyy hh:mm a")} -{" "}
                        {format(new Date(meeting.endTime), "hh:mm a")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Participants: {meeting.participants.join(", ")}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
