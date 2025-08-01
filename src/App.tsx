import React, { useEffect, useState, useCallback } from 'react';
import { 
  getWorkspaces, 
  getReports, 
  getReportAttributes 
} from './api/mockApi';
import { 
  Workspace, 
  ReportName, 
  ReportAttribute, 
  ReportParamSelection,
  FormState 
} from './types';
import { submitToTableau } from './connectors/connector';
import ReportForm from './components/ReportForm';
import './App.css';

const App: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    workspaces: [],
    reports: [],
    attributes: [],
    selectedParams: {},
    loading: {
      workspaces: false,
      reports: false,
      attributes: false,
    },
    errors: {},
  });

  // Load workspaces on component mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setFormState(prev => ({
      ...prev,
      loading: { ...prev.loading, workspaces: true },
      errors: {},
    }));

    try {
      const workspaces = await getWorkspaces();
      setFormState(prev => ({
        ...prev,
        workspaces,
        loading: { ...prev.loading, workspaces: false },
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: { ...prev.loading, workspaces: false },
        errors: { general: 'Failed to load workspaces' },
      }));
    }
  }, []);

  const handleWorkspaceChange = useCallback(async (workspace: Workspace) => {
    setFormState(prev => ({
      ...prev,
      selectedParams: { 
        ...prev.selectedParams, 
        workspace,
        report: undefined,
        cobdate: undefined,
        attributes: {},
      },
      reports: [],
      attributes: [],
      loading: { ...prev.loading, reports: true },
      errors: {},
    }));

    try {
      const reports = await getReports(workspace);
      setFormState(prev => ({
        ...prev,
        reports,
        loading: { ...prev.loading, reports: false },
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: { ...prev.loading, reports: false },
        errors: { general: 'Failed to load reports' },
      }));
    }
  }, []);

  const handleReportChange = useCallback(async (report: ReportName) => {
    setFormState(prev => ({
      ...prev,
      selectedParams: { 
        ...prev.selectedParams, 
        report,
        cobdate: undefined,
        attributes: {},
      },
      attributes: [],
      loading: { ...prev.loading, attributes: true },
      errors: {},
    }));

    try {
      const attributes = await getReportAttributes(report);
      setFormState(prev => ({
        ...prev,
        attributes,
        loading: { ...prev.loading, attributes: false },
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: { ...prev.loading, attributes: false },
        errors: { general: 'Failed to load report attributes' },
      }));
    }
  }, []);

  const handleAttributeChange = useCallback((key: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      selectedParams: {
        ...prev.selectedParams,
        attributes: {
          ...prev.selectedParams.attributes,
          [key]: value,
        },
      },
    }));
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setFormState(prev => ({
      ...prev,
      selectedParams: {
        ...prev.selectedParams,
        cobdate: date,
      },
    }));
  }, []);

  const handleSubmit = useCallback((params: ReportParamSelection) => {
    try {
      submitToTableau(params);
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        errors: { general: 'Failed to submit to Tableau' },
      }));
    }
  }, []);

  return (
    <div className="app">
      <div className="app-container">
        <ReportForm
          formState={formState}
          onSubmit={handleSubmit}
          onWorkspaceChange={handleWorkspaceChange}
          onReportChange={handleReportChange}
          onAttributeChange={handleAttributeChange}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
};

export default App;
