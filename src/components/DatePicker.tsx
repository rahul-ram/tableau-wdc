import React from 'react';
import { DatePickerProps } from '../types';
import { format, parseISO } from 'date-fns';
import './DatePicker.css';

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange(dateValue);
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const defaultMinDate = minDate || '2020-01-01';
  const defaultMaxDate = maxDate || today;

  return (
    <div className="date-picker">
      <label htmlFor="date-input" className="date-label">
        {label} {required && '*'}
      </label>
      <div className="date-input-wrapper">
        <input
          id="date-input"
          type="date"
          value={value ? formatDateForDisplay(value) : ''}
          onChange={handleChange}
          min={defaultMinDate}
          max={defaultMaxDate}
          disabled={disabled}
          className="date-input"
          required={required}
        />
        <div className="date-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>
      <div className="help-text">
        Select the Close of Business (COB) date for the report
      </div>
    </div>
  );
};

export default DatePicker; 