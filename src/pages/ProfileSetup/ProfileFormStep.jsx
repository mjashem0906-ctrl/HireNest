import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Trash2,
  Plus,
  Search,
  ChevronDown,
  CalendarDays,
  CheckCircle2,
  FileText,
  UploadCloud,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import API from "../../axios";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import DateSelect from "../../components/UI/DateSelect";
import styles from "./ProfileSetup.module.scss";

// ── Static data ──────────────────────────────────────────────────────────────
const KARNATAKA_DISTRICTS = [
  "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
  "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu",
  "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir",
];

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

const DESIRED_ROLES_OPTIONS = [
  "Accountant", "Administrative Assistant", "Android Developer", "Architect",
  "Artificial Intelligence Engineer", "Automobile Engineer", "Back Office Executive",
  "Backend Developer", "Biomedical Engineer", "Business Analyst",
  "Business Development Executive (BDE)", "Chartered Accountant (CA)", "Chemical Engineer",
  "Civil Engineer", "Cloud Architect", "Consultant", "Content Creator", "Content Writer",
  "Customer Support Executive", "Data Analyst", "Data Entry Operator", "Data Scientist",
  "Delivery Partner", "DevOps Engineer", "Digital Marketing Specialist", "Director",
  "Electrical Engineer", "Electronics Engineer", "Financial Analyst", "Frontend Developer",
  "Full Stack Developer", "Graduate Trainee", "Graphic Designer", "HR Generalist",
  "HR Recruiter", "IT Support / Helpdesk", "Intern", "Manager", "Mechanical Engineer",
  "Mobile Developer", "Mobile App Developer", "Network Engineer", "Office Administrator",
  "Operations Executive", "Product Manager", "Project Manager", "QA / Testing Engineer",
  "QA Engineer", "Sales Executive", "Senior Software Engineer", "Software Engineer",
  "System Administrator", "Teacher / Lecturer", "Tech Lead", "Telecaller", "Trainer",
  "UI/UX Designer", "Web Designer"
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

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImage = async (imageSrc, pixelCrop, rotation = 0, fileName = "profile-photo.png") => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const safeSize = Math.max(image.width, image.height);
  canvas.width = safeSize;
  canvas.height = safeSize;

  ctx.translate(safeSize / 2, safeSize / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeSize / 2, -safeSize / 2);
  ctx.drawImage(image, 0, 0, safeSize, safeSize);

  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = pixelCrop.width;
  targetCanvas.height = pixelCrop.height;
  const targetCtx = targetCanvas.getContext("2d");

  targetCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    targetCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create cropped image"));
        return;
      }
      resolve(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
};

// ── Helper inline sub-components ─────────────────────────────────────────────
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
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setQuery(value || ""), [value]);

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
          <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ps-primary)", fontWeight: 600 }}>
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
              if (e.key === "Tab") {
                setOpen(false);
                const trimmedQuery = String(query || "").trim();
                if (trimmedQuery && trimmedQuery !== value) {
                  commit(trimmedQuery);
                }
              }
            }}
          />

          <button
            type="button"
            tabIndex={-1}
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
                    tabIndex={-1}
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
              if (e.key === "Tab") setOpen(false);
            }}
          />

          <button
            type="button"
            tabIndex={-1}
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
                  tabIndex={-1}
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

  const toYMD = (d) => (d ? (d instanceof Date ? d.toISOString().split("T")[0] : String(d).split("T")[0]) : "");

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
                  tabIndex={-1}
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
                if (e.key === "Tab") {
                  setOpen(false);
                }
              }}
            />
          </div>

          {options && options.length > 0 && (
            <button
              type="button"
              tabIndex={-1}
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
                      tabIndex={-1}
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

function MultiJobRoleDropdown({ label = "Preferred Job Role", value = [], options = [], required = false, error = "", onChange, category = null, onCustomAdded = () => { } }) {
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
          {selected.map((tag) => (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 6px 3px 10px", background: "var(--am-primary-soft)", border: "1px solid rgba(225,29,72,0.22)", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, color: "var(--am-primary)", whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tag}</span>
              <button type="button" tabIndex={-1} onClick={(e) => removeTag(tag, e)} style={{ border: "none", background: "transparent", color: "var(--am-muted)", fontSize: "1rem", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }} aria-label={`Remove ${tag}`}>×</button>
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
              if (e.key === "Tab") { setOpen(false); setQuery(""); }
              if (e.key === "Backspace" && query === "" && selected.length > 0) onChange(selected.slice(0, -1));
            }}
          />
          <button type="button" tabIndex={-1} className={styles.edBtn} onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 0); }}>
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
                      tabIndex={-1}
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
                <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => onChange([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, color: "var(--am-muted)", fontFamily: "inherit" }}>Clear all</button>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

// ── ProfileFormStep Component ────────────────────────────────────────────────
const ProfileFormStep = ({ initialData = {}, resumeUrl = "", onSaved, onBack }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    fathersName: initialData.fatherName || initialData.fathersName || "",
    mobileNumber: initialData.mobileNumber || "",
    email: initialData.email || "",
    gender: initialData.gender || "",
    solidarityMember: initialData.solidarityMember || initialData.symMemberStatus || "",
    symMemberStatus: initialData.symMemberStatus || initialData.solidarityMember || "",
    dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : null,
    district: initialData.district || "",
    currentInstitutionOrCompany: initialData.currentInstitutionOrCompany || "",
    designation: initialData.designation || "",
    workExp: initialData.workExp || "",
    highest_education: initialData.highest_education || "",
    branch: initialData.branch || initialData.fieldofStudy_Interest || "",
    educationStatus: initialData.educationStatus || "",
    passOutYear: initialData.passOutYear || "",
    preferredJobRole_Sector: Array.isArray(initialData.preferredJobRole_Sector)
      ? initialData.preferredJobRole_Sector
      : initialData.careerProfile?.role
        ? (Array.isArray(initialData.careerProfile.role) ? initialData.careerProfile.role : [initialData.careerProfile.role])
        : [],
    careerProfile: {
      location: initialData.careerProfile?.location || initialData.district || "",
      role: Array.isArray(initialData.careerProfile?.role)
        ? initialData.careerProfile.role
        : initialData.careerProfile?.role
          ? [initialData.careerProfile.role]
          : Array.isArray(initialData.preferredJobRole_Sector)
            ? initialData.preferredJobRole_Sector
            : [],
      industry: initialData.careerProfile?.industry || "",
      employmentType: initialData.careerProfile?.employmentType || "",
      expectedSalary: initialData.careerProfile?.expectedSalary || "",
      noticePeriod: initialData.careerProfile?.noticePeriod || "",
    },
    linkedinUrl: initialData.linkedinUrl || "",
    experienceDetails: initialData.experienceDetails || (
      (initialData.designation || initialData.currentInstitutionOrCompany) ? [
        {
          companyName: initialData.currentInstitutionOrCompany || "",
          designation: initialData.designation || "",
          startDate: "",
          endDate: "",
          currentlyWorking: true,
          description: ""
        }
      ] : []
    ),
    certifications: initialData.certifications || [],
    skills: Array.isArray(initialData.skills) ? initialData.skills : [],
    languages: Array.isArray(initialData.languages) ? initialData.languages : [],
    fatherName: initialData.fatherName || initialData.fathersName || "",
    motherName: initialData.motherName || "",
    hometown: initialData.hometown || "",
    pincode: initialData.pincode || "",
    maritalStatus: initialData.maritalStatus || "",
    address: initialData.address || "",
    photoUrl: initialData.photoUrl || "",
    resumeLink: resumeUrl || initialData.resumeLink || "",
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [role] = useState("Job"); // Default to Job Seeker
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [dynamicDistricts, setDynamicDistricts] = useState([]);
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [dynamicIndustries, setDynamicIndustries] = useState([]);

  const [errors, setErrors] = useState({
    resume: "",
    degree: "",
    branch: "",
    photo: "",
    designation: "",
    workExp: "",
    role: "",
    industry: "",
    location: ""
  });

  const photoInputRef = useRef(null);

  // ── Prefill info banner ────────────────────────────────────────────────────
  const autoFilledFields = Object.keys(initialData).filter(
    (k) => initialData[k] && String(initialData[k]).length > 0
  );

  // ── Fetch dynamic dropdown configurations ──────────────────────────────────
  const fetchDynamicDropdowns = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchDynamicDropdowns();
  }, [fetchDynamicDropdowns]);

  const combinedDistricts = [...new Set([...KARNATAKA_DISTRICTS, ...dynamicDistricts])].sort();
  const combinedRoles = [...new Set([...DESIRED_ROLES_OPTIONS, ...dynamicRoles])].sort();
  const combinedIndustries = [...new Set([...INDUSTRY_OPTIONS, ...dynamicIndustries])].sort();

  // ── Image preview memo ─────────────────────────────────────────────────────
  const photoPreviewUrl = useMemo(() => {
    if (photoPreview) return photoPreview;
    if (photoFile) {
      try {
        return URL.createObjectURL(photoFile);
      } catch {
        return "";
      }
    }
    return "";
  }, [photoFile, photoPreview]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  // ── Field manipulation handlers ───────────────────────────────────────────
  const handleMobileChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, mobileNumber: digits });
  };

  const handleWorkExpChange = (delta) => {
    let nextVal = "";
    if (formData.workExp === "") {
      nextVal = delta > 0 ? "1" : "0";
    } else {
      const current = parseFloat(formData.workExp) || 0;
      nextVal = String(Math.max(0, Math.min(50, current + delta)));
    }
    setFormData({ ...formData, workExp: nextVal });
    setErrors((p) => ({ ...p, workExp: "" }));
    sessionStorage.setItem("onboarding_workExp", nextVal);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "Photo must be under 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingPhotoFile(file);
      setPendingPhotoPreview(ev.target.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setIsCropModalOpen(true);
      setErrors((p) => ({ ...p, photo: "" }));
    };
    reader.readAsDataURL(file);
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
      setPhotoPreview(URL.createObjectURL(croppedFile));
      setErrors((p) => ({ ...p, photo: "" }));
      setIsCropModalOpen(false);
      setPendingPhotoFile(null);
      setPendingPhotoPreview(null);
      setCropArea(null);
    } catch (err) {
      console.error("Failed to crop selected photo:", err);
      setErrors((p) => ({ ...p, photo: "Photo could not be processed. Please try another image." }));
    }
  };

  const clearSelectedPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors((p) => ({ ...p, photo: "" }));
    if (photoInputRef.current) photoInputRef.current.value = "";
    setFormData((p) => ({ ...p, photoUrl: "" }));
  };

  const uploadToServer = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    const res = await API.post("/api/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return res.data.url;
  };

  // ── Experience list manipulation ──────────────────────────────────────────
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

  // ── Certificate list manipulation ─────────────────────────────────────────
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

  // ── Validation logic ───────────────────────────────────────────────────────
  const validateBasicTab = () => {
    const nextErrors = { name: "", district: "" };
    let hasError = false;

    if (!String(formData.name || "").trim()) {
      nextErrors.name = "Full Name is required.";
      hasError = true;
    }
    if (!String(formData.district || "").trim()) {
      nextErrors.district = "District is required.";
      hasError = true;
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return !hasError;
  };

  const validatePersonalTab = () => {
    const nextErrors = { email: "", mobileNumber: "" };
    let hasError = false;

    if (!String(formData.email || "").trim()) {
      nextErrors.email = "Email is required.";
      hasError = true;
    }
    const mobile = String(formData.mobileNumber || "").trim();
    if (!mobile) {
      nextErrors.mobileNumber = "Mobile Number is required.";
      hasError = true;
    } else if (mobile.length !== 10) {
      nextErrors.mobileNumber = "Mobile number must be exactly 10 digits.";
      hasError = true;
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return !hasError;
  };

  const validateCareerTab = () => {
    const nextErrors = { designation: "", workExp: "", role: "", industry: "", location: "", linkedinUrl: "" };
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

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return !hasError;
  };

  const validateEduTab = () => {
    const nextErrors = { resume: "", degree: "", branch: "" };
    let hasError = false;

    if (!String(formData.highest_education || "").trim()) {
      nextErrors.degree = "Degree is required.";
      hasError = true;
    }
    if (!String(formData.branch || "").trim()) {
      nextErrors.branch = "Branch is required.";
      hasError = true;
    }

    const hasExistingResume = Boolean(formData.resumeLink);
    if (!hasExistingResume) {
      nextErrors.resume = "Resume is mandatory. Please upload your resume.";
      hasError = true;
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return !hasError;
  };

  // ── Profile completion percentage tracker ──────────────────────────────────
  const requiredFields = [
    { key: "name", label: "Name" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "gender", label: "Gender" },
    { key: "district", label: "District" },
    { key: "designation", label: "Designation" },
    { key: "workExp", label: "Experience Years" },
    { key: "highest_education", label: "Degree" },
    { key: "branch", label: "Branch" },
  ];

  const completion = useMemo(() => {
    let completedCount = requiredFields.filter((item) => {
      return formData[item.key] && String(formData[item.key]).trim().length > 0;
    }).length;

    if (formData.careerProfile?.role && formData.careerProfile.role.length > 0) completedCount++;
    if (formData.careerProfile?.industry && String(formData.careerProfile.industry).trim().length > 0) completedCount++;
    if (formData.careerProfile?.location && String(formData.careerProfile.location).trim().length > 0) completedCount++;
    if (photoFile || formData.photoUrl) completedCount++;

    return Math.min(100, Math.round((completedCount / 12) * 100));
  }, [formData, photoFile]);

  // ── Save action handler ────────────────────────────────────────────────────
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const basicOk = validateBasicTab();
    if (!basicOk) {
      setActiveTab("basic");
      return;
    }

    const personalOk = validatePersonalTab();
    if (!personalOk) {
      setActiveTab("personal");
      return;
    }

    const hasExistingPhoto = Boolean(formData.photoUrl);
    const hasNewPhoto = Boolean(photoFile);

    if (!hasExistingPhoto && !hasNewPhoto) {
      setErrors((prev) => ({ ...prev, photo: "Profile photo is mandatory. Please upload a photo." }));
      setActiveTab("basic");
      return;
    }

    const careerOk = validateCareerTab();
    if (!careerOk) {
      setActiveTab("career");
      return;
    }

    const eduOk = validateEduTab();
    if (!eduOk) {
      setActiveTab("edu");
      return;
    }

    setLoading(true);
    try {
      let photo = formData.photoUrl;
      if (photoFile) {
        photo = await uploadToServer(photoFile);
      }

      // Structure updated data payload for candidate profile
      const payload = {
        role,
        profileData: {
          ...formData,
          photoUrl: photo,
          branch: String(formData.branch || "").trim(),
          educationStatus: String(formData.educationStatus || "").trim(),
          highest_education: String(formData.highest_education || "").trim(),
          passOutYear: String(formData.passOutYear || "").trim(),
          dateOfBirth: formData.dateOfBirth ? (formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split("T")[0] : formData.dateOfBirth) : null,
          careerProfile: {
            ...formData.careerProfile,
            role: formData.careerProfile?.role || [],
            industry: String(formData.careerProfile?.industry || "").trim(),
            location: String(formData.careerProfile?.location || "").trim(),
            expectedSalary: String(formData.careerProfile?.expectedSalary || "").trim(),
            noticePeriod: String(formData.careerProfile?.noticePeriod || "").trim(),
          },
          linkedinUrl: String(formData.linkedinUrl || "").trim(),
          experienceDetails: (formData.experienceDetails || []).map((exp) => ({
            companyName: exp?.companyName || "",
            designation: exp?.designation || "",
            startDate: exp?.startDate || "",
            endDate: exp?.endDate || "",
            currentlyWorking: Boolean(exp?.currentlyWorking),
            description: exp?.description || "",
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
        }
      };

      await API.post("/auth/update-profile", payload);

      console.log("[ProfileFormStep] handleSave successfully updated profile on backend. workExp:", formData.workExp);
      sessionStorage.setItem("onboarding_workExp", formData.workExp);
      onSaved(formData.workExp);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={styles.formStep}>
      {/* CV Parse Banner */}
      {autoFilledFields.length > 0 && (
        <div className={styles.autofillBanner}>
          <span className={styles.autofillIcon}>✨</span>
          <span>
            <strong>{autoFilledFields.length} fields</strong> were auto-filled from your CV.
            Please review the tabs below to verify and complete your profile.
          </span>
        </div>
      )}

      {/* Completion status bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${completion}%` }} />
        </div>
        <span>{completion}% Complete</span>
      </div>

      <div className={styles.tabContainer}>
        <button
          className={activeTab === "basic" ? styles.activeTab : ""}
          onClick={() => setActiveTab("basic")}
          type="button"
        >
          Basic Info
        </button>
        <button
          className={activeTab === "career" ? styles.activeTab : ""}
          onClick={() => setActiveTab("career")}
          type="button"
        >
          Career Profile
        </button>
        <button
          className={activeTab === "edu" ? styles.activeTab : ""}
          onClick={() => setActiveTab("edu")}
          type="button"
        >
          Education
        </button>
        <button
          className={activeTab === "cert" ? styles.activeTab : ""}
          onClick={() => setActiveTab("cert")}
          type="button"
        >
          Certificates
        </button>
        <button
          className={activeTab === "personal" ? styles.activeTab : ""}
          onClick={() => setActiveTab("personal")}
          type="button"
        >
          Advanced Personal
        </button>
      </div>

      <div className={styles.form}>
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

            {/* Profile Photo Uploader */}
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
                    color: "var(--am-muted)",
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
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 260 }}>
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
                      color: photoFile ? "#15803d" : "var(--am-primary)",
                    }}
                  >
                    {photoFile ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>
                      {photoFile ? "Photo selected" : "Upload your profile photo"}
                    </div>

                    <div style={{ fontSize: 13, color: "var(--am-muted)", marginTop: 4 }}>
                      {photoFile
                        ? `${photoFile.name} • ${(photoFile.size / (1024 * 1024)).toFixed(2)} MB`
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
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                    onChange={handlePhotoChange}
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

            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(v) => {
                setFormData({ ...formData, name: v });
                setErrors((p) => ({ ...p, name: "" }));
              }}
              required
              error={errors.name}
            />

            <DropdownSelect
              label="Gender"
              value={formData.gender}
              options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]}
              onChange={(v) => setFormData({ ...formData, gender: v })}
            />

            <EditableDropdown
              label="District"
              value={formData.district}
              options={combinedDistricts}
              placeholder="Select your district..."
              category="locationPreferences"
              onCustomAdded={fetchDynamicDropdowns}
              onChange={(v) => {
                setFormData({ ...formData, district: v });
                setErrors((p) => ({ ...p, district: "" }));
              }}
              required
              error={errors.district}
            />

            <DropdownSelect
              label="Are you a member of solidarity moment ?"
              value={formData.solidarityMember}
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
                { value: "Interested in Join", label: "Interested in Join" },
              ]}
              onChange={(v) => setFormData({ ...formData, solidarityMember: v, symMemberStatus: v })}
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
              onChange={(v) => {
                setFormData({ ...formData, designation: v });
                setErrors((p) => ({ ...p, designation: "" }));
              }}
            />

            {/* Experience Spinner & Input Wrapper */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Years of Experience <span className={styles.required}>*</span></label>
              <div className={`${styles.spinnerWrapper} ${errors.workExp ? styles.edFieldError : ""}`}>
                <button
                  type="button"
                  tabIndex={-1}
                  className={styles.spinBtn}
                  onClick={() => handleWorkExpChange(-1)}
                  disabled={formData.workExp !== "" && parseFloat(formData.workExp) <= 0}
                >
                  −
                </button>
                <input
                  type="number"
                  value={formData.workExp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData({ ...formData, workExp: val });
                    setErrors((p) => ({ ...p, workExp: "" }));
                    sessionStorage.setItem("onboarding_workExp", val);
                  }}
                  className={styles.spinnerValue}
                  style={{ border: "none", outline: "none", background: "transparent", width: "100%", textAlign: "center" }}
                  placeholder="0"
                  min="0"
                  max="50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className={styles.spinBtn}
                  onClick={() => handleWorkExpChange(1)}
                  disabled={formData.workExp !== "" && parseFloat(formData.workExp) >= 50}
                >
                  +
                </button>
              </div>
              {errors.workExp && <p className={styles.edErrorText}>{errors.workExp}</p>}
            </div>

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
                setFormData({
                  ...formData,
                  preferredJobRole_Sector: arr,
                  careerProfile: { ...formData.careerProfile, role: arr }
                });
                setErrors((p) => ({ ...p, role: "" }));
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
              onChange={(v) => {
                setFormData({ ...formData, careerProfile: { ...formData.careerProfile, industry: v } });
                setErrors((p) => ({ ...p, industry: "" }));
              }}
            />

            <EditableDropdown
              label="Location Preference"
              required
              error={errors.location}
              value={formData.careerProfile.location}
              options={combinedDistricts}
              placeholder="Select your preferred district..."
              category="locationPreferences"
              onCustomAdded={fetchDynamicDropdowns}
              onChange={(v) => {
                setFormData({ ...formData, careerProfile: { ...formData.careerProfile, location: v } });
                setErrors((p) => ({ ...p, location: "" }));
              }}
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
                setErrors((prev) => ({ ...prev, linkedinUrl: "" }));
              }}
              placeholder="https://linkedin.com/in/your-profile"
              required
              error={errors.linkedinUrl}
            />

            <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
              <TagInputField
                label="Skills"
                value={formData.skills || []}
                placeholder="Type a skill (e.g. React, Java, Python) and press Enter"
                onChange={(next) => setFormData((p) => ({ ...p, skills: next }))}
              />
            </div>

            {/* Experience list section */}
            <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
              <div className={styles.sectionHeader} style={{ marginTop: 6 }}>
                <h3 style={{ margin: 0 }}>Experience Details</h3>
                <button type="button" className={styles.miniBtn} onClick={addExperience}>
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
                  No experience details added yet. Click <b>+ Add Experience</b>.
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
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontWeight: 900 }}>Experience #{idx + 1}</div>
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {!exp.currentlyWorking && (
                            <CertifiedDateSelect
                              label="End Date"
                              value={exp?.endDate || ""}
                              onChange={(v) => updateExperience(idx, "endDate", v)}
                            />
                          )}
                          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: exp.currentlyWorking ? 32 : 0, fontWeight: 700, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={exp?.currentlyWorking || false}
                              onChange={(e) => {
                                updateExperience(idx, "currentlyWorking", e.target.checked);
                                if (e.target.checked) updateExperience(idx, "endDate", "");
                              }}
                              style={{ width: 18, height: 18, cursor: "pointer" }}
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
              </div>

              {formData.resumeLink ? (
                <div className={styles.resumeStatusCard}>
                  <span className={styles.resumeStatusIcon}>📄</span>
                  <div>
                    <p className={styles.resumeStatusTitle}>Resume uploaded successfully</p>
                    <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer" className={styles.resumeStatusLink}>
                      View uploaded resume ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    border: "1.5px solid var(--am-danger)",
                    background: "var(--am-soft)",
                    padding: 16,
                    color: "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  ⚠️ Resume was not found. Please click back to Step 1 and upload your resume.
                </div>
              )}
              {errors.resume && (
                <p style={{ color: "#ef4444", marginTop: 10, fontWeight: 800 }}>{errors.resume}</p>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <EditableDropdown
                label="Degree"
                required
                value={formData.highest_education || ""}
                options={DEGREE_OPTIONS}
                placeholder="Select or enter your degree..."
                error={errors.degree}
                onChange={(val) => {
                  setFormData((p) => ({ ...p, highest_education: val }));
                  setErrors((p) => ({ ...p, degree: "" }));
                }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <EditableDropdown
                label="Branch"
                required
                value={formData.branch || ""}
                options={BRANCH_OPTIONS}
                placeholder="Select or enter your branch..."
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
                onChange={(val) => setFormData((p) => ({ ...p, educationStatus: val }))}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <YearPicker
                label="Pass-out Year"
                value={formData.passOutYear || ""}
                placeholder="YYYY"
                onChange={(val) => setFormData((p) => ({ ...p, passOutYear: val }))}
              />
            </div>
          </div>
        )}

        {activeTab === "cert" && (
          <div>
            <div className={styles.sectionHeader} style={{ marginTop: 6 }}>
              <h3 style={{ margin: 0 }}>Certificate Details</h3>
              <button type="button" className={styles.miniBtn} onClick={addCertificate}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontWeight: 900 }}>Certificate #{idx + 1}</div>
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
                        onChange={(v) => updateCertificate(idx, "certifiedDate", v)}
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
              onChange={(v) => {
                setFormData({ ...formData, email: v });
                setErrors((p) => ({ ...p, email: "" }));
              }}
              required
              error={errors.email}
            />

            <FormInput
              label="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleMobileChange}
              required
              placeholder="10 digit number"
              error={errors.mobileNumber}
            />

            <DateSelect
              label="Date of Birth"
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
              onChange={(v) => setFormData({ ...formData, maritalStatus: v })}
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
              onChange={(next) => setFormData((p) => ({ ...p, languages: next }))}
            />
          </div>
        )}

        {uploadProgress > 0 && (
          <p style={{ textAlign: "center", color: "var(--ps-primary)", marginTop: 10, fontWeight: 800, fontSize: "0.9rem" }}>
            Uploading Profile Image: {uploadProgress}%
          </p>
        )}

        <div className={styles.formStepActions}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← Back
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? "Saving…" : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormStep;
