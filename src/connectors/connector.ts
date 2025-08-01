import { 
  Workspace, 
  ReportName, 
  ReportParamSelection, 
  TableauSchema,
  TableauConnection 
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
    
    // Extract parameters from connection data
    const params: ReportParamSelection = {
      workspace: connectionData.workspace as Workspace,
      report: connectionData.report as ReportName,
      cobdate: connectionData.cobdate,
      attributes: connectionData.attributes || {},
    };

    // Fetch data from API
    fetchReportData(params)
      .then((data) => {
        // Add data to the table
        data.forEach((row) => {
          table.appendRows([
            [
              row.id,
              row.workspace,
              row.report,
              row.cobdate,
              row.snaptype,
              row.riskclass,
              row.value,
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
export const submitToTableau = (params: ReportParamSelection) => {
  // Set connection name
  tableau.connectionName = `${params.report} - ${params.workspace} - ${params.cobdate}`;

  // Set connection data
  tableau.connectionData = {
    workspace: params.workspace,
    report: params.report,
    cobdate: params.cobdate,
    attributes: params.attributes,
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
