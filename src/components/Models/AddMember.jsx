import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Search,
  CalendarDays,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import axios from "axios";
import FormInput from "../UI/FormInput";
import DropdownSelect from "../UI/DropdownSelect";
import DateSelect from "../UI/DateSelect";
import API from "../../axios";
import styles from "./AddModel.module.scss";

const initialState = {
  name: "",
  fathersName: "",
  mobileNumber: "",
  email: "",
  gender: "",
  dateOfBirth: null,
  district: "",
  forGrouping: [],
  memberType: "",
  symMemberStatus: "Yes",
  currentInstitutionOrCompany: "",
  designation: "",
  workExp: "",
  fieldofStudy_Interest: "",
  seekerNeed: "",
  highest_education: "",
  branch: "",
  educationStatus: "",
  passOutYear: "",
  preferredJobRole_Sector: "",
  relocationStatus: "",
  preferredJobLocation: "",
  photoUrl: "",
  resumeLink: "",
  careerProfile: {
    location: "",
    role: [],
    industry: "",
    department: "",
    employmentType: "",
    expectedSalary: "",
    noticePeriod: "",
  },
  linkedinUrl: "",
  experienceDetails: [],
  certifications: [],
  skills: [],
  languages: [],
  fatherName: "",
  motherName: "",
  hometown: "",
  pincode: "",
  passportNumber: "",
  maritalStatus: "",
  address: "",
  occupation: "",
  companyDetails: "",
};

const DEGREE_OPTIONS = [
  "SSLC / 10th", "PUC / 12th", "ITI", "Diploma (Polytechnic)", "B.A", "B.Com", "B.Sc",
  "B.B.A", "B.C.A", "B.S.W", "B.Voc", "B.E", "B.Tech", "B.Arch", "LLB", "BBA LLB",
  "BA LLB", "B.Pharm", "D.Pharm", "BPT", "BDS", "MBBS", "BAMS", "BHMS", "M.A",
  "M.Com", "M.Sc", "M.S.W", "M.B.A", "M.C.A", "M.Tech", "M.E", "LLM", "M.Pharm",
  "MPT", "MD", "MS", "PhD", "Post Graduate Diploma (PGD)", "Certification Course",
];

const BRANCH_OPTIONS = [
  "Computer Science", "Information Technology", "Artificial Intelligence", "Data Science",
  "Cyber Security", "Electronics & Communication", "Electrical & Electronics", "Mechanical",
  "Civil", "Automobile", "Chemical", "Biotechnology", "Agriculture", "Commerce",
  "Accounting & Finance", "Business Administration", "Marketing", "Human Resource",
  "Economics", "English", "History", "Political Science", "Sociology", "Psychology",
  "Education", "Law", "Pharmacy", "Nursing", "Medical Lab Technology",
];

const KARNATAKA_DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
  "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu",
  "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir",
];

const DESIRED_ROLES_OPTIONS = [
  "Accountant",
  "Administrative Assistant",
  "Android Developer",
  "Architect",
  "Artificial Intelligence Engineer",
  "Automobile Engineer",
  "Back Office Executive",
  "Backend Developer",
  "Biomedical Engineer",
  "Business Analyst",
  "Business Development Executive (BDE)",
  "Chartered Accountant (CA)",
  "Chemical Engineer",
  "Civil Engineer",
  "Cloud Architect",
  "Consultant",
  "Content Creator",
  "Content Writer",
  "Customer Support Executive",
  "Data Analyst",
  "Data Entry Operator",
  "Data Scientist",
  "Delivery Partner",
  "DevOps Engineer",
  "Digital Marketing Specialist",
  "Director",
  "Electrical Engineer",
  "Electronics Engineer",
  "Financial Analyst",
  "Frontend Developer",
  "Full Stack Developer",
  "Graduate Trainee",
  "Graphic Designer",
  "HR Generalist",
  "HR Recruiter",
  "IT Support / Helpdesk",
  "Intern",
  "Manager",
  "Mechanical Engineer",
  "Mobile Developer",
  "Mobile App Developer",
  "Network Engineer",
  "Office Administrator",
  "Operations Executive",
  "Product Manager",
  "Project Manager",
  "QA / Testing Engineer",
  "QA Engineer",
  "Sales Executive",
  "Senior Software Engineer",
  "Software Engineer",
  "System Administrator",
  "Teacher / Lecturer",
  "Tech Lead",
  "Telecaller",
  "Trainer",
  "UI/UX Designer",
  "Web Designer"
];

const INDUSTRY_OPTIONS = [
  "Information Technology", "Healthcare", "Education", "Finance & Banking",
  "Manufacturing", "Retail & E-commerce", "Construction", "Automotive",
  "Telecommunications", "Real Estate", "Media & Entertainment",
  "Hospitality & Tourism", "Agriculture", "Logistics & Supply Chain",
  "Government & Public Administration", "Non-Profit / NGO"
];

const LANGUAGE_OPTIONS = [
  "English", "Tamil", "Hindi", "Kannada", "Urdu", "Telugu", "Malayalam", "Marathi",
  "Bengali", "Gujarati", "Odia", "Punjabi", "Assamese", "Sanskrit", "French", "German",
  "Spanish", "Arabic"
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function EditableDropdown({
  label,
  value,
  options,
  placeholder = "Select or type...",
  required = false,
  error = "",
  onChange,
  category = null,
  onCustomAdded = () => { },
  onOpenChange = () => { },
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setQuery(value || ""), [value]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const norm = (s) => String(s || "").toLowerCase().trim();

  const filtered = options
    .filter(Boolean)
    .filter((opt) => norm(opt).includes(norm(query)));

  const saveCustomValueToBackend = async (val) => {
    if (!category) return;
    const trimmedValue = String(val || "").trim();
    if (!trimmedValue) return;

    const exists = options.some((opt) => norm(opt) === norm(trimmedValue));
    if (exists) return;

    setIsSaving(true);
    try {
      await API.post(
        "/dropdown",
        { category, value: trimmedValue },
        { headers: getAuthHeaders() }
      );
      onCustomAdded();
    } catch (err) {
      console.error("Failed to save custom dropdown value:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const commit = (val) => {
    const v = String(val || "").trim();
    onChange(v);
    setQuery(v);
    setOpen(false);
    saveCustomValueToBackend(v);
  };

  const handleBlur = () => {
    const trimmedQuery = String(query || "").trim();
    if (trimmedQuery && trimmedQuery !== value) {
      commit(trimmedQuery);
    }
  };

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.edLabel}>
        {label} {required && <span className={styles.edReq}>*</span>}
        {isSaving && (
          <span style={{ marginLeft: 6, fontSize: 11, color: "var(--am-primary)", fontWeight: 600 }}>
            saving...
          </span>
        )}
      </label>

      <div className={styles.edControl}>
        <div
          className={`${styles.edField} ${error ? styles.edFieldError : ""}`}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <span className={styles.edIcon}>
            <Search size={16} />
          </span>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className={styles.edInput}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(query);
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />

          <button
            type="button"
            className={styles.edBtn}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((p) => !p);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {open && (
          <div className={styles.edMenu}>
            {filtered.length === 0 ? (
              <div className={styles.edEmpty}>
                No matches. Press <b>Enter</b> to use: “{query}”
              </div>
            ) : (
              <div className={styles.edMenuList}>
                {filtered.slice(0, 200).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.edItem} ${norm(opt) === norm(value) ? styles.edItemActive : ""}`}
                    onClick={() => commit(opt)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.edTip}>
              <span>Tip: Type to search. If custom, type it and press <b>Enter</b>.</span>
            </div>
          </div>
        )}
      </div>
      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

function YearPicker({
  label = "Pass-out Year",
  value,
  required = false,
  error = "",
  placeholder = "YYYY",
  minYear = 1980,
  maxYear = new Date().getFullYear() + 3,
  onChange,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);

  const years = useMemo(() => {
    const arr = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(String(y));
    return arr;
  }, [minYear, maxYear]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const commit = (val) => {
    const v = String(val || "").trim();
    onChange(v);
    setOpen(false);
  };

  const handleTyping = (val) => {
    const digits = String(val || "")
      .replace(/\D/g, "")
      .slice(0, 4);
    onChange(digits);
  };

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.edLabel}>
        {label} {required && <span className={styles.edReq}>*</span>}
      </label>

      <div className={styles.edControl}>
        <div
          className={`${styles.edField} ${error ? styles.edFieldError : ""}`}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <span className={styles.edIcon}>
            <CalendarDays size={16} />
          </span>

          <input
            ref={inputRef}
            value={value || ""}
            onChange={(e) => {
              handleTyping(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className={styles.edInput}
            onFocus={() => setOpen(true)}
            inputMode="numeric"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(value);
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />

          <button
            type="button"
            className={styles.edBtn}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((p) => !p);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="Pick year"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {open && (
          <div className={styles.edMenu}>
            <div className={styles.edMenuList} style={{ maxHeight: 240 }}>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`${styles.edItem} ${String(value) === y ? styles.edItemActive : ""
                    }`}
                  onClick={() => commit(y)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className={styles.edTip}>
              <span>Tip: Type year (YYYY) or pick from list.</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

function CertifiedDateSelect({
  label = "Certified Date",
  value,
  required = false,
  error = "",
  onChange,
}) {
  const dateValue = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const toYMD = (d) => (d ? d.toISOString().split("T")[0] : "");

  return (
    <div className={styles.edWrap}>
      <label className={styles.edLabel}>
        {label} {required && <span className={styles.edReq}>*</span>}
      </label>
      <DateSelect
        label=""
        value={dateValue}
        onChange={(d) => onChange(d ? toYMD(d) : "")}
      />
      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

function TagInputField({
  label = "Languages",
  value = [],
  placeholder = "Type language and press Enter",
  options = [],
  onChange,
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!options || options.length === 0) return;
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [options]);

  const addTag = (tagVal) => {
    const v = String(tagVal || text || "").trim();
    if (!v) return;

    const exists = value.some(
      (x) => String(x).toLowerCase() === v.toLowerCase()
    );
    if (exists) {
      if (!tagVal) setText("");
      return;
    }

    onChange([...value, v]);
    if (!tagVal) setText("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const toggleTagFromOption = (opt) => {
    const exists = value.some(
      (x) => String(x).toLowerCase() === String(opt).toLowerCase()
    );
    if (exists) {
      onChange(value.filter((t) => String(t).toLowerCase() !== String(opt).toLowerCase()));
    } else {
      onChange([...value, opt]);
    }
  };

  const norm = (s) => String(s || "").toLowerCase().trim();

  const filteredOptions = (options || []).filter((opt) => {
    if (!text) return true;
    return norm(opt).includes(norm(text));
  });

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.edLabel}>{label}</label>

      <div className={styles.edControl}>
        <div
          className={styles.edField}
          onClick={() => {
            inputRef.current?.focus();
            if (options && options.length > 0) setOpen(true);
          }}
          style={{
            height: "auto",
            minHeight: 52,
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            paddingTop: 8,
            paddingBottom: 8,
            cursor: "text",
            paddingRight: options && options.length > 0 ? "40px" : "12px",
            position: "relative",
          }}
        >
          <span className={styles.edIcon}>
            <Search size={16} style={{ opacity: 0.6 }} />
          </span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1, alignItems: "center" }}>
            {value.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--am-primary-soft)",
                  border: "1px solid var(--am-border)",
                  color: "var(--am-primary)",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    color: "var(--am-primary)",
                    fontWeight: 900,
                  }}
                  aria-label={`Remove ${tag}`}
                  title={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}

            <input
              ref={inputRef}
              className={styles.edInput}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (options && options.length > 0) setOpen(true);
              }}
              placeholder={value.length ? "" : placeholder}
              style={{
                flex: 1,
                minWidth: 150,
                border: "none",
                outline: "none",
                padding: 0,
                background: "transparent",
                height: "auto",
              }}
              onFocus={() => {
                if (options && options.length > 0) setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                  setOpen(false);
                }
                if (e.key === "Backspace" && !text && value.length) {
                  onChange(value.slice(0, -1));
                }
                if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
            />
          </div>

          {options && options.length > 0 && (
            <button
              type="button"
              className={styles.edBtn}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((p) => !p);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ChevronDown size={18} />
            </button>
          )}
        </div>

        {open && options && options.length > 0 && (
          <div className={styles.edMenu}>
            {filteredOptions.length === 0 ? (
              <div className={styles.edEmpty}>
                No matches. Press <b>Enter</b> to add: “{text}”
              </div>
            ) : (
              <div className={styles.edMenuList} style={{ maxHeight: 200 }}>
                {filteredOptions.map((opt) => {
                  const isSelected = value.some(
                    (x) => String(x).toLowerCase() === String(opt).toLowerCase()
                  );
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.edItem} ${isSelected ? styles.edItemActive : ""}`}
                      onClick={() => toggleTagFromOption(opt)}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                      }}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <span style={{ color: "var(--am-primary)", fontWeight: "bold", fontSize: "14px" }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.edTip}>
              <span>Tip: Select from list or type to search. Press <b>Enter</b> for custom language.</span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{ marginTop: 8, color: "rgba(100,116,139,1)", fontSize: 13 }}
      >
        Press <b>Enter</b> to add. Backspace to remove last tag.
      </div>
    </div>
  );
}

function MultiJobRoleDropdown({ label = "Preferred Job Role", value = [], options = [], required = false, error = "", onChange, category = null, onCustomAdded = () => { }, onOpenChange = () => { } }) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = Array.isArray(value)
    ? value.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean))
    : value
      ? String(value).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const norm = (s) => String(s || "").toLowerCase().trim();
  const filtered = options.filter(Boolean).filter((opt) => norm(opt).includes(norm(query)));

  const toggleOption = (opt) => {
    const already = selected.some((s) => norm(s) === norm(opt));
    const next = already ? selected.filter((s) => norm(s) !== norm(opt)) : [...selected, opt];
    onChange(next);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeTag = (opt, e) => {
    e.stopPropagation();
    onChange(selected.filter((s) => norm(s) !== norm(opt)));
  };

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.edLabel}>
        {label}{required && <span className={styles.edReq}>*</span>}
        {selected.length > 0 && (
          <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: "var(--am-primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 800, verticalAlign: "middle" }}>
            {selected.length}
          </span>
        )}
      </label>

      <div className={styles.edControl}>
        <div
          className={`${styles.edField} ${error ? styles.edFieldError : ""}`}
          style={{ height: "auto", minHeight: 48, flexWrap: "wrap", alignItems: "center", gap: 6, paddingTop: 6, paddingBottom: 6, cursor: "text" }}
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        >
          {/* Selected tags */}
          {selected.map((tag) => (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 6px 3px 10px", background: "var(--am-primary-soft)", border: "1px solid rgba(225,29,72,0.22)", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--am-primary)", whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tag}</span>
              <button type="button" onClick={(e) => removeTag(tag, e)} style={{ border: "none", background: "transparent", color: "var(--am-muted)", fontSize: "1rem", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }} aria-label={`Remove ${tag}`}>×</button>
            </span>
          ))}

          <span className={styles.edIcon} style={{ alignSelf: "center" }}><Search size={16} /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder={selected.length === 0 ? "Search or select job roles…" : "Add more…"}
            className={styles.edInput}
            style={{ flex: 1, minWidth: 120, border: "none", outline: "none", background: "transparent", boxShadow: "none" }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setOpen(false); setQuery(""); }
              if (e.key === "Backspace" && query === "" && selected.length > 0) onChange(selected.slice(0, -1));
            }}
          />
          <button type="button" className={styles.edBtn} onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 0); }}>
            <ChevronDown size={18} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
        </div>

        {open && (
          <div className={styles.edMenu}>
            {filtered.length === 0 ? (
              <div className={styles.edEmpty}>No roles found for "{query}"</div>
            ) : (
              <div className={styles.edMenuList} style={{ maxHeight: 220 }}>
                {filtered.map((opt) => {
                  const isSel = selected.some((s) => norm(s) === norm(opt));
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.edItem} ${isSel ? styles.edItemActive : ""}`}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                      onClick={() => toggleOption(opt)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 5, border: isSel ? "1.5px solid var(--am-primary)" : "1.5px solid var(--am-border)", background: isSel ? "var(--am-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {isSel && <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>✓</span>}
                      </span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
                      {isSel && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--am-primary)", background: "var(--am-primary-soft)", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 999, padding: "2px 7px" }}>Selected</span>}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.edTip} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{selected.length > 0 ? `✔ ${selected.length} role${selected.length > 1 ? "s" : ""} selected` : "Click a role to select"}</span>
              {selected.length > 0 && (
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, color: "var(--am-muted)", fontFamily: "inherit" }}>Clear all</button>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}


function AddMember({
  isOpen,
  onClose,
  editMember,
  onSuccess,
  preSelectedMemberType = null,
  initialTab = "basic",
}) {
  const [formData, setFormData] = useState(initialState);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [dynamicDistricts, setDynamicDistricts] = useState([]);
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [dynamicIndustries, setDynamicIndustries] = useState([]);

  const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });
  const [errors, setErrors] = useState({ resume: "", degree: "", branch: "", photo: "", designation: "", workExp: "", role: "", industry: "", location: "" });

  const [isParsingCv, setIsParsingCv] = useState(false);
  const [autoFilledCount, setAutoFilledCount] = useState(0);

  const resumeInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const fetchDynamicDropdowns = useCallback(async () => {
    if (!isOpen) return;
    try {
      const options = { headers: getAuthHeaders() };

      const locRes = await API.get("/dropdown?category=locationPreferences", options);
      const fetchedLocs = Array.isArray(locRes.data)
        ? locRes.data.map((item) => typeof item === 'object' ? item.value : item)
        : [];
      setDynamicDistricts(fetchedLocs);

      const roleRes = await API.get("/dropdown?category=desiredRoles", options);
      const fetchedRoles = Array.isArray(roleRes.data)
        ? roleRes.data.map((item) => typeof item === 'object' ? item.value : item)
        : [];
      setDynamicRoles(fetchedRoles);

      const indRes = await API.get("/dropdown?category=industry", options);
      const fetchedIndustries = Array.isArray(indRes.data)
        ? indRes.data.map((item) => typeof item === 'object' ? item.value : item)
        : [];
      setDynamicIndustries(fetchedIndustries);

    } catch (err) {
      console.error("Failed to fetch dynamic dropdowns:", err);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchDynamicDropdowns();
    }
  }, [isOpen, initialTab, fetchDynamicDropdowns]);

  useEffect(() => {
    if (editMember) {
      setFormData({
        ...initialState,
        ...editMember,
        symMemberStatus: editMember.symMemberStatus || "",
        branch: editMember.branch || "",
        educationStatus: editMember.educationStatus || "",
        passOutYear: editMember.passOutYear || "",
        dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
        linkedinUrl: editMember.linkedinUrl || "",
        careerProfile: {
          ...initialState.careerProfile,
          ...(editMember.careerProfile || {}),
          role: Array.isArray(editMember.careerProfile?.role)
            ? editMember.careerProfile.role
            : editMember.careerProfile?.role
              ? [editMember.careerProfile.role]
              : [],
          noticePeriod: editMember.careerProfile?.noticePeriod || editMember.noticePeriod || "",
        },
        experienceDetails: editMember.experienceDetails || [],
        certifications: editMember.certifications || [],
        skills: Array.isArray(editMember.skills) ? editMember.skills : [],
        languages: Array.isArray(editMember.languages) && editMember.languages.length > 0
          ? editMember.languages
          : [],
      });
    } else {
      setFormData({ ...initialState, memberType: preSelectedMemberType || "" });
    }
    setPhotoFile(null);
    setResumeFile(null);
    setUploadProgress({ photo: 0, resume: 0 });
    setErrors({ resume: "", degree: "", branch: "", photo: "" });
    setAutoFilledCount(0);
    setIsParsingCv(false);
  }, [editMember, isOpen, preSelectedMemberType]);

  const photoPreviewUrl = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); };
  }, [photoPreviewUrl]);

  const handleMobileChange = (val) => val.replace(/\D/g, "").slice(0, 10);

  const combinedDistricts = [...new Set([...KARNATAKA_DISTRICTS, ...dynamicDistricts])].sort();
  const combinedRoles = [...new Set([...DESIRED_ROLES_OPTIONS, ...dynamicRoles])].sort();
  const combinedIndustries = [...new Set([...INDUSTRY_OPTIONS, ...dynamicIndustries])].sort();

  const handleResumeUploadAndParse = async (file) => {
    if (!file) return;
    setIsParsingCv(true);
    setErrors((p) => ({ ...p, resume: "" }));
    setAutoFilledCount(0);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await API.post("/api/upload/parse-cv", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const parsedData = res.data.parsedData || {};
      const resumeUrl = res.data.url || "";

      setResumeFile(file);

      let filledCount = 0;
      const nextFormData = { ...formData };

      if (resumeUrl) {
        nextFormData.resumeLink = resumeUrl;
      }

      if (parsedData.name) {
        nextFormData.name = parsedData.name;
        filledCount++;
      }
      if (parsedData.mobileNumber) {
        nextFormData.mobileNumber = parsedData.mobileNumber;
        filledCount++;
      }
      if (parsedData.email) {
        nextFormData.email = parsedData.email;
        filledCount++;
      }
      if (parsedData.gender) {
        nextFormData.gender = parsedData.gender;
        filledCount++;
      }
      if (parsedData.highest_education) {
        nextFormData.highest_education = parsedData.highest_education;
        filledCount++;
      }
      if (parsedData.fieldofStudy_Interest) {
        nextFormData.branch = parsedData.fieldofStudy_Interest;
        filledCount++;
      }
      if (parsedData.designation) {
        nextFormData.designation = parsedData.designation;
        filledCount++;
      }
      if (parsedData.workExp) {
        nextFormData.workExp = parsedData.workExp;
        filledCount++;
      }
      if (parsedData.passOutYear) {
        nextFormData.passOutYear = parsedData.passOutYear;
        filledCount++;
      }
      if (parsedData.linkedinUrl) {
        nextFormData.linkedinUrl = parsedData.linkedinUrl;
        filledCount++;
      }
      if (Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
        nextFormData.skills = [...new Set(parsedData.skills)];
        filledCount++;
      }
      if (Array.isArray(parsedData.languages) && parsedData.languages.length > 0) {
        nextFormData.languages = [...new Set(parsedData.languages)];
        filledCount++;
      }
      if (parsedData.fatherName || parsedData.fathersName) {
        const fName = parsedData.fatherName || parsedData.fathersName;
        nextFormData.fatherName = fName;
        nextFormData.fathersName = fName;
        filledCount++;
      }
      if (parsedData.motherName) {
        nextFormData.motherName = parsedData.motherName;
        filledCount++;
      }
      if (parsedData.dateOfBirth) {
        const parsedDob = new Date(parsedData.dateOfBirth);
        nextFormData.dateOfBirth = isNaN(parsedDob.getTime()) ? null : parsedDob;
        filledCount++;
      }
      if (parsedData.maritalStatus) {
        nextFormData.maritalStatus = parsedData.maritalStatus;
        filledCount++;
      }
      if (parsedData.hometown) {
        nextFormData.hometown = parsedData.hometown;
        filledCount++;
      }
      if (parsedData.pincode) {
        nextFormData.pincode = parsedData.pincode;
        filledCount++;
      }
      if (parsedData.address) {
        nextFormData.address = parsedData.address;
        filledCount++;
      }
      if (parsedData.district) {
        nextFormData.district = parsedData.district;
        filledCount++;
      }
      if (parsedData.careerProfile) {
        nextFormData.careerProfile = {
          ...nextFormData.careerProfile,
          location: parsedData.careerProfile.location || nextFormData.careerProfile.location || "",
          role: Array.isArray(parsedData.careerProfile.role) && parsedData.careerProfile.role.length > 0
            ? parsedData.careerProfile.role
            : nextFormData.careerProfile.role || [],
          industry: parsedData.careerProfile.industry || nextFormData.careerProfile.industry || "",
          employmentType: parsedData.careerProfile.employmentType || nextFormData.careerProfile.employmentType || "",
          expectedSalary: parsedData.careerProfile.expectedSalary || nextFormData.careerProfile.expectedSalary || "",
          noticePeriod: parsedData.careerProfile.noticePeriod || nextFormData.careerProfile.noticePeriod || "",
        };
        if (Array.isArray(parsedData.careerProfile.role) && parsedData.careerProfile.role.length > 0) {
          nextFormData.preferredJobRole_Sector = parsedData.careerProfile.role;
        }
        filledCount++;
      }
      if (Array.isArray(parsedData.certifications) && parsedData.certifications.length > 0) {
        nextFormData.certifications = parsedData.certifications;
        filledCount++;
      }

      if (Array.isArray(parsedData.experienceDetails) && parsedData.experienceDetails.length > 0) {
        nextFormData.experienceDetails = parsedData.experienceDetails;
        filledCount++;
      } else if (parsedData.designation || parsedData.currentInstitutionOrCompany) {
        nextFormData.experienceDetails = [
          {
            companyName: parsedData.currentInstitutionOrCompany || "",
            designation: parsedData.designation || "",
            startDate: "",
            endDate: "",
            currentlyWorking: true,
            description: "",
          }
        ];
        filledCount++;
      }

      setFormData(nextFormData);
      setAutoFilledCount(filledCount);

      if (res.data.parseWarning) {
        setErrors((p) => ({ ...p, resume: res.data.parseWarning }));
      }
    } catch (err) {
      console.error("[AddMember] CV parsing failed:", err);
      setErrors((p) => ({
        ...p,
        resume: "Failed to parse resume automatically. File was uploaded, but fields could not be extracted.",
      }));
      setResumeFile(file);
    } finally {
      setIsParsingCv(false);
    }
  };

  const uploadToServer = async (file, fileType) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await API.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) =>
          setUploadProgress((prev) => ({
            ...prev,
            [fileType]: Math.round((p.loaded * 100) / p.total),
          })),
      });
      return res.data.url;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  };

  const addExperience = () => {
    setFormData((p) => ({
      ...p,
      experienceDetails: [
        ...(p.experienceDetails || []),
        { companyName: "", designation: "", startDate: "", endDate: "", currentlyWorking: false, description: "" },
      ],
    }));
  };

  const updateExperience = (index, key, value) => {
    setFormData((p) => {
      const next = [...(p.experienceDetails || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...p, experienceDetails: next };
    });
  };

  const removeExperience = (index) => {
    setFormData((p) => ({
      ...p,
      experienceDetails: (p.experienceDetails || []).filter((_, i) => i !== index),
    }));
  };

  const addCertificate = () => {
    setFormData((p) => ({
      ...p,
      certifications: [
        ...(p.certifications || []),
        { name: "", description: "", certifiedDate: "" },
      ],
    }));
  };

  const updateCertificate = (index, key, value) => {
    setFormData((p) => {
      const next = [...(p.certifications || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...p, certifications: next };
    });
  };

  const removeCertificate = (index) => {
    setFormData((p) => ({
      ...p,
      certifications: (p.certifications || []).filter((_, i) => i !== index),
    }));
  };

  const validateCareerTab = () => {
    const nextErrors = { ...errors, designation: "", workExp: "", role: "", industry: "", location: "", linkedinUrl: "" };
    let hasError = false;

    if (!String(formData.designation || "").trim()) {
      nextErrors.designation = "Designation is required.";
      hasError = true;
    }
    if (!String(formData.workExp || "").trim()) {
      nextErrors.workExp = "Experience is required.";
      hasError = true;
    }
    const roleVal = formData.careerProfile?.role;
    if (!roleVal || (Array.isArray(roleVal) ? roleVal.length === 0 : !String(roleVal).trim())) {
      nextErrors.role = "Preferred Job Role is required.";
      hasError = true;
    }
    if (!String(formData.careerProfile?.industry || "").trim()) {
      nextErrors.industry = "Industry is required.";
      hasError = true;
    }
    if (!String(formData.careerProfile?.location || "").trim()) {
      nextErrors.location = "Location Preference is required.";
      hasError = true;
    }
    if (!String(formData.linkedinUrl || "").trim()) {
      nextErrors.linkedinUrl = "LinkedIn Profile URL is required.";
      hasError = true;
    }

    setErrors(nextErrors);
    return !hasError;
  };

  const validateEduTab = () => {
    const nextErrors = { ...errors, resume: "", degree: "", branch: "" };

    if (!String(formData.highest_education || "").trim()) {
      nextErrors.degree = "Degree is required.";
    }

    if (!String(formData.branch || "").trim()) {
      nextErrors.branch = "Branch is required.";
    }

    const hasExistingResume = Boolean(formData.resumeLink);
    const hasNewResume = Boolean(resumeFile);

    if (!hasExistingResume && !hasNewResume) {
      nextErrors.resume = "Resume is mandatory. Please upload your resume.";
    }

    setErrors(nextErrors);
    return !nextErrors.resume && !nextErrors.degree && !nextErrors.branch;
  };

  const clearSelectedResume = () => {
    setResumeFile(null);
    setErrors((p) => ({ ...p, resume: "" }));
    if (resumeInputRef.current) resumeInputRef.current.value = "";
    setUploadProgress((p) => ({ ...p, resume: 0 }));
  };

  const applyCroppedPhoto = async () => {
    if (!pendingPhotoPreview || !pendingPhotoFile) return;

    try {
      const finalCropArea = cropArea || { x: 0, y: 0, width: 1000, height: 1000 };
      const croppedFile = await getCroppedImage(
        pendingPhotoPreview,
        finalCropArea,
        rotation,
        pendingPhotoFile.name || "profile-photo.jpg"
      );

      setPhotoFile(croppedFile);
      setFormData((prev) => ({ ...prev, photoUrl: "" }));
      setErrors((p) => ({ ...p, photo: "" }));
      setUploadProgress((p) => ({ ...p, photo: 0 }));
      setIsCropModalOpen(false);
      setPendingPhotoPreview(null);
      setPendingPhotoFile(null);
      setCropArea(null);
    } catch (err) {
      console.error("Failed to crop selected photo:", err);
      setErrors((p) => ({ ...p, photo: "Photo could not be processed. Please try another image." }));
    }
  };

  const clearSelectedPhoto = () => {
    setPhotoFile(null);
    setPendingPhotoPreview(null);
    setPendingPhotoFile(null);
    setCropArea(null);
    setIsCropModalOpen(false);
    setErrors((p) => ({ ...p, photo: "" }));
    if (photoInputRef.current) photoInputRef.current.value = "";
    setUploadProgress((p) => ({ ...p, photo: 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    const hasExistingPhoto = Boolean(formData.photoUrl);
    const hasNewPhoto = Boolean(photoFile);
    const shouldReplacePhoto = Boolean(photoFile);

    if (!hasExistingPhoto && !hasNewPhoto) {
      setErrors((p) => ({ ...p, photo: "Profile photo is mandatory. Please upload a photo.", }));
      setActiveTab("basic");
      return;
    }

    const careerOk = validateCareerTab();
    if (!careerOk) {
      setActiveTab("career");
      return;
    }

    const ok = validateEduTab();
    if (!ok) {
      setActiveTab("edu");
      return;
    }

    setBtnLoading(true);
    try {
      let photo = formData.photoUrl;
      if (shouldReplacePhoto) {
        const uploadedPhoto = await uploadToServer(photoFile, "photo");
        if (!uploadedPhoto) {
          setErrors((p) => ({ ...p, photo: "Photo upload failed. Please try again." }));
          setActiveTab("basic");
          return;
        }
        photo = uploadedPhoto;
      }

      let resume = formData.resumeLink;
      if (resumeFile) {
        const uploadedResume = await uploadToServer(resumeFile, "resume");
        if (uploadedResume) {
          resume = uploadedResume;
        }
      }

      const payload = {
        ...formData,
        photo,
        photoUrl: photo,
        resume,
        resumeLink: resume,
        branch: String(formData.branch || "").trim(),
        educationStatus: String(formData.educationStatus || "").trim(),
        highest_education: String(formData.highest_education || "").trim(),
        passOutYear: String(formData.passOutYear || "").trim(),
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : null,
        careerProfile: {
          ...formData.careerProfile,
          role: String(formData.careerProfile?.role || "").trim(),
          industry: String(formData.careerProfile?.industry || "").trim(),
          location: String(formData.careerProfile?.location || "").trim(),
          expectedSalary: String(formData.careerProfile?.expectedSalary || "").trim(),
          noticePeriod: String(formData.careerProfile?.noticePeriod || "").trim(),
        },
        linkedinUrl: String(formData.linkedinUrl || "").trim(),
        experienceDetails: (formData.experienceDetails || []).map((e) => ({
          companyName: e?.companyName || "",
          designation: e?.designation || "",
          startDate: e?.startDate || "",
          endDate: e?.endDate || "",
          currentlyWorking: Boolean(e?.currentlyWorking),
          description: e?.description || "",
        })),
        certifications: (formData.certifications || []).map((c) => ({
          name: c?.name || "",
          description: c?.description || "",
          certifiedDate: c?.certifiedDate || "",
        })),
        skills: (formData.skills || [])
          .filter((s) => String(s || "").trim())
          .map((s) => String(s).trim()),
        languages: (formData.languages || [])
          .filter((l) => String(l || "").trim())
          .map((l) => String(l).trim()),
      };

      const res = editMember ? await API.put(`/member/${editMember._id}`, payload) : await API.post("/member", payload);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setBtnLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedResumeName = resumeFile?.name;
  const selectedResumeSizeMB = resumeFile
    ? (resumeFile.size / (1024 * 1024)).toFixed(2)
    : null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: "900px" }}>
        <div className={styles.header}>
          <h2>Update Detailed Profile</h2>
          <button onClick={onClose} type="button" className={styles.closeButton}><X size={20} /></button>
        </div>

        <div className={styles.tabContainer}>
          <button className={activeTab === "basic" ? styles.activeTab : ""} onClick={() => setActiveTab("basic")} type="button">Basic Info</button>
          <button className={activeTab === "career" ? styles.activeTab : ""} onClick={() => setActiveTab("career")} type="button">Career Profile</button>
          <button className={activeTab === "edu" ? styles.activeTab : ""} onClick={() => setActiveTab("edu")} type="button">Education</button>
          <button className={activeTab === "cert" ? styles.activeTab : ""} onClick={() => setActiveTab("cert")} type="button">Certificates</button>
          <button className={activeTab === "personal" ? styles.activeTab : ""} onClick={() => setActiveTab("personal")} type="button">Advanced Personal</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {autoFilledCount > 0 && (
            <div className={styles.autofillBanner} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className={styles.autofillIcon}>✨</span>
                <div>
                  <strong>{autoFilledCount} fields</strong> were auto-filled from your CV.
                  Please review the tabs (Basic Info, Career Profile, Education, Advanced Personal) to verify details.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoFilledCount(0)}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16, fontWeight: "bold", padding: "0 4px" }}
              >
                ×
              </button>
            </div>
          )}

          {activeTab === "basic" && (
            <div className={styles.formGrid}>
              {isCropModalOpen && pendingPhotoPreview && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    borderRadius: 20,
                    background: "var(--am-card)",
                    border: "1px solid var(--am-border)",
                    padding: 16,
                    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>Edit your profile photo</div>
                      <div style={{ fontSize: 13, color: "var(--am-muted)" }}>Crop, zoom, and rotate before saving.</div>
                    </div>
                    <button type="button" onClick={() => setIsCropModalOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--am-muted)", fontWeight: 700 }}>
                      <X size={16} /> Close
                    </button>
                  </div>

                  <div style={{ position: "relative", width: "100%", height: 340, borderRadius: 18, overflow: "hidden", background: "#0f172a" }}>
                    <Cropper
                      image={pendingPhotoPreview}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                      onCropComplete={(_, croppedAreaPixels) => setCropArea(croppedAreaPixels)}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))} style={{ border: "1px solid var(--am-border)", background: "white", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <ZoomOut size={16} /> Zoom Out
                      </button>
                      <button type="button" onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(2))))} style={{ border: "1px solid var(--am-border)", background: "white", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <ZoomIn size={16} /> Zoom In
                      </button>
                      <button type="button" onClick={() => setRotation((r) => r - 90)} style={{ border: "1px solid var(--am-border)", background: "white", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <RotateCcw size={16} /> Rotate Left
                      </button>
                      <button type="button" onClick={() => setRotation((r) => r + 90)} style={{ border: "1px solid var(--am-border)", background: "white", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <RotateCw size={16} /> Rotate Right
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button type="button" onClick={() => setIsCropModalOpen(false)} style={{ background: "transparent", color: "var(--am-muted)", fontWeight: 800, border: "none", cursor: "pointer" }}>
                        Cancel
                      </button>
                      <button type="button" onClick={applyCroppedPhoto} style={{ background: "var(--am-primary)", color: "white", fontWeight: 800, border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}>
                        Save Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>
                    Profile Photo <span style={{ color: "#ef4444" }}>*</span>
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: errors.photo
                        ? "1px solid rgba(239,68,68,0.55)"
                        : "1px solid rgba(148,163,184,0.35)",
                      color: "rgba(100,116,139,1)",
                      fontWeight: 700,
                    }}
                  >
                    JPG / PNG • Recommended 1–3MB
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    border: errors.photo
                      ? "1.5px solid var(--am-danger)"
                      : "1.5px solid var(--am-border)",
                    background: "var(--am-soft)",
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 260,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: photoFile
                          ? "rgba(34,197,94,0.12)"
                          : "var(--am-primary-soft)",
                        border: photoFile
                          ? "1px solid rgba(34,197,94,0.25)"
                          : "1.5px solid var(--am-primary)",
                        color: photoFile
                          ? "#15803d"
                          : "var(--am-primary)",
                      }}
                    >
                      {photoFile ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <UploadCloud size={20} />
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {photoFile
                          ? "Photo selected"
                          : "Upload your profile photo"}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(100,116,139,1)",
                          marginTop: 4,
                        }}
                      >
                        {photoFile
                          ? `${photoFile.name} • ${(
                            photoFile.size /
                            (1024 * 1024)
                          ).toFixed(2)} MB`
                          : "Click upload button to choose a file"}
                      </div>

                      {!photoFile && formData.photoUrl && (
                        <div style={{ marginTop: 6 }}>
                          <a
                            href={formData.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 800,
                              color: "var(--am-primary)",
                              textDecoration: "none",
                            }}
                          >
                            <FileText size={16} />
                            View Current Photo
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {(photoPreviewUrl || (!photoFile && formData.photoUrl)) && (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          overflow: "hidden",
                          border: "1px solid rgba(148,163,184,0.25)",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={photoPreviewUrl || formData.photoUrl}
                          alt="Profile preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;

                        const maxBytes = 3 * 1024 * 1024;
                        if (file.size > maxBytes) {
                          setErrors((p) => ({
                            ...p,
                            photo: "Image too large. Try under 3MB.",
                          }));
                          e.target.value = "";
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPendingPhotoFile(file);
                          setPendingPhotoPreview(ev.target.result);
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setRotation(0);
                          setCropArea(null);
                          setIsCropModalOpen(true);
                        };
                        reader.readAsDataURL(file);
                        setErrors((p) => ({ ...p, photo: "" }));
                        setUploadProgress((p) => ({ ...p, photo: 0 }));
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        border: "none",
                        background: "linear-gradient(135deg, #e11d48, #be123c)",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
                      }}
                    >
                      {photoFile ? "Replace" : "Upload"}
                    </button>

                    {photoFile && (
                      <button
                        type="button"
                        onClick={clearSelectedPhoto}
                        title="Remove selected photo"
                        style={{
                          border: "1.5px solid var(--am-border)",
                          background: "transparent",
                          color: "var(--am-text2)",
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {errors.photo && (
                  <p style={{ color: "#ef4444", marginTop: 10, fontWeight: 800 }}>
                    {errors.photo}
                  </p>
                )}
              </div>

              <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />

              <DropdownSelect
                label="Gender"
                value={formData.gender}
                options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                onChange={(v) => setFormData({ ...formData, gender: v })}
              />

              <EditableDropdown
                label="District"
                value={formData.district}
                options={combinedDistricts}
                placeholder="Select your district..."
                category="locationPreferences"
                onCustomAdded={fetchDynamicDropdowns}
                onOpenChange={setIsDropdownOpen}
                onChange={(v) => setFormData({ ...formData, district: v })}
              />

              <DropdownSelect
                label="Solidarity Member Status"
                value={formData.symMemberStatus}
                options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                onOpenChange={setIsDropdownOpen}
                onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
              />
            </div>
          )}

          {activeTab === "career" && (
            <div className={styles.formGrid}>
              <FormInput
                label="Designation"
                required
                error={errors.designation}
                value={formData.designation}
                onChange={(v) => { setFormData({ ...formData, designation: v }); setErrors(p => ({ ...p, designation: "" })); }}
              />
              <FormInput
                label="Experience (Years)"
                type="number"
                required
                error={errors.workExp}
                value={formData.workExp}
                onChange={(v) => { setFormData({ ...formData, workExp: v }); setErrors(p => ({ ...p, workExp: "" })); }}
                placeholder="0"
              />

              <MultiJobRoleDropdown
                label="Preferred Job Role"
                required
                error={errors.role}
                value={formData.careerProfile.role}
                options={combinedRoles}
                category="desiredRoles"
                onCustomAdded={fetchDynamicDropdowns}
                onChange={(v) => {
                  const arr = Array.isArray(v) ? v : (v ? [v] : []);
                  setFormData({ ...formData, preferredJobRole_Sector: arr, careerProfile: { ...formData.careerProfile, role: arr } });
                  setErrors(p => ({ ...p, role: "" }));
                }}
              />

              <EditableDropdown
                label="Industry"
                required
                error={errors.industry}
                value={formData.careerProfile.industry}
                options={combinedIndustries}
                placeholder="Select or type industry..."
                category="industry"
                onCustomAdded={fetchDynamicDropdowns}
                onChange={(v) => { setFormData({ ...formData, careerProfile: { ...formData.careerProfile, industry: v } }); setErrors(p => ({ ...p, industry: "" })); }}
              />

              <EditableDropdown
                label="Location Preference"
                required
                error={errors.location}
                value={formData.careerProfile.location}
                options={combinedDistricts}
                placeholder="Select your district..."
                category="locationPreferences"
                onCustomAdded={fetchDynamicDropdowns}
                onChange={(v) => { setFormData({ ...formData, careerProfile: { ...formData.careerProfile, location: v } }); setErrors(p => ({ ...p, location: "" })); }}
              />

              <FormInput
                label="Expected Salary"
                type="number"
                value={formData.careerProfile.expectedSalary}
                onChange={(v) => {
                  const numValue = String(v).replace(/[^0-9]/g, "");
                  setFormData({ ...formData, careerProfile: { ...formData.careerProfile, expectedSalary: numValue } });
                }}
                placeholder="0"
              />

              <DropdownSelect
                label="Employment Type"
                value={formData.careerProfile.employmentType}
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                  { value: "Freelance", label: "Freelance" },
                  { value: "Internship", label: "Internship" },
                  { value: "Remote", label: "Remote" },
                  { value: "Contract", label: "Contract" },
                ]}
                onChange={(v) => setFormData({ ...formData, careerProfile: { ...formData.careerProfile, employmentType: v } })}
              />

              <DropdownSelect
                label="Notice Period"
                value={formData.careerProfile.noticePeriod}
                options={[
                  { value: "Immediate", label: "Immediate" },
                  { value: "15 days", label: "15 days" },
                  { value: "30 days", label: "30 days" },
                  { value: "45 days", label: "45 days" },
                  { value: "60 days", label: "60 days" },
                  { value: "90 days", label: "90 days" },
                ]}
                onChange={(v) => setFormData({ ...formData, careerProfile: { ...formData.careerProfile, noticePeriod: v } })}
              />

              <FormInput
                label="LinkedIn Profile URL"
                value={formData.linkedinUrl}
                onChange={(v) => {
                  setFormData({ ...formData, linkedinUrl: v });
                  if (errors.linkedinUrl) setErrors({ ...errors, linkedinUrl: "" });
                }}
                placeholder="https://linkedin.com/in/your-profile"
                required
                error={errors.linkedinUrl}
              />

              <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                <TagInputField
                  label="Skills"
                  value={formData.skills || []}
                  placeholder="Type a skill (e.g., React, Java, Python) and press Enter"
                  onChange={(next) => setFormData((p) => ({ ...p, skills: next }))}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                <div className={styles.sectionHeader} style={{ marginTop: 6 }}>
                  <h3 style={{ margin: 0 }}>Experience Details</h3>
                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={addExperience}
                  >
                    + Add Experience
                  </button>
                </div>

                {(formData.experienceDetails || []).length === 0 ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 14,
                      borderRadius: 12,
                      border: "1.5px dashed var(--am-border)",
                      color: "var(--am-muted)",
                      fontWeight: 700,
                    }}
                  >
                    No experience added yet. Click <b>+ Add Experience</b>.
                  </div>
                ) : (
                  <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                    {formData.experienceDetails.map((exp, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderRadius: 16,
                          border: "1.5px solid var(--am-border)",
                          background: "var(--am-soft)",
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>
                            Experience #{idx + 1}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            title="Remove"
                            style={{
                              border: "1px solid rgba(148,163,184,0.35)",
                              background: "transparent",
                              padding: "8px 10px",
                              borderRadius: 10,
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className={styles.formGrid}>
                          <FormInput
                            label="Company Name"
                            value={exp?.companyName || ""}
                            onChange={(v) => updateExperience(idx, "companyName", v)}
                          />

                          <FormInput
                            label="Designation"
                            value={exp?.designation || ""}
                            onChange={(v) => updateExperience(idx, "designation", v)}
                          />

                          <CertifiedDateSelect
                            label="Start Date"
                            value={exp?.startDate || ""}
                            onChange={(v) => updateExperience(idx, "startDate", v)}
                          />

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {!exp.currentlyWorking && (
                              <CertifiedDateSelect
                                label="End Date"
                                value={exp?.endDate || ""}
                                onChange={(v) => updateExperience(idx, "endDate", v)}
                              />
                            )}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: exp.currentlyWorking ? 32 : 0, fontWeight: 700, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={exp?.currentlyWorking || false}
                                onChange={(e) => {
                                  updateExperience(idx, "currentlyWorking", e.target.checked);
                                  if (e.target.checked) updateExperience(idx, "endDate", "");
                                }}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                              Currently Working Here
                            </label>
                          </div>

                          <div style={{ gridColumn: "1 / -1" }}>
                            <FormInput
                              label="Description"
                              multiline={true}
                              value={exp?.description || ""}
                              onChange={(v) => updateExperience(idx, "description", v)}
                              placeholder="Enter experience description..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "edu" && (
            <div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0 }}>
                    Resume <span style={{ color: "#ef4444" }}>*</span>
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.35)",
                      color: "rgba(100,116,139,1)",
                      fontWeight: 700,
                    }}
                  >
                    PDF / DOC / DOCX • Max 5MB
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    border: errors.resume
                      ? "1.5px solid var(--am-danger)"
                      : "1.5px solid var(--am-border)",
                    background: "var(--am-soft)",
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: isParsingCv
                          ? "rgba(225,29,72,0.12)"
                          : resumeFile
                            ? "rgba(34,197,94,0.12)"
                            : "var(--am-primary-soft)",
                        border: isParsingCv
                          ? "1px solid rgba(225,29,72,0.25)"
                          : resumeFile
                            ? "1px solid rgba(34,197,94,0.25)"
                            : "1.5px solid var(--am-primary)",
                        color: isParsingCv
                          ? "var(--am-primary)"
                          : resumeFile
                            ? "#15803d"
                            : "var(--am-primary)",
                      }}
                    >
                      {isParsingCv ? (
                        <div className={styles.cvMiniSpinner} />
                      ) : resumeFile ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <UploadCloud size={20} />
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {isParsingCv ? "Reading and parsing your CV..." : resumeFile ? "Resume selected" : "Upload your resume"}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(100,116,139,1)",
                          marginTop: 4,
                        }}
                      >
                        {isParsingCv
                          ? "Extracting details to auto-fill the profile form..."
                          : resumeFile
                            ? `${selectedResumeName} • ${selectedResumeSizeMB} MB`
                            : "Click upload button to choose a file"}
                      </div>

                      {!resumeFile && formData.resumeLink && (
                        <div style={{ marginTop: 6 }}>
                          <a
                            href={formData.resumeLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 800,
                              color: "var(--am-primary)",
                              textDecoration: "none",
                            }}
                          >
                            <FileText size={16} />
                            View Current Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;

                        const maxBytes = 5 * 1024 * 1024;
                        if (file.size > maxBytes) {
                          setErrors((p) => ({
                            ...p,
                            resume: "File too large. Max 5MB.",
                          }));
                          e.target.value = "";
                          return;
                        }

                        await handleResumeUploadAndParse(file);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      style={{
                        border: "none",
                        background: "linear-gradient(135deg, #e11d48, #be123c)",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
                      }}
                    >
                      {resumeFile ? "Replace" : "Upload"}
                    </button>

                    {resumeFile && (
                      <button
                        type="button"
                        onClick={clearSelectedResume}
                        title="Remove selected file"
                        style={{
                          border: "1.5px solid var(--am-border)",
                          background: "transparent",
                          color: "var(--am-text2)",
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {errors.resume && (
                  <p style={{ color: "#ef4444", marginTop: 10, fontWeight: 800 }}>
                    {errors.resume}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 18 }}>
                <EditableDropdown
                  label="Current Degree"
                  required
                  value={formData.highest_education || ""}
                  options={DEGREE_OPTIONS}
                  placeholder="Type to search or enter your degree..."
                  error={errors.degree}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, highest_education: val }));
                    setErrors((p) => ({ ...p, degree: "" }));
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <EditableDropdown
                  label=" Current Branch"
                  required
                  value={formData.branch || ""}
                  options={BRANCH_OPTIONS}
                  placeholder="Type to search or enter your branch..."
                  error={errors.branch}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, branch: val }));
                    setErrors((p) => ({ ...p, branch: "" }));
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <DropdownSelect
                  label="Status"
                  value={formData.educationStatus}
                  options={[
                    { value: "Pursuing", label: "Pursuing" },
                    { value: "Completed", label: "Completed" }
                  ]}
                  placeholder="Select Status"
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, educationStatus: val }));
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <YearPicker
                  label="Pass-out Year"
                  value={formData.passOutYear || ""}
                  placeholder="YYYY"
                  onChange={(val) =>
                    setFormData((p) => ({ ...p, passOutYear: val }))
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "cert" && (
            <div>
              <div className={styles.sectionHeader} style={{ marginTop: 6 }}>
                <h3 style={{ margin: 0 }}>Certificate Details</h3>
                <button
                  type="button"
                  className={styles.miniBtn}
                  onClick={addCertificate}
                >
                  + Add Certificate
                </button>
              </div>

              {(formData.certifications || []).length === 0 ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 12,
                    border: "1.5px dashed var(--am-border)",
                    color: "var(--am-muted)",
                    fontWeight: 700,
                  }}
                >
                  No certificates added yet. Click <b>+ Add Certificate</b>.
                </div>
              ) : (
                <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                  {formData.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 16,
                        border: "1.5px solid var(--am-border)",
                        background: "var(--am-soft)",
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>
                          Certificate #{idx + 1}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCertificate(idx)}
                          title="Remove"
                          style={{
                            border: "1px solid rgba(148,163,184,0.35)",
                            background: "transparent",
                            padding: "8px 10px",
                            borderRadius: 10,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className={styles.formGrid}>
                        <FormInput
                          label="Certificate Name"
                          value={cert?.name || ""}
                          onChange={(v) => updateCertificate(idx, "name", v)}
                        />

                        <CertifiedDateSelect
                          label="Certified Date"
                          value={cert?.certifiedDate || ""}
                          onChange={(v) =>
                            updateCertificate(idx, "certifiedDate", v)
                          }
                        />

                        <div style={{ gridColumn: "1 / -1" }}>
                          <FormInput
                            label="Description"
                            multiline={true}
                            value={cert?.description || ""}
                            onChange={(v) => updateCertificate(idx, "description", v)}
                            placeholder="Enter certificate description..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "personal" && (
            <div className={styles.formGrid}>
              <FormInput
                label="Email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                required
              />

              <FormInput
                label="Mobile"
                value={formData.mobileNumber}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    mobileNumber: handleMobileChange(v),
                  })
                }
                required
                placeholder="10 digit number"
              />

              <DateSelect
                label="DOB"
                value={formData.dateOfBirth}
                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
              />

              <FormInput
                label="Father's Name"
                value={formData.fatherName}
                onChange={(v) => setFormData({ ...formData, fatherName: v, fathersName: v })}
              />

              <FormInput
                label="Mother's Name"
                value={formData.motherName}
                onChange={(v) => setFormData({ ...formData, motherName: v })}
              />

              <FormInput
                label="Hometown"
                value={formData.hometown}
                onChange={(v) => setFormData({ ...formData, hometown: v })}
              />

              <FormInput
                label="Address"
                value={formData.address}
                onChange={(v) => setFormData({ ...formData, address: v })}
              />

              <DropdownSelect
                label="Marital Status"
                value={formData.maritalStatus}
                options={[
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                ]}
                onChange={(v) =>
                  setFormData({ ...formData, maritalStatus: v })
                }
              />

              <FormInput
                label="Pincode"
                value={formData.pincode}
                onChange={(v) => setFormData({ ...formData, pincode: v })}
              />

              <TagInputField
                label="Languages"
                value={formData.languages || []}
                options={LANGUAGE_OPTIONS}
                onChange={(next) =>
                  setFormData((p) => ({ ...p, languages: next }))
                }
              />
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={btnLoading}
              className={styles.submitButton}
            >
              {btnLoading ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMember;                