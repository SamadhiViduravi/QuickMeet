# QuickMeet - Internal Meeting Scheduler App

A professional web application for scheduling and managing internal company meetings.

## 🚀 Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Meeting Management**: Create, view, and delete meetings
- **Calendar Views**: Monthly and weekly calendar interfaces
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Search Functionality**: Search meetings by title, description, or organizer
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live meeting data synchronization

## 🛠️ Tech Stack

**Frontend:**
- React.js (JavaScript)
- React Router for navigation
- Axios for API calls
- CSS3 with responsive design

**Backend:**
- Node.js with Express.js
- JWT for authentication
- bcryptjs for password hashing
- File-based JSON storage (easily upgradeable to PostgreSQL)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Step 1: Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd quickmeet-app
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
\`\`\`

### Step 3: Start the Application
\`\`\`bash
# Start both backend and frontend concurrently
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Project Structure

\`\`\`
quickmeet-app/
├── backend/
│   ├── data/                 # JSON data storage
│   ├── server.js            # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main App component
│   │   ├── App.css         # Styles
│   │   └── index.js        # Entry point
│   └── package.json
├── package.json             # Root package.json
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (authenticated)

### Meetings
- `GET /api/meetings` - Get user's meetings
- `POST /api/meetings` - Create new meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/search?query=` - Search meetings

## 💡 Key Features Explained

### 1. Authentication System
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected routes and API endpoints

### 2. Meeting Scheduling
- Create meetings with title, description, date, time, and participants
- Automatic conflict detection prevents double-booking
- Support for multiple participants

### 3. Calendar Interface
- Monthly and weekly calendar views
- Visual meeting representation
- Easy navigation between time periods

### 4. Search & Filter
- Real-time search functionality
- Search by meeting title, description, or organizer
- Instant results display

### 5. Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with automatic builds

### Option 2: Heroku
1. Create Heroku app
2. Set up environment variables
3. Deploy using Git

### Option 3: Traditional VPS
1. Set up Node.js environment
2. Use PM2 for process management
3. Configure reverse proxy (Nginx)

## 🔄 Database Migration

To upgrade from JSON storage to PostgreSQL:

1. Install PostgreSQL dependencies:
\`\`\`bash
npm install pg
\`\`\`

2. Replace file operations with database queries
3. Update connection configuration
4. Run database migrations

## 🎯 Future Enhancements

- [ ] Email notifications for meeting reminders
- [ ] Integration with Google Calendar
- [ ] Meeting room booking system
- [ ] Video conferencing integration
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Role-based permissions (Admin/Employee)
- [ ] CSV export functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

Created by [Your Name] for internship portfolio demonstration.

## 📞 Support

For support or questions, please contact [your-email@example.com]
