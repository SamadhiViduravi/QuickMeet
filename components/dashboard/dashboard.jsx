"use client"

import { useState } from "react"
import Header from "./header"
import CalendarView from "./calendar-view"
import MeetingForm from "./meeting-form"
import MeetingList from "./meeting-list"
import SearchMeetings from "./search-meetings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("calendar")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="create">Create Meeting</TabsTrigger>
            <TabsTrigger value="meetings">My Meetings</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <MeetingForm />
          </TabsContent>

          <TabsContent value="meetings" className="mt-6">
            <MeetingList />
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <SearchMeetings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
