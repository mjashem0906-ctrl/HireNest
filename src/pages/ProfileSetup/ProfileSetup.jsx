import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import DateSelect from "../../components/UI/DateSelect";
import styles from "./ProfileSetup.module.scss";

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

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode",
  "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
];

const DEGREE_OPTIONS = [
  "SSLC / 10th", "PUC / 12th", "ITI", "Diploma (Polytechnic)", "B.A", "B.Com", "B.Sc",
  "B.B.A", "B.C.A", "B.S.W", "B.Voc", "B.E", "B.Tech", "B.Arch", "LLB", "BBA LLB",
  "BA LLB", "B.Pharm", "D.Pharm", "BPT", "BDS", "MBBS", "BAMS", "BHMS", "M.A",
  "M.Com", "M.Sc", "M.S.W", "M.B.A", "M.C.A", "M.Tech", "M.E", "LLM", "M.Pharm",
  "MPT", "MD", "MS", "PhD", "Post Graduate Diploma (PGD)", "Certification Course",
];

const JOB_ROLE_OPTIONS = [
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
  "Content Creator",
  "Content Writer",
  "Customer Support Executive",
  "Data Analyst",
  "Data Entry Operator",
  "Data Scientist",
  "Delivery Partner",
  "DevOps Engineer",
  "Digital Marketing Specialist",
  "Electrical Engineer",
  "Electronics Engineer",
  "Financial Analyst",
  "Frontend Developer",
  "Full Stack Developer",
  "Graphic Designer",
  "Graduate Trainee",
  "HR Generalist",
  "HR Recruiter",
  "IT Support / Helpdesk",
  "Mechanical Engineer",
  "Mobile App Developer",
  "Network Engineer",
  "Office Administrator",
  "Operations Executive",
  "Product Manager",
  "Project Manager",
  "QA / Testing Engineer",
  "Sales Executive",
  "Software Engineer",
  "System Administrator",
  "Teacher / Lecturer",
  "Telecaller",
  "Trainer",
  "UI/UX Designer",
  "Web Designer"
];

function EducationDropdown({ value, onChange }) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

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
  const filtered = DEGREE_OPTIONS.filter((opt) => norm(opt).includes(norm(query)));

  const commit = (val) => {
    const v = String(val || "").trim();
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.fieldLabel}>Highest Education</label>
      <div
        className={styles.edField}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
      >
        <span className={styles.edIcon}>🎓</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
          placeholder="Type to search or enter your degree..."
          className={styles.edInput}
          onFocus={() => setOpen(true)}
          onBlur={() => { const v = query.trim(); if (v && v !== value) commit(v); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(query); }
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <button
          type="button"
          className={styles.edBtn}
          onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 0); }}
        >
          ▾
        </button>
      </div>
      {open && (
        <div className={styles.edMenu}>
          {filtered.length === 0 ? (
            <div className={styles.edEmpty}>No matches — press <b>Enter</b> to use: "{query}"</div>
          ) : (
            <div className={styles.edMenuList}>
              {filtered.map((opt) => (
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
          <div className={styles.edTip}>Tip: Type to search. If custom, type it and press <b>Enter</b>.</div>
        </div>
      )}
    </div>
  );
}

function JobRoleDropdown({ value = [], options = [], onChange }) {
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
  const filtered = options.filter((opt) => norm(opt).includes(norm(query)));

  const toggleOption = (opt) => {
    const already = selected.some((s) => norm(s) === norm(opt));
    const next = already
      ? selected.filter((s) => norm(s) !== norm(opt))
      : [...selected, opt];
    onChange(next);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeTag = (opt, e) => {
    e.stopPropagation();
    onChange(selected.filter((s) => norm(s) !== norm(opt)));
  };

  return (
    <div ref={wrapRef} className={styles.jrWrap}>
      <label className={styles.fieldLabel}>
        Preferred Job Role
        {selected.length > 0 && (
          <span className={styles.jrBadge}>{selected.length}</span>
        )}
      </label>

      {/* Main control box */}
      <div
        className={`${styles.jrBox} ${open ? styles.jrBoxOpen : ""}`}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
      >
        {/* Tags row */}
        {selected.length > 0 && (
          <div className={styles.jrTags}>
            {selected.map((tag) => (
              <span key={tag} className={styles.jrTag}>
                <span className={styles.jrTagText}>{tag}</span>
                <button
                  type="button"
                  className={styles.jrTagX}
                  onClick={(e) => removeTag(tag, e)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search row */}
        <div className={styles.jrInputRow}>
          <span className={styles.jrIcon}>💼</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder={selected.length === 0 ? "Search or select job roles…" : "Add more roles…"}
            className={styles.jrInput}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setOpen(false); setQuery(""); }
              if (e.key === "Backspace" && query === "" && selected.length > 0) {
                onChange(selected.slice(0, -1));
              }
            }}
          />
          <span className={`${styles.jrChevron} ${open ? styles.jrChevronUp : ""}`}>
            ▾
          </span>
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className={styles.jrMenu}>
          {/* Search summary */}
          {query && (
            <div className={styles.jrSearchHint}>
              Searching: <strong>{query}</strong> — {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className={styles.jrEmpty}>
              <span>🔍</span>
              <span>No roles found for "<strong>{query}</strong>"</span>
            </div>
          ) : (
            <div className={styles.jrList}>
              {filtered.map((opt) => {
                const isSelected = selected.some((s) => norm(s) === norm(opt));
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.jrItem} ${isSelected ? styles.jrItemOn : ""}`}
                    onClick={() => toggleOption(opt)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className={`${styles.jrCheckbox} ${isSelected ? styles.jrCheckboxOn : ""}`}>
                      {isSelected && <span className={styles.jrTick}>✓</span>}
                    </span>
                    <span className={styles.jrItemLabel}>{opt}</span>
                    {isSelected && <span className={styles.jrItemBadge}>Selected</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className={styles.jrFooter}>
            {selected.length > 0 ? (
              <>
                <span className={styles.jrFooterCount}>
                  ✔ {selected.length} role{selected.length > 1 ? "s" : ""} selected
                </span>
                <button
                  type="button"
                  className={styles.jrClearAll}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
              </>
            ) : (
              <span className={styles.jrFooterHint}>Click a role to select it</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


const ProfileSetup = () => {
  const { user, login, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("Job"); // Default to Job Seeker — skip role selection for Google users
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: null,
    district: "",
    currentInstitutionOrCompany: "",
    designation: "",
    fieldofStudy_Interest: "",
    workExp: "",
    highest_education: "",
    preferredJobRole_Sector: [],
    employmentType: "",
    noticePeriod: "",
    linkedinUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [dynamicDistricts, setDynamicDistricts] = useState([]);
  const [dynamicRoles, setDynamicRoles] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await API.get("/dropdown?category=locationPreferences");
        const fetchedLocs = Array.isArray(res.data)
          ? res.data.map((item) => typeof item === 'object' ? item.value : item)
          : [];
        setDynamicDistricts(fetchedLocs);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }

      try {
        const res = await API.get("/dropdown?category=desiredRoles");
        const fetchedRoles = Array.isArray(res.data)
          ? res.data.map((item) => typeof item === 'object' ? item.value : item)
          : [];
        setDynamicRoles(fetchedRoles);
      } catch (err) {
        console.error("Failed to fetch preferred job roles:", err);
      }
    };
    fetchDropdownData();
  }, []);

  const combinedDistricts = [...new Set([
    ...KARNATAKA_DISTRICTS,
    ...TAMIL_NADU_DISTRICTS,
    ...KERALA_DISTRICTS,
    ...dynamicDistricts
  ])].sort().map(d => ({ value: d, label: d }));

  const combinedRoles = [...new Set([
    ...JOB_ROLE_OPTIONS,
    ...dynamicRoles
  ])].sort();

  // Server upload function (replaces Cloudinary)
  const uploadToServer = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    const res = await API.post("/api/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      },
    });
    return res.data.url;
  };

  const handleMobileChange = (v) => {
    // Allow only digits, max 10
    const digits = v.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, mobileNumber: digits });
  };

  const handleWorkExpChange = (delta) => {
    if (formData.workExp === "") {
      if (delta > 0) {
        setFormData({ ...formData, workExp: "1" });
      } else {
        setFormData({ ...formData, workExp: "0" });
      }
      return;
    }
    const current = parseInt(formData.workExp) || 0;
    const next = Math.max(0, Math.min(50, current + delta));
    setFormData({ ...formData, workExp: String(next) });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) {
      if (type === 'photo') { setPhotoFile(null); setPhotoPreview(null); }
      if (type === 'resume') setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = null;
      if (type === 'photo') { setPhotoFile(null); setPhotoPreview(null); }
      if (type === 'resume') setResumeFile(null);
      return;
    }

    if (type === 'photo') {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else if (type === 'resume') {
      setResumeFile(file);
    }
  };

  const calculateCompletion = () => {
    if (!role) return 0;
    const mentorFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'district', 'currentInstitutionOrCompany', 'designation', 'fieldofStudy_Interest', 'workExp', 'photoUrl', 'resumeLink', 'linkedinUrl'];
    const jobFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'district', 'highest_education', 'fieldofStudy_Interest', 'preferredJobRole_Sector', 'employmentType', 'noticePeriod', 'workExp', 'photoUrl', 'resumeLink', 'linkedinUrl'];
    const fieldsToTrack = role === 'Mentor' ? mentorFields : jobFields;
    const completedFields = fieldsToTrack.filter(field => {
      if (field === 'photoUrl') return !!photoFile;
      if (field === 'resumeLink') return !!resumeFile;
      if (Array.isArray(formData[field])) return formData[field].length > 0;
      return formData[field] && String(formData[field]).length > 0;
    });
    return Math.round((completedFields.length / fieldsToTrack.length) * 100);
  };

  const completion = calculateCompletion();

  const handleSave = async () => {
    if (!photoFile || !resumeFile) {
      alert("Profile Photo and Resume are mandatory. Please upload them.");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = "";
      let resumeLink = "";

      if (photoFile) photoUrl = await uploadToServer(photoFile);
      if (resumeFile) resumeLink = await uploadToServer(resumeFile);

      const res = await API.post("/auth/update-profile", {
        role,
        profileData: {
          ...formData,
          photoUrl,
          resumeLink
        }
      });
      await fetchUser(); // Re-fetch fresh user data from server (new memberId, profileCompleted)
      setShowWhatsAppModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const isFresher = !formData.workExp || parseInt(formData.workExp) === 0;
  const whatsappLink = isFresher
    ? "https://chat.whatsapp.com/LPe6kC4RVjFFqX25uWCKA5"
    : "https://chat.whatsapp.com/G29SZJqIJzY1J8lAste193";

  const handleWhatsAppJoin = () => {
    window.open(whatsappLink, "_blank");
    navigate("/", { state: { isNew: true } });
  };

  const handleSkipWhatsApp = () => {
    setShowWhatsAppModal(false);
    navigate("/", { state: { isNew: true } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1>Complete Your Profile</h1>
        <div className={styles.titleAccent}></div>
        <p>Please provide your details to continue</p>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          <span>{completion}% Complete</span>
        </div>

        {!role ? (
          <div className={styles.roleSelection}>
            <h3>What is your role?</h3>
            <div className={styles.roleButtons}>
              <button onClick={() => setRole("Mentor")}>Mentor</button>
              <button onClick={() => setRole("Job")}>Job Seeker</button>
            </div>
          </div>
        ) : (
          <div className={styles.form}>

            <div className={styles.formGrid}>
              <FormInput
                label="Full Name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <FormInput
                label="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleMobileChange}
                type="tel"
                maxLength={10}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="10-digit number"
              />
              <DropdownSelect
                label="Gender"
                value={formData.gender}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                onChange={(v) => setFormData({ ...formData, gender: v })}
              />
              <DateSelect
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
              />
              <DropdownSelect
                label="District"
                value={formData.district}
                options={combinedDistricts}
                placeholder="Select your district"
                searchable={true}
                required={true}
                onChange={(v) => setFormData({ ...formData, district: v })}
              />

              {role === 'Mentor' ? (
                <>
                  <FormInput
                    label="Current Company / Institution"
                    value={formData.currentInstitutionOrCompany}
                    onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })}
                  />
                  <FormInput
                    label="Designation"
                    value={formData.designation}
                    onChange={(v) => setFormData({ ...formData, designation: v })}
                  />
                </>
              ) : (
                <>
                  <EducationDropdown
                    value={formData.highest_education}
                    onChange={(v) => setFormData({ ...formData, highest_education: v })}
                  />
                  <JobRoleDropdown
                    value={formData.preferredJobRole_Sector}
                    options={combinedRoles}
                    onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: Array.isArray(v) ? v : [v] })}
                  />
                </>
              )}

              <DropdownSelect
                label="Employment Type"
                value={formData.employmentType}
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                  { value: "Freelance", label: "Freelance" },
                  { value: "Internship", label: "Internship" },
                  { value: "Remote", label: "Remote" },
                  { value: "Contract", label: "Contract" },
                ]}
                onChange={(v) => setFormData({ ...formData, employmentType: v })}
              />
              <DropdownSelect
                label="Notice Period"
                value={formData.noticePeriod}
                options={[
                  { value: "Immediate", label: "Immediate" },
                  { value: "15 days", label: "15 days" },
                  { value: "30 days", label: "30 days" },
                  { value: "45 days", label: "45 days" },
                  { value: "60 days", label: "60 days" },
                  { value: "90 days", label: "90 days" },
                ]}
                onChange={(v) => setFormData({ ...formData, noticePeriod: v })}
              />
              <FormInput
                label="LinkedIn Profile URL"
                value={formData.linkedinUrl}
                onChange={(v) => setFormData({ ...formData, linkedinUrl: v })}
                placeholder="https://linkedin.com/in/your-profile"
              />

              <FormInput
                label="Field of Interest / Study"
                value={formData.fieldofStudy_Interest}
                onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })}
              />
              {/* Years of Experience — number spinner */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Years of Experience</label>
                <div className={styles.spinnerWrapper}>
                  <button
                    type="button"
                    className={styles.spinBtn}
                    onClick={() => handleWorkExpChange(-1)}
                    disabled={formData.workExp !== "" && parseInt(formData.workExp) <= 0}
                  >−</button>
                  <span className={styles.spinnerValue}>
                    {formData.workExp !== '' ? formData.workExp : '-'}
                  </span>
                  <button
                    type="button"
                    className={styles.spinBtn}
                    onClick={() => handleWorkExpChange(1)}
                    disabled={formData.workExp !== "" && parseInt(formData.workExp) >= 50}
                  >+</button>
                </div>
              </div>

              {/* Profile Photo Upload Card */}
              <div className={styles.uploadCard}>
                <label className={styles.fieldLabel}>Profile Photo <span className={styles.required}>*</span></label>
                <label className={styles.uploadZone} htmlFor="photoInput">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <span className={styles.uploadIcon}>📷</span>
                      <span className={styles.uploadText}>Click to upload photo</span>
                      <span className={styles.uploadHint}>JPG, PNG up to 5MB</span>
                    </div>
                  )}
                </label>
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  style={{ display: 'none' }}
                />
                {photoFile && (
                  <p className={styles.fileName}>✅ {photoFile.name}</p>
                )}
              </div>

              {/* Resume Upload Card */}
              <div className={styles.uploadCard}>
                <label className={styles.fieldLabel}>Resume (PDF/DOC) <span className={styles.required}>*</span></label>
                <label className={styles.uploadZone} htmlFor="resumeInput">
                  {resumeFile ? (
                    <div className={styles.resumePreview}>
                      <span className={styles.resumeIcon}>📄</span>
                      <span className={styles.resumeName}>{resumeFile.name}</span>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <span className={styles.uploadIcon}>📎</span>
                      <span className={styles.uploadText}>Click to upload resume</span>
                      <span className={styles.uploadHint}>PDF, DOC, DOCX up to 5MB</span>
                    </div>
                  )}
                </label>
                <input
                  id="resumeInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'resume')}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {uploadProgress > 0 && <p style={{ textAlign: "center", color: "var(--ps-primary)", marginTop: "10px", fontWeight: "800", fontSize: "0.9rem", letterSpacing: "0.02em" }}>Uploading: {uploadProgress}%</p>}

            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Group Invitation Modal */}
      {showWhatsAppModal && (
        <div className={styles.waOverlay} onClick={handleSkipWhatsApp}>
          <div className={styles.waModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.waGlow}></div>
            <div className={styles.waIconWrap}>
              <svg className={styles.waIcon} viewBox="0 0 24 24" fill="none">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366" />
              </svg>
            </div>
            <h2 className={styles.waTitle}>🎉 Profile Created!</h2>
            <p className={styles.waSubtitle}>
              Join our WhatsApp community for {isFresher ? "freshers" : "experienced professionals"} to get job updates, tips & networking opportunities.
            </p>
            <div className={styles.waGroupInfo}>
              <span className={styles.waGroupIcon}>👥</span>
              <div className={styles.waGroupText}>
                <span className={styles.waGroupName}>
                  {isFresher ? "JBNK Freshers Community" : "JBNK Experienced Professionals"}
                </span>
                <span className={styles.waGroupDesc}>
                  {isFresher ? "Entry-level jobs, career guidance & mentorship" : "Senior roles, referrals & industry insights"}
                </span>
              </div>
            </div>
            <button className={styles.waJoinBtn} onClick={handleWhatsAppJoin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Join WhatsApp Group
            </button>
            <button className={styles.waSkipBtn} onClick={handleSkipWhatsApp}>
              Skip for now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;
