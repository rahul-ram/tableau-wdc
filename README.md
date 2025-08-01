# Tableau Dynamic Report Connector

A comprehensive solution for building dynamic Tableau Web Data Connectors that enable users to fetch reports with configurable parameters such as workspaces, reports, COB dates, and custom attributes.

## 🚀 Quick Start

### Option 1: WDC 3.0 Native Connector (Recommended)

```bash
# Install dependencies
npm install -g @tableau/taco-toolkit

# Build native connector
cd taco-connector
./build.sh

# Install in Tableau
cp build/DynamicReportConnector.taco \
   "$HOME/Documents/My Tableau Repository/Connectors/"
```

### Option 2: WDC 2.0 Web Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## 📖 Overview

This project provides two approaches for building dynamic Tableau connectors:

### WDC 3.0 Native Connector

- **Language**: Java
- **Deployment**: Single `.taco` file
- **UI**: Native Tableau interface
- **Performance**: Native execution
- **Best for**: Production environments, enterprise deployments

### WDC 2.0 Web Application

- **Language**: React/TypeScript
- **Deployment**: Web server hosting
- **UI**: Web application
- **Performance**: Network dependent
- **Best for**: Development, prototyping, custom UIs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tableau Desktop/Server                   │
├─────────────────────────────────────────────────────────────┤
│  WDC 3.0 Native Connector (Java)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DynamicReportDriver.java                          │   │
│  │  - API Integration                                 │   │
│  │  - Data Processing                                 │   │
│  │  - Schema Definition                               │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  WDC 2.0 Web Application (React/TypeScript)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Web Interface                                     │   │
│  │  - Parameter Selection                             │   │
│  │  - Form Validation                                 │   │
│  │  - API Integration                                 │   │
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

## ✨ Features

### Core Features

- **Dynamic Parameter Selection**: Dropdown-based selections for workspaces, reports, and attributes
- **Real-time API Integration**: Fetches data from external APIs with authentication
- **Flexible Data Schema**: Configurable field definitions and data types
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during data operations

### WDC 3.0 Native Connector Features

- **Native Performance**: Runs within Tableau's JVM for optimal performance
- **Integrated UI**: Seamless integration with Tableau's interface
- **Single File Deployment**: Easy deployment with `.taco` file
- **Enterprise Security**: Sandboxed execution with controlled access

### WDC 2.0 Web Application Features

- **Modern UI**: React-based interface with TypeScript
- **Responsive Design**: Works on desktop and mobile devices
- **Hot Reloading**: Fast development with webpack dev server
- **Custom Styling**: Modern CSS with component-based design

## 🔧 System Requirements

### WDC 3.0 Native Connector

| Component           | Version          | Purpose                 |
| ------------------- | ---------------- | ----------------------- |
| **Java**            | 11 or higher     | Runtime and compilation |
| **Node.js**         | 16 or higher     | TACO toolkit            |
| **Maven**           | 3.6 or higher    | Java dependencies       |
| **Tableau Desktop** | 2022.3 or higher | Testing                 |

### WDC 2.0 Web Application

| Component           | Version      | Purpose                 |
| ------------------- | ------------ | ----------------------- |
| **Node.js**         | 16 or higher | Runtime and build tools |
| **npm**             | 8 or higher  | Package management      |
| **Tableau Desktop** | Any version  | Testing                 |

## 📦 Installation

### Prerequisites

```bash
# Check Node.js version
node --version  # Should be 16+

# Check Java version (for WDC 3.0)
java -version   # Should be 11+

# Check Maven version (for WDC 3.0)
mvn --version   # Should be 3.6+
```

### Project Setup

```bash
# Clone repository
git clone <repository-url>
cd tableau-wdc

# Install dependencies
npm install

# Install TACO toolkit (for WDC 3.0)
npm install -g @tableau/taco-toolkit
```

## 🚀 Usage

### WDC 3.0 Native Connector

1. **Build the Connector**:

   ```bash
   cd taco-connector
   ./build.sh
   ```

2. **Install in Tableau**:

   ```bash
   # Windows
   cp build/DynamicReportConnector.taco \
      "C:\Users\%USERNAME%\Documents\My Tableau Repository\Connectors\"

   # macOS/Linux
   cp build/DynamicReportConnector.taco \
      "$HOME/Documents/My Tableau Repository/Connectors/"
   ```

3. **Use in Tableau**:
   - Open Tableau Desktop
   - Go to **Data** → **More** → **Dynamic Report Connector**
   - Configure parameters and connect

### WDC 2.0 Web Application

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Access in Tableau**:

   - Open Tableau Desktop
   - Go to **Data** → **Web Data Connector**
   - Enter URL: `http://localhost:3000`

3. **Configure Parameters**:
   - Select workspace, report, and attributes
   - Click "Submit to Tableau"

## ⚙️ Configuration

### Environment Variables

#### Development (`env.development`)

```bash
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000
MOCK_WORKSPACES_API=/api/get/workspaces
MOCK_REPORTS_API=/api/get/reports
MOCK_ATTRIBUTES_API=/api/get/reportAttributes
AUTH_ENABLED=false
```

#### Production (`env.production`)

```bash
NODE_ENV=production
API_BASE_URL=https://your-production-api.com
API_TIMEOUT=60000
PROD_WORKSPACES_API=/get/workspaces
PROD_REPORTS_API=/get/reports
PROD_ATTRIBUTES_API=/get/reportAttributes
AUTH_ENABLED=true
AUTH_TOKEN=your-bearer-token
```

### API Endpoints

The connector expects these endpoints:

1. **Workspaces**: `GET /get/workspaces`

   ```json
   ["HSVRR", "FRTB", "SANDBOX"]
   ```

2. **Reports**: `GET /get/reports?workspace={workspace}`

   ```json
   ["HSVAR", "HS_PORTFOLIO_PnL", "SENSITIVITIES"]
   ```

3. **Report Attributes**: `GET /get/reportAttributes?reportName={report}`

   ```json
   [
     {
       "key": "snaptype",
       "type": "text",
       "label": "Snap Type",
       "required": true
     },
     {
       "key": "riskclass",
       "type": "text",
       "label": "Risk Class",
       "required": true
     }
   ]
   ```

4. **Report Data**: `POST /fetch/report-data`
   ```json
   {
     "workspace": "HSVRR",
     "report": "HSVAR",
     "cobdate": "2024-01-15",
     "attributes": {
       "snaptype": "daily",
       "riskclass": "equity"
     }
   }
   ```

## 🛠️ Development

### Project Structure

```
tableau-wdc/
├── taco-connector/                    # WDC 3.0 Native Connector
│   ├── manifest.xml                   # Connector configuration
│   ├── DynamicReportDriver.java       # Java driver
│   ├── build.sh                       # Build script
│   └── pom.xml                        # Maven config
├── src/                               # WDC 2.0 Web Application
│   ├── components/                    # React components
│   ├── api/                           # API integration
│   ├── types/                         # TypeScript types
│   └── connectors/                    # WDC 2.0 connector
├── public/                            # Web assets
├── package.json                       # Dependencies
├── webpack.config.js                  # Build configuration
├── tsconfig.json                      # TypeScript config
├── env.development                    # Development config
├── env.production                     # Production config
├── README.md                          # This file
├── DEVELOPER_GUIDE.md                 # Detailed developer guide
└── WDC3_NATIVE_README.md              # WDC 3.0 specific guide
```

### Development Commands

#### WDC 3.0 Native Connector

```bash
# Build connector
cd taco-connector
./build.sh

# Simulate locally
taco simulate

# Run tests
mvn test
```

#### WDC 2.0 Web Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Data Schema

Both connectors provide the same data schema:

| Field     | Type     | Description            |
| --------- | -------- | ---------------------- |
| id        | int      | Unique identifier      |
| workspace | string   | Selected workspace     |
| report    | string   | Selected report        |
| cobdate   | date     | Close of business date |
| snaptype  | string   | Snap type attribute    |
| riskclass | string   | Risk class attribute   |
| value     | double   | Numeric value          |
| timestamp | datetime | Data timestamp         |

## 🚀 Deployment

### WDC 3.0 Native Connector

#### Development

```bash
cd taco-connector
taco build --mode development
taco package --mode development
```

#### Production

```bash
cd taco-connector
taco build --mode production
taco package --mode production
taco sign --certificate your-cert.p12
```

#### Tableau Server Deployment

```bash
# Copy to server
cp build/DynamicReportConnector.taco /opt/tableau/connectors/

# Restart Tableau Server services
sudo systemctl restart tableau
```

### WDC 2.0 Web Application

#### Development

```bash
npm run build
# Deploy dist/ folder to web server
```

#### Production with Nginx

```bash
npm run build
cp -r dist/* /var/www/html/
cp nginx.conf /etc/nginx/sites-available/tableau-wdc
sudo ln -s /etc/nginx/sites-available/tableau-wdc /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 🔍 Troubleshooting

### Common Issues

#### WDC 3.0 Issues

1. **Connector Not Appearing**

   - Verify `.taco` file is in correct directory
   - Check file permissions
   - Restart Tableau Desktop

2. **Build Failures**
   - Check Java version (requires 11+)
   - Verify TACO toolkit installation
   - Check Maven dependencies

#### WDC 2.0 Issues

1. **"This URL points to a website, not a web data connector"**

   - This is expected for WDC 2.0
   - Use WDC 3.0 native connector for better integration

2. **CORS Errors**
   - Configure web server CORS headers
   - Check Tableau domain whitelist

### Debug Commands

```bash
# Enable debug logging
export TACO_DEBUG=true
export JAVA_OPTS="-Dlog.level=DEBUG"

# Check Tableau logs
# Windows: %APPDATA%\Tableau\Logs\
# macOS: ~/Library/Logs/Tableau/
# Linux: ~/.tableau/logs/
```

## 📚 Documentation

- **[Developer Guide](DEVELOPER_GUIDE.md)** - Comprehensive development guide
- **[WDC 3.0 Native Guide](WDC3_NATIVE_README.md)** - WDC 3.0 specific documentation
- **[Tableau WDC 3.0 Documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm)** - Official Tableau docs
- **[TACO Toolkit](https://github.com/tableau/connector-plugin-sdk)** - Connector SDK

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue in the repository
- **Documentation**: Check the guides in this repository
- **Community**: [Tableau Community Forums](https://community.tableau.com/)
- **Official**: [Tableau WDC Documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm)

---

**Note**: For production use, we recommend the WDC 3.0 native connector approach for better performance, security, and user experience.
