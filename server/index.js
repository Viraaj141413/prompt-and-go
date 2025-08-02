import express from 'express';
import { WebSocketServer } from 'ws';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { createServer } from 'http';
import fetch from 'node-fetch';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

let browser = null;
let page = null;
let screenshotInterval = null;

// OpenRouter API configuration
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
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
    return screenshot;
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    return null;
  }
}

// Analyze screenshot with AI
async function analyzeScreenshot(screenshot, userMessage) {
  try {
    console.log('🤖 Analyzing screenshot with AI...');
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/horizon-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `User request: "${userMessage}"\n\nPlease analyze this screenshot and provide insights about what's visible on the page. What actions could be taken next to fulfill the user's request?`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    return 'Unable to analyze screenshot at this time.';
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
          
        case 'analyze_screenshot':
          const screenshot = await takeScreenshot(ws);
          if (screenshot) {
            const analysis = await analyzeScreenshot(screenshot, message.userMessage || 'Analyze this page');
            ws.send(JSON.stringify({
              type: 'screenshot_analysis',
              analysis: analysis,
              timestamp: Date.now()
            }));
          }
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

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    browser: browser ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.post('/init-browser', async (req, res) => {
  const success = await initBrowser();
  res.json({ 
    success,
    message: success ? 'Browser initialized' : 'Failed to initialize browser'
  });
});

app.post('/ai-chat', async (req, res) => {
  try {
    const { message, includeScreenshot } = req.body;
    
    let screenshot = null;
    if (includeScreenshot && page) {
      screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        encoding: 'base64'
      });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are PeaksAI, a browser automation assistant. Help users navigate websites and complete tasks.'
      }
    ];

    if (screenshot) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: message
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenshot}`
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: message
      });
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/horizon-beta',
        messages: messages,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      message: data.choices[0].message.content,
      screenshot: screenshot
    });

  } catch (error) {
    console.error('❌ AI chat error:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      message: error.message
    });
  }
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

server.listen(PORT, '0.0.0.0', async () => {
  console.log('🌟 ================================');
  console.log(`🚀 PeaksAI Backend Server running on port ${PORT}`);
  console.log('🌟 ================================');
  console.log('🔌 WebSocket server ready for connections');
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('🤖 AI Chat endpoint: http://localhost:' + PORT + '/ai-chat');
  
  // Auto-initialize browser on startup
  console.log('🎬 Auto-initializing browser...');
  await initBrowser();
});