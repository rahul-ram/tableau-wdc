const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('🧪 Running WDC tests...');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

let testsPassed = 0;
let testsFailed = 0;

// Test utilities
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ ${message}`);
    testsFailed++;
  }
}

function test(name, fn) {
  console.log(`\\n🔍 ${name}`);
  try {
    fn();
  } catch (error) {
    console.error(`  ❌ Test failed: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Build artifacts exist
test('Build artifacts exist', () => {
  const requiredFiles = [
    path.join(distDir, 'connector.json'),
    path.join(distDir, 'app', 'index.html'),
    path.join(distDir, 'app', 'index.js'),
    path.join(distDir, 'app', 'index.css')
  ];

  requiredFiles.forEach(file => {
    assert(fs.existsSync(file), `${path.relative(projectRoot, file)} exists`);
  });
});

// Test 2: Connector configuration is valid
test('Connector configuration is valid', () => {
  const connectorPath = path.join(distDir, 'connector.json');
  
  if (fs.existsSync(connectorPath)) {
    const connectorContent = fs.readFileSync(connectorPath, 'utf-8');
    
    try {
      const connector = JSON.parse(connectorContent);
      assert(connector.name, 'Connector has name');
      assert(connector.displayName, 'Connector has displayName');
      assert(connector.version, 'Connector has version');
      assert(connector['tableau-version'], 'Connector specifies Tableau version requirement');
      assert(connector.vendor, 'Connector has vendor information');
      assert(connector.auth, 'Connector has auth configuration');
      assert(connector.window, 'Connector has window configuration');
      
      // Check required properties
      assert(typeof connector.name === 'string' && connector.name.length > 0, 'Connector name is valid');
      assert(typeof connector.displayName === 'string' && connector.displayName.length > 0, 'Connector displayName is valid');
      assert(typeof connector.version === 'string' && /\d+\.\d+\.\d+/.test(connector.version), 'Connector version is valid semver');
      
    } catch (parseError) {
      assert(false, 'Connector JSON is valid');
    }
  } else {
    assert(false, 'Connector configuration file exists');
  }
});

// Test 3: HTML structure is valid
test('HTML structure is valid', () => {
  const htmlPath = path.join(distDir, 'app', 'index.html');
  
  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      assert(document.title, 'HTML has title');
      assert(document.querySelector('script'), 'HTML includes JavaScript');
      assert(document.querySelector('link[href="index.css"]'), 'HTML includes CSS');
      assert(document.querySelector('#submitButton'), 'HTML has submit button');
      
    } catch (parseError) {
      assert(false, 'HTML is valid');
    }
  } else {
    assert(false, 'HTML file exists');
  }
});

// Test 4: JavaScript compilation is valid
test('JavaScript compilation is valid', () => {
  const jsPath = path.join(distDir, 'app', 'index.js');
  
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    
    // Basic syntax checks
    assert(jsContent.includes('tableau'), 'JS includes Tableau API references');
    assert(jsContent.includes('makeConnector'), 'JS includes connector creation');
    assert(jsContent.includes('getSchema'), 'JS includes schema definition');
    assert(jsContent.includes('getData'), 'JS includes data fetching');
    
    // Check for TypeScript compilation artifacts
    assert(!jsContent.includes('interface '), 'TypeScript interfaces are compiled out');
    assert(!jsContent.includes('import '), 'ES6 imports are compiled out');
    
    // Ensure no Node.js dependencies leak through
    assert(!jsContent.includes('require('), 'No Node.js require statements');
    assert(!jsContent.includes('module.exports'), 'No Node.js module exports');
    
    // Check for essential WDC functionality
    assert(jsContent.includes('Parameterized_Report_'), 'Includes connection name parsing');
    assert(jsContent.includes('/reports/getData'), 'Includes API endpoint');
    
  } else {
    assert(false, 'JavaScript file exists');
  }
});

// Test 5: CSS is present
test('CSS styling is present', () => {
  const cssPath = path.join(distDir, 'app', 'index.css');
  
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    assert(cssContent.includes('.container'), 'CSS includes container styling');
    assert(cssContent.includes('#submitButton'), 'CSS includes button styling');
    assert(cssContent.includes('.loading'), 'CSS includes loading state');
    
  } else {
    assert(false, 'CSS file exists');
  }
});

// Test 6: Package structure validation
test('Package structure is correct', () => {
  const expectedStructure = [
    'connector.json',
    'app/index.html',
    'app/index.js',
    'app/index.css',
    'app/connector.json',
    'handlers/connector.json'
  ];

  expectedStructure.forEach(filePath => {
    const fullPath = path.join(distDir, filePath);
    assert(fs.existsSync(fullPath), `Package includes ${filePath}`);
  });

  // Check for unexpected files
  const allFiles = getAllFiles(distDir);
  const unexpectedFiles = allFiles.filter(file => {
    const relativePath = path.relative(distDir, file).replace(/\\/g, '/');
    return !expectedStructure.includes(relativePath) && 
           !relativePath.startsWith('handlers/'); // handlers are optional
  });

  assert(unexpectedFiles.length === 0, `No unexpected files (found: ${unexpectedFiles.map(f => path.relative(distDir, f).replace(/\\/g, '/')).join(', ') || 'none'})`);
});

// Helper function
function getAllFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
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

// Summary
console.log('\\n📊 Test Summary:');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);

if (testsFailed > 0) {
  console.log('\\n❌ Some tests failed. Please fix the issues before packaging.');
  process.exit(1);
} else {
  console.log('\\n🎉 All tests passed! WDC is ready for packaging.');
}

module.exports = { testsPassed, testsFailed };
