# PeaksAI - Smart Browser Automation Assistant

PeaksAI is an AI-powered browser automation tool that understands natural language commands and converts them into real browser actions using Puppeteer.

## 🚀 Features

- **Natural Language Processing**: Tell the AI what you want in plain English
- **Real Browser Automation**: Uses Puppeteer to control actual Chrome browser
- **Live Screenshots**: Automatic screenshots captured at 3fps during automation
- **Real-time Progress**: Watch actions execute step-by-step
- **OpenRouter Integration**: Powered by DeepSeek R1T Chimera AI model
- **Split-screen UI**: Chat interface on left, browser preview on right

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Chrome/Chromium browser (Puppeteer will install its own if needed)

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start Development Environment

#### Option A: Auto-start both frontend and backend
```bash
node start-dev.js
```

#### Option B: Manual start (separate terminals)

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎯 How to Use

1. **Sign Up/Login**: Create an account or sign in
2. **Give Commands**: Type natural language commands like:
   - "Order me a latte from Starbucks"
   - "Find the best laptop deals on Amazon"
   - "Book a flight to New York"
   - "Search for Python tutorials"
3. **Watch Automation**: The AI will:
   - Generate browser actions
   - Launch a real Chrome browser
   - Execute actions step-by-step
   - Capture screenshots automatically
4. **View Results**: See live progress in the browser preview panel

## 🏗️ Architecture

### Frontend (React + Vite)
- **Port**: 5173
- **UI**: Shadcn/UI components
- **State**: React hooks
- **Communication**: WebSocket to backend

### Backend (Node.js + Express)
- **Port**: 3001
- **Browser**: Puppeteer + Chrome
- **API**: Express.js
- **WebSocket**: Real-time communication
- **AI**: OpenRouter API (DeepSeek model)

### Supabase Edge Functions
- **Authentication**: User management
- **AI Processing**: Convert commands to actions
- **API**: OpenRouter integration

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# Backend server port (default: 3001)
PORT=3001

# Browser options
HEADLESS=false  # Set to true to run browser in background
```

### Browser Settings
The browser launches with these settings:
- **Headless**: false (visible browser window)
- **Viewport**: 1280x720
- **Screenshot Interval**: 3 seconds
- **Auto-initialization**: Starts browser on server launch

## 📁 Project Structure

```
├── src/                    # Frontend React app
│   ├── components/        # UI components
│   ├── pages/            # Route pages
│   └── lib/              # Utilities
├── server/               # Backend Node.js server
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── supabase/             # Supabase configuration
│   └── functions/        # Edge functions
├── start-dev.js          # Development startup script
└── README.md            # This file
```

## 🐛 Troubleshooting

### Backend Won't Start
```bash
cd server
npm install
node index.js
```

### Browser Won't Launch
- Ensure Chrome/Chromium is installed
- Check if port 3001 is available
- Try running: `npx puppeteer browsers install chrome`

### WebSocket Connection Failed
- Make sure backend is running on port 3001
- Check firewall settings
- Verify no other apps are using the port

### Frontend Build Errors
```bash
npm install
npm run dev
```

## 🎮 Example Commands

Try these commands to test the system:

**Shopping:**
- "Find me wireless headphones on Amazon under $100"
- "Search for running shoes on Nike website"

**Food Delivery:**
- "Order me a pizza from Domino's"
- "Find coffee shops near me"

**Travel:**
- "Search for flights from New York to London"
- "Find hotels in San Francisco"

**General:**
- "Search for JavaScript tutorials"
- "Find the weather forecast for tomorrow"

## 🔐 Security Notes

- API keys are stored in Supabase Edge Functions
- Browser runs in non-headless mode for transparency
- Local execution only - no cloud browser instances
- WebSocket communication is local only

## 🚀 Production Deployment

For production use:
1. Set `HEADLESS=true` for background browser operation
2. Configure proper error handling and timeouts
3. Set up process monitoring (PM2, etc.)
4. Configure HTTPS for WebSocket connections
5. Set up proper logging and monitoring

## 📝 License

This project is for demonstration purposes. Ensure compliance with website terms of service when automating browser actions.

---

**Made with ❤️ using React, Node.js, Puppeteer, and AI**

---

## Original Lovable Project

**URL**: https://lovable.dev/projects/93708202-fdf7-4ae5-ba1a-ef58cadf0441

This project was created with Lovable and enhanced with local browser automation capabilities.
