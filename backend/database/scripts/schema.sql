-- QuickMeet PostgreSQL Database Schema

-- Table for Users (Employees)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords
    role VARCHAR(20) DEFAULT 'EMPLOYEE' NOT NULL, -- e.g., 'EMPLOYEE', 'ADMIN'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Table for Meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organizer_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookup by organizer and time
CREATE INDEX IF NOT EXISTS idx_meetings_organizer_time ON meetings (organizer_id, start_time, end_time);

-- Table for Meeting Participants (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS meeting_participants (
    meeting_id UUID NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (meeting_id, user_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for Reminders (optional, for simulating email reminders or in-app notifications)
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL,
    user_id UUID NOT NULL, -- User who receives the reminder
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    sent_status BOOLEAN DEFAULT FALSE, -- True if reminder has been "sent"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookup of reminders by user and meeting
CREATE INDEX IF NOT EXISTS idx_reminders_user_meeting ON reminders (user_id, meeting_id);

-- Function to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meetings table
CREATE OR REPLACE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
