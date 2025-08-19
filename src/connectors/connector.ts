import {
  Workspace,
  ReportName,
  ReportParamSelection,
  TableauSchema
} from '../types';
import { fetchReportData } from '../api/mockApi';

// Declare global tableau object
declare global {
  interface Window {
    tableau: any;
  }
}

const tableau = window.tableau;

// Schema definition for the WDC
const getSchema = (): TableauSchema[] => {
  return [
    {
      id: 'id',
      alias: 'ID',
      dataType: 'int',
    },
    {
      id: 'workspace',
      alias: 'Workspace',
      dataType: 'string',
    },
    {
      id: 'report',
      alias: 'Report',
      dataType: 'string',
    },
    {
      id: 'cobdate',
      alias: 'COB Date',
      dataType: 'date',
    },
    {
      id: 'snaptype',
      alias: 'Snap Type',
      dataType: 'string',
    },
    {
      id: 'riskclass',
      alias: 'Risk Class',
      dataType: 'string',
    },
    {
      id: 'value',
      alias: 'Value',
      dataType: 'double',
    },
    {
      id: 'timestamp',
      alias: 'Timestamp',
      dataType: 'datetime',
    },
  ];
};

// Initialize the WDC
export const initConnector = () => {
  // Define the connector
  const connector = tableau.makeConnector();

  // Define the schema
  connector.getSchema = (schemaCallback: any) => {
    const schema = getSchema();
    schemaCallback(schema);
  };

  // Define the data fetching
  connector.getData = (table: any, doneCallback: any) => {
    const connectionData = table.connectionData;
    const connectionName: string = (typeof tableau !== 'undefined' && tableau.connectionName) || '';

    // Extract parameters from connection data
    const params: ReportParamSelection = {
      workspace: connectionData.workspace as Workspace,
      report: connectionData.report as ReportName,
      cobdate: connectionData.cobdate,
      attributes: connectionData.attributes || {},
    };

    // Allow extension-driven refresh by parsing standardized datasource name
    // Format: Parameterized_Report_{userEmail}_{workspaceName}_{reportName}_{signature}
    let userEmailFromName: string | undefined;
    let signatureFromName: string | undefined;
    if (connectionName.startsWith('Parameterized_Report_')) {
      const rest = connectionName.substring('Parameterized_Report_'.length);
      const parts = rest.split('_');
      if (parts.length >= 4) {
        const signature = parts.pop() as string;
        const reportName = parts.pop() as string;
        const workspaceName = parts.pop() as string;
        const userEmail = parts.join('_');
        signatureFromName = signature;
        userEmailFromName = userEmail;
        // Override params from connection name to ensure correct data isolation
        (params as any).workspace = workspaceName as Workspace;
        (params as any).report = reportName as ReportName;
      }
    }

    // Fetch data from API
    fetchReportData({ ...params, userEmail: userEmailFromName, signature: signatureFromName })
      .then((data) => {
        // Add data to the table
        data.forEach((row) => {
          table.appendRows([
            [
              row.id,
              row.workspace || row.workspace_name || '',
              row.report || row.report_name || '',
              row.cobdate,
              row.snaptype || row.snap_type || '',
              row.riskclass || '',
              row.value || row.metric_value || 0,
              row.timestamp,
            ],
          ]);
        });

        doneCallback();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        doneCallback();
      });
  };

  // Register the connector
  tableau.registerConnector(connector);
};

// Submit connection to Tableau
const computeSignature = (payload: Record<string, any>): string => {
  const keys = Object.keys(payload).sort();
  const normalized = JSON.stringify(keys.reduce((acc, k) => { acc[k] = payload[k]; return acc; }, {} as Record<string, any>));
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
};

export const submitToTableau = (params: ReportParamSelection) => {
  const userEmail = (import.meta as any).env?.VITE_WDC_USER_EMAIL || 'dev.user@example.com';
  const signature = computeSignature({ ...params.attributes, cobdate: params.cobdate });
  // Standardized connection (data source) name aligned with backend
  tableau.connectionName = `Parameterized_Report_${userEmail}_${params.workspace}_${params.report}_${signature}`;

  // Set connection data
  tableau.connectionData = {
    workspace: params.workspace,
    report: params.report,
    cobdate: params.cobdate,
    attributes: params.attributes,
    userEmail,
    signature,
  };

  // Submit the connection
  tableau.submit();
};

// Initialize when the script loads
if (typeof tableau !== 'undefined') {
  initConnector();
}

export default {
  initConnector,
  submitToTableau,
};
