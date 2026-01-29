import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";   
import DateSelect from "../../components/UI/DateSelect";
import API from "../../axios";  
import FormInput from "../../components/UI/FormInput"; 
import DropdownSelect from "../../components/UI/DropdownSelect"; 
import styles from "../../components/Models/AddModel.module.scss"; 

function AddMentor({ onSuccess, editData, isEditing, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (editData && isEditing) {
      setFormData({
        name: editData.name || "",
        mobileNumber: editData.mobileNumber || "",
        email: editData.email || "",
        gender: editData.gender || "",
        dateOfBirth: editData.dateOfBirth || null,
        memberType: "Mentor",
        currentInstitutionOrCompany: editData.currentInstitutionOrCompany || "",
        designation: editData.designation || "",
        fieldofStudy_Interest: editData.fieldofStudy_Interest || "",
        workExp: editData.workExp || "",
      });
      setIsOpen(true);
    }
  }, [editData, isEditing]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFormData({
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
      });
    }
    if (onClose && isOpen) {
      onClose();
    }
  };

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

    const payload = {
      ...formData,
      dateOfBirth: formatDOB(formData.dateOfBirth),
    };

    try {
      let res;
      if (isEditing && editData) {
        res = await API.put(`/member/${editData._id}`, payload);
      } else {
        res = await API.post("/member", payload);
      }
      
      if (onSuccess) onSuccess(res.data);
      alert(isEditing ? "Mentor updated successfully!" : "Mentor added successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert(isEditing ? "Failed to update mentor" : "Failed to add mentor");
    } finally {
      setBtnLoading(false);
    }
  };

  const modalTitle = isEditing ? "Edit Mentor" : "Add New Mentor";
  const submitButtonText = isEditing ? "Update Mentor" : "Save Mentor";

  return (
    <>
      {!isEditing && (
        <button onClick={toggleModal} className={styles.addRefereeBtn}>
          <Plus size={20} />
          Add Mentor
        </button>
      )}

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>{modalTitle}</h2>
              <button onClick={toggleModal} className={styles.closeButton}>
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
                  {btnLoading ? "Saving..." : submitButtonText}
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