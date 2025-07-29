import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌟 Starting PeaksAI Development Environment...\n');

// Start frontend (Vite)
console.log('🎨 Starting Frontend (Vite)...');
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: __dirname
});

frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.log(`[FRONTEND] ${data.toString().trim()}`);
});

// Wait a bit for frontend to start, then start backend
setTimeout(() => {
  console.log('\n🤖 Starting Backend (Puppeteer Server)...');
  const backend = spawn('node', ['index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    cwd: join(__dirname, 'server')
  });

  backend.stdout.on('data', (data) => {
    console.log(`[BACKEND] ${data.toString().trim()}`);
  });

  backend.stderr.on('data', (data) => {
    console.log(`[BACKEND] ${data.toString().trim()}`);
  });

  backend.on('close', (code) => {
    console.log(`[BACKEND] Process exited with code ${code}`);
  });

}, 3000);

frontend.on('close', (code) => {
  console.log(`[FRONTEND] Process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  frontend.kill();
  process.exit(0);
});