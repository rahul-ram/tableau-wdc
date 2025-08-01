import React from 'react';
import { ReportSelectorProps, ReportName } from '../types';
import './ReportSelector.css';

const ReportSelector: React.FC<ReportSelectorProps> = ({
  reports,
  selectedReport,
  onReportChange,
  loading = false,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const report = e.target.value as ReportName;
    onReportChange(report);
  };

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="report-selector">
      <label htmlFor="report-select" className="selector-label">
        Report *
      </label>
      <div className="select-wrapper">
        <select
          id="report-select"
          value={selectedReport || ''}
          onChange={handleChange}
          disabled={disabled || loading}
          className={`report-select ${loading ? 'loading' : ''}`}
          required
        >
          <option value="">-- Select Report --</option>
          {reports.map((report) => (
            <option key={report} value={report}>
              {report}
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
        Select the report to fetch data from
      </div>
    </div>
  );
};

export default ReportSelector; 