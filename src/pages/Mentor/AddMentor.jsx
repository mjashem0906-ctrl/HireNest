// //----------------------------31/01------------------4.45-------------------

// import React, { useState, useEffect } from "react";
// import { X, Plus } from "lucide-react"; 
// import DateSelect from "../../components/UI/DateSelect"; 
// import API from "../../axios"; 
// import FormInput from "../../components/UI/FormInput"; 
// import DropdownSelect from "../../components/UI/DropdownSelect"; 
// import styles from "../../components/Models/AddModel.module.scss"; 

// const initialState = {
//   name: "",
//   mobileNumber: "",
//   email: "",
//   gender: "",
//   dateOfBirth: null, 
//   memberType: "Mentor", 
//   currentInstitutionOrCompany: "", 
//   designation: "", 
//   fieldofStudy_Interest: "", 
//   workExp: "", 
//   district: "", // Added district as it appears on the card
// };

// function AddMentor({ onSuccess, isEditing, editData, onClose }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [formData, setFormData] = useState(initialState);
//   const [btnLoading, setBtnLoading] = useState(false);

//   // Handle Edit Mode vs Add Mode
//   useEffect(() => {
//     if (isEditing && editData) {
//       setFormData({ ...initialState, ...editData });
//       setIsOpen(true);
//     }
//   }, [isEditing, editData]);

//   const toggleModal = () => {
//     if (isEditing && onClose) {
//       onClose();
//     } else {
//       setIsOpen(!isOpen);
//       if (!isOpen) setFormData(initialState);
//     }
//   };

//   const formatDOB = (date) => {
//     if (!date) return null;
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (btnLoading) return;
//     setBtnLoading(true);

//     const payload = {
//       ...formData,
//       dateOfBirth: formatDOB(formData.dateOfBirth),
//     };

//     try {
//       let res;
//       if (isEditing) {
//         res = await API.put(`/member/${editData._id}`, payload);
//         alert("Mentor updated successfully!");
//       } else {
//         res = await API.post("/member", payload);
//         alert("Mentor added successfully!");
//       }

//       if (onSuccess) onSuccess(res.data);
//       toggleModal();
//     } catch (err) {
//       console.error(err);
//       alert(isEditing ? "Failed to update mentor" : "Failed to add mentor");
//     } finally {
//       setBtnLoading(false);
//     }
//   };

//   // Button Styles to match your screenshot (Purple)
//   const addBtnStyle = {
//     backgroundColor: '#6366f1', // Indigo/Purple
//     color: 'white',
//     padding: '8px 16px',
//     borderRadius: '6px',
//     border: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     cursor: 'pointer',
//     fontWeight: '500'
//   };

//   return (
//     <>
//       {!isEditing && (
//         <button onClick={toggleModal} style={addBtnStyle}>
//           <Plus size={18} />
//           Add Mentor
//         </button>
//       )}

//       {isOpen && (
//         <div className={styles.overlay}>
//           <div className={styles.modal}>
//             <div className={styles.header}>
//               <h2>{isEditing ? "Edit Mentor" : "Add New Mentor"}</h2>
//               <button onClick={toggleModal} className={styles.closeButton}>
//                 <X size={18} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className={styles.form}>
//               <div className={styles.formGrid}>
//                 <FormInput 
//                   label="Name *" 
//                   value={formData.name}
//                   onChange={(v) => setFormData({ ...formData, name: v })} 
//                   required 
//                 />

//                 <FormInput 
//                   label="Mobile Number" 
//                   value={formData.mobileNumber}
//                   onChange={(v) => setFormData({ ...formData, mobileNumber: v })} 
//                 />

//                 <FormInput 
//                   label="Email" 
//                   value={formData.email}
//                   onChange={(v) => setFormData({ ...formData, email: v })} 
//                 />

//                 <DropdownSelect
//                   label="Gender"
//                   value={formData.gender}
//                   options={[
//                     { value: "Male", label: "Male" },
//                     { value: "Female", label: "Female" },
//                     { value: "Other", label: "Other" },
//                   ]}
//                   onChange={(v) => setFormData({ ...formData, gender: v })}
//                 />

//                 <DateSelect
//                   label="Date of Birth"
//                   value={formData.dateOfBirth}
//                   onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
//                 />

//                 <FormInput 
//                   label="District / Location" 
//                   value={formData.district}
//                   onChange={(v) => setFormData({ ...formData, district: v })} 
//                   placeholder="e.g. Bangalore"
//                 />

//                 <FormInput 
//                   label="Current Company / Institution" 
//                   value={formData.currentInstitutionOrCompany}
//                   onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })} 
//                 />

//                 <FormInput 
//                   label="Job Role / Designation" 
//                   value={formData.designation}
//                   onChange={(v) => setFormData({ ...formData, designation: v })} 
//                 />

//                 <FormInput 
//                   label="Expertise / Domain" 
//                   value={formData.fieldofStudy_Interest}
//                   onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} 
//                 />

//                 <FormInput 
//                   label="Years of Experience" 
//                   value={formData.workExp}
//                   onChange={(v) => setFormData({ ...formData, workExp: v })} 
//                 />
//               </div>

//               <div className={styles.actions}>
//                 <button type="button" onClick={toggleModal} className={styles.cancelButton}>
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={btnLoading} className={styles.submitButton}>
//                   {btnLoading ? "Saving..." : (isEditing ? "Update Mentor" : "Save Mentor")}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default AddMentor;

//------------------------6/2-------------------------11.30-------------------

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
  const [btnLoading, setBtnLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && editData) {
      setFormData({
        ...initialState,
        ...editData,
        dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth) : null,
      });
      setIsOpen(true);
    }
  }, [isEditing, editData]);

  const toggleModal = () => {
    if (isEditing && onClose) {
      onClose();
    } else {
      setIsOpen(!isOpen);
      if (!isOpen) setFormData(initialState);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;

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
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)",
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
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  required
                />

                <FormInput
                  label="Email Address"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                />

                <FormInput
                  label="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(v) => setFormData({ ...formData, mobileNumber: v })}
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
                  onChange={(v) =>
                    setFormData({ ...formData, currentInstitutionOrCompany: v })
                  }
                />

                <FormInput
                  label="Job Designation"
                  value={formData.designation}
                  onChange={(v) => setFormData({ ...formData, designation: v })}
                />

                <FormInput
                  label="Domain"
                  value={formData.fieldofStudy_Interest}
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })}
                />

                <FormInput
                  label="Years of Experience"
                  value={formData.workExp}
                  onChange={(v) => setFormData({ ...formData, workExp: v })}
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