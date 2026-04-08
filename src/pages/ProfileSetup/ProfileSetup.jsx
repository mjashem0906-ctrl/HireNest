// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../../axios";
// import { useAuth } from "../../context/AuthContext";
// import FormInput from "../../components/UI/FormInput";
// import DropdownSelect from "../../components/UI/DropdownSelect";
// import DateSelect from "../../components/UI/DateSelect";
// import styles from "./ProfileSetup.module.scss";

// const ProfileSetup = () => {
//     const { user, login } = useAuth();
//     const navigate = useNavigate();
//     const [role, setRole] = useState("");
//     const [formData, setFormData] = useState({
//         name: "",
//         mobileNumber: "",
//         gender: "",
//         dateOfBirth: null,
//         currentInstitutionOrCompany: "",
//         designation: "",
//         fieldofStudy_Interest: "",
//         workExp: "",
//         highest_education: "",
//         preferredJobRole_Sector: ""
//     });
//     const [loading, setLoading] = useState(false);

//     const calculateCompletion = () => {
//         if (!role) return 0;
//         const mentorFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'currentInstitutionOrCompany', 'designation', 'fieldofStudy_Interest', 'workExp'];
//         const jobFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'highest_education', 'fieldofStudy_Interest', 'preferredJobRole_Sector', 'workExp'];

//         const fieldsToTrack = role === 'Mentor' ? mentorFields : jobFields;
//         const completedFields = fieldsToTrack.filter(field => formData[field] && String(formData[field]).length > 0);
//         return Math.round((completedFields.length / fieldsToTrack.length) * 100);
//     };

//     const completion = calculateCompletion();

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const res = await API.post("/auth/update-profile", {
//                 role,
//                 profileData: formData
//             });
//             login(res.data.user);
//             if (res.data.user.profileCompleted === 100) {
//                 navigate("/");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Failed to update profile");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className={styles.container}>
//             <div className={styles.box}>
//                 <h1>Complete Your Profile</h1>
//                 <p>Please provide your details to continue</p>

//                 <div className={styles.progressContainer}>
//                     <div className={styles.progressBar}>
//                         <div
//                             className={styles.progressFill}
//                             style={{ width: `${completion}%` }}
//                         ></div>
//                     </div>
//                     <span>{completion}% Complete</span>
//                 </div>

//                 {!role ? (
//                     <div className={styles.roleSelection}>
//                         <h3>What is your role?</h3>
//                         <div className={styles.roleButtons}>
//                             <button onClick={() => setRole("Mentor")}>Mentor</button>
//                             <button onClick={() => setRole("Job")}>Job Seeker</button>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className={styles.form}>
//                         <button className={styles.backBtn} onClick={() => setRole("")}>Change Role</button>

//                         <div className={styles.formGrid}>
//                             <FormInput
//                                 label="Full Name"
//                                 value={formData.name}
//                                 onChange={(v) => setFormData({ ...formData, name: v })}
//                             />
//                             <FormInput
//                                 label="Mobile Number"
//                                 value={formData.mobileNumber}
//                                 onChange={(v) => setFormData({ ...formData, mobileNumber: v })}
//                             />
//                             <DropdownSelect
//                                 label="Gender"
//                                 value={formData.gender}
//                                 options={[
//                                     { value: "Male", label: "Male" },
//                                     { value: "Female", label: "Female" },
//                                     { value: "Other", label: "Other" },
//                                 ]}
//                                 onChange={(v) => setFormData({ ...formData, gender: v })}
//                             />
//                             <DateSelect
//                                 label="Date of Birth"
//                                 value={formData.dateOfBirth}
//                                 onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
//                             />

//                             {role === 'Mentor' ? (
//                                 <>
//                                     <FormInput
//                                         label="Current Company / Institution"
//                                         value={formData.currentInstitutionOrCompany}
//                                         onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })}
//                                     />
//                                     <FormInput
//                                         label="Designation"
//                                         value={formData.designation}
//                                         onChange={(v) => setFormData({ ...formData, designation: v })}
//                                     />
//                                 </>
//                             ) : (
//                                 <>
//                                     <FormInput
//                                         label="Highest Education"
//                                         value={formData.highest_education}
//                                         onChange={(v) => setFormData({ ...formData, highest_education: v })}
//                                     />
//                                     <FormInput
//                                         label="Preferred Job Role"
//                                         value={formData.preferredJobRole_Sector}
//                                         onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })}
//                                     />
//                                 </>
//                             )}

//                             <FormInput
//                                 label="Field of Interest / Study"
//                                 value={formData.fieldofStudy_Interest}
//                                 onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })}
//                             />
//                             <FormInput
//                                 label="Years of Experience"
//                                 value={formData.workExp}
//                                 onChange={(v) => setFormData({ ...formData, workExp: v })}
//                             />
//                         </div>

//                         <button
//                             className={styles.saveBtn}
//                             onClick={handleSave}
//                             disabled={loading}
//                         >
//                             {loading ? "Saving..." : "Save & Continue"}
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProfileSetup;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import DateSelect from "../../components/UI/DateSelect";
import styles from "./ProfileSetup.module.scss";

const DEGREE_OPTIONS = [
  "SSLC / 10th", "PUC / 12th", "ITI", "Diploma (Polytechnic)", "B.A", "B.Com", "B.Sc",
  "B.B.A", "B.C.A", "B.S.W", "B.Voc", "B.E", "B.Tech", "B.Arch", "LLB", "BBA LLB",
  "BA LLB", "B.Pharm", "D.Pharm", "BPT", "BDS", "MBBS", "BAMS", "BHMS", "M.A",
  "M.Com", "M.Sc", "M.S.W", "M.B.A", "M.C.A", "M.Tech", "M.E", "LLM", "M.Pharm",
  "MPT", "MD", "MS", "PhD", "Post Graduate Diploma (PGD)", "Certification Course",
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

const ProfileSetup = () => {
    const { user, login, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState("Job"); // Default to Job Seeker — skip role selection for Google users
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        gender: "",
        dateOfBirth: null,
        currentInstitutionOrCompany: "",
        designation: "",
        fieldofStudy_Interest: "",
        workExp: "",
        highest_education: "",
        preferredJobRole_Sector: ""
    });
    const [loading, setLoading] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadToCloudinary = async (file) => {
        if (!file) return null;
        const cloudName = "dwelwaavj";
        const uploadPreset = "jobbridge_preset";
        const api = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);

        const res = await axios.post(api, data, {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            }
        });
        return res.data.secure_url;
    };

    const handleMobileChange = (v) => {
        // Allow only digits, max 10
        const digits = v.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, mobileNumber: digits });
    };

    const handleWorkExpChange = (delta) => {
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
        const mentorFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'currentInstitutionOrCompany', 'designation', 'fieldofStudy_Interest', 'workExp', 'photoUrl', 'resumeLink'];
        const jobFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'highest_education', 'fieldofStudy_Interest', 'preferredJobRole_Sector', 'workExp', 'photoUrl', 'resumeLink'];

        const fieldsToTrack = role === 'Mentor' ? mentorFields : jobFields;
        const completedFields = fieldsToTrack.filter(field => {
            if (field === 'photoUrl') return !!photoFile;
            if (field === 'resumeLink') return !!resumeFile;
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
            
            if (photoFile) photoUrl = await uploadToCloudinary(photoFile);
            if (resumeFile) resumeLink = await uploadToCloudinary(resumeFile);

            const res = await API.post("/auth/update-profile", {
                role,
                profileData: {
                    ...formData,
                    photoUrl,
                    resumeLink
                }
            });
            await fetchUser(); // Re-fetch fresh user data from server (new memberId, profileCompleted)
            navigate("/", { state: { isNew: true } });
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1>Complete Your Profile</h1>
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
                                    <FormInput
                                        label="Preferred Job Role"
                                        value={formData.preferredJobRole_Sector}
                                        onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })}
                                    />
                                </>
                            )}

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
                                        disabled={parseInt(formData.workExp) <= 0}
                                    >−</button>
                                    <span className={styles.spinnerValue}>
                                        {formData.workExp !== '' ? formData.workExp : '0'}
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.spinBtn}
                                        onClick={() => handleWorkExpChange(1)}
                                        disabled={parseInt(formData.workExp) >= 50}
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

                        {uploadProgress > 0 && <p style={{ textAlign: "center", color: "#555", marginTop: "10px", fontWeight: "bold" }}>Uploading: {uploadProgress}%</p>}

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
        </div>
    );
};

export default ProfileSetup;
