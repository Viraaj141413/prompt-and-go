import express from 'express';
import { WebSocketServer } from 'ws';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

let browser = null;
let page = null;
let screenshotInterval = null;

// Initialize browser
async function initBrowser() {
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser window
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Browser initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize browser:', error);
    return false;
  }
}

// Execute browser action
async function executeAction(action, ws) {
  if (!page) {
    console.error('❌ No active page');
    return;
  }

  try {
    console.log(`🎬 Executing action: ${action.type}`, action);
    
    switch (action.type) {
      case 'goto':
        console.log(`🌐 Navigating to: ${action.url}`);
        await page.goto(action.url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        break;
        
      case 'click':
        console.log(`👆 Clicking: ${action.selector}`);
        await page.waitForSelector(action.selector, { timeout: 10000 });
        await page.click(action.selector);
        break;
        
      case 'type':
        console.log(`⌨️ Typing "${action.text}" into: ${action.selector}`);
        await page.waitForSelector(action.selector, { timeout: 10000 });
        await page.click(action.selector);
        await page.keyboard.type(action.text, { delay: 100 });
        break;
        
      case 'press':
        console.log(`🔑 Pressing key: ${action.key}`);
        await page.keyboard.press(action.key);
        break;
        
      case 'waitForSelector':
        console.log(`⏳ Waiting for selector: ${action.selector}`);
        await page.waitForSelector(action.selector, { 
          timeout: action.timeout || 10000 
        });
        break;
        
      case 'waitForTimeout':
        console.log(`⏱️ Waiting for: ${action.timeout}ms`);
        await page.waitForTimeout(action.timeout);
        break;
        
      case 'scroll':
        console.log(`📜 Scrolling page`);
        if (action.direction === 'down') {
          await page.evaluate(() => window.scrollBy(0, 500));
        } else if (action.direction === 'up') {
          await page.evaluate(() => window.scrollBy(0, -500));
        } else {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        }
        break;
        
      case 'hover':
        console.log(`🖱️ Hovering over: ${action.selector}`);
        await page.waitForSelector(action.selector, { timeout: 10000 });
        await page.hover(action.selector);
        break;
        
      case 'select':
        console.log(`📋 Selecting option: ${action.value} in ${action.selector}`);
        await page.waitForSelector(action.selector, { timeout: 10000 });
        await page.select(action.selector, action.value);
        break;
        
      case 'evaluate':
        console.log(`🔧 Executing JavaScript: ${action.script}`);
        await page.evaluate(action.script);
        break;
        
      case 'screenshot':
        console.log('📸 Taking screenshot...');
        await takeScreenshot(ws);
        break;
        
      default:
        console.log(`❓ Unknown action type: ${action.type}`);
    }
    
    // Small delay between actions
    await page.waitForTimeout(500);
    
  } catch (error) {
    console.error(`❌ Error executing action ${action.type}:`, error.message);
    // Continue with next action even if current one fails
  }
}

// Take screenshot and send to frontend
async function takeScreenshot(ws) {
  if (!page || !ws) return;
  
  try {
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      encoding: 'base64'
    });
    
    ws.send(JSON.stringify({
      type: 'screenshot',
      screenshot: screenshot,
      timestamp: Date.now()
    }));
    
    console.log('📸 Screenshot captured and sent');
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
  }
}

// Start automatic screenshot capture
function startScreenshotCapture(ws) {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
  }
  
  // Capture screenshots every 3 seconds
  screenshotInterval = setInterval(() => {
    takeScreenshot(ws);
  }, 3000);
  
  console.log('📹 Started automatic screenshot capture (3fps)');
}

// Stop automatic screenshot capture
function stopScreenshotCapture() {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
    console.log('⏹️ Stopped automatic screenshot capture');
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  // Start screenshot capture when client connects
  startScreenshotCapture(ws);
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received message:', message.type);
      
      switch (message.type) {
        case 'execute_actions':
          console.log(`🎯 Starting execution of ${message.actions.length} actions`);
          
          for (let i = 0; i < message.actions.length; i++) {
            const action = message.actions[i];
            
            // Send progress update
            ws.send(JSON.stringify({
              type: 'action_progress',
              currentStep: i,
              totalSteps: message.actions.length,
              action: action
            }));
            
            await executeAction(action, ws);
            
            // Take screenshot after each action
            await takeScreenshot(ws);
          }
          
          // Send completion message
          ws.send(JSON.stringify({
            type: 'execution_complete',
            totalActions: message.actions.length
          }));
          
          console.log('✅ All actions completed');
          break;
          
        case 'screenshot':
          await takeScreenshot(ws);
          break;
          
        case 'navigate':
          if (message.url) {
            await executeAction({ type: 'goto', url: message.url }, ws);
          }
          break;
          
        default:
          console.log(`❓ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    stopScreenshotCapture();
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    browser: browser ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Initialize browser endpoint
app.post('/init-browser', async (req, res) => {
  const success = await initBrowser();
  res.json({ 
    success,
    message: success ? 'Browser initialized' : 'Failed to initialize browser'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  stopScreenshotCapture();
  
  if (browser) {
    await browser.close();
    console.log('🚀 Browser closed');
  }
  
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log('🌟 ================================');
  console.log(`🚀 PeaksAI Backend Server running on port ${PORT}`);
  console.log('🌟 ================================');
  console.log('🔌 WebSocket server ready for connections');
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  
  // Auto-initialize browser on startup
  console.log('🎬 Auto-initializing browser...');
  await initBrowser();
});