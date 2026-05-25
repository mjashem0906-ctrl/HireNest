import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Search,
  CalendarDays,
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
  symMemberStatus: "Active",
  currentInstitutionOrCompany: "",
  designation: "",
  workExp: "",
  fieldofStudy_Interest: "",
  seekerNeed: "",
  highest_education: "",
  branch: "",
  passOutYear: "",
  preferredJobRole_Sector: "",
  relocationStatus: "",
  preferredJobLocation: "",
  photoUrl: "",
  resumeLink: "",
  careerProfile: {
    location: "",
    role: "",
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
  "Bagalkote", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
  "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu",
  "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
  "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayanagara", "Vijayapura (Bijapur)", "Yadgir",
];

const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
  "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai",
  "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
  "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
  "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
];

const DESIRED_ROLES_OPTIONS = [
  "Software Engineer", "Senior Software Engineer", "Tech Lead", "Product Manager",
  "Data Scientist", "Data Analyst", "DevOps Engineer", "Cloud Architect", "Frontend Developer",
  "Backend Developer", "Full Stack Developer", "Mobile Developer", "QA Engineer",
  "Business Analyst", "Consultant", "Manager", "Director", "Analyst", "Intern", "Graduate Trainee",
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
  onCustomAdded = () => {},
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
          <span style={{ marginLeft: 6, fontSize: 11, color: "#2563eb", fontWeight: 600 }}>
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
                  className={`${styles.edItem} ${
                    String(value) === y ? styles.edItemActive : ""
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
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.25)",
                  color: "#1e40af",
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
                    color: "#1e40af",
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
                        <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px" }}>✓</span>
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
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  
  const [dynamicDistricts, setDynamicDistricts] = useState([]);
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [dynamicIndustries, setDynamicIndustries] = useState([]);

  const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });
  const [errors, setErrors] = useState({ resume: "", degree: "", branch: "", photo: "", designation: "", workExp: "", role: "", industry: "", location: "" });

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
        branch: editMember.branch || "",
        passOutYear: editMember.passOutYear || "",
        dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
        linkedinUrl: editMember.linkedinUrl || "",
        careerProfile: {
          ...initialState.careerProfile,
          ...(editMember.careerProfile || {}),
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
  }, [editMember, isOpen, preSelectedMemberType]);

  const photoPreviewUrl = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); };
  }, [photoPreviewUrl]);

  const handleMobileChange = (val) => val.replace(/\D/g, "").slice(0, 10);

  const combinedDistricts = [...new Set([...KARNATAKA_DISTRICTS, ...TAMIL_NADU_DISTRICTS, ...dynamicDistricts])].sort();
  const combinedRoles = [...new Set([...DESIRED_ROLES_OPTIONS, ...dynamicRoles])].sort();
  const combinedIndustries = [...new Set([...INDUSTRY_OPTIONS, ...dynamicIndustries])].sort();

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
    const nextErrors = { ...errors, designation: "", workExp: "", role: "", industry: "", location: "" };
    let hasError = false;

    if (!String(formData.designation || "").trim()) {
      nextErrors.designation = "Designation is required.";
      hasError = true;
    }
    if (!String(formData.workExp || "").trim()) {
      nextErrors.workExp = "Experience is required.";
      hasError = true;
    }
    if (!String(formData.careerProfile?.role || "").trim()) {
      nextErrors.role = "Desired Role is required.";
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

  const clearSelectedPhoto = () => { 
    setPhotoFile(null); 
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
      if (photoFile) { 
        photo = await uploadToServer(photoFile, "photo"); 
      } 
      
      let resume = formData.resumeLink; 
      if (resumeFile) { 
        resume = await uploadToServer(resumeFile, "resume"); 
      } 
      
      const payload = { 
        ...formData, 
        photoUrl: photo, 
        resumeLink: resume, 
        branch: String(formData.branch || "").trim(), 
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
          {activeTab === "basic" && (
            <div className={styles.formGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                      ? "1px solid rgba(239,68,68,0.55)"
                      : "1px solid rgba(148,163,184,0.25)",
                    background: "rgba(148,163,184,0.07)",
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
                          : "rgba(59,130,246,0.12)",
                        border: photoFile
                          ? "1px solid rgba(34,197,94,0.25)"
                          : "1px solid rgba(59,130,246,0.25)",
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
                              color: "#2563eb",
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

                        setPhotoFile(file);
                        setErrors((p) => ({ ...p, photo: "" }));
                        setUploadProgress((p) => ({ ...p, photo: 0 }));
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 10px 18px rgba(37,99,235,0.18)",
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
                          border: "1px solid rgba(148,163,184,0.35)",
                          background: "transparent",
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
                onChange={(v) => setFormData({ ...formData, district: v })}
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

              <EditableDropdown
                label="Desired Role"
                required
                error={errors.role}
                value={formData.careerProfile.role}
                options={combinedRoles}
                placeholder="Select or type desired role..."
                category="desiredRoles"
                onCustomAdded={fetchDynamicDropdowns}
                onChange={(v) => { setFormData({ ...formData, careerProfile: { ...formData.careerProfile, role: v }}); setErrors(p => ({ ...p, role: "" })); }}
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
                onChange={(v) => { setFormData({ ...formData, careerProfile: { ...formData.careerProfile, industry: v }}); setErrors(p => ({ ...p, industry: "" })); }}
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
                onChange={(v) => { setFormData({ ...formData, careerProfile: { ...formData.careerProfile, location: v }}); setErrors(p => ({ ...p, location: "" })); }}
              />

              <FormInput
                label="Expected Salary"
                type="number"
                value={formData.careerProfile.expectedSalary}
                onChange={(v) => {
                  const numValue = String(v).replace(/[^0-9]/g, "");
                  setFormData({ ...formData, careerProfile: { ...formData.careerProfile, expectedSalary: numValue }});
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
                onChange={(v) => setFormData({ ...formData, linkedinUrl: v })}
                placeholder="https://linkedin.com/in/your-profile"
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
                      border: "1px dashed rgba(148,163,184,0.45)",
                      color: "rgba(100,116,139,1)",
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
                          border: "1px solid rgba(148,163,184,0.25)",
                          background: "rgba(148,163,184,0.05)",
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
                      ? "1px solid rgba(239,68,68,0.55)"
                      : "1px solid rgba(148,163,184,0.25)",
                    background: "rgba(148,163,184,0.07)",
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
                        background: resumeFile
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(59,130,246,0.12)",
                        border: resumeFile
                          ? "1px solid rgba(34,197,94,0.25)"
                          : "1px solid rgba(59,130,246,0.25)",
                      }}
                    >
                      {resumeFile ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <UploadCloud size={20} />
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {resumeFile ? "Resume selected" : "Upload your resume"}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(100,116,139,1)",
                          marginTop: 4,
                        }}
                      >
                        {resumeFile
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
                              color: "#2563eb",
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
                      onChange={(e) => {
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

                        setResumeFile(file);
                        setErrors((p) => ({ ...p, resume: "" }));
                        setUploadProgress((p) => ({ ...p, resume: 0 }));
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 10px 18px rgba(37,99,235,0.18)",
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
                          border: "1px solid rgba(148,163,184,0.35)",
                          background: "transparent",
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
                  label="Degree"
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
                  label="Branch"
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
                    border: "1px dashed rgba(148,163,184,0.45)",
                    color: "rgba(100,116,139,1)",
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
                        border: "1px solid rgba(148,163,184,0.25)",
                        background: "rgba(148,163,184,0.05)",
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
                value={formData.fatherName || formData.fathersName}
                onChange={(v) => setFormData({ ...formData, fatherName: v })}
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