#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 PeaksAI Desktop Browser Automation');
console.log('=====================================\n');

// Check if server directory exists
const serverDir = join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found. Please ensure the server folder exists.');
  process.exit(1);
}

// Check if server dependencies are installed
const serverPackageJson = join(serverDir, 'package.json');
const serverNodeModules = join(serverDir, 'node_modules');

if (!fs.existsSync(serverNodeModules)) {
  console.log('📦 Installing server dependencies...');
  const installServer = spawn('npm', ['install'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });

  installServer.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Server dependencies installed successfully\n');
      startApplication();
    } else {
      console.error('❌ Failed to install server dependencies');
      process.exit(1);
    }
  });
} else {
  startApplication();
}

function startApplication() {
  console.log('🎨 Starting Frontend Server...');
  
  // Start frontend (Vite)
  const frontend = spawn('npm', ['run', 'start:frontend'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    cwd: __dirname
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) console.log(`[FRONTEND] ${output}`);
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('EADDRINUSE')) {
      console.log(`[FRONTEND] ${output}`);
    }
  });

  // Wait for frontend to start, then start backend
  setTimeout(() => {
    console.log('🤖 Starting Backend Server (Browser Automation)...');
    
    const backend = spawn('npm', ['run', 'start:backend'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      cwd: __dirname
    });

    backend.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log(`[BACKEND] ${output}`);
    });

    backend.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log(`[BACKEND] ${output}`);
    });

    backend.on('close', (code) => {
      console.log(`[BACKEND] Process exited with code ${code}`);
      frontend.kill();
      process.exit(code);
    });

    // Open browser after both servers are running
    setTimeout(() => {
      console.log('\n🌐 Opening application in browser...');
      const open = spawn('node', ['-e', `
        const { exec } = require('child_process');
        const url = 'http://localhost:5173';
        const start = process.platform === 'darwin' ? 'open' : 
                     process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(start + ' ' + url);
      `], { shell: true });
    }, 3000);

  }, 2000);

  frontend.on('close', (code) => {
    console.log(`[FRONTEND] Process exited with code ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down PeaksAI...');
    frontend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down PeaksAI...');
    frontend.kill();
    process.exit(0);
  });
}