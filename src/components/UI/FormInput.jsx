
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from './FormInput.module.scss';

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  multiline = false,
  ...rest
}) => {
  const handleIncrement = () => {
    const minVal = rest.min !== undefined ? Number(rest.min) : -Infinity;
    const startVal = value === "" || value === undefined ? Math.max(0, minVal) : Number(value);
    const stepVal = Number(rest.step) || 1;
    const maxVal = rest.max !== undefined ? Number(rest.max) : Infinity;
    const newVal = Math.min(startVal + stepVal, maxVal);
    onChange(String(newVal));
  };

  const handleDecrement = () => {
    const minVal = rest.min !== undefined ? Number(rest.min) : -Infinity;
    const startVal = value === "" || value === undefined ? Math.max(0, minVal) : Number(value);
    const stepVal = Number(rest.step) || 1;
    const newVal = Math.max(startVal - stepVal, minVal);
    onChange(String(newVal));
  };

  return (
    <div className={styles.formInput}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.input} ${styles.textarea} ${icon ? styles.withIcon : ''} ${error ? styles.error : ''}`}
            rows={4}
            required={required}
            {...rest}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.input} ${icon ? styles.withIcon : ''} ${type === 'number' ? styles.typeNumber : ''} ${error ? styles.error : ''}`}
            required={required}
            {...rest}
          />
        )}
        {type === 'number' && (
          <div className={styles.stepperContainer}>
            <button
              type="button"
              onClick={handleIncrement}
              className={styles.stepperBtn}
              tabIndex={-1}
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className={styles.stepperBtn}
              tabIndex={-1}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default FormInput;
