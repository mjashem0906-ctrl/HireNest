import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import API from "../../axios";
import styles from "../../components/Models/AddModel.module.scss";

// Initial state
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

function AddReferee({ onSuccess, editData, isEditing, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [btnLoading, setBtnLoading] = useState(false);

  // Handle edit data
  useEffect(() => {
    if (editData && isEditing) {
      setFormData({
        name: editData.name || "",
        mobileNumber: editData.mobileNumber || "",
        email: editData.email || "",
        gender: editData.gender || "",
        age: editData.age || "",
        memberType: "Referee",
        referrerStatus: editData.referrerStatus || "",
        referringOfferType: editData.referringOfferType || "",
        referringSector: editData.referringSector || "",
        referringFor: editData.referringFor || "",
        levelOfSupport: editData.levelOfSupport || "",
        occupation: editData.occupation || "",
        companyDetails: editData.companyDetails || "",
        sector: editData.sector || "",
        jobOfferType: editData.jobOfferType || "",
        opportunityDescription: editData.opportunityDescription || "",
        referrerContact: editData.referrerContact || "",
        offer_Location: editData.offer_Location || "",
        symMemberStatus: editData.symMemberStatus || "Active",
        address: editData.address || "",
        district: editData.district || "",
      });
      setIsOpen(true);
    }
  }, [editData, isEditing]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFormData(initialState);
    }
    if (onClose && isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;
    setBtnLoading(true);

    try {
      let res;
      if (isEditing && editData) {
        // Update existing referee
        res = await API.put(`/member/${editData._id}`, formData);
      } else {
        // Create new referee
        res = await API.post("/member", formData);
      }
      
      if (onSuccess) onSuccess(res.data);
      alert(isEditing ? "Referee updated successfully!" : "Referee added successfully!");
      toggleModal();
    } catch (err) {
      console.error("Error saving referee:", err);
      alert(isEditing ? "Failed to update referee" : "Failed to add referee");
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

  const modalTitle = isEditing ? "Edit Referee" : "Add New Referee";
  const submitButtonText = isEditing ? "Update Referee" : "Save Referee";

  return (
    <>
      {!isEditing && (
        <button onClick={toggleModal} className={styles.addRefereeBtn}>
          <Plus size={20} />
          Add Job Referee
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
                {/* Basic Info */}
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
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(v) => setFormData({ ...formData, gender: v })}
                />

                <FormInput 
                  label="Occupation" 
                  value={formData.occupation}
                  onChange={(v) => setFormData({ ...formData, occupation: v })} 
                />

                <FormInput 
                  label="Company Details" 
                  value={formData.companyDetails}
                  onChange={(v) => setFormData({ ...formData, companyDetails: v })} 
                />

                {/* Status Fields */}
                <DropdownSelect
                  label="Solidarity Member Status"
                  value={formData.symMemberStatus}
                  options={statusOptions}
                  onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
                />

                <DropdownSelect
                  label="Referrer Status"
                  value={formData.referrerStatus}
                  options={statusOptions}
                  onChange={(v) => setFormData({ ...formData, referrerStatus: v })}
                />

                {/* Location Fields */}
                <FormInput 
                  label="District" 
                  value={formData.district}
                  onChange={(v) => setFormData({ ...formData, district: v })} 
                />

                <FormInput 
                  label="Address" 
                  value={formData.address}
                  onChange={(v) => setFormData({ ...formData, address: v })} 
                />

                <FormInput 
                  label="Offer Location" 
                  value={formData.offer_Location}
                  onChange={(v) => setFormData({ ...formData, offer_Location: v })} 
                />

                {/* Sector Fields */}
                <FormInput 
                  label="Sector" 
                  value={formData.sector}
                  onChange={(v) => setFormData({ ...formData, sector: v })} 
                />

                <FormInput 
                  label="Referring Sector" 
                  value={formData.referringSector}
                  onChange={(v) => setFormData({ ...formData, referringSector: v })} 
                />

                {/* Offer Type Fields */}
                <FormInput 
                  label="Job Offer Type" 
                  value={formData.jobOfferType}
                  onChange={(v) => setFormData({ ...formData, jobOfferType: v })} 
                />

                <FormInput 
                  label="Referring Offer Type" 
                  value={formData.referringOfferType}
                  onChange={(v) => setFormData({ ...formData, referringOfferType: v })} 
                />

                {/* Additional Fields */}
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

                <FormInput 
                  label="Referrer Contact" 
                  value={formData.referrerContact}
                  onChange={(v) => setFormData({ ...formData, referrerContact: v })} 
                />

                {/* Description Field */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormInput 
                    label="Description" 
                    value={formData.opportunityDescription}
                    onChange={(v) => setFormData({ ...formData, opportunityDescription: v })}
                    textarea
                    rows={4}
                  />
                </div>
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

export default AddReferee;