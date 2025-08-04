-- Insert sample users
INSERT INTO users (name, email, password_hash, department, role) VALUES
('John Doe', 'john.doe@company.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Engineering', 'admin'),
('Jane Smith', 'jane.smith@company.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Marketing', 'employee'),
('Mike Johnson', 'mike.johnson@company.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Sales', 'employee'),
('Sarah Wilson', 'sarah.wilson@company.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'HR', 'employee'),
('David Brown', 'david.brown@company.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Engineering', 'employee');

-- Insert sample meetings
INSERT INTO meetings (title, description, meeting_date, start_time, end_time, organizer_id) VALUES
('Weekly Team Standup', 'Weekly team sync to discuss progress and blockers', '2024-01-15', '09:00:00', '09:30:00', 1),
('Product Planning Meeting', 'Planning session for Q1 product roadmap', '2024-01-16', '14:00:00', '15:30:00', 2),
('Client Presentation', 'Quarterly business review with key client', '2024-01-17', '10:00:00', '11:00:00', 3),
('Engineering Review', 'Monthly engineering team review', '2024-01-18', '15:00:00', '16:00:00', 1),
('Marketing Campaign Planning', 'Q1 marketing campaign strategy session', '2024-01-19', '11:00:00', '12:30:00', 2);

-- Insert meeting participants
INSERT INTO meeting_participants (meeting_id, user_id, status) VALUES
-- Weekly Team Standup participants
(1, 1, 'accepted'),
(1, 2, 'accepted'),
(1, 5, 'accepted'),

-- Product Planning Meeting participants
(2, 2, 'accepted'),
(2, 3, 'accepted'),

-- Client Presentation participants
(3, 3, 'accepted'),
(3, 4, 'accepted'),

-- Engineering Review participants
(4, 1, 'accepted'),
(4, 5, 'accepted'),

-- Marketing Campaign Planning participants
(5, 2, 'accepted'),
(5, 4, 'invited');

-- Insert sample reminders
INSERT INTO meeting_reminders (meeting_id, user_id, reminder_time, message) VALUES
(1, 1, '2024-01-15 08:45:00', 'Weekly standup starting in 15 minutes'),
(1, 2, '2024-01-15 08:45:00', 'Weekly standup starting in 15 minutes'),
(2, 2, '2024-01-16 13:45:00', 'Product planning meeting starting in 15 minutes'),
(3, 3, '2024-01-17 09:45:00', 'Client presentation starting in 15 minutes');
