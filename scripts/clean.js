const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning build artifacts...');

const projectRoot = path.join(__dirname, '..');
const dirsToClean = [
  path.join(projectRoot, 'dist'),
  path.join(projectRoot, 'coverage'),
  path.join(projectRoot, '.nyc_output')
];

const filesToClean = [
  path.join(projectRoot, '*.taco'),
  path.join(projectRoot, '*.log'),
  path.join(projectRoot, 'test-results.xml')
];

// Clean directories
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`🗑️ Removed: ${path.basename(dir)}/`);
  }
});

// Clean individual files
filesToClean.forEach(pattern => {
  const dir = path.dirname(pattern);
  const fileName = path.basename(pattern);
  
  if (fileName.includes('*')) {
    // Handle wildcard patterns
    const prefix = fileName.replace('*.*', '').replace('*', '');
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if ((prefix && file.startsWith(prefix)) || (extension && file.endsWith(`.${extension}`))) {
          const filePath = path.join(dir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed: ${file}`);
        }
      });
    }
  } else if (fs.existsSync(pattern)) {
    fs.unlinkSync(pattern);
    console.log(`🗑️ Removed: ${fileName}`);
  }
});

console.log('✅ Clean completed!');

module.exports = { clean: () => {} };
