# WDC 3.0 Native Connector - Dynamic Report Connector

This document explains how to build a **WDC 3.0 native connector** that allows users to dynamically select reports and parameters within Tableau, rather than using a web-hosted WDC 2.0 approach.

## Why WDC 3.0 Native Connector?

Based on the [Tableau WDC 3.0 documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm), WDC 3.0 native connectors provide:

- **Dynamic UI within Tableau**: Users can select parameters on-the-fly
- **No web hosting required**: Connector runs natively in Tableau
- **Better user experience**: Integrated into Tableau's interface
- **Easier deployment**: Single `.taco` file installation

## Project Structure

```
taco-connector/
├── manifest.xml                    # Connector configuration
├── DynamicReportDriver.java        # Java driver implementation
├── DynamicReportLibrary.jar        # Custom library (if needed)
├── resources/
│   ├── icons/
│   │   └── icon.png               # Connector icon
│   └── strings/
│       └── strings.xml            # Localization strings
└── build/
    └── DynamicReportConnector.taco # Final connector package
```

## Building the Native Connector

### 1. Install TACO Toolkit

```bash
npm install -g @tableau/taco-toolkit
```

### 2. Initialize TACO Project

```bash
taco init
```

### 3. Build the Connector

```bash
taco build
```

### 4. Package the Connector

```bash
taco package
```

## Installation

### For Tableau Desktop

1. Copy the `.taco` file to:

   ```
   Windows: C:\Users\[User]\Documents\My Tableau Repository\Connectors
   macOS: /Users/[user]/Documents/My Tableau Repository/Connectors
   ```

2. Restart Tableau Desktop

3. The connector will appear in the connector list

### For Tableau Server

1. Copy the `.taco` file to:

   ```
   Windows: C:\Program Files\Tableau\Connectors
   Linux: /opt/tableau/connectors
   ```

2. Restart Tableau Server services

## Usage

1. **Open Tableau Desktop**
2. **Connect to Data** → **More** → **Dynamic Report Connector**
3. **Configure Parameters**:
   - Select Workspace (HSVRR, FRTB, SANDBOX)
   - Select Report (HSVAR, HS_PORTFOLIO_PnL, SENSITIVITIES)
   - Choose COB Date
   - Enter Snap Type and Risk Class
4. **Click Connect**
5. **Data loads into Tableau**

## Key Features

### Dynamic Parameter Selection

- **Workspace Dropdown**: Pre-defined workspace options
- **Report Dropdown**: Available reports for selected workspace
- **Date Picker**: COB date selection
- **Text Inputs**: Snap Type and Risk Class

### API Integration

- **REST API Calls**: Fetches data from your backend
- **Authentication**: Supports Bearer token auth
- **Error Handling**: Graceful error handling and user feedback

### Data Schema

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

## Configuration

### Environment Variables

```bash
API_BASE_URL=https://your-api-endpoint.com
API_TIMEOUT=30000
AUTH_TOKEN=your-bearer-token
```

### API Endpoints

The connector expects these endpoints:

1. **Report Data**: `POST /api/reports/data`
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

## Development

### Prerequisites

- Java 11+
- Maven 3.6+
- Tableau Desktop/Server
- TACO Toolkit

### Development Workflow

1. **Edit Java Driver**: Modify `DynamicReportDriver.java`
2. **Update Manifest**: Edit `manifest.xml` for UI changes
3. **Test Locally**: Use `taco simulate` for testing
4. **Build Package**: Run `taco build` and `taco package`
5. **Install & Test**: Install in Tableau and test

### Testing

```bash
# Simulate connector locally
taco simulate

# Run unit tests
mvn test

# Build and package
taco build && taco package
```

## Troubleshooting

### Common Issues

1. **Connector Not Appearing**

   - Verify `.taco` file is in correct directory
   - Check file permissions
   - Restart Tableau

2. **API Connection Errors**

   - Verify API endpoint is accessible
   - Check authentication credentials
   - Review network connectivity

3. **Data Not Loading**
   - Check API response format
   - Verify field mappings in schema
   - Review error logs

### Debug Mode

Enable debug logging by setting:

```bash
export TACO_DEBUG=true
```

## Deployment

### Production Deployment

1. **Build Production Package**:

   ```bash
   taco build --mode production
   taco package --mode production
   ```

2. **Sign the Package** (recommended):

   ```bash
   taco sign --certificate your-cert.p12
   ```

3. **Deploy to Tableau Server**:
   - Copy `.taco` to server connectors directory
   - Restart Tableau Server services
   - Verify connector appears in connector list

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Build TACO Connector
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: "11"
      - run: npm install -g @tableau/taco-toolkit
      - run: taco build
      - run: taco package
      - uses: actions/upload-artifact@v2
        with:
          name: connector
          path: build/*.taco
```

## Known Limitations

According to the [Tableau documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm#known), there are known issues with WDC 3.0 connectors on multi-node Tableau Server environments.

## Support

For issues with the TACO toolkit or connector development:

- [Tableau WDC 3.0 Documentation](https://help.tableau.com/current/pro/desktop/en-us/examples_wdc_connector_sdk.htm)
- [TACO Toolkit GitHub](https://github.com/tableau/connector-plugin-sdk)
- [Tableau Community Forums](https://community.tableau.com/)

## License

This project is licensed under the MIT License.
