import React, { useState, useRef, useEffect } from "react";
import { X, UserPlus, ChevronDown, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import API from "../../axios";
import styles from "./AddModel.module.scss";

const initialState = {
  name: "",
  mobileNumber: "",
  email: "",
  gender: "",
  age: "",
  memberType: "Referee",
  referrerStatus: "",
  referringOfferType: "",
  referringSector: "",
  referringFor: "",
  levelOfSupport: "",
  occupation: "",
  companyDetails: "",
  sector: "",
  jobOfferType: "",
  opportunityDescription: "",
  referrerContact: "",
  offer_Location: "",
  symMemberStatus: "Active",
  address: "",
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
                    className={`${styles.edItem} ${
                      norm(opt) === norm(value) ? styles.edItemActive : ""
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

function AddReferee({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [btnLoading, setBtnLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setFormData(initialState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;

    if (!formData.name?.trim()) {
      alert("Full Name is required.");
      return;
    }
    if (!formData.mobileNumber?.trim()) {
      alert("Mobile Number is required.");
      return;
    }
    if (!formData.referringSector?.trim()) {
      alert("Referring Sector is required.");
      return;
    }

    setBtnLoading(true);
    try {
      const res = await API.post("/member", formData);
      if (onSuccess) onSuccess(res.data);
      alert("Job Referee registered successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add referee.");
    } finally {
      setBtnLoading(false);
    }
  };

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "May be in Future", label: "May be in Future" },
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  return (
    <>
      <button
        onClick={toggleModal}
        style={{
          background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.2)",
        }}
      >
        <UserPlus size={18} />
        Add Job Referee
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Register Job Referee</h2>
              <button onClick={toggleModal} className={styles.closeButton} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.sectionTitle}>Personal Profile</div>

                <FormInput
                  label="Full Name "
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  required
                />
                <FormInput
                  label="Email ID"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                />
                <FormInput
                  label="Mobile Number "
                  value={formData.mobileNumber}
                  onChange={(v) => setFormData({ ...formData, mobileNumber: v })}
                  required
                />

                <div
                  className={styles.formGrid}
                  style={{ gridColumn: "span 1", gap: "15px" }}
                >
                  <FormInput
                    label="Age"
                    value={formData.age}
                    onChange={(v) => setFormData({ ...formData, age: v })}
                    type="number"
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
                </div>

                <div className={styles.sectionTitle}>Professional Info</div>

                <FormInput
                  label="Current Occupation"
                  value={formData.occupation}
                  onChange={(v) => setFormData({ ...formData, occupation: v })}
                />
                <FormInput
                  label="Company Details"
                  value={formData.companyDetails}
                  onChange={(v) => setFormData({ ...formData, companyDetails: v })}
                />
                <FormInput
                  label="Primary Industry/Sector"
                  value={formData.sector}
                  onChange={(v) => setFormData({ ...formData, sector: v })}
                />
                <DropdownSelect
                  label="Solidarity Status"
                  value={formData.symMemberStatus}
                  options={statusOptions}
                  onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
                />

                <div className={styles.sectionTitle}>Referral Context</div>

                <DropdownSelect
                  label="Referrer Eligibility"
                  value={formData.referrerStatus}
                  options={statusOptions}
                  onChange={(v) => setFormData({ ...formData, referrerStatus: v })}
                />
                <FormInput
                  label="Referring For (Role)"
                  value={formData.referringFor}
                  onChange={(v) => setFormData({ ...formData, referringFor: v })}
                />
                <FormInput
                  label="Referring Sector "
                  value={formData.referringSector}
                  onChange={(v) => setFormData({ ...formData, referringSector: v })}
                  required
                />
                <FormInput
                  label="Job Offer Type"
                  value={formData.jobOfferType}
                  onChange={(v) => setFormData({ ...formData, jobOfferType: v })}
                />
                <FormInput
                  label="Level of Support"
                  value={formData.levelOfSupport}
                  onChange={(v) => setFormData({ ...formData, levelOfSupport: v })}
                />
                <FormInput
                  label="Referrer Contact Ref"
                  value={formData.referrerContact}
                  onChange={(v) => setFormData({ ...formData, referrerContact: v })}
                />

                <div className={styles.sectionTitle}>Location Details</div>

                <EditableDropdown
                  label="District"
                  value={formData.district}
                  options={KARNATAKA_DISTRICTS}
                  placeholder="Select district..."
                  onChange={(v) => setFormData({ ...formData, district: v })}
                />

                <EditableDropdown
                  label="Offer Location"
                  value={formData.offer_Location}
                  options={KARNATAKA_DISTRICTS}
                  placeholder="Select offer location..."
                  onChange={(v) => setFormData({ ...formData, offer_Location: v })}
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormInput
                    label="Full Address"
                    value={formData.address}
                    onChange={(v) => setFormData({ ...formData, address: v })}
                  />
                </div>

                <div className={styles.sectionTitle}>Opportunity Description</div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormInput
                    label="Briefly describe the referral opportunity"
                    value={formData.opportunityDescription}
                    onChange={(v) =>
                      setFormData({ ...formData, opportunityDescription: v })
                    }
                    textarea
                    rows={3}
                  />
                </div>
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
                  onClick={handleSubmit}
                  disabled={btnLoading}
                  className={styles.submitButton}
                >
                  {btnLoading ? "Processing..." : "Confirm & Save Referee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddReferee;