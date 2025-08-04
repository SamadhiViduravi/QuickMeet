// This file simulates API calls to your Spring Boot backend.
// In a real application, you would replace these with actual fetch requests.

export type User = {
  id: string
  username: string
  email: string
  // Add other user fields as needed
}

export type Meeting = {
  id: string
  title: string
  description: string
  start_time: string // ISO string
  end_time: string // ISO string
  organizer_id: string // ID of the user who created the meeting
  participants: string[] // Array of participant usernames or IDs
}

const API_BASE_URL = "http://localhost:8080/api" // Replace with your Spring Boot backend URL

// Helper to get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("quickmeet_jwt_token")
}

// Simulate fetching meetings
export const getMeetings = async (): Promise<Meeting[]> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found.")
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app:
  // const response = await fetch(`${API_BASE_URL}/meetings`, {
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch meetings');
  // }
  // return response.json();

  // Simulated data
  const simulatedMeetings: Meeting[] = [
    {
      id: "m1",
      title: "Project Alpha Sync",
      description: "Discuss progress on Project Alpha.",
      start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      end_time: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      organizer_id: "user1",
      participants: ["Alice", "Bob"],
    },
    {
      id: "m2",
      title: "Team Standup",
      description: "Daily team check-in.",
      start_time: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
      end_time: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
      organizer_id: "user2",
      participants: ["Bob", "Charlie"],
    },
    {
      id: "m3",
      title: "Client Demo Prep",
      description: "Final preparations for the client demonstration.",
      start_time: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0).toISOString(),
      end_time: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 30, 0, 0).toISOString(),
      organizer_id: "user1",
      participants: ["Alice", "Charlie"],
    },
  ]
  return simulatedMeetings
}

// Simulate creating a meeting
export const createMeeting = async (meetingData: Omit<Meeting, "id" | "organizer_id">): Promise<Meeting> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found.")
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app:
  // const response = await fetch(`${API_BASE_URL}/meetings`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(meetingData),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to create meeting');
  // }
  // return response.json();

  // Simulate successful creation
  const newMeeting: Meeting = {
    id: `m${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
    organizer_id: "current_user_id", // This would come from your JWT token
    ...meetingData,
  }
  console.log("Simulated meeting creation:", newMeeting)
  return newMeeting
}

// Simulate fetching users (for participant selection)
export const getUsers = async (): Promise<User[]> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found.")
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app:
  // const response = await fetch(`${API_BASE_URL}/users`, {
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch users');
  // }
  // return response.json();

  return [
    { id: "user1", username: "Alice", email: "alice@example.com" },
    { id: "user2", username: "Bob", email: "bob@example.com" },
    { id: "user3", username: "Charlie", email: "charlie@example.com" },
  ]
}
