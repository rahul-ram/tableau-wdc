import { WdcConfig, ApiConfig, AuthConfig } from './types';

// Load environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

// API Configuration
const apiConfig: ApiConfig = {
  baseUrl: getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
  timeout: parseInt(getEnvVar('API_TIMEOUT', '30000')),
  endpoints: {
    workspaces: getEnvVar('MOCK_WORKSPACES_API', '/api/get/workspaces'),
    reports: getEnvVar('MOCK_REPORTS_API', '/api/get/reports'),
    attributes: getEnvVar('MOCK_ATTRIBUTES_API', '/api/get/reportAttributes'),
  }
};

// Authentication Configuration
const authConfig: AuthConfig = {
  enabled: getEnvVar('AUTH_ENABLED', 'false') === 'true',
  token: getEnvVar('AUTH_TOKEN', ''),
  clientId: getEnvVar('OAUTH_CLIENT_ID', ''),
  clientSecret: getEnvVar('OAUTH_CLIENT_SECRET', ''),
  authUri: getEnvVar('OAUTH_AUTH_URI', ''),
  tokenUri: getEnvVar('OAUTH_TOKEN_URI', ''),
};

// CORS Configuration
const corsConfig = {
  origin: getEnvVar('CORS_ORIGIN', '*'),
  methods: getEnvVar('CORS_METHODS', 'GET,POST,PUT,DELETE,OPTIONS'),
  headers: getEnvVar('CORS_HEADERS', 'Content-Type,Authorization'),
};

// Main Configuration
export const config: WdcConfig = {
  version: getEnvVar('WDC_VERSION', '3.0'),
  name: getEnvVar('WDC_NAME', 'Dynamic Report Connector'),
  api: apiConfig,
  auth: authConfig,
  cors: corsConfig,
};

// Environment-specific configurations
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.auth.enabled && config.auth.token) {
    headers['Authorization'] = `Bearer ${config.auth.token}`;
  }

  return headers;
};

export default config;
