"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ArrowLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function CreateMeetingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [participants, setParticipants] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!session?.accessToken) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!date || !startTime || !endTime || !topic || !participants) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const formattedDate = format(date, "yyyy-MM-dd")
    const startDateTime = `${formattedDate}T${startTime}:00`
    const endDateTime = `${formattedDate}T${endTime}:00`
    const participantArray = participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          topic,
          startTime: startDateTime,
          endTime: endDateTime,
          participants: participantArray,
        }),
      })

      if (response.ok) {
        toast({
          title: "Meeting Created",
          description: "Your meeting has been successfully scheduled.",
        })
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        toast({
          title: "Failed to Create Meeting",
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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-6 dark:bg-gray-950">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Meeting</CardTitle>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <CardDescription>Fill in the details to schedule a new meeting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="topic">Meeting Topic</Label>
              <Input
                id="topic"
                placeholder="Project Sync"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="participants">Participants (comma-separated emails)</Label>
              <Textarea
                id="participants"
                placeholder="john.doe@example.com, jane.smith@example.com"
                required
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
