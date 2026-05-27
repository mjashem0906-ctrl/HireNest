import React, { useState, useEffect, useRef } from "react";
import { X, UserPlus, ChevronDown, Search } from "lucide-react";
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

function AddMentor({ onSuccess, isEditing, editData, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  const { user } = useAuth();

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

    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (!/^[0-9+\s()-]{7,20}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
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

      {isOpen && (
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
                  label="Email Address"
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
                    setFormData({ ...formData, mobileNumber: v });
                    if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: "" });
                  }}
                  required
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

                <FormInput
                  label="Domain"
                  value={formData.fieldofStudy_Interest}
                  onChange={(v) => {
                    setFormData({ ...formData, fieldofStudy_Interest: v });
                    if (errors.fieldofStudy_Interest) {
                      setErrors({ ...errors, fieldofStudy_Interest: "" });
                    }
                  }}
                  required
                  error={errors.fieldofStudy_Interest}
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
        </div>
      )}
    </>
  );
}

export default AddMentor;