const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building Dynamic Report WDC...');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const appDir = path.join(projectRoot, 'app');
const handlersDir = path.join(projectRoot, 'handlers');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist structure
fs.mkdirSync(path.join(distDir, 'app'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'handlers'), { recursive: true });

console.log('📁 Created dist directories');

// Compile TypeScript for app
console.log('🔧 Compiling app TypeScript...');
try {
  execSync(`npx tsc --target ES2018 --module none --outDir "${path.join(distDir, 'app')}" --declaration false --sourceMap false "${path.join(appDir, 'index.ts')}"`, 
    { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.error('❌ App TypeScript compilation failed');
  process.exit(1);
}

// Copy app assets
console.log('📋 Copying app assets...');
if (fs.existsSync(path.join(appDir, 'index.html'))) {
  fs.copyFileSync(path.join(appDir, 'index.html'), path.join(distDir, 'app', 'index.html'));
}
if (fs.existsSync(path.join(appDir, 'index.css'))) {
  fs.copyFileSync(path.join(appDir, 'index.css'), path.join(distDir, 'app', 'index.css'));
}

// Copy package.json to app directory for proper connector detection
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(packageJsonPath, path.join(distDir, 'app', 'package.json'));
}

// Compile TypeScript for handlers (if any exist)
if (fs.existsSync(handlersDir) && fs.readdirSync(handlersDir).length > 0) {
  console.log('🔧 Compiling handlers TypeScript...');
  try {
    const tsFiles = fs.readdirSync(handlersDir).filter(f => f.endsWith('.ts'));
    for (const file of tsFiles) {
      execSync(`npx tsc --target ES2018 --module commonjs --outDir "${path.join(distDir, 'handlers')}" --declaration false --sourceMap false "${path.join(handlersDir, file)}"`, 
        { cwd: projectRoot, stdio: 'inherit' });
    }
  } catch (error) {
    console.error('❌ Handlers TypeScript compilation failed');
    process.exit(1);
  }
} else {
  console.log('ℹ️ No handlers to compile');
}

// Copy connector.json to dist root and both app/handlers directories
const connectorJsonPath = path.join(projectRoot, 'connector.json');
if (fs.existsSync(connectorJsonPath)) {
  // Copy to dist root
  fs.copyFileSync(connectorJsonPath, path.join(distDir, 'connector.json'));
  
  // Copy to app directory
  fs.copyFileSync(connectorJsonPath, path.join(distDir, 'app', 'connector.json'));
  
  // Copy to handlers directory
  fs.copyFileSync(connectorJsonPath, path.join(distDir, 'handlers', 'connector.json'));
  
  console.log('📋 Copied connector.json to dist/, app/, and handlers/');
}

// Validate the build
const requiredFiles = [
  path.join(distDir, 'app', 'index.html'),
  path.join(distDir, 'app', 'index.js'),
  path.join(distDir, 'connector.json')
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));
if (missing.length > 0) {
  console.error('❌ Build validation failed. Missing files:');
  missing.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

console.log('✅ Build completed successfully!');
console.log(`📦 Output: ${distDir}`);

// Show build summary
const stats = {
  app: fs.readdirSync(path.join(distDir, 'app')).length,
  handlers: fs.existsSync(path.join(distDir, 'handlers')) ? fs.readdirSync(path.join(distDir, 'handlers')).length : 0,
  total: getAllFiles(distDir).length
};

console.log('📊 Build Summary:');
console.log(`  - App files: ${stats.app}`);
console.log(`  - Handler files: ${stats.handlers}`);
console.log(`  - Total files: ${stats.total}`);

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}
