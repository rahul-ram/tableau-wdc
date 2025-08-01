import React from 'react';
import { AttributeInputProps, ReportAttribute } from '../types';
import './AttributeInput.css';

const AttributeInput: React.FC<AttributeInputProps> = ({
  attribute,
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const inputValue = e.target.value;
    onChange(attribute.key, inputValue);
  };

  const renderInput = () => {
    switch (attribute.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className="attribute-select"
            required={attribute.required}
          >
            <option value="">-- Select {attribute.label} --</option>
            {attribute.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className="attribute-input"
            placeholder={`Enter ${attribute.label.toLowerCase()}`}
            required={attribute.required}
            min={attribute.validation?.min}
            max={attribute.validation?.max}
            step="any"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className="attribute-input"
            required={attribute.required}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className="attribute-input"
            placeholder={`Enter ${attribute.label.toLowerCase()}`}
            required={attribute.required}
            pattern={attribute.validation?.pattern}
          />
        );
    }
  };

  return (
    <div className="attribute-input-container">
      <label htmlFor={`attribute-${attribute.key}`} className="attribute-label">
        {attribute.label} {attribute.required && '*'}
      </label>
      <div className="input-wrapper">
        {renderInput()}
      </div>
      {attribute.validation && (
        <div className="validation-help">
          {attribute.validation.pattern && (
            <span>Format: {attribute.validation.pattern}</span>
          )}
          {attribute.validation.min !== undefined && (
            <span>Min: {attribute.validation.min}</span>
          )}
          {attribute.validation.max !== undefined && (
            <span>Max: {attribute.validation.max}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AttributeInput; 