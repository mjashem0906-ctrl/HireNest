// //---------------------30/01----------12.48--------------------------

// import React, { useEffect, useState } from "react";
// import { X, UploadCloud, FileText } from "lucide-react";
// import axios from "axios";
// import FormInput from "../UI/FormInput";
// import DropdownSelect from "../UI/DropdownSelect";
// import DateSelect from "../UI/DateSelect";
// import API from "../../axios";
// import styles from "./AddModel.module.scss";

// const initialState = {
//   name: "",
//   fathersName: "",
//   mobileNumber: "",
//   email: "",
//   gender: "",
//   dateOfBirth: null,
//   district: "",
//   forGrouping: [],
//   memberType: "",
//   symMemberStatus: "Active",
//   currentInstitutionOrCompany: "",
//   designation: "",
//   workExp: "",
//   fieldofStudy_Interest: "",
//   seekerNeed: "",
//   highest_education: "",
//   preferredJobRole_Sector: "",
//   relocationStatus: "",
//   preferredJobLocation: "",
//   photoUrl: "",
//   resumeLink: "",
//   careerProfile: {
//     location: "",
//     role: "",
//     industry: "",
//     department: "",
//     employmentType: "",
//     expectedSalary: ""
//   },
//   certifications: [],
//   languages: [],
//   fatherName: "",
//   motherName: "",
//   hometown: "",
//   pincode: "",
//   passportNumber: "",
//   maritalStatus: "",
//   address: "",
//   occupation: "",
//   companyDetails: "",
// };

// function AddMember({
//   isOpen,
//   onClose,
//   editMember,
//   onSuccess,
//   preSelectedMemberType = null,
//   initialTab = "basic"
// }) {
//   const [formData, setFormData] = useState(initialState);
//   const [activeTab, setActiveTab] = useState(initialTab);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [resumeFile, setResumeFile] = useState(null);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });

//   useEffect(() => {
//     if (isOpen) setActiveTab(initialTab);
//   }, [isOpen, initialTab]);

//   useEffect(() => {
//     if (editMember) {
//       setFormData({
//         ...initialState,
//         ...editMember,
//         dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
//         careerProfile: editMember.careerProfile || initialState.careerProfile,
//         certifications: editMember.certifications || [],
//         languages: editMember.languages || [],
//       });
//     } else {
//       setFormData({
//         ...initialState,
//         memberType: preSelectedMemberType || "",
//       });
//     }
//     setPhotoFile(null);
//     setResumeFile(null);
//     setUploadProgress({ photo: 0, resume: 0 });
//   }, [editMember, isOpen, preSelectedMemberType]);

//   // --- Logic for Mobile Number Enforcement ---
//   const handleMobileChange = (val) => {
//     const cleaned = val.replace(/\D/g, ""); // Remove non-digits
//     return cleaned.slice(0, 10); // Cap at 10 digits
//   };

//   const uploadToCloudinary = async (file, resourceType, fileType) => {
//     if (!file) return null;
//     const cloudName = "dwelwaavj";
//     const uploadPreset = "jobbridge_preset";
//     const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", uploadPreset);

//     try {
//       const res = await axios.post(api, data, {
//         onUploadProgress: (p) => setUploadProgress(prev => ({ 
//             ...prev, 
//             [fileType]: Math.round((p.loaded * 100) / p.total) 
//         }))
//       });
//       return res.data.secure_url;
//     } catch (e) { 
//       console.error(e); 
//       return null; 
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Final validation before submitting
//     if (formData.mobileNumber.length !== 10) {
//       alert("Mobile number must be exactly 10 digits.");
//       return;
//     }

//     setBtnLoading(true);
//     try {
//       let photo = formData.photoUrl;
//       if (photoFile) photo = await uploadToCloudinary(photoFile, "image", "photo");

//       let resume = formData.resumeLink;
//       if (resumeFile) resume = await uploadToCloudinary(resumeFile, "auto", "resume");

//       const payload = {
//         ...formData,
//         photoUrl: photo,
//         resumeLink: resume,
//         dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null
//       };

//       const res = editMember
//         ? await API.put(`/member/${editMember._id}`, payload)
//         : await API.post("/member", payload);

//       onSuccess(res.data);
//       onClose();
//     } catch (err) {
//       alert("Error saving profile");
//     } finally {
//       setBtnLoading(false);
//     }
//   };

//   // ... (addCert, updateCert, removeCert stay the same)
//   const addCert = () => setFormData({ ...formData, certifications: [...formData.certifications, { title: "", organization: "", year: "" }] });
//   const updateCert = (idx, field, val) => {
//     const newCerts = [...formData.certifications];
//     newCerts[idx][field] = val;
//     setFormData({ ...formData, certifications: newCerts });
//   };
//   const removeCert = (idx) => setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== idx) });

//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal} style={{ maxWidth: '900px' }}>
//         <div className={styles.header}>
//           <h2>Update Detailed Profile</h2>
//           <button onClick={onClose}><X size={20} /></button>
//         </div>

//         <div className={styles.tabContainer}>
//           <button className={activeTab === 'basic' ? styles.activeTab : ''} onClick={() => setActiveTab('basic')}>Basic Info</button>
//           <button className={activeTab === 'career' ? styles.activeTab : ''} onClick={() => setActiveTab('career')}>Career Profile</button>
//           <button className={activeTab === 'edu' ? styles.activeTab : ''} onClick={() => setActiveTab('edu')}>Education & Certs</button>
//           <button className={activeTab === 'personal' ? styles.activeTab : ''} onClick={() => setActiveTab('personal')}>Advanced Personal</button>
//         </div>

//         <form onSubmit={handleSubmit} className={styles.form} style={{ padding: '20px' }}>

//           {activeTab === 'basic' && (
//             <div className={styles.formGrid}>
//               <div className={styles.fileUploadSection}>
//                 <label>Profile Photo</label>
//                 <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
//               </div>
//               <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
//               <DropdownSelect label="Gender" value={formData.gender} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} onChange={(v) => setFormData({ ...formData, gender: v })} />
//               <FormInput label="District" value={formData.district} onChange={(v) => setFormData({ ...formData, district: v })} />
//             </div>
//           )}

//           {activeTab === 'career' && (
//             <div className={styles.formGrid}>
//               {/* Existing career fields... */}
//               <FormInput label="Designation" value={formData.designation} onChange={(v) => setFormData({ ...formData, designation: v })} />
//               <FormInput label="Experience (Years)" value={formData.workExp} onChange={(v) => setFormData({ ...formData, workExp: v })} />
//               <FormInput label="Expected Salary" value={formData.careerProfile.expectedSalary} onChange={(v) => setFormData({ ...formData, careerProfile: { ...formData.careerProfile, expectedSalary: v } })} />
//               {/* ... other fields ... */}
//             </div>
//           )}

//           {activeTab === 'edu' && (
//             <div>
//               <div className={styles.resumeSection}>
//                 <h3>Resume</h3>
//                 <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
//                 {formData.resumeLink && <p><a href={formData.resumeLink} target="_blank" rel="noreferrer">View Current Resume</a></p>}
//               </div>
//               <FormInput label="Degree" value={formData.highest_education} onChange={(v) => setFormData({ ...formData, highest_education: v })} />
//             </div>
//           )}

//           {activeTab === 'personal' && (
//             <div className={styles.formGrid}>
//               <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />

//               {/* ENFORCED MOBILE FIELD */}
//               <FormInput 
//                 label="Mobile" 
//                 value={formData.mobileNumber} 
//                 onChange={(v) => setFormData({ ...formData, mobileNumber: handleMobileChange(v) })} 
//                 required 
//                 placeholder="10 digit number"
//               />

//               <DateSelect label="DOB" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} />
//               <FormInput label="Father's Name" value={formData.fatherName || formData.fathersName} onChange={(v) => setFormData({ ...formData, fatherName: v })} />
//               <FormInput label="Mother's Name" value={formData.motherName} onChange={(v) => setFormData({ ...formData, motherName: v })} />
//               <FormInput label="Hometown" value={formData.hometown} onChange={(v) => setFormData({ ...formData, hometown: v })} />
//               <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
//               <DropdownSelect label="Marital Status" value={formData.maritalStatus} options={[{ value: "Single", label: "Single" }, { value: "Married", label: "Married" }]} onChange={(v) => setFormData({ ...formData, maritalStatus: v })} />
//               <FormInput label="Pincode" value={formData.pincode} onChange={(v) => setFormData({ ...formData, pincode: v })} />
//             </div>
//           )}

//           <div className={styles.actions} style={{ marginTop: '20px' }}>
//             <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
//             <button type="submit" disabled={btnLoading} className={styles.submitButton}>
//               {btnLoading ? "Saving..." : "Save Profile Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AddMember;


import React, { useEffect, useRef, useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Search,
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
  },
  certifications: [],
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
  "SSLC / 10th",
  "PUC / 12th",
  "ITI",
  "Diploma (Polytechnic)",
  "B.A",
  "B.Com",
  "B.Sc",
  "B.B.A",
  "B.C.A",
  "B.S.W",
  "B.Voc",
  "B.E",
  "B.Tech",
  "B.Arch",
  "LLB",
  "BBA LLB",
  "BA LLB",
  "B.Pharm",
  "D.Pharm",
  "BPT",
  "BDS",
  "MBBS",
  "BAMS",
  "BHMS",
  "M.A",
  "M.Com",
  "M.Sc",
  "M.S.W",
  "M.B.A",
  "M.C.A",
  "M.Tech",
  "M.E",
  "LLM",
  "M.Pharm",
  "MPT",
  "MD",
  "MS",
  "PhD",
  "Post Graduate Diploma (PGD)",
  "Certification Course",
];

const BRANCH_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Artificial Intelligence",
  "Data Science",
  "Cyber Security",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical",
  "Civil",
  "Automobile",
  "Chemical",
  "Biotechnology",
  "Agriculture",
  "Commerce",
  "Accounting & Finance",
  "Business Administration",
  "Marketing",
  "Human Resource",
  "Economics",
  "English",
  "History",
  "Political Science",
  "Sociology",
  "Psychology",
  "Education",
  "Law",
  "Pharmacy",
  "Nursing",
  "Medical Lab Technology",
];

// ✅ Karnataka Districts
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

/**
 * ✅ Editable dropdown (search + type custom + press Enter)
 * ✅ Supports Dark Mode using SCSS classes from AddModel.module.scss
 */
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
  const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });
  const [errors, setErrors] = useState({ resume: "", degree: "" });

  const resumeInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (editMember) {
      setFormData({
        ...initialState,
        ...editMember,
        branch: editMember.branch || "",
        dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
        careerProfile: editMember.careerProfile || initialState.careerProfile,
        certifications: editMember.certifications || [],
        languages: editMember.languages || [],
      });
    } else {
      setFormData({
        ...initialState,
        memberType: preSelectedMemberType || "",
      });
    }
    setPhotoFile(null);
    setResumeFile(null);
    setUploadProgress({ photo: 0, resume: 0 });
    setErrors({ resume: "", degree: "" });
  }, [editMember, isOpen, preSelectedMemberType]);

  const handleMobileChange = (val) => {
    const cleaned = val.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  };

  const uploadToCloudinary = async (file, resourceType, fileType) => {
    if (!file) return null;
    const cloudName = "dwelwaavj";
    const uploadPreset = "jobbridge_preset";
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(api, data, {
        onUploadProgress: (p) =>
          setUploadProgress((prev) => ({
            ...prev,
            [fileType]: Math.round((p.loaded * 100) / p.total),
          })),
      });
      return res.data.secure_url;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const validateEduTab = () => {
    const nextErrors = { resume: "", degree: "" };

    if (!String(formData.highest_education || "").trim()) {
      nextErrors.degree = "Degree is required.";
    }

    const hasExistingResume = Boolean(formData.resumeLink);
    const hasNewResume = Boolean(resumeFile);
    if (!hasExistingResume && !hasNewResume) {
      nextErrors.resume = "Resume is mandatory. Please upload your resume.";
    }

    setErrors(nextErrors);
    return !nextErrors.resume && !nextErrors.degree;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
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
      if (photoFile) photo = await uploadToCloudinary(photoFile, "image", "photo");

      let resume = formData.resumeLink;
      if (resumeFile) resume = await uploadToCloudinary(resumeFile, "auto", "resume");

      const payload = {
        ...formData,
        photoUrl: photo,
        resumeLink: resume,
        branch: String(formData.branch || "").trim(),
        highest_education: String(formData.highest_education || "").trim(),
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString().split("T")[0]
          : null,
      };

      const res = editMember
        ? await API.put(`/member/${editMember._id}`, payload)
        : await API.post("/member", payload);

      onSuccess(res.data);
      onClose();
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setBtnLoading(false);
    }
  };

  const clearSelectedResume = () => {
    setResumeFile(null);
    setErrors((p) => ({ ...p, resume: "" }));
    if (resumeInputRef.current) resumeInputRef.current.value = "";
    setUploadProgress((p) => ({ ...p, resume: 0 }));
  };

  if (!isOpen) return null;

  const selectedName = resumeFile?.name;
  const selectedSizeMB = resumeFile
    ? (resumeFile.size / (1024 * 1024)).toFixed(2)
    : null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: "900px" }}>
        <div className={styles.header}>
          <h2>Update Detailed Profile</h2>
          <button onClick={onClose} type="button" className={styles.closeButton}>
            <X size={20} />
          </button>
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
            className={activeTab === "personal" ? styles.activeTab : ""}
            onClick={() => setActiveTab("personal")}
            type="button"
          >
            Advanced Personal
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* BASIC TAB */}
          {activeTab === "basic" && (
            <div className={styles.formGrid}>
              <div className={styles.fileUploadSection}>
                <label>Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                />
              </div>

              <FormInput
                label="Full Name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
                required
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

              {/* ✅ UPDATED: Karnataka District Dropdown */}
              <EditableDropdown
                label="District"
                value={formData.district}
                options={KARNATAKA_DISTRICTS}
                placeholder="Select your district..."
                onChange={(v) => setFormData({ ...formData, district: v })}
              />
            </div>
          )}

          {/* CAREER TAB */}
          {activeTab === "career" && (
            <div className={styles.formGrid}>
              <FormInput
                label="Designation"
                value={formData.designation}
                onChange={(v) => setFormData({ ...formData, designation: v })}
              />
              <FormInput
                label="Experience (Years)"
                value={formData.workExp}
                onChange={(v) => setFormData({ ...formData, workExp: v })}
              />
              <FormInput
                label="Expected Salary"
                value={formData.careerProfile.expectedSalary}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    careerProfile: { ...formData.careerProfile, expectedSalary: v },
                  })
                }
              />
            </div>
          )}

          {/* EDU TAB */}
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
                          ? `${selectedName} • ${selectedSizeMB} MB`
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
                          setErrors((p) => ({ ...p, resume: "File too large. Max 5MB." }));
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
                  value={formData.branch || ""}
                  options={BRANCH_OPTIONS}
                  placeholder="Type to search or enter your branch..."
                  onChange={(val) => setFormData((p) => ({ ...p, branch: val }))}
                />
              </div>
            </div>
          )}

          {/* PERSONAL TAB */}
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
                  setFormData({ ...formData, mobileNumber: handleMobileChange(v) })
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
                onChange={(v) => setFormData({ ...formData, maritalStatus: v })}
              />

              <FormInput
                label="Pincode"
                value={formData.pincode}
                onChange={(v) => setFormData({ ...formData, pincode: v })}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
              {btnLoading ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMember;