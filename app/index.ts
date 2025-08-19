// Dynamic Report WDC - App Entry Point
// This WDC automatically detects the data source name from extension and fetches data

interface WindowWithTableau {
    tableau?: any;
    location: Location;
    document: Document;
    setTimeout: typeof setTimeout;
    fetch: typeof fetch;
}

let connectorInitialized = false;
let pageLoaded = false;

class DynamicReportConnector {
    private tableau: any;
    private connectionName: string = '';
    private parsedConnection: any = null;

    constructor() {
        this.tableau = (window as WindowWithTableau).tableau;
        if (!this.tableau) {
            console.error('Tableau WDC API not available');
            return;
        }

        this.initializeConnector();
    }

    private initializeConnector() {
        const connector = this.tableau.makeConnector();

        connector.getSchema = (schemaCallback: any) => {
            console.log('Getting schema for connection:', this.connectionName);

            const schema = this.createSchema();
            schemaCallback([schema]);
        };

        connector.getData = (table: any, doneCallback: any) => {
            console.log('Getting data for table:', table.tableInfo.id);

            this.fetchData(table)
                .then(() => {
                    console.log('Data fetch completed');
                    doneCallback();
                })
                .catch((error) => {
                    console.error('Data fetch failed:', error);
                    this.tableau.abortWithError(error.message || 'Failed to fetch data');
                });
        };

        this.tableau.registerConnector(connector);
        connectorInitialized = true;
        this.enableButtonWhenReady();
    }

    private createSchema(): any {
        return {
            id: 'dynamicReportData',
            alias: 'Dynamic Report Data',
            columns: [
                {
                    id: 'id',
                    alias: 'ID',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'timestamp',
                    alias: 'Timestamp',
                    dataType: this.tableau.dataTypeEnum.datetime
                },
                {
                    id: 'date_dimension',
                    alias: 'Date',
                    dataType: this.tableau.dataTypeEnum.date
                },
                {
                    id: 'user_email',
                    alias: 'User Email',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'workspace',
                    alias: 'Workspace',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'report_name',
                    alias: 'Report Name',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'metric_name',
                    alias: 'Metric Name',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'metric_value',
                    alias: 'Metric Value',
                    dataType: this.tableau.dataTypeEnum.float
                },
                {
                    id: 'category',
                    alias: 'Category',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'snaptype',
                    alias: 'Snap Type',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'riskclass',
                    alias: 'Risk Class',
                    dataType: this.tableau.dataTypeEnum.string
                },
                {
                    id: 'cobdate',
                    alias: 'COB Date',
                    dataType: this.tableau.dataTypeEnum.string
                }
            ]
        };
    }

    private parseConnectionName(connectionName: string): any {
        // Parse: Parameterized_Report_{userEmail}_{workspaceName}_{reportName}_{signature}
        if (connectionName.startsWith('Parameterized_Report_')) {
            const rest = connectionName.substring('Parameterized_Report_'.length);
            const parts = rest.split('_');

            if (parts.length >= 4) {
                const signature = parts.pop() as string;
                const reportName = parts.pop() as string;
                const workspaceName = parts.pop() as string;
                const userEmail = parts.join('_'); // In case email contains underscores

                return {
                    userEmail,
                    workspaceName,
                    reportName,
                    signature
                };
            }
        }

        // Fallback for non-standard names
        return {
            userEmail: 'dev.user@example.com',
            workspaceName: 'WS_HS1',
            reportName: 'report1',
            signature: 'unknown'
        };
    }

    private async fetchData(table: any): Promise<void> {
        this.connectionName = this.tableau.connectionName || '';
        this.parsedConnection = this.parseConnectionName(this.connectionName);

        console.log('Parsed connection:', this.parsedConnection);

        const apiUrl = this.buildApiUrl();
        console.log('Fetching from:', apiUrl);

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const data = result.data || [];

            console.log(`Fetched ${data.length} rows`);

            const tableData = data.map((row: any) => ({
                id: row.id || '',
                timestamp: row.timestamp || new Date().toISOString(),
                date_dimension: row.date_dimension || '',
                user_email: row.user_email || this.parsedConnection.userEmail,
                workspace: row.workspace || this.parsedConnection.workspaceName,
                report_name: row.report_name || this.parsedConnection.reportName,
                metric_name: row.metric_name || '',
                metric_value: row.metric_value || 0,
                category: row.category || '',
                snaptype: row.snaptype || '',
                riskclass: row.riskclass || '',
                cobdate: row.cobdate || ''
            }));

            table.appendRows(tableData);
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    private buildApiUrl(): string {
        const baseUrl = this.getApiBaseUrl();
        const params = new URLSearchParams();

        params.set('user_email', this.parsedConnection.userEmail);
        params.set('workspace_name', this.parsedConnection.workspaceName);
        params.set('report_name', this.parsedConnection.reportName);

        if (this.parsedConnection.signature && this.parsedConnection.signature !== 'unknown') {
            params.set('signature', this.parsedConnection.signature);
        }

        return `${baseUrl}/reports/getData?${params.toString()}`;
    }

    private getApiBaseUrl(): string {
        // Try to detect environment
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:4173';
        } else {
            // Production - adjust as needed
            return 'https://your-production-api.com';
        }
    }

    public submit() {
        console.log('Submitting connector with connection name:', this.connectionName);

        this.tableau.connectionName = this.connectionName || 'Dynamic Report Data';
        this.tableau.submit();
    }

    private enableButtonWhenReady() {
        if (connectorInitialized && pageLoaded) {
            const loadingDiv = document.querySelector('.loading') as HTMLElement;
            const readyDiv = document.querySelector('.ready') as HTMLElement;
            const button = document.getElementById('submitButton') as HTMLButtonElement;

            if (loadingDiv) loadingDiv.style.display = 'none';
            if (readyDiv) readyDiv.style.display = 'flex';

            if (button) {
                button.addEventListener('click', () => {
                    button.disabled = true;
                    button.textContent = 'Processing...';
                    this.submit();
                });
            }

            // Auto-submit after a brief delay to make it feel responsive
            setTimeout(() => {
                if (button && !button.disabled) {
                    button.click();
                }
            }, 1000);
        }
    }
}

// Initialize when page loads
function initializeWDC() {
    pageLoaded = true;

    const w = window as WindowWithTableau;
    if (w.tableau) {
        new DynamicReportConnector();
    } else {
        console.error('Tableau WDC API not available');

        // Show error state
        const container = w.document.querySelector('.container');
        if (container) {
            container.innerHTML = `
        <div style="text-align: center; color: #dc3545;">
          <h3>Error</h3>
          <p>This connector must be run within Tableau.</p>
        </div>
      `;
        }
    }
}

const w = window as WindowWithTableau;
if (w.document.readyState === 'loading') {
    w.document.addEventListener('DOMContentLoaded', initializeWDC);
} else {
    initializeWDC();
}
