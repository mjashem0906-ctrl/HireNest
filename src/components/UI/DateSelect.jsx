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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
        <DatePicker
          label={label === undefined ? "Select Date" : label}
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
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--text-primary)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-medium)",
                  backgroundImage: "none",
                },
                "& .MuiPickersCalendarHeader-root": {
                  color: "var(--text-primary)",
                },
                "& .MuiPickersDay-root": {
                  color: "var(--text-primary)",
                  backgroundColor: "transparent",
                },
                "& .MuiPickersDay-root:hover": {
                  backgroundColor: "var(--bg-secondary)",
                },
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "var(--m-primary)",
                  color: "#fff",
                },
                "& .MuiPickersDay-root.Mui-selected:hover": {
                  backgroundColor: "var(--m-primary-hover, #be123c)",
                  color: "#fff",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "var(--text-muted)",
                },
                "& .MuiIconButton-root": {
                  color: "var(--text-primary)",
                },
              }
            },
            textField: {
              error: false,
              sx: {
                width: "100%",
                // Target the input element directly with high specificity
                "& .MuiInputBase-input": {
                  color: "var(--text-primary) !important",
                  WebkitTextFillColor: "var(--text-primary) !important",
                  fill: "var(--text-primary) !important",
                },
                "& .MuiInputBase-root": {
                  borderRadius: "12px",
                  minHeight: "52px",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--text-primary)",
                },
                "& .MuiInputLabel-root": {
                  color: "var(--text-secondary)",
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--icon-color)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-medium)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--text-muted)",
                },
                "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--m-primary)",
                  borderWidth: "2px",
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
