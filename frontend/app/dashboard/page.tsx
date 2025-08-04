"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, SearchIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getMeetings, createMeeting, type Meeting, type User } from "@/lib/api"
import { checkAuth, logoutUser } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [users, setUsers] = useState<User[]>([]) // For participant selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newMeetingTitle, setNewMeetingTitle] = useState("")
  const [newMeetingDescription, setNewMeetingDescription] = useState("")
  const [newMeetingStartTime, setNewMeetingStartTime] = useState("")
  const [newMeetingEndTime, setNewMeetingEndTime] = useState("")
  const [newMeetingParticipants, setNewMeetingParticipants] = useState<string[]>([])
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/login")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const fetchedMeetings = await getMeetings()
      setMeetings(fetchedMeetings)
      // Simulate fetching users for participant selection
      setUsers([
        { id: "user1", username: "Alice", email: "alice@example.com" },
        { id: "user2", username: "Bob", email: "bob@example.com" },
        { id: "user3", username: "Charlie", email: "charlie@example.com" },
      ])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      // Handle error, e.g., redirect to login if token is invalid
      logoutUser()
      router.push("/login")
    }
  }

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle || !selectedDate || !newMeetingStartTime || !newMeetingEndTime) {
      alert("Please fill in all required fields.")
      return
    }

    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(
      Number.parseInt(newMeetingStartTime.split(":")[0]),
      Number.parseInt(newMeetingStartTime.split(":")[1]),
    )
    const endDateTime = new Date(selectedDate)
    endDateTime.setHours(
      Number.parseInt(newMeetingEndTime.split(":")[0]),
      Number.parseInt(newMeetingEndTime.split(":")[1]),
    )

    const newMeeting: Omit<Meeting, "id" | "organizer_id"> = {
      title: newMeetingTitle,
      description: newMeetingDescription,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      participants: newMeetingParticipants,
    }

    try {
      await createMeeting(newMeeting)
      setIsMeetingDialogOpen(false)
      setNewMeetingTitle("")
      setNewMeetingDescription("")
      setNewMeetingStartTime("")
      setNewMeetingEndTime("")
      setNewMeetingParticipants([])
      fetchData() // Refresh meetings
    } catch (error) {
      console.error("Failed to create meeting:", error)
      alert("Failed to create meeting. Please try again.")
    }
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesTitle = meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDescription = meeting.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesParticipant = meeting.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTitle || matchesDescription || matchesParticipant
  })

  const meetingsForSelectedDate = filteredMeetings
    .filter((meeting) => {
      if (!selectedDate) return false
      const meetingDate = new Date(meeting.start_time)
      return meetingDate.toDateString() === selectedDate.toDateString()
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-xl font-bold">QuickMeet Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search meetings..."
              className="pl-9 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Meetings on {selectedDate ? format(selectedDate, "PPP") : "Selected Date"}
              </CardTitle>
              <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Create New Meeting</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newMeetingDescription}
                        onChange={(e) => setNewMeetingDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startTime" className="text-right">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newMeetingStartTime}
                        onChange={(e) => setNewMeetingStartTime(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endTime" className="text-right">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newMeetingEndTime}
                        onChange={(e) => setNewMeetingEndTime(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="participants" className="text-right">
                        Participants
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setNewMeetingParticipants((prev) =>
                            prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
                          )
                        }}
                        value={newMeetingParticipants[0] || ""} // Display first selected, or empty
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select participants" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.username}>
                              {user.username} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newMeetingParticipants.length > 0 && (
                      <div className="grid grid-cols-4 items-start gap-4">
                        <div className="col-span-1"></div>
                        <div className="col-span-3 flex flex-wrap gap-2">
                          {newMeetingParticipants.map((p) => (
                            <span
                              key={p}
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
                            >
                              {p}
                              <button
                                onClick={() =>
                                  setNewMeetingParticipants(newMeetingParticipants.filter((item) => item !== p))
                                }
                                className="ml-1 text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreateMeeting}>Create Meeting</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {meetingsForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground">No meetings scheduled for this date.</p>
              ) : (
                <div className="grid gap-4">
                  {meetingsForSelectedDate.map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meeting.start_time), "p")} - {format(new Date(meeting.end_time), "p")}
                      </p>
                      {meeting.description && <p className="text-sm mt-2">{meeting.description}</p>}
                      {meeting.participants && meeting.participants.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Participants: {meeting.participants.join(", ")}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings (All)</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMeetings.length === 0 ? (
                <p className="text-muted-foreground">No upcoming meetings found.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredMeetings
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((meeting) => (
                      <Card key={meeting.id} className="p-4">
                        <h3 className="font-semibold text-lg">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meeting.start_time), "PPP p")} - {format(new Date(meeting.end_time), "p")}
                        </p>
                        {meeting.participants && meeting.participants.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Participants: {meeting.participants.join(", ")}
                          </p>
                        )}
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
