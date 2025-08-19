const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

console.log('🚀 Starting development server...');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const watchPaths = [
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'handlers'),
  path.join(projectRoot, 'connector.json')
];

let server = null;
let building = false;

// Initial build
console.log('🔨 Initial build...');
runBuild();

// Setup file watcher
console.log('👀 Watching for changes...');
const watcher = chokidar.watch(watchPaths, {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  console.log(`📝 Changed: ${path.relative(projectRoot, filePath)}`);
  rebuildAndRestart();
});

watcher.on('add', (filePath) => {
  console.log(`➕ Added: ${path.relative(projectRoot, filePath)}`);
  rebuildAndRestart();
});

watcher.on('unlink', (filePath) => {
  console.log(`➖ Removed: ${path.relative(projectRoot, filePath)}`);
  rebuildAndRestart();
});

// Start development server
startServer();

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down development server...');
  if (server) {
    server.kill();
  }
  watcher.close();
  process.exit(0);
});

function runBuild() {
  try {
    require('./build.js');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

function startServer() {
  if (server) {
    server.kill();
  }

  if (!fs.existsSync(path.join(distDir, 'app'))) {
    console.log('⏳ Waiting for build to complete...');
    return;
  }

  console.log('🌐 Starting HTTP server on http://localhost:3000');
  
  server = spawn('npx', ['http-server', distDir, '-p', '3000', '-c-1', '--cors'], {
    cwd: projectRoot,
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('Starting up')) {
      console.log(`📡 Server: ${output}`);
    }
  });

  server.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
      console.error(`❌ Server error: ${error}`);
    }
  });

  server.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`⚠️ Server exited with code ${code}`);
    }
  });

  // Give server time to start
  setTimeout(() => {
    console.log('');
    console.log('🎉 Development server ready!');
    console.log('📋 Open in Tableau: http://localhost:3000/app/index.html');
    console.log('🔧 Connector config: http://localhost:3000/connector.json');
    console.log('');
    console.log('Press Ctrl+C to stop');
  }, 1000);
}

function rebuildAndRestart() {
  if (building) {
    return; // Prevent overlapping builds
  }

  building = true;
  console.log('\\n🔄 Rebuilding...');
  
  const buildSuccess = runBuild();
  
  if (buildSuccess) {
    console.log('✅ Rebuild completed, restarting server...');
    startServer();
  } else {
    console.log('❌ Rebuild failed, keeping old version running');
  }
  
  building = false;
}
