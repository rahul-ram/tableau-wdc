import React from 'react';
import { WorkspaceSelectorProps, Workspace } from '../types';
import './WorkspaceSelector.css';

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  selectedWorkspace,
  onWorkspaceChange,
  loading = false,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspace = e.target.value as Workspace;
    onWorkspaceChange(workspace);
  };

  return (
    <div className="workspace-selector">
      <label htmlFor="workspace-select" className="selector-label">
        Workspace *
      </label>
      <div className="select-wrapper">
        <select
          id="workspace-select"
          value={selectedWorkspace || ''}
          onChange={handleChange}
          disabled={disabled || loading}
          className={`workspace-select ${loading ? 'loading' : ''}`}
          required
        >
          <option value="">-- Select Workspace --</option>
          {workspaces.map((workspace) => (
            <option key={workspace} value={workspace}>
              {workspace}
            </option>
          ))}
        </select>
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      <div className="help-text">
        Select the workspace to fetch available reports from
      </div>
    </div>
  );
};

export default WorkspaceSelector;
