# PeaksAI Desktop - Installation Guide

This guide will help you install and run PeaksAI Desktop Browser Automation on your local machine.

## 🎯 Quick Start (TL;DR)

```bash
# 1. Install Node.js (if not already installed)
# Download from: https://nodejs.org/

# 2. Install dependencies
npm install

# 3. Start the application
npm start

# 4. The app will automatically open in your browser at http://localhost:5173
```

## 📋 Detailed Installation Steps

### Step 1: Install Prerequisites

#### Node.js and npm
1. **Download Node.js**: Go to [https://nodejs.org/](https://nodejs.org/)
2. **Choose Version**: Download the LTS (Long Term Support) version
3. **Install**: Run the installer and follow the prompts
4. **Verify Installation**:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

#### Chrome Browser (Optional)
- Puppeteer will automatically download its own Chrome if needed
- If you prefer to use your system Chrome, ensure it's installed

### Step 2: Download PeaksAI

#### Option A: Download ZIP
1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal/command prompt in the extracted folder

#### Option B: Clone Repository (if available)
```bash
git clone <repository-url>
cd peaksai-desktop
```

### Step 3: Install Dependencies

```bash
# Install frontend dependencies
npm install
```

**Note**: Backend dependencies will be installed automatically when you first run the app.

### Step 4: Start the Application

```bash
# Start the complete application
npm start
```

This command will:
1. ✅ Check and install backend dependencies
2. 🎨 Start the frontend server (port 5173)
3. 🤖 Start the backend server (port 3001)
4. 🚀 Launch a Chrome browser window
5. 🌐 Open the app in your default browser

### Step 5: First Run Setup

1. **Wait for Startup**: The first run may take 30-60 seconds
2. **Browser Windows**: You'll see:
   - Your default browser with the PeaksAI interface
   - A Chrome window for automation (may be blank initially)
3. **Sign Up**: Create an account to access the chat interface
4. **Test Connection**: Look for "Connected" status in the browser preview

## 🔧 Manual Installation (If Automatic Fails)

### Install Backend Dependencies Manually

```bash
cd server
npm install
cd ..
```

### Start Services Separately

**Terminal 1 - Frontend:**
```bash
npm run start:frontend
```

**Terminal 2 - Backend:**
```bash
npm run start:backend
```

## 🌐 Accessing the Application

- **Main Interface**: http://localhost:5173
- **Backend Health**: http://localhost:3001/health
- **WebSocket**: ws://localhost:3001

## ✅ Verify Installation

### Check if Everything is Working

1. **Frontend Loading**: Visit http://localhost:5173
2. **Backend Health**: Visit http://localhost:3001/health
3. **WebSocket Connection**: Look for "Connected" status in the app
4. **Browser Automation**: Try the "Screenshot" button

### Expected Console Output

```
🚀 PeaksAI Desktop Browser Automation
=====================================

📦 Installing server dependencies...
✅ Server dependencies installed successfully

🎨 Starting Frontend Server...
[FRONTEND] Local:   http://localhost:5173/
[FRONTEND] Network: http://192.168.x.x:5173/

🤖 Starting Backend Server (Browser Automation)...
[BACKEND] 🌟 ================================
[BACKEND] 🚀 PeaksAI Backend Server running on port 3001
[BACKEND] 🌟 ================================
[BACKEND] 🔌 WebSocket server ready for connections
[BACKEND] 🚀 Launching browser...
[BACKEND] ✅ Browser initialized successfully

🌐 Opening application in browser...
```

## 🐛 Common Installation Issues

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Port 3001 already in use"
**Solution**: 
```bash
# Kill process using port 3001
npx kill-port 3001
# Or change port in server/index.js
```

### Issue: "Permission denied" on macOS/Linux
**Solution**:
```bash
sudo npm install -g npm
# Or use node version manager (nvm)
```

### Issue: Browser won't launch
**Solution**:
```bash
# Install Chrome manually for Puppeteer
npx puppeteer browsers install chrome
```

### Issue: WebSocket connection fails
**Solution**:
1. Check if backend is running on port 3001
2. Disable firewall temporarily
3. Try restarting the application

## 🔄 Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Reinstall dependencies
npm install
cd server && npm install && cd ..

# Restart application
npm start
```

## 🗑️ Uninstalling

```bash
# Remove node_modules
rm -rf node_modules server/node_modules

# Remove the entire project folder
cd ..
rm -rf peaksai-desktop
```

## 🆘 Getting Help

If you encounter issues:

1. **Check Prerequisites**: Ensure Node.js v18+ is installed
2. **Port Conflicts**: Make sure ports 3001 and 5173 are free
3. **Firewall**: Temporarily disable firewall/antivirus
4. **Clean Install**: Delete `node_modules` and reinstall
5. **Console Logs**: Check terminal output for error messages

### Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check if ports are in use
netstat -an | grep 3001
netstat -an | grep 5173

# Test backend directly
curl http://localhost:3001/health

# Check WebSocket connection
# (Use browser developer tools -> Network -> WS)
```

## 🎉 Success!

Once installed successfully, you should see:
- ✅ Frontend running on http://localhost:5173
- ✅ Backend running on port 3001
- ✅ Chrome browser window opened
- ✅ "Connected" status in the app
- ✅ Ability to take screenshots and run automation

You're now ready to use PeaksAI for browser automation! 🚀