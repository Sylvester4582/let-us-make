# Welcome to YouMatter - AI-Powered Wellness Platform

## 🌟 Project Overview

YouMatter is a comprehensive wellness platform that combines gamification, AI-driven personalization, and user authentication to create an engaging health and wellness experience.

**URL**: https://lovable.dev/projects/3cdd1a6f-5ff3-4970-bac9-29dd94a8eaf2

## 🚀 Features

### 🔐 Authentication & Profile Management
- **User Registration & Login**: Secure authentication with JWT tokens
- **Profile Persistence**: User data synced between frontend and backend
- **Protected Routes**: Secure access to wellness dashboard
- **Guest Mode**: Try the app without registration (local storage)

### 🎮 Gamification System
- **Points & Levels**: Earn points for activities, unlock new levels
- **Streak Tracking**: Maintain daily wellness streaks
- **Badges & Achievements**: Unlock rewards for milestones
- **Leaderboard**: Compete with other users
- **Premium Discounts**: Unlock discounts as you level up

### 🤖 AI-Powered Features (Gemini Integration)
- **Motivation Profiling**: AI analyzes your behavior patterns
- **Predictive Challenges**: Personalized challenges based on your habits
- **Smart Recommendations**: Context-aware activity suggestions
- **Intelligent Insights**: Deep analysis of your wellness journey

### 📊 Wellness Tracking
- **Activity Logging**: Track workouts, reading, social activities
- **Progress Visualization**: Beautiful charts and progress bars
- **Daily Rewards**: Claim daily bonuses
- **Challenge System**: Complete weekly and monthly challenges

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** + **Shadcn/ui** for styling
- **React Router** for navigation
- **React Query** for state management
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled

### AI Integration
- **Google Gemini AI** for personalization
- **Real-time analysis** of user patterns
- **Predictive modeling** for challenges

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows:
```bash
start-dev.bat
```

#### Mac/Linux:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

#### 1. Clone and Setup Frontend
```bash
git clone <YOUR_GIT_URL>
cd youmatter
npm install
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

#### 3. Environment Configuration
Copy `.env.example` to `.env` and configure:
```env
# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Backend API Configuration
VITE_API_URL=http://localhost:3001/api

# JWT Secret (for backend)
JWT_SECRET=your-jwt-secret-key-here
```

#### 4. Start Backend Server
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

#### 5. Start Frontend
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events
- `POST /api/events` - Log activity events
- `GET /api/events` - Get user activity history

### Health Check
- `GET /health` - Server health status

## 📱 Usage Guide

### 1. Getting Started
1. **Register**: Create a new account or try guest mode
2. **Login**: Access your personalized dashboard
3. **Explore**: Check out your level, points, and AI insights

### 2. Earning Points
- **Log Workout**: +10 points
- **Read Article**: +7 points
- **View Policy**: +15 points
- **Invite Friend**: +20 points
- **Daily Reward**: +50 points

### 3. AI Features
- **Motivation Card**: Personalized messages based on your style
- **Predictive Challenges**: AI-generated challenges matching your patterns
- **Smart Recommendations**: Context-aware suggestions
- **Profile Insights**: Deep analysis of your wellness patterns

### 4. Levels & Rewards
- **Level 1 (0-99 pts)**: Beginner
- **Level 2 (100-299 pts)**: Explorer
- **Level 3 (300-599 pts)**: Advocate + 10% discount
- **Level 4 (600-999 pts)**: Champion + 20% discount
- **Level 5 (1000+ pts)**: Wellness Master + 30% discount

## 🧠 AI Features in Detail

### Intelligent User Profiling
- **Motivation Style Analysis**: AI determines whether you're competitive, collaborative, achievement-focused, or intrinsically motivated
- **Activity Pattern Recognition**: Learns your preferred activity times, duration, and consistency levels
- **Personality Trait Identification**: Identifies key personality traits that influence your wellness journey

### Predictive Challenge System
- **Personalized Challenge Generation**: AI creates challenges tailored to your profile and success probability
- **Success Rate Prediction**: Each challenge comes with an AI-calculated success probability
- **Dynamic Difficulty Adjustment**: Challenges adapt based on your past performance and preferences

### Smart Recommendations
- **Context-Aware Suggestions**: AI provides recommendations based on time of day, recent activities, and current goals
- **Personalized Action Items**: Suggestions are tailored to your motivation style and activity patterns
- **Priority-Based Ordering**: Recommendations are ranked by relevance and impact

### Adaptive Motivation
- **Dynamic Motivational Messages**: AI generates personalized encouragement based on your profile
- **Style-Specific Messaging**: Messages adapt to whether you respond better to competition, collaboration, or personal achievement
- **Real-time Adaptation**: Motivation adjusts based on your current progress and streak

### 🔧 Setup AI Features

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `.env.example` to `.env`
3. Replace `your-gemini-api-key-here` with your actual API key
4. Restart the development server

```bash
# Copy environment file
cp .env.example .env

# Edit the .env file with your API key
# VITE_GEMINI_API_KEY=your-actual-api-key-here
```

Note: The app will work without the API key using fallback data, but AI features will be limited.

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Start production server
npm test            # Run tests
```

### Database
- SQLite database: `backend/youmatter.db`
- Auto-initialized on first run
- Tables: `users`, `events`

## 🎨 UI Components

Built with **Shadcn/ui** components:
- Cards, Buttons, Inputs
- Progress bars, Badges
- Dialogs, Toasts
- Animations and transitions

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Protected routes
- Secure data storage

## 📊 Data Privacy

- User data stored securely
- Guest mode for privacy-conscious users
- No tracking without consent
- Local storage fallback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**: Check if port 3001 is available
2. **Frontend not connecting**: Verify `VITE_API_URL` in `.env`
3. **AI features not working**: Add valid `VITE_GEMINI_API_KEY`
4. **Database issues**: Delete `backend/youmatter.db` to reset

### Support
- Check the terminal logs for detailed error messages
- Ensure all dependencies are installed
- Verify environment variables are set correctly

## 📄 License

This project is part of a hackathon submission and is available for educational purposes.

---

**Built with ❤️ for wellness and powered by AI** 🤖✨

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3cdd1a6f-5ff3-4970-bac9-29dd94a8eaf2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
