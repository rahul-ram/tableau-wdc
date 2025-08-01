import React from 'react';
import { ReportFormProps, ReportParamSelection } from '../types';
import WorkspaceSelector from './WorkspaceSelector';
import ReportSelector from './ReportSelector';
import DatePicker from './DatePicker';
import AttributeInput from './AttributeInput';
import './ReportForm.css';

const ReportForm: React.FC<ReportFormProps> = ({
  formState,
  onSubmit,
  onWorkspaceChange,
  onReportChange,
  onAttributeChange,
  onDateChange,
}) => {
  const { workspaces, reports, attributes, selectedParams, loading, errors } = formState;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedParams.workspace || !selectedParams.report || !selectedParams.cobdate) {
      return;
    }

    const completeParams: ReportParamSelection = {
      workspace: selectedParams.workspace,
      report: selectedParams.report,
      cobdate: selectedParams.cobdate,
      attributes: selectedParams.attributes || {},
    };

    onSubmit(completeParams);
  };

  const isFormValid = () => {
    return !!(
      selectedParams.workspace &&
      selectedParams.report &&
      selectedParams.cobdate &&
      attributes.every(attr => !attr.required || selectedParams.attributes?.[attr.key])
    );
  };

  const isSubmitting = loading.workspaces || loading.reports || loading.attributes;

  return (
    <div className="report-form-container">
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-header">
          <h2>Dynamic Report Connector</h2>
          <p>Configure your report parameters to fetch data from Tableau</p>
        </div>

        <div className="form-section">
          <WorkspaceSelector
            workspaces={workspaces}
            selectedWorkspace={selectedParams.workspace}
            onWorkspaceChange={onWorkspaceChange}
            loading={loading.workspaces}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-section">
          <ReportSelector
            reports={reports}
            selectedReport={selectedParams.report}
            onReportChange={onReportChange}
            loading={loading.reports}
            disabled={!selectedParams.workspace || isSubmitting}
          />
        </div>

        {selectedParams.report && (
          <div className="form-section">
            <DatePicker
              value={selectedParams.cobdate}
              onChange={onDateChange}
              label="COB Date"
              required={true}
              disabled={isSubmitting}
            />
          </div>
        )}

        {attributes.length > 0 && selectedParams.report && (
          <div className="form-section">
            <h3>Report Attributes</h3>
            {attributes.map((attribute) => (
              <AttributeInput
                key={attribute.key}
                attribute={attribute}
                value={selectedParams.attributes?.[attribute.key] || ''}
                onChange={onAttributeChange}
                disabled={isSubmitting}
              />
            ))}
          </div>
        )}

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Loading...
              </>
            ) : (
              'Submit to Tableau'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
