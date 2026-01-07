import React, { useState } from "react";
import { X } from "lucide-react";   
import DateSelect from "../../components/UI/DateSelect"; // 👈 Import DateSelect
import API from "../../axios";  
import FormInput from "../../components/UI/FormInput"; 
import DropdownSelect from "../../components/UI/DropdownSelect"; 
import styles from "../../components/Models/AddModel.module.scss"; 

const initialState = {
  name: "",
  mobileNumber: "",
  email: "",
  gender: "",
  dateOfBirth: null, // 👈 Added Date of Birth
  memberType: "Mentor", 
  
  // Mentor Specific Fields
  currentInstitutionOrCompany: "", 
  designation: "",                 
  fieldofStudy_Interest: "",       
  workExp: "",                     
};

function AddMentor({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [btnLoading, setBtnLoading] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setFormData(initialState);
  };

  // Helper to format date as YYYY-MM-DD for the backend
  const formatDOB = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;
    setBtnLoading(true);

    // Prepare payload with formatted date
    const payload = {
        ...formData,
        dateOfBirth: formatDOB(formData.dateOfBirth),
    };

    try {
      const res = await API.post("/member", payload);
      if (onSuccess) onSuccess(res.data);
      alert("Mentor added successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add mentor");
    } finally {
      setBtnLoading(false);
    }
  };

  // Button Style
  const btnStyle = {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '8px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <>
      <button onClick={toggleModal} style={btnStyle}>
        Add Mentor
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Add New Mentor</h2>
              <button onClick={toggleModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <FormInput 
                  label="Name *" 
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })} 
                  required 
                />

                <FormInput 
                  label="Mobile Number" 
                  value={formData.mobileNumber}
                  onChange={(v) => setFormData({ ...formData, mobileNumber: v })} 
                />

                <FormInput 
                  label="Email" 
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })} 
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

                {/* 👇 ADDED DATE OF BIRTH FIELD */}
                <DateSelect
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                />

                <FormInput 
                  label="Current Company / Institution" 
                  value={formData.currentInstitutionOrCompany}
                  onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })} 
                  placeholder="e.g. Google, IIT Bombay"
                />

                <FormInput 
                  label="Job Role / Designation" 
                  value={formData.designation}
                  onChange={(v) => setFormData({ ...formData, designation: v })} 
                  placeholder="e.g. Senior Software Engineer"
                />

                <FormInput 
                  label="Expertise / Domain" 
                  value={formData.fieldofStudy_Interest}
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} 
                  placeholder="e.g. AI, Data Science"
                />

                <FormInput 
                  label="Years of Experience" 
                  value={formData.workExp}
                  onChange={(v) => setFormData({ ...formData, workExp: v })} 
                  placeholder="e.g. 10 Years"
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={toggleModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                  {btnLoading ? "Saving..." : "Save Mentor"}
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