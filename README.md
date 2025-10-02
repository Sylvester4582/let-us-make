# Welcome to YouMatter - AI-Powered Wellness Platform

## 🚀 Quick Start (Easiest Way)

### **Windows Users:**
Simply double-click `start-app.bat` or run:
```cmd
start-dev.bat
```

### **Linux/Mac Users:**
```bash
chmod +x start-dev.sh
./start-app.sh
```

The batch files will automatically:
- ✅ Check for Node.js and npm installation
- ✅ Install all dependencies (frontend & backend)
- ✅ Create .env file from template
- ✅ Start both servers---

## 🔄 Recent Updates & Development Log

### v2.1.0 - Health & Risk Assessment Integration
- ✅ **Date of Birth Integration**: Automatic age calculation from DOB across all components
- ✅ **Advanced Risk Calculation**: Standardized insurance risk formula with BMI, exercise, age factors  
- ✅ **Health Profile Unification**: Fitness goals and health data now share unified interface
- ✅ **RiskScoreCard Component**: Visual risk breakdown with detailed factor analysis
- ✅ **Age-based Premium Calculations**: 5-tier premium system based on calculated health risk

### v2.0.0 - Daily Challenges & Point System
- ✅ **Daily Challenges System**: 7 challenge types with point rewards
- ✅ **Database Point Sync**: Real-time point tracking with backend persistence  
- ✅ **Challenge Completion**: Track progress across all challenge types
- ✅ **Point Integration**: Unified point system across all app features
- ✅ **Improved User Experience**: Immediate feedback with fallback mechanisms

### v1.5.0 - Fitness Goal Enhancement  
- ✅ **AI-Powered Goal Setup**: Personalized fitness recommendations
- ✅ **BMI Calculation**: Real-time BMI tracking and health categories
- ✅ **Exercise Type Selection**: Multiple exercise preferences with visual selection
- ✅ **Goal Progress Tracking**: Monitor fitness goal achievements over time

### v1.0.0 - Core Platform
- ✅ **User Authentication**: JWT-based secure authentication
- ✅ **Gamification System**: Points, levels, streaks, badges
- ✅ **AI Integration**: Gemini AI for personalized insights
- ✅ **Health Tracking**: Basic activity logging and progress monitoring

---

**Built with ❤️ for wellness and powered by AI** 🤖✨

For the latest updates and deployment, visit: [Lovable Project](https://lovable.dev/projects/3cdd1a6f-5ff3-4970-bac9-29dd94a8eaf2)
- ✅ Open the app at http://localhost:5173

**That's it! Your app will be running in under 2 minutes!**

---

## 🌟 Project Overview

YouMatter is a comprehensive wellness platform that combines gamification, AI-driven personalization, health risk assessment, and user authentication to create an engaging health and wellness experience.

**Features Include:**
- 🏥 **Health Risk Assessment** - Calculate insurance risk scores with BMI, exercise, and age factors
- 🎯 **Daily Challenges** - Complete fitness and wellness challenges to earn points
- 📊 **Fitness Goal Tracking** - AI-powered fitness goal setup with automatic age calculation from DOB
- 🎮 **Gamification System** - Points, levels, streaks, and leaderboards
- 🤖 **AI Integration** - Gemini AI for personalized recommendations and insights
- 💳 **Insurance Integration** - Risk-based premium calculations and recommendations

## ✨ New Features Added

### 🔢 **Smart Age Calculation**
- Enter your date of birth once, age is calculated automatically
- Used across health profiles, risk assessments, and insurance calculations
- No more manual age updates needed!

### 🏥 **Advanced Health Risk Assessment**
- Comprehensive BMI-based risk calculation
- Exercise frequency impact on health scores  
- Age-adjusted risk factors for insurance premiums
- Real-time risk score visualization with detailed breakdowns

### 🎯 **Enhanced Daily Challenges**
- 7 different challenge types (exercise, nutrition, mindfulness, etc.)
- Point system integrated with database
- Real-time progress tracking and completion
- Synchronized across all components

### 🎮 **Integrated Point System**
- Points from daily challenges sync with leaderboard
- Database persistence for reliable point tracking
- Immediate UI feedback with localStorage backup
- Level progression based on total points earned

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
- **Lucide React** for icons

### Backend  
- **Node.js** with Express
- **SQLite** database with auto-initialization
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### AI Integration
- **Google Gemini AI** for personalization
- **Real-time analysis** of user patterns
- **Predictive modeling** for challenges
- **Health risk assessment** algorithms

### Key Services
- **Risk Calculation Service**: BMI, exercise, and age-based risk scoring
- **Daily Challenges Service**: 7 challenge types with point tracking
- **Points Service**: Database-synced point management
- **Insurance Service**: Risk-based premium calculations  
- **Fitness Service**: AI-powered goal recommendations

## 📁 Project Structure

```
youmatter/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── FitnessGoalSetup.tsx
│   │   ├── HealthProfileCard.tsx
│   │   ├── RiskScoreCard.tsx
│   │   └── DailyChallengesPage.tsx
│   ├── contexts/            # React contexts
│   │   └── UserContext.tsx  # User state management
│   ├── services/            # Business logic
│   │   ├── riskCalculationService.ts
│   │   ├── dailyChallengesService.ts
│   │   ├── pointsService.ts
│   │   └── insuranceRecommendationService.ts
│   ├── pages/               # Route components
│   └── lib/                 # Utilities
├── backend/
│   ├── server.js            # Express server
│   ├── database.js          # SQLite setup
│   └── youmatter.db         # SQLite database
├── start-app.bat            # Windows quick start
├── start-app.sh             # Linux/Mac quick start
└── README.md
```

## 🚀 Advanced Setup Options

### Option 1: One-Click Setup (Recommended) ⭐

#### Windows:
```cmd
start-app.bat
```

#### Linux/Mac:
```bash
chmod +x start-app.sh
./start-app.sh
```

### Option 2: Legacy Automated Scripts

#### Windows:
```bash
start-dev.bat
```

#### Mac/Linux:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 3: Manual Setup

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
Create `.env` file in the root directory:
```env
# Gemini AI Configuration (Optional - app works without it)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Backend API Configuration  
VITE_API_URL=http://localhost:3001/api

# JWT Secret (for backend)
JWT_SECRET=your-jwt-secret-key-here
```

#### 4. Start Both Servers
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
npm run dev  
# Frontend runs on http://localhost:5173
```

Then visit http://localhost:5173 to use the app!

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Health Profile
- `PUT /api/health-profile` - Update health profile with DOB, fitness goals
- `GET /api/health-profile` - Get complete health profile

### Points & Gamification  
- `POST /api/points/add` - Add points for user activities
- `GET /api/points/leaderboard` - Get leaderboard rankings
- `PUT /api/points/update` - Update user points and level

### Daily Challenges
- `GET /api/challenges/daily` - Get available daily challenges
- `POST /api/challenges/complete` - Mark challenge as completed
- `GET /api/challenges/progress` - Get challenge completion progress

### Events & Activities
- `POST /api/events` - Log activity events
- `GET /api/events` - Get user activity history

### Health Check
- `GET /health` - Server health status

## 📱 Usage Guide

### 1. Getting Started
1. **Quick Start**: Run `start-app.bat` (Windows) or `./start-app.sh` (Linux/Mac)
2. **Register**: Create a new account or try guest mode  
3. **Complete Health Profile**: Add your date of birth, height, weight for personalized features
4. **Set Fitness Goals**: AI-powered goal setup with automatic age calculation
5. **Explore**: Check out your level, points, daily challenges, and risk assessments

### 2. Health & Fitness Features
- **Health Risk Assessment**: Get detailed risk scores based on BMI, exercise, and age
- **Fitness Goal Setup**: AI recommends personalized workout plans and nutrition goals
- **Daily Challenges**: Complete 7 different types of wellness challenges
- **Age Calculation**: Enter DOB once, age automatically calculated for all features
- **Insurance Integration**: Risk-based premium calculations and recommendations

### 3. Earning Points
- **Complete Daily Challenges**: +5 to +25 points per challenge
- **Log Workout**: +10 points
- **Read Health Article**: +7 points  
- **View Insurance Policy**: +15 points
- **Invite Friend**: +20 points
- **Daily Login Reward**: +50 points

### 4. Daily Challenges System
Choose from 7 challenge types:
- 🏃‍♂️ **Exercise**: 30-minute workout, 10k steps, strength training
- 🥗 **Nutrition**: Healthy meal, 8 glasses of water, no processed food
- 🧘‍♀️ **Mindfulness**: Meditation, gratitude journal, stress management
- 📚 **Learning**: Read health article, learn new skill, educational content
- 😴 **Sleep**: 8 hours sleep, bedtime routine, sleep tracking
- 🤝 **Social**: Connect with friend, group activity, community engagement
- 🌱 **Lifestyle**: Outdoor activity, clean environment, healthy habit

### 5. Health Risk Assessment
- **BMI Calculation**: Automatic BMI calculation from height/weight
- **Exercise Impact**: Weekly workout frequency affects risk scores
- **Age Factors**: Age-adjusted risk multipliers for accurate assessment
- **Insurance Premiums**: 5-tier premium system based on calculated risk
- **Improvement Recommendations**: Personalized suggestions to lower risk scores

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

### Using Quick Start Scripts

#### Windows (`start-app.bat`):
- **Double-click not working**: Right-click → "Run as administrator"
- **"Node not found"**: Install Node.js from https://nodejs.org/
- **Ports already in use**: Check if other apps are using ports 3001 or 5173
- **Script closes immediately**: Run from Command Prompt to see error messages

#### Linux/Mac (`start-app.sh`):
- **Permission denied**: Run `chmod +x start-app.sh` first
- **Script not executable**: Ensure file has executable permissions
- **Dependencies fail**: Make sure you have Node.js 18+ installed

### Common Issues

1. **Backend not starting**: 
   - Check if port 3001 is available
   - Verify Node.js is installed: `node --version`
   - Check backend logs in the terminal window

2. **Frontend not connecting**: 
   - Verify `VITE_API_URL=http://localhost:3001/api` in `.env`
   - Ensure backend is running first
   - Check browser console for connection errors

3. **AI features not working**: 
   - Add valid `VITE_GEMINI_API_KEY` to `.env` file
   - App works without API key but with limited AI features
   - Check API key validity at Google AI Studio

4. **Database issues**: 
   - Delete `backend/youmatter.db` to reset database
   - Restart backend server to recreate tables
   - Check file permissions on database file

5. **Points not syncing**:
   - Check backend connection in browser Network tab
   - Verify user is logged in (not in guest mode)
   - Check backend logs for point update errors

6. **Health profile not saving**:
   - Ensure all required fields are filled (DOB, weight, exercise types)
   - Check age calculation is working (age > 0)
   - Verify backend health-profile endpoints are responding

### Debug Mode
- Add `DEBUG=true` to `.env` for detailed logging
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors
- Monitor Network tab for API request failures

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
