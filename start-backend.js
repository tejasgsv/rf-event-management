#!/usr/bin/env node

/**
 * Backend Server Startup Script
 * Runs node server.js from the backend directory
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.join(__dirname, 'backend');
const serverScript = path.join(backendDir, 'server.js');

console.log(`Starting server from: ${serverScript}`);
console.log(`Working directory: ${backendDir}\n`);

const server = spawn('node', ['server.js'], {
  cwd: backendDir,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  detached: true
});

// Log output to a file instead
const fs = require('fs');
const logFile = fs.createWriteStream(path.join(backendDir, 'server.log'), { flags: 'a' });
server.stdout.pipe(logFile);
server.stderr.pipe(logFile);

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\nServer exited with code ${code}`);
  process.exit(code);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill();
  process.exit(0);
});
