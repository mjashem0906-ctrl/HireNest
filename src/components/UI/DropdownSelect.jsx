

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import styles from "./DropdownSelect.module.scss";

const DropdownSelect = ({
  label,
  options,
  value, // string (single) or array (multi)
  onChange,
  placeholder = "Select an option",
  searchable = false,
  required = false,
  error,
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // const filteredOptions = options.filter((option) =>
  //   option.label.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const filteredOptions = (options || []).filter((option) =>
  (option.label || "").toLowerCase().includes(searchTerm.toLowerCase())
);


  const selectedValues = multiple
    ? options.filter((opt) => value.includes(opt.value))
    : options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (multiple) {
      if (value.includes(val)) {
        onChange(value.filter((v) => v !== val));
      } else {
        onChange([...value, val]);
      }
    } else {
      onChange(val);
      setIsOpen(false);
    }
    setSearchTerm("");
  };

  // const handleRemove = (val) => {
  //   onChange(value.filter((v) => v !== val));
  // };

  const handleRemove = (val) => {
  if (multiple) {
    onChange(value.filter((v) => v !== val));
  } else {
    onChange(""); // clears selection for single-select
    setIsOpen(false); // optional, to close dropdown after removal
  }
};

  const renderIcon = (option) => {
    if (option.image) {
      return <img src={option.image} alt={option.label} className={styles.avatar} />;
    } else if (option.color) {
      return (
        <span
          className={styles.colorDot}
          style={{ backgroundColor: option.color }}
        />
      );
    }
    return null;
  };

  return (
    <div className={`${styles.dropdown} custom-dropdown-area`} ref={dropdownRef}>
      <label className={`${styles.label} custom-dropdown-label`}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {/* Selected Value */}
      <div
        className={`${styles.select} ${isOpen ? `${styles.open} custom-dropdown-open` : ""} ${
          error ? styles.error : ""
        } custom-dropdown-select`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${styles.chosenValue} custom-dropdown-value`}>
          {multiple ? (
            selectedValues.length > 0 ? (
              <div className={styles.multiChosen}>
                {selectedValues.map((sel) => (
                  <span key={sel.value} className={styles.chip}>
                    {renderIcon(sel)}
                    {sel.label}
                    <X
                      size={14}
                      className={styles.removeIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(sel.value);
                      }}
                    />
                  </span>
                ))}
              </div>
            ) : (
              placeholder
            )
          ) : selectedValues ? (
            <span className={`${styles.optionContent} custom-dropdown-content`}>
              {renderIcon(selectedValues)}
              {selectedValues.label}
              <X
                      size={14}
                      className={styles.removeIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(selectedValues.value);
                      }}
                    />
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.rotated : ""} custom-dropdown-chevron`}
          size={16}
        />
      </div>

      {/* Options */}
      {isOpen && (
        <div className={`${styles.options} custom-dropdown-options`}>
          {searchable && (
            <div className={`${styles.searchBox} custom-dropdown-search`}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className={styles.optionsList}>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${
                  multiple
                    ? value.includes(option.value)
                      ? `${styles.selected} custom-dropdown-selected`
                      : ""
                    : option.value === value
                    ? `${styles.selected} custom-dropdown-selected`
                    : ""
                } custom-dropdown-option`}
                onClick={() => handleSelect(option.value)}
              >
                {renderIcon(option)}
                {option.label}
                {multiple && value.includes(option.value) && (
                  <Check className={styles.checkIcon} size={14} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default DropdownSelect;
