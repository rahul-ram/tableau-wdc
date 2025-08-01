# WDC 3.0 Native Connector - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why Java?](#why-java)
3. [System Requirements](#system-requirements)
4. [Development Setup](#development-setup)
5. [Project Structure](#project-structure)
6. [Implementation Details](#implementation-details)
7. [Testing & Debugging](#testing--debugging)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

### WDC 3.0 vs WDC 2.0

| Aspect              | WDC 2.0 (Web-based)   | WDC 3.0 (Native)      |
| ------------------- | --------------------- | --------------------- |
| **Deployment**      | Web server hosting    | Single `.taco` file   |
| **UI**              | Web application       | Native Tableau UI     |
| **Language**        | JavaScript/TypeScript | Java                  |
| **Performance**     | Network dependent     | Native performance    |
| **User Experience** | External browser      | Integrated in Tableau |
| **Maintenance**     | Server management     | File-based deployment |

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tableau Desktop/Server                   │
├─────────────────────────────────────────────────────────────┤
│  JVM (Java Virtual Machine)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WDC 3.0 Native Connector               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         DynamicReportDriver.java            │   │   │
│  │  │  - API Integration Layer                    │   │   │
│  │  │  - Data Processing Engine                   │   │   │
│  │  │  - Authentication Handler                   │   │   │
│  │  │  - Schema Definition                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         manifest.xml                        │   │   │
│  │  │  - Connector Configuration                  │   │   │
│  │  │  - UI Field Definitions                     │   │   │
│  │  │  - Validation Rules                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    External API Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints                                │   │
│  │  - GET /get/workspaces                             │   │
│  │  - GET /get/reports?workspace={ws}                 │   │
│  │  - GET /get/reportAttributes?report={r}            │   │
│  │  - POST /fetch/report-data                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Why Java?

### 1. **Native Integration**

- WDC 3.0 connectors run within Tableau's JVM
- Direct access to Tableau's internal APIs
- No network overhead for data processing

### 2. **Performance Benefits**

- Compiled bytecode execution
- Optimized memory management
- Efficient data processing for large datasets

### 3. **Enterprise Standards**

- Java is the standard for enterprise Tableau connectors
- Strong typing and compile-time error checking
- Mature ecosystem and tooling

### 4. **SDK Compatibility**

- Official Tableau Connector SDK is Java-based
- Full access to connector lifecycle hooks
- Comprehensive API for data manipulation

### 5. **Security**

- Sandboxed execution within Tableau's JVM
- Controlled access to system resources
- Enterprise-grade security model

## System Requirements

### Development Environment

| Component           | Version          | Purpose                      |
| ------------------- | ---------------- | ---------------------------- |
| **Java**            | 11 or higher     | Runtime and compilation      |
| **Node.js**         | 16 or higher     | TACO toolkit and build tools |
| **Maven**           | 3.6 or higher    | Java dependency management   |
| **Tableau Desktop** | 2022.3 or higher | Testing and validation       |
| **Git**             | 2.0 or higher    | Version control              |

### Installation Commands

#### Windows

```powershell
# Install Java 11+
winget install Oracle.JDK.11
# or download from: https://adoptium.net/

# Install Node.js
winget install OpenJS.NodeJS

# Install Maven
winget install Apache.Maven
```

#### macOS

```bash
# Install Java 11+
brew install openjdk@11

# Install Node.js
brew install node

# Install Maven
brew install maven
```

#### Linux (Ubuntu/Debian)

```bash
# Install Java 11+
sudo apt update
sudo apt install openjdk-11-jdk

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Maven
sudo apt install maven
```

### Verify Installations

```bash
# Check Java version
java -version

# Check Node.js version
node --version

# Check Maven version
mvn --version

# Check TACO toolkit
taco --version
```

## Development Setup

### 1. **Clone and Setup Project**

```bash
git clone <your-repo-url>
cd tableau-wdc
```

### 2. **Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Install TACO toolkit globally
npm install -g @tableau/taco-toolkit
```

### 3. **Configure Development Environment**

```bash
# Copy environment files
cp env.development .env.development
cp env.production .env.production

# Edit configuration
nano .env.development
```

### 4. **Initialize TACO Project**

```bash
cd taco-connector
taco init
```

## Project Structure

```
tableau-wdc/
├── taco-connector/                    # WDC 3.0 Native Connector
│   ├── manifest.xml                   # Connector configuration
│   ├── DynamicReportDriver.java       # Main driver implementation
│   ├── build.sh                       # Build automation script
│   ├── pom.xml                        # Maven configuration
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/tableau/connector/
│           │       └── dynamicreport/
│           │           ├── DynamicReportDriver.java
│           │           └── api/
│           │               └── ApiClient.java
│           └── resources/
│               ├── icons/
│               │   └── icon.png
│               └── strings/
│                   └── strings.xml
├── src/                               # WDC 2.0 Web Application (Legacy)
│   ├── components/
│   ├── api/
│   └── ...
├── public/                            # Web assets
├── package.json                       # Node.js dependencies
├── webpack.config.js                  # Webpack configuration
├── tsconfig.json                      # TypeScript configuration
├── env.development                    # Development environment
├── env.production                     # Production environment
├── README.md                          # Project overview
├── DEVELOPER_GUIDE.md                 # This file
└── WDC3_NATIVE_README.md              # WDC 3.0 specific guide
```

## Implementation Details

### 1. **Java Driver Architecture**

```java
public class DynamicReportDriver implements ConnectorDriver {

    // 1. Define connector capabilities
    @Override
    public ConnectorCapabilities getCapabilities() {
        return ConnectorCapabilities.builder()
            .setSupportsExtract(true)
            .setSupportsLive(false)
            .build();
    }

    // 2. Define data schema
    @Override
    public ConnectorSchema getSchema(ConnectorConnection connection) {
        // Define fields and their types
    }

    // 3. Fetch and process data
    @Override
    public ConnectorData getData(ConnectorConnection connection, ConnectorQuery query) {
        // Extract parameters from connection
        // Call external API
        // Process and return data
    }
}
```

### 2. **Manifest Configuration**

```xml
<connector-plugin class="DynamicReportConnector" version="1.0">
  <connection-fields>
    <!-- Dynamic field definitions -->
    <field name="workspace" datatype="string" required="true">
      <validation-list>
        <value>HSVRR</value>
        <value>FRTB</value>
        <value>SANDBOX</value>
      </validation-list>
    </field>
  </connection-fields>
</connector-plugin>
```

### 3. **API Integration Flow**

```java
private List<Map<String, Object>> callReportAPI(Map<String, Object> requestData) {
    // 1. Build HTTP request
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(API_BASE_URL + "/fetch/report-data"))
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + authToken)
        .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
        .build();

    // 2. Send request and get response
    HttpResponse<String> response = httpClient.send(request,
        HttpResponse.BodyHandlers.ofString());

    // 3. Parse response
    return parseApiResponse(response.body());
}
```

## Testing & Debugging

### 1. **Local Testing**

```bash
# Simulate connector locally
cd taco-connector
taco simulate

# Run unit tests
mvn test

# Build and test
taco build && taco package
```

### 2. **Tableau Desktop Testing**

```bash
# Build connector
./build.sh

# Copy to Tableau connectors directory
cp build/DynamicReportConnector.taco \
   "$HOME/Documents/My Tableau Repository/Connectors/"

# Restart Tableau Desktop
# Test connector in Tableau
```

### 3. **Debug Mode**

```bash
# Enable debug logging
export TACO_DEBUG=true
export JAVA_OPTS="-Dlog.level=DEBUG"

# Run with verbose output
taco build --verbose
```

### 4. **API Testing**

```bash
# Test API endpoints
curl -X GET "https://your-api.com/get/workspaces" \
  -H "Authorization: Bearer your-token"

curl -X POST "https://your-api.com/fetch/report-data" \
  -H "Content-Type: application/json" \
  -d '{"workspace":"HSVRR","report":"HSVAR","cobdate":"2024-01-15"}'
```

## Deployment

### 1. **Development Deployment**

```bash
# Build development version
taco build --mode development
taco package --mode development

# Install locally
cp build/DynamicReportConnector.taco \
   "$HOME/Documents/My Tableau Repository/Connectors/"
```

### 2. **Production Deployment**

```bash
# Build production version
taco build --mode production
taco package --mode production

# Sign the package (recommended)
taco sign --certificate your-cert.p12

# Deploy to Tableau Server
cp build/DynamicReportConnector.taco \
   "/opt/tableau/connectors/"
```

### 3. **CI/CD Pipeline**

```yaml
# .github/workflows/build.yml
name: Build TACO Connector
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: "11"
          distribution: "temurin"
      - uses: actions/setup-node@v3
        with:
          node-version: "16"
      - run: npm install -g @tableau/taco-toolkit
      - run: cd taco-connector && taco build && taco package
      - uses: actions/upload-artifact@v3
        with:
          name: connector
          path: taco-connector/build/*.taco
```

## Troubleshooting

### Common Issues

#### 1. **Java Version Issues**

```bash
# Check Java version
java -version

# Set JAVA_HOME if needed
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

#### 2. **TACO Toolkit Issues**

```bash
# Reinstall TACO toolkit
npm uninstall -g @tableau/taco-toolkit
npm install -g @tableau/taco-toolkit

# Check TACO version
taco --version
```

#### 3. **Build Failures**

```bash
# Clean and rebuild
cd taco-connector
rm -rf build/
taco build --verbose

# Check Maven dependencies
mvn dependency:resolve
```

#### 4. **Tableau Integration Issues**

```bash
# Verify connector installation
ls -la "$HOME/Documents/My Tableau Repository/Connectors/"

# Check Tableau logs
# Windows: %APPDATA%\Tableau\Logs\
# macOS: ~/Library/Logs/Tableau/
# Linux: ~/.tableau/logs/
```

### Debug Commands

```bash
# Enable verbose logging
export TACO_DEBUG=true
export JAVA_OPTS="-Dlog.level=DEBUG -Dlog.file=connector.log"

# Run with debug output
taco build --debug
taco simulate --debug
```

### Performance Optimization

```java
// Use connection pooling for API calls
private static final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(30))
    .build();

// Implement caching for frequently accessed data
private final Map<String, Object> cache = new ConcurrentHashMap<>();
```

## Best Practices

### 1. **Code Organization**

- Separate API logic from data processing
- Use dependency injection for testability
- Implement proper error handling and logging

### 2. **Performance**

- Use connection pooling for HTTP clients
- Implement caching for static data
- Optimize data processing for large datasets

### 3. **Security**

- Validate all input parameters
- Use secure authentication methods
- Implement proper error handling (no sensitive data in logs)

### 4. **Testing**

- Write unit tests for all components
- Test with various data scenarios
- Validate error conditions

### 5. **Documentation**

- Document API endpoints and data formats
- Maintain up-to-date configuration guides
- Provide troubleshooting documentation

## Support Resources

- [Tableau WDC 3.0 Documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm)
- [TACO Toolkit GitHub](https://github.com/tableau/connector-plugin-sdk)
- [Tableau Community Forums](https://community.tableau.com/)
- [Java Documentation](https://docs.oracle.com/en/java/)
- [Maven Documentation](https://maven.apache.org/guides/)

---

**Note**: This guide assumes familiarity with Java development. For beginners, consider starting with the WDC 2.0 web-based approach before moving to WDC 3.0 native connectors.
