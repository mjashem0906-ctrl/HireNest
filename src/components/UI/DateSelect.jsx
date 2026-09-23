import styles from './Date.module.scss'
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enGB } from "date-fns/locale"; // en-GB uses dd/MM/yyyy
export default function DateSelect({
  label,
  value,
  onChange,
  min,
  max,
  required,
  error,
}) {
  // Ensure value is never undefined - use null instead
  const dateValue = value === undefined ? null : value;
  // ✅ Format selected date to Local Date (YYYY-MM-DD)
  const handleDateChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    // Return a proper Date object (local midnight) so DatePicker works correctly
    onChange(localDate);
  };
  return (
    <div className={styles.datePickerWrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
        <DatePicker
          value={dateValue}
          onChange={handleDateChange}
          minDate={min}
          maxDate={max}
          required={required}
          error={error}
          format="dd/MM/yyyy"
          slotProps={{
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  backgroundColor: "var(--ps-card, var(--surface-elevated)) !important",
                  color: "var(--ps-text, var(--text-primary)) !important",
                  borderRadius: "16px",
                  border: "1px solid var(--ps-border, var(--border-medium)) !important",
                  backgroundImage: "none !important",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4) !important",
                },
                "& .MuiPickersCalendarHeader-root": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                },
                "& .MuiPickersCalendarHeader-labelContainer": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                },
                "& .MuiPickersDay-root": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                  backgroundColor: "transparent",
                },
                "& .MuiPickersDay-root:hover": {
                  backgroundColor: "var(--ps-soft, var(--bg-secondary)) !important",
                },
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "var(--ps-primary, var(--m-primary)) !important",
                  color: "#fff !important",
                },
                "& .MuiPickersDay-root.Mui-selected:hover": {
                  backgroundColor: "var(--ps-primary-dark, var(--m-primary-hover, #184749)) !important",
                  color: "#fff !important",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "var(--ps-muted, var(--text-muted)) !important",
                },
                "& .MuiIconButton-root": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                },
                "& .MuiPickersYear-yearButton": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                },
                "& .MuiPickersYear-yearButton.Mui-selected": {
                  backgroundColor: "var(--ps-primary, var(--m-primary)) !important",
                  color: "#fff !important",
                },
              }
            },
            textField: {
              error: !!error,
              sx: {
                width: "100%",
                // Universal override for all inner text/input tags to prevent color inheritance issues
                "& *": {
                  color: "var(--ps-text, var(--text-primary)) !important",
                  WebkitTextFillColor: "var(--ps-text, var(--text-primary)) !important",
                },
                "& .MuiInputBase-root": {
                  borderRadius: "12px",
                  height: "52px",
                  minHeight: "52px",
                  backgroundColor: "var(--ps-soft, var(--surface-elevated))",
                  border: "1.5px solid var(--ps-border, var(--border-medium))",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  paddingRight: "8px",

                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none !important", // Hide default MUI outline
                  },

                  "&:hover": {
                    borderColor: "var(--ps-primary, var(--accent-primary))",
                  },

                  "&.Mui-focused": {
                    borderColor: "var(--ps-primary, var(--accent-primary))",
                    boxShadow: "0 0 0 3px rgba(225, 29, 72, 0.1)",
                  },
                },
                "& input": {
                  padding: "0 16px",
                  fontSize: "0.875rem",
                  height: "100%",
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--ps-muted, var(--icon-color)) !important",
                  WebkitTextFillColor: "var(--ps-muted, var(--icon-color)) !important",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
