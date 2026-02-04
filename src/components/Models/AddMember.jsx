//---------------------30/01----------12.48--------------------------

import React, { useEffect, useState } from "react";
import { X, UploadCloud, FileText } from "lucide-react";
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
    expectedSalary: ""
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

function AddMember({
  isOpen,
  onClose,
  editMember,
  onSuccess,
  preSelectedMemberType = null,
  initialTab = "basic"
}) {
  const [formData, setFormData] = useState(initialState);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (editMember) {
      setFormData({
        ...initialState,
        ...editMember,
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
  }, [editMember, isOpen, preSelectedMemberType]);

  // --- Logic for Mobile Number Enforcement ---
  const handleMobileChange = (val) => {
    const cleaned = val.replace(/\D/g, ""); // Remove non-digits
    return cleaned.slice(0, 10); // Cap at 10 digits
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
        onUploadProgress: (p) => setUploadProgress(prev => ({ 
            ...prev, 
            [fileType]: Math.round((p.loaded * 100) / p.total) 
        }))
      });
      return res.data.secure_url;
    } catch (e) { 
      console.error(e); 
      return null; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submitting
    if (formData.mobileNumber.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
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
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null
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

  // ... (addCert, updateCert, removeCert stay the same)
  const addCert = () => setFormData({ ...formData, certifications: [...formData.certifications, { title: "", organization: "", year: "" }] });
  const updateCert = (idx, field, val) => {
    const newCerts = [...formData.certifications];
    newCerts[idx][field] = val;
    setFormData({ ...formData, certifications: newCerts });
  };
  const removeCert = (idx) => setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== idx) });

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '900px' }}>
        <div className={styles.header}>
          <h2>Update Detailed Profile</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.tabContainer}>
          <button className={activeTab === 'basic' ? styles.activeTab : ''} onClick={() => setActiveTab('basic')}>Basic Info</button>
          <button className={activeTab === 'career' ? styles.activeTab : ''} onClick={() => setActiveTab('career')}>Career Profile</button>
          <button className={activeTab === 'edu' ? styles.activeTab : ''} onClick={() => setActiveTab('edu')}>Education & Certs</button>
          <button className={activeTab === 'personal' ? styles.activeTab : ''} onClick={() => setActiveTab('personal')}>Advanced Personal</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} style={{ padding: '20px' }}>
          
          {activeTab === 'basic' && (
            <div className={styles.formGrid}>
              <div className={styles.fileUploadSection}>
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
              </div>
              <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
              <DropdownSelect label="Gender" value={formData.gender} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} onChange={(v) => setFormData({ ...formData, gender: v })} />
              <FormInput label="District" value={formData.district} onChange={(v) => setFormData({ ...formData, district: v })} />
            </div>
          )}

          {activeTab === 'career' && (
            <div className={styles.formGrid}>
              {/* Existing career fields... */}
              <FormInput label="Designation" value={formData.designation} onChange={(v) => setFormData({ ...formData, designation: v })} />
              <FormInput label="Experience (Years)" value={formData.workExp} onChange={(v) => setFormData({ ...formData, workExp: v })} />
              <FormInput label="Expected Salary" value={formData.careerProfile.expectedSalary} onChange={(v) => setFormData({ ...formData, careerProfile: { ...formData.careerProfile, expectedSalary: v } })} />
              {/* ... other fields ... */}
            </div>
          )}

          {activeTab === 'edu' && (
            <div>
              <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Resume</h3>
                <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
                {formData.resumeLink && <p><a href={formData.resumeLink} target="_blank" rel="noreferrer">View Current Resume</a></p>}
              </div>
              <FormInput label="Degree" value={formData.highest_education} onChange={(v) => setFormData({ ...formData, highest_education: v })} />
            </div>
          )}

          {activeTab === 'personal' && (
            <div className={styles.formGrid}>
              <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
              
              {/* ENFORCED MOBILE FIELD */}
              <FormInput 
                label="Mobile" 
                value={formData.mobileNumber} 
                onChange={(v) => setFormData({ ...formData, mobileNumber: handleMobileChange(v) })} 
                required 
                placeholder="10 digit number"
              />

              <DateSelect label="DOB" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} />
              <FormInput label="Father's Name" value={formData.fatherName || formData.fathersName} onChange={(v) => setFormData({ ...formData, fatherName: v })} />
              <FormInput label="Mother's Name" value={formData.motherName} onChange={(v) => setFormData({ ...formData, motherName: v })} />
              <FormInput label="Hometown" value={formData.hometown} onChange={(v) => setFormData({ ...formData, hometown: v })} />
              <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
              <DropdownSelect label="Marital Status" value={formData.maritalStatus} options={[{ value: "Single", label: "Single" }, { value: "Married", label: "Married" }]} onChange={(v) => setFormData({ ...formData, maritalStatus: v })} />
              <FormInput label="Pincode" value={formData.pincode} onChange={(v) => setFormData({ ...formData, pincode: v })} />
            </div>
          )}

          <div className={styles.actions} style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
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