const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');

console.log('🔏 Signing WDC package...');

const projectRoot = path.join(__dirname, '..');
const packagePath = path.join(projectRoot, 'tableau-wdc-dynamic.taco');
const signaturePath = path.join(projectRoot, 'tableau-wdc-dynamic.taco.sig');
const publicKeyPath = path.join(projectRoot, 'keys', 'public.pem');
const privateKeyPath = path.join(projectRoot, 'keys', 'private.pem');

// Check if package exists
if (!fs.existsSync(packagePath)) {
  console.error('❌ Package not found. Run "npm run package" first.');
  process.exit(1);
}

// Check if keys exist, generate if they don't
if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
  console.log('🔑 Generating RSA key pair...');
  generateKeyPair();
}

// Sign the package
try {
  signPackage();
  console.log('✅ Package signed successfully!');
  console.log(`📝 Signature: ${path.basename(signaturePath)}`);
} catch (error) {
  console.error('❌ Signing failed:', error.message);
  process.exit(1);
}

function generateKeyPair() {
  const keysDir = path.join(projectRoot, 'keys');
  
  // Create keys directory
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Generate key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Save keys
  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);
  
  console.log(`🔑 Keys generated:`);
  console.log(`  - Private: ${path.relative(projectRoot, privateKeyPath)}`);
  console.log(`  - Public: ${path.relative(projectRoot, publicKeyPath)}`);

  // Create .gitignore for keys if it doesn't exist
  const gitignorePath = path.join(keysDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Never commit private keys\\nprivate.pem\\n');
  }
}

function signPackage() {
  // Read the package file
  const packageData = fs.readFileSync(packagePath);
  
  // Read the private key
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  
  // Create signature
  const sign = crypto.createSign('SHA256');
  sign.update(packageData);
  sign.end();
  
  const signature = sign.sign(privateKey, 'hex');
  
  // Create signature file with metadata
  const signatureData = {
    algorithm: 'SHA256withRSA',
    signature: signature,
    packageName: path.basename(packagePath),
    packageSize: packageData.length,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  
  // Save signature
  fs.writeFileSync(signaturePath, JSON.stringify(signatureData, null, 2));
  
  // Also create a simple .sig file for compatibility
  const simpleSigPath = packagePath + '.signature';
  fs.writeFileSync(simpleSigPath, signature);
  
  return signature;
}

// Verification function (for testing)
function verifyPackage() {
  if (!fs.existsSync(signaturePath) || !fs.existsSync(publicKeyPath)) {
    throw new Error('Signature or public key not found');
  }

  const packageData = fs.readFileSync(packagePath);
  const signatureData = JSON.parse(fs.readFileSync(signaturePath, 'utf8'));
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  
  const verify = crypto.createVerify('SHA256');
  verify.update(packageData);
  verify.end();
  
  const isValid = verify.verify(publicKey, signatureData.signature, 'hex');
  
  if (isValid) {
    console.log('✅ Package signature is valid');
  } else {
    console.log('❌ Package signature is invalid');
  }
  
  return isValid;
}

// Add verification command
if (process.argv.includes('--verify')) {
  console.log('🔍 Verifying package signature...');
  verifyPackage();
}

module.exports = { generateKeyPair, signPackage, verifyPackage };
