import React, { useState } from "react";
import { X } from "lucide-react"; 
import FormInput from "../../components/UI/FormInput"; 
import DropdownSelect from "../../components/UI/DropdownSelect"; 
import API from "../../axios"; 
import styles from "../../components/Models/AddModel.module.scss";
import { Plus } from 'lucide-react';

const initialState = {
  name: "",
  mobileNumber: "",
  email: "",
  gender: "",
  memberType: "Referee",
  
  // Referee Specific Fields
  referrerStatus: "",
  referringOfferType: "",
  referringSector: "",
  referringFor: "",
  levelOfSupport: "",
};

function AddReferee({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [btnLoading, setBtnLoading] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setFormData(initialState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;
    setBtnLoading(true);

    try {
      const res = await API.post("/member", formData);
      if (onSuccess) onSuccess(res.data);
      alert("Referee added successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add referee");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      {/* 👇 Button now uses the SCSS class */}
      <button 
        onClick={toggleModal}
        className={styles.addRefereeBtn} 
      >
      <Plus size={20} />
        Add Referee
      </button>

      {/* The Modal */}
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Add New Referee</h2>
              <button onClick={toggleModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <FormInput 
                  label="Name" 
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
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(v) => setFormData({ ...formData, gender: v })}
                />

                <FormInput 
                  label="Referrer Status" 
                  value={formData.referrerStatus}
                  onChange={(v) => setFormData({ ...formData, referrerStatus: v })} 
                />
                
                <FormInput 
                  label="Referring Offer Type" 
                  value={formData.referringOfferType}
                  onChange={(v) => setFormData({ ...formData, referringOfferType: v })} 
                />
                
                <FormInput 
                  label="Referring Sector" 
                  value={formData.referringSector}
                  onChange={(v) => setFormData({ ...formData, referringSector: v })} 
                />
                
                <FormInput 
                  label="Referring For" 
                  value={formData.referringFor}
                  onChange={(v) => setFormData({ ...formData, referringFor: v })} 
                />
                
                <FormInput 
                  label="Level of Support" 
                  value={formData.levelOfSupport}
                  onChange={(v) => setFormData({ ...formData, levelOfSupport: v })} 
                />
              </div>

              <div className={styles.actions}>
                <button 
                  type="button" 
                  onClick={toggleModal} 
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={btnLoading} 
                  className={styles.submitButton}
                >
                  {btnLoading ? "Saving..." : "Save Referee"}
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