import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Workspace,
  ReportName,
  ReportAttribute,
  ApiResponse,
  WorkspaceResponse,
  ReportResponse,
  ReportAttributesResponse,
  ApiError
} from '../types';
import config, { getAuthHeaders, isDevelopment } from '../config';

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: isDevelopment ? 'http://localhost:4173' : config.api.baseUrl,
  timeout: config.api.timeout,
  headers: getAuthHeaders(),
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      code: error.response?.status?.toString() || 'UNKNOWN',
      message: error.message || 'Unknown error occurred',
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

// Mock data for development
const mockWorkspaces: Workspace[] = ['HSVRR', 'FRTB', 'SANDBOX'];
const mockReports: ReportName[] = ['HSVAR', 'HS_PORTFOLIO_PnL', 'SENSITIVITIES'];
const mockAttributes: ReportAttribute[] = [
  {
    key: 'snaptype',
    type: 'text',
    label: 'Snap Type',
    required: true,
    defaultValue: '',
  },
  {
    key: 'riskclass',
    type: 'text',
    label: 'Risk Class',
    required: true,
    defaultValue: '',
  },
];

// API Functions
export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    if (isDevelopment) {
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return mockWorkspaces;
    }

    const response: AxiosResponse<ApiResponse<WorkspaceResponse>> = await apiClient.get(
      config.api.endpoints.workspaces
    );

    return response.data.data.workspaces;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    // Fallback to mock data in case of error
    return mockWorkspaces;
  }
};

export const getReports = async (workspace: Workspace): Promise<ReportName[]> => {
  try {
    if (isDevelopment) {
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockReports;
    }

    const response: AxiosResponse<ApiResponse<ReportResponse>> = await apiClient.get(
      `${config.api.endpoints.reports}?workspace=${workspace}`
    );

    return response.data.data.reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    // Fallback to mock data in case of error
    return mockReports;
  }
};

export const getReportAttributes = async (report: ReportName): Promise<ReportAttribute[]> => {
  try {
    if (isDevelopment) {
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockAttributes;
    }

    const response: AxiosResponse<ApiResponse<ReportAttributesResponse>> = await apiClient.get(
      `${config.api.endpoints.attributes}?reportName=${report}`
    );

    return response.data.data.attributes;
  } catch (error) {
    console.error('Error fetching report attributes:', error);
    // Fallback to mock data in case of error
    return mockAttributes;
  }
};

// Data fetching function for Tableau
export const fetchReportData = async (params: {
  workspace: Workspace;
  report: ReportName;
  cobdate: string;
  attributes: Record<string, string>;
  userEmail?: string;
  signature?: string;
}): Promise<any[]> => {
  try {
    if (isDevelopment) {
      // Mock data response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 1,
          workspace: params.workspace,
          report: params.report,
          cobdate: params.cobdate,
          snaptype: params.attributes.snaptype || 'default',
          riskclass: params.attributes.riskclass || 'default',
          value: Math.random() * 1000,
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          workspace: params.workspace,
          report: params.report,
          cobdate: params.cobdate,
          snaptype: params.attributes.snaptype || 'default',
          riskclass: params.attributes.riskclass || 'default',
          value: Math.random() * 1000,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    const qp = new URLSearchParams();
    qp.set('user_email', params.userEmail || 'dev.user@example.com');
    qp.set('workspace_name', params.workspace);
    qp.set('report_name', params.report);
    // Merge attributes and cobdate into backend expected params
    const paramPayload: Record<string, any> = { ...params.attributes };
    if (params.cobdate) paramPayload.cobdate = params.cobdate;
    qp.set('parameters', JSON.stringify(paramPayload));
    if (params.signature) qp.set('signature', params.signature);

    const response = await apiClient.get(`/reports/getData?${qp.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
};

export default {
  getWorkspaces,
  getReports,
  getReportAttributes,
  fetchReportData,
};
