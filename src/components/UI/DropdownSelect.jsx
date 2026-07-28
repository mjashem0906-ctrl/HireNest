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
  multiple = false,
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const selectBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const filteredOptions = (options || []).filter((option) =>
    (option.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedValues = multiple
    ? (options || []).filter((opt) => (Array.isArray(value) ? value : []).includes(opt.value))
    : (options || []).find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (val) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    } else {
      onChange(val);
      setIsOpen(false);
      selectBoxRef.current?.focus();
    }
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const handleRemove = (val) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.filter((v) => v !== val));
    } else {
      onChange("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      if (isOpen) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
      selectBoxRef.current?.focus();
      return;
    }

    if (!isOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[focusedIndex].value);
      }
    }
  };

  const renderIcon = (option) => {
    if (!option) return null;
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

      <div className={styles.selectWrap}>
        {/* Selected Value */}
        <div
          ref={selectBoxRef}
          tabIndex={0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`${styles.select} ${isOpen ? `${styles.open} custom-dropdown-open` : ""} ${
            error ? styles.error : ""
          } custom-dropdown-select`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={`${styles.chosenValue} custom-dropdown-value`}>
            {multiple ? (
              Array.isArray(selectedValues) && selectedValues.length > 0 ? (
                <div className={styles.multiChosen}>
                  {selectedValues.map((sel) => (
                    <span key={sel.value} className={styles.chip}>
                      {renderIcon(sel)}
                      {sel.label}
                      <X
                        size={14}
                        tabIndex={-1}
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
                  tabIndex={-1}
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className={styles.optionsList} role="listbox">
              {filteredOptions.map((option, idx) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={
                    multiple
                      ? Array.isArray(value) && value.includes(option.value)
                      : option.value === value
                  }
                  tabIndex={-1}
                  className={`${styles.option} ${
                    multiple
                      ? Array.isArray(value) && value.includes(option.value)
                        ? `${styles.selected} custom-dropdown-selected`
                        : ""
                      : option.value === value
                      ? `${styles.selected} custom-dropdown-selected`
                      : ""
                  } ${idx === focusedIndex ? styles.focused : ""} custom-dropdown-option`}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                >
                  {renderIcon(option)}
                  {option.label}
                  {multiple && Array.isArray(value) && value.includes(option.value) && (
                    <Check className={styles.checkIcon} size={14} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default DropdownSelect;
