import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, ChevronDown, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import DateSelect from "../../components/UI/DateSelect";
import API from "../../axios";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import styles from "./AddModel.module.scss";
import { useAuth } from "../../context/AuthContext";

const initialState = {
  name: "",
  mobileNumber: "",
  email: "",
  gender: "",
  dateOfBirth: null,
  memberType: "Mentor",
  currentInstitutionOrCompany: "",
  designation: "",
  fieldofStudy_Interest: "",
  workExp: "",
  district: "",
  skills: [],
};

const KARNATAKA_DISTRICTS = [
  "Bagalkote",
  "Ballari (Bellary)",
  "Belagavi (Belgaum)",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi (Gulbarga)",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru (Mysore)",
  "Raichur",
  "Ramanagara",
  "Shivamogga (Shimoga)",
  "Tumakuru (Tumkur)",
  "Udupi",
  "Uttara Kannada (Karwar)",
  "Vijayanagara",
  "Vijayapura (Bijapur)",
  "Yadgir",
];

function EditableDropdown({
  label,
  value,
  options,
  placeholder = "Select or type...",
  required = false,
  error = "",
  onChange,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

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

  const commit = (val) => {
    const v = String(val || "").trim();
    onChange(v);
    setQuery(v);
    setOpen(false);
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
                    className={`${styles.edItem} ${norm(opt) === norm(value) ? styles.edItemActive : ""
                      }`}
                    onClick={() => commit(opt)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.edTip}>
              <span>
                Tip: Type to search. If custom, type it and press <b>Enter</b>.
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

function MultiValueInput({ 
  label, 
  value = [], 
  options = [], 
  onChange, 
  placeholder = "Type and press Enter", 
  required = false, 
  error = "",
  onCustomAdded
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addTag = (tagVal) => {
    const v = String(tagVal || inputValue || "").trim();
    if (!v) return;

    const exists = value.some(
      (x) => String(x).toLowerCase() === v.toLowerCase()
    );
    if (!exists) {
      onChange([...value, v]);
      if (onCustomAdded && !options.some(opt => String(opt).toLowerCase() === v.toLowerCase())) {
        onCustomAdded(v);
      }
    }
    setInputValue("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
    if (e.key === "Escape") setOpen(false);
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const toggleOption = (opt) => {
    const exists = value.some(
      (x) => String(x).toLowerCase() === String(opt).toLowerCase()
    );
    if (exists) {
      onChange(value.filter((t) => String(t).toLowerCase() !== String(opt).toLowerCase()));
    } else {
      onChange([...value, opt]);
    }
    setInputValue("");
    setOpen(false);
  };

  const norm = (s) => String(s || "").toLowerCase().trim();

  const filteredOptions = (options || []).filter((opt) => {
    if (!inputValue) return true;
    return norm(opt).includes(norm(inputValue));
  });

  return (
    <div ref={wrapRef} className={styles.edWrap} style={{ position: 'relative' }}>
      <label className={styles.edLabel}>
        {label} {required && <span className={styles.edReq}>*</span>}
      </label>
      <div className={styles.edControl}>
        <div
          className={`${styles.edField} ${error ? styles.edFieldError : ""}`}
          style={{ height: 'auto', minHeight: '48px', flexWrap: 'wrap', padding: '6px 16px', gap: '8px', alignItems: 'center', cursor: 'text', position: 'relative' }}
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          {value.map((tag, index) => (
            <span key={index} style={{ background: '#f1f5f9', color: '#334155', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
              {tag}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: '#64748b' }}>
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className={styles.edInput}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            style={{ flex: 1, minWidth: '120px', padding: '0', height: 'auto', border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none' }}
          />

          {options && options.length > 0 && (
            <button
              type="button"
              className={styles.edBtn}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((p) => !p);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: 0 }}
            >
              <ChevronDown size={18} />
            </button>
          )}
        </div>

        {open && options && options.length > 0 && (
          <div className={styles.edMenu} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100 }}>
            {filteredOptions.length === 0 ? (
              <div className={styles.edEmpty}>
                No matches. Press <b>Enter</b> to add: “{inputValue}”
              </div>
            ) : (
              <div className={styles.edMenuList} style={{ maxHeight: 200, overflowY: 'auto' }}>
                {filteredOptions.map((opt) => {
                  const isSel = value.some((x) => norm(x) === norm(opt));
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.edItem} ${isSel ? styles.edItemActive : ""}`}
                      onClick={() => toggleOption(opt)}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.edTip}>
              <span>Tip: Type to search. Press <b>Enter</b> to add custom values.</span>
            </div>
          </div>
        )}
      </div>
      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
}

function AddMentor({ onSuccess, isEditing, editData, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const [existingDomains, setExistingDomains] = useState([]);
  const [existingSkills, setExistingSkills] = useState([]);

  const fetchDomainsAndSkills = async () => {
    try {
      const res = await API.get("/member");
      const members = res.data || [];
      const mentorsList = members.filter(
        (m) => String(m.memberType || "").toLowerCase() === "mentor"
      );

      // Extract unique domains (fieldofStudy_Interest)
      const domainSet = new Set();
      mentorsList.forEach((m) => {
        if (m.fieldofStudy_Interest) {
          m.fieldofStudy_Interest.split(",").forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) domainSet.add(trimmed);
          });
        }
      });
      setExistingDomains(Array.from(domainSet).sort());

      // Extract unique skills
      const skillSet = new Set();
      mentorsList.forEach((m) => {
        if (Array.isArray(m.skills)) {
          m.skills.forEach((skill) => {
            const trimmed = String(skill || "").trim();
            if (trimmed) skillSet.add(trimmed);
          });
        }
      });
      setExistingSkills(Array.from(skillSet).sort());
    } catch (err) {
      console.error("Failed to fetch domains/skills from mentors:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDomainsAndSkills();
    }
  }, [isOpen]);

  const saveCustomDomain = () => {};
  const saveCustomSkill = () => {};

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (isEditing && editData) {
      setFormData({
        ...initialState,
        ...editData,
        dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth) : null,
      });
      setErrors({});
      setIsOpen(true);
    }
  }, [isEditing, editData]);

  const toggleModal = () => {
    if (isEditing && onClose) {
      onClose();
    } else {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFormData(initialState);
        setErrors({});
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (formData.mobileNumber?.trim() && formData.mobileNumber.replace(/\D/g, '').length !== 10) {
      newErrors.mobileNumber = "Mobile Number must be exactly 10 digits";
    }

    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.currentInstitutionOrCompany?.trim()) {
      newErrors.currentInstitutionOrCompany = "Current Institution/Company is required";
    }

    if (!formData.designation?.trim()) {
      newErrors.designation = "Job Designation is required";
    }

    if (!formData.fieldofStudy_Interest?.trim()) {
      newErrors.fieldofStudy_Interest = "Domain is required";
    }

    if (!formData.workExp?.trim()) {
      newErrors.workExp = "Years of Experience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;

    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    setBtnLoading(true);

    try {
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString().split("T")[0]
          : null,
      };

      let res;
      if (isEditing) {
        res = await API.put(`/member/${editData._id}`, payload);
        alert("Profile Updated Successfully");
      } else {
        res = await API.post("/member", payload);
      }

      if (onSuccess) onSuccess(res.data);
      toggleModal();
    } catch (err) {
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      {user?.role === "Admin" && !isEditing && (
        <button
          onClick={toggleModal}
          style={{
            background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(225, 29, 72, 0.2)",
          }}
        >
          <UserPlus size={18} />
          Add Mentor
        </button>
      )}

      {isOpen && createPortal(
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>{isEditing ? "Update Mentor Profile" : "Register New Mentor"}</h2>
              <button onClick={toggleModal} className={styles.closeButton} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <FormInput
                  label="Full Name "
                  value={formData.name}
                  onChange={(v) => {
                    setFormData({ ...formData, name: v });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  required
                  error={errors.name}
                />

                <FormInput
                  label="Email Address "
                  type="email"
                  value={formData.email}
                  onChange={(v) => {
                    setFormData({ ...formData, email: v });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  error={errors.email}
                />

                <FormInput
                  label="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(v) => {
                    const cleaned = v.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobileNumber: cleaned });
                    if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: "" });
                  }}
                  placeholder="9876543210"
                  error={errors.mobileNumber}
                />

                <DropdownSelect
                  label="Gender"
                  value={formData.gender}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  onChange={(v) => setFormData({ ...formData, gender: v })}
                />

                <DateSelect
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                />

                <EditableDropdown
                  label="Location (District)"
                  value={formData.district}
                  options={KARNATAKA_DISTRICTS}
                  placeholder="Select your district..."
                  onChange={(v) => setFormData({ ...formData, district: v })}
                />

                <FormInput
                  label="Current Institution/Company"
                  value={formData.currentInstitutionOrCompany}
                  onChange={(v) => {
                    setFormData({ ...formData, currentInstitutionOrCompany: v });
                    if (errors.currentInstitutionOrCompany) {
                      setErrors({ ...errors, currentInstitutionOrCompany: "" });
                    }
                  }}
                  required
                  error={errors.currentInstitutionOrCompany}
                />

                <FormInput
                  label="Job Designation"
                  value={formData.designation}
                  onChange={(v) => {
                    setFormData({ ...formData, designation: v });
                    if (errors.designation) setErrors({ ...errors, designation: "" });
                  }}
                  required
                  error={errors.designation}
                />

                <MultiValueInput
                  label="Domain"
                  value={formData.fieldofStudy_Interest ? formData.fieldofStudy_Interest.split(",").map(s => s.trim()).filter(Boolean) : []}
                  options={existingDomains}
                  onChange={(v) => {
                    setFormData({ ...formData, fieldofStudy_Interest: v.join(", ") });
                    if (errors.fieldofStudy_Interest) {
                      setErrors({ ...errors, fieldofStudy_Interest: "" });
                    }
                  }}
                  onCustomAdded={saveCustomDomain}
                  required
                  error={errors.fieldofStudy_Interest}
                  placeholder="e.g. Technology, AI (press Enter)"
                />

                <FormInput
                  label="Years of Experience"
                  value={formData.workExp}
                  onChange={(v) => {
                    setFormData({ ...formData, workExp: v });
                    if (errors.workExp) setErrors({ ...errors, workExp: "" });
                  }}
                  required
                  error={errors.workExp}
                />

                <MultiValueInput
                  label="Skills"
                  value={formData.skills || []}
                  options={existingSkills}
                  onChange={(v) => setFormData({ ...formData, skills: v })}
                  onCustomAdded={saveCustomSkill}
                  placeholder="e.g. React, Node.js (press Enter)"
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={toggleModal}
                  className={styles.cancelButton}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className={styles.submitButton}
                >
                  {btnLoading
                    ? "Processing..."
                    : isEditing
                      ? "Update Profile"
                      : "Create Mentor"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default AddMentor;