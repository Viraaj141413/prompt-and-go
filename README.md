# PeaksAI - Desktop Browser Automation Assistant

PeaksAI is a standalone desktop application that provides AI-powered browser automation with real browser control, screenshot analysis, and intelligent task execution.

## 🚀 Features

- **Real Browser Control**: Launches actual Chrome browser windows (headful mode)
- **AI-Powered Automation**: Uses OpenRouter's Horizon Beta model for intelligent task planning
- **Live Screenshot Analysis**: Captures and analyzes browser screenshots with AI vision
- **Local WebSocket Server**: No external dependencies - runs entirely on your machine
- **Natural Language Commands**: Tell the AI what you want in plain English
- **Real-time Progress**: Watch actions execute step-by-step with live feedback

## 📋 Prerequisites

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Chrome/Chromium browser** (Puppeteer will install its own if needed)

## 🛠️ Installation & Setup

### 1. Clone or Download the Project

```bash
# If you have git
git clone <repository-url>
cd peaksai-desktop

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# The backend dependencies will be installed automatically when you start the app
```

### 3. Start the Application

```bash
# Start the complete application (frontend + backend)
npm start
```

This command will:
- Install backend dependencies if needed
- Start the frontend server on http://localhost:5173
- Start the backend WebSocket server on port 3001
- Launch a real Chrome browser window
- Automatically open the application in your default browser

## 🎯 How to Use

### 1. Sign Up/Login
- Create an account or sign in when prompted
- This enables access to the chat interface

### 2. Give Natural Language Commands
Type commands like:
- **Shopping**: "Find me wireless headphones under $100"
- **Food**: "Order me a coffee and pastry"
- **Travel**: "Search for flights from New York to London"
- **Research**: "Find information about electric cars"
- **Navigation**: "Go to Amazon and search for laptops"

### 3. Watch Real Browser Automation
- The AI converts your request into browser actions
- A real Chrome window opens and executes the actions
- Screenshots are captured automatically every 3 seconds
- View live progress in the browser preview panel

### 4. AI Screenshot Analysis
- Click the "🤖 Analyze" button to get AI insights about the current page
- The AI can suggest next steps or explain what's visible

## 🏗️ Architecture

### Frontend (React + Vite)
- **Port**: 5173
- **Framework**: React with TypeScript
- **UI**: Shadcn/UI components with Tailwind CSS
- **Communication**: WebSocket client for real-time updates

### Backend (Node.js + Express)
- **Port**: 3001
- **Browser Engine**: Puppeteer with Chrome
- **WebSocket Server**: Real-time communication with frontend
- **AI Integration**: OpenRouter API with Horizon Beta model
- **Screenshot Processing**: Base64 encoding for AI analysis

### Key Components
- **WebSocket Server**: Handles real-time browser control commands
- **Puppeteer Integration**: Controls actual Chrome browser instances
- **AI Vision**: Analyzes screenshots and provides intelligent responses
- **Action Executor**: Converts AI commands into browser actions

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the root directory:

```bash
# Backend server port (default: 3001)
PORT=3001

# Browser options
HEADLESS=false  # Set to true to run browser in background
```

### Browser Settings
The browser launches with these optimized settings:
- **Headless**: false (visible browser window)
- **Viewport**: 1280x720
- **Screenshot Interval**: 3 seconds
- **Security**: Disabled web security for automation

## 📁 Project Structure

```
peaksai-desktop/
├── src/                    # Frontend React application
│   ├── components/        # UI components
│   │   ├── auth/         # Authentication components
│   │   ├── browser/      # Browser preview and controls
│   │   ├── chat/         # Chat interface
│   │   └── ui/           # Reusable UI components
│   ├── pages/            # Route pages
│   └── lib/              # Utilities and helpers
├── server/               # Backend Node.js server
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── start-app.js          # Application launcher script
├── package.json          # Frontend dependencies
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
- Verify no other applications are using the ports

### Frontend Build Errors
```bash
npm install
npm run dev
```

### AI API Issues
- The application includes fallback responses if the AI service is unavailable
- Check your internet connection for AI features
- Basic browser automation will still work without AI

## 🎮 Example Commands

Try these commands to test the system:

**Shopping:**
- "Find me wireless headphones on Amazon under $100"
- "Search for running shoes on Nike website"
- "Compare laptop prices on different sites"

**Food & Delivery:**
- "Order me a pizza from Domino's"
- "Find coffee shops near me"
- "Search for healthy meal delivery options"

**Travel & Booking:**
- "Search for flights from New York to London"
- "Find hotels in San Francisco for next weekend"
- "Check train schedules between cities"

**Research & Information:**
- "Search for JavaScript tutorials"
- "Find the weather forecast for tomorrow"
- "Research electric car reviews"

**Direct Navigation:**
- "Go to Google and search for news"
- "Open YouTube and find cooking videos"
- "Navigate to GitHub and search for React projects"

## 🔐 Security & Privacy

- **Local Execution**: Everything runs on your local machine
- **No Cloud Dependencies**: Browser automation happens locally
- **API Security**: OpenRouter API key is used securely for AI features
- **Data Privacy**: Screenshots and data stay on your device
- **Transparent Operation**: Browser runs in visible mode for full transparency

## 🚀 Advanced Usage

### Custom Browser Actions
The system supports these browser actions:
- `goto`: Navigate to URLs
- `click`: Click elements
- `type`: Enter text
- `press`: Keyboard shortcuts
- `scroll`: Page scrolling
- `screenshot`: Capture images
- `waitForSelector`: Wait for elements
- `hover`: Mouse hover effects

### API Endpoints
- **Health Check**: `GET http://localhost:3001/health`
- **AI Chat**: `POST http://localhost:3001/ai-chat`
- **Browser Init**: `POST http://localhost:3001/init-browser`

### WebSocket Events
- `execute_actions`: Run browser automation
- `screenshot`: Capture current page
- `analyze_screenshot`: AI analysis of current page
- `navigate`: Direct navigation

## 📝 License

This project is for demonstration and educational purposes. Ensure compliance with website terms of service when automating browser actions.

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify ports 3001 and 5173 are available
4. Check the console output for error messages

---

**Made with ❤️ using React, Node.js, Puppeteer, and AI**

**Powered by OpenRouter's Horizon Beta AI Model**