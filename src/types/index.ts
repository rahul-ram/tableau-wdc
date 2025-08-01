// Core WDC Types
export type Workspace = 'HSVRR' | 'FRTB' | 'SANDBOX';
export type ReportName = 'HSVAR' | 'HS_PORTFOLIO_PnL' | 'SENSITIVITIES';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface WorkspaceResponse {
  workspaces: Workspace[];
}

export interface ReportResponse {
  reports: ReportName[];
}

export interface ReportAttribute {
  key: string;
  type: 'text' | 'date' | 'number' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ReportAttributesResponse {
  attributes: ReportAttribute[];
}

// Form and State Types
export interface ReportParamSelection {
  workspace: Workspace;
  report: ReportName;
  cobdate: string;
  attributes: Record<string, string>;
}

export interface FormState {
  workspaces: Workspace[];
  reports: ReportName[];
  attributes: ReportAttribute[];
  selectedParams: Partial<ReportParamSelection>;
  loading: {
    workspaces: boolean;
    reports: boolean;
    attributes: boolean;
  };
  errors: Record<string, string>;
}

// Authentication Types
export interface AuthConfig {
  enabled: boolean;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  authUri?: string;
  tokenUri?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Configuration Types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: {
    workspaces: string;
    reports: string;
    attributes: string;
  };
}

export interface WdcConfig {
  version: string;
  name: string;
  api: ApiConfig;
  auth: AuthConfig;
  cors: {
    origin: string;
    methods: string;
    headers: string;
  };
}

// Tableau WDC Types
export interface TableauConnection {
  connectionName: string;
  connectionData: Record<string, any>;
}

export interface TableauSchema {
  id: string;
  alias: string;
  dataType: string;
  semanticRole?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Component Props Types
export interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  selectedWorkspace?: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface ReportSelectorProps {
  reports: ReportName[];
  selectedReport?: ReportName;
  onReportChange: (report: ReportName) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface AttributeInputProps {
  attribute: ReportAttribute;
  value?: string;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}

export interface ReportFormProps {
  formState: FormState;
  onSubmit: (params: ReportParamSelection) => void;
  onWorkspaceChange: (workspace: Workspace) => void;
  onReportChange: (report: ReportName) => void;
  onAttributeChange: (key: string, value: string) => void;
  onDateChange: (date: string) => void;
}
