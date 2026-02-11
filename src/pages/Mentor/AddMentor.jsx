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

import React, { useState, useEffect } from "react";
import { X, Plus, UserPlus, Save, Check } from "lucide-react"; 
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

function AddMentor({ onSuccess, isEditing, editData, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [btnLoading, setBtnLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && editData) {
      setFormData({ ...initialState, ...editData });
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
      let res;
      if (isEditing) {
        res = await API.put(`/member/${editData._id}`, formData);
      } else {
        res = await API.post("/member", formData);
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
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
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
              <button onClick={toggleModal} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <FormInput 
                  label="Full Name *" 
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

                <FormInput 
                  label="Location (District)" 
                  value={formData.district}
                  onChange={(v) => setFormData({ ...formData, district: v })} 
                />

                <FormInput 
                  label="Current Institution/Company" 
                  value={formData.currentInstitutionOrCompany}
                  onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })} 
                />

                <FormInput 
                  label="Job Designation" 
                  value={formData.designation}
                  onChange={(v) => setFormData({ ...formData, designation: v })} 
                />

                <FormInput 
                  label="Domain Expertise" 
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
                <button type="button" onClick={toggleModal} className={styles.cancelButton}>
                  Discard
                </button>
                <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                  {btnLoading ? "Processing..." : (isEditing ? "Update Profile" : "Create Mentor")}
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