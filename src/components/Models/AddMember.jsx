//---------------------20/01------3.07-------------

import React, { useEffect, useState } from "react";
import { X, UploadCloud } from "lucide-react";
import axios from "axios";
import FormInput from "../UI/FormInput";
import DropdownSelect from "../UI/DropdownSelect";
import DateSelect from "../UI/DateSelect";
import API from "../../axios";
import styles from "./AddModel.module.scss";

const initialState = {
  // --- Basic Info ---
  name: "",
  fathersName: "",
  mobileNumber: "",
  email: "",
  gender: "",
  dateOfBirth: null,
  district: "",
  forGrouping: [],
  
  // --- System Status ---
  memberType: "",
  symMemberStatus: "Active",

  // --- Mentor / Professional Specific ---
  currentInstitutionOrCompany: "",
  designation: "", 
  workExp: "",
  fieldofStudy_Interest: "", // Used for Mentor expertise or Seeker interest

  // --- Job Seeker Specific ---
  seekerNeed: "",
  highest_education: "",
  preferredJobRole_Sector: "",
  relocationStatus: "",
  preferredJobLocation: "",

  // --- Files (Cloudinary) ---
  photoUrl: "",
  resumeLink: "",

  // --- Opportunity Provider ---
  jobOfferType: "",
  offeringSector: "",
  opportunityDescription: "",
  offer_Location: "",
  contactForSeekers: "",

  // --- Referee ---
  referrerStatus: "",
  referringOfferType: "",
  referringSector: "",
  referringFor: "",
  levelOfSupport: "",
  referrerContact: "",
  // NEW FIELDS: Moved to Referee section
  occupation: "",
  companyDetails: "",

  // --- Upskilling ---
  interest_SkillBuildingProgram: "",
  skillsToImprove: "",
  
  // --- Additional Fields ---
  address: "",
  profession: "",
  nativePlace: "",
  age: "",
};

function AddMember({ 
  isOpen, 
  onClose, 
  editMember, 
  onSuccess, 
  preSelectedMemberType = null
}) {
  const [formData, setFormData] = useState(initialState);
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ photo: 0, resume: 0 });

  // --- Initialization ---
  useEffect(() => {
    if (editMember) {
      // Edit Mode
      setFormData({
        ...initialState,
        ...editMember,
        dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
        designation: editMember.designation || "",
        workExp: editMember.workExp || "",
        currentInstitutionOrCompany: editMember.currentInstitutionOrCompany || "",
        symMemberStatus: editMember.symMemberStatus || "Active",
        photoUrl: editMember.photoUrl || "",
        resumeLink: editMember.resumeLink || "",
        forGrouping: editMember.forGrouping || [],
        // NEW FIELDS: Initialize from editMember
        occupation: editMember.occupation || "",
        companyDetails: editMember.companyDetails || "",
      });
    } else {
      // Create Mode
      setFormData({
        ...initialState,
        memberType: preSelectedMemberType || "",
      });
    }
    // Reset file inputs
    setPhotoFile(null);
    setResumeFile(null);
    setUploadProgress({ photo: 0, resume: 0 });
  }, [editMember, isOpen, preSelectedMemberType]);

  // --- Helper: Format Date ---
  const formatDOB = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- Helper: Calculate Age from DOB ---
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // --- Handle DOB Change ---
  const handleDOBChange = (date) => {
    const updatedFormData = {
      ...formData,
      dateOfBirth: date,
      age: calculateAge(date)
    };
    setFormData(updatedFormData);
  };

  // --- Helper: Cloudinary Upload ---
  const uploadToCloudinary = async (file, resourceType, fileType) => {
    if (!file) return null;
    
    const cloudName = "dwelwaavj";
    const uploadPreset = "jobbridge_preset";
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    
    // Set folder based on file type
    if (resourceType === 'image') {
      data.append("folder", "member_photos");
    } else {
      data.append("folder", "member_resumes");
    }

    try {
      const res = await axios.post(api, data, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({
            ...prev,
            [fileType]: progress
          }));
        }
      });
      
      // Reset progress after completion
      setTimeout(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: 0
        }));
      }, 1000);
      
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error(`Failed to upload ${fileType}: ${error.message}`);
    }
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;
    
    // Basic validation
    if (!formData.name || !formData.mobileNumber || !formData.email || !formData.memberType) {
      alert("Please fill in all required fields (Name, Mobile, Email, Member Type)");
      return;
    }

    setBtnLoading(true);

    try {
      // 1. Upload Files if new ones selected
      let finalPhotoUrl = formData.photoUrl;
      if (photoFile) {
        finalPhotoUrl = await uploadToCloudinary(photoFile, "image", "photo");
      }

      let finalResumeUrl = formData.resumeLink;
      if (resumeFile) {
        finalResumeUrl = await uploadToCloudinary(resumeFile, "auto", "resume");
      }

      // 2. Prepare Payload
      const dataPayload = {
        ...formData,
        dateOfBirth: formatDOB(formData.dateOfBirth),
        photoUrl: finalPhotoUrl,
        resumeLink: finalResumeUrl,
        // Ensure arrays are properly formatted
        forGrouping: Array.isArray(formData.forGrouping) ? formData.forGrouping : [],
        skillsToImprove: Array.isArray(formData.skillsToImprove) ? formData.skillsToImprove : formData.skillsToImprove,
        jobOfferType: Array.isArray(formData.jobOfferType) ? formData.jobOfferType : formData.jobOfferType,
        offeringSector: Array.isArray(formData.offeringSector) ? formData.offeringSector : formData.offeringSector,
        levelOfSupport: Array.isArray(formData.levelOfSupport) ? formData.levelOfSupport : formData.levelOfSupport,
        // NEW FIELDS: Include occupation and companyDetails
        occupation: formData.occupation || "",
        companyDetails: formData.companyDetails || "",
      };

      // Clean up undefined/null values
      Object.keys(dataPayload).forEach(key => {
        if (dataPayload[key] === undefined || dataPayload[key] === null) {
          dataPayload[key] = "";
        }
      });

      console.log("Submitting Data Payload:", dataPayload);

      // 3. Send to Backend
      let res;
      if (editMember) {
        res = await API.put(`/member/${editMember._id}`, dataPayload);
      } else {
        res = await API.post("/member", dataPayload);
      }

      if (onSuccess) {
        onSuccess(res.data);
      }
      
      alert(editMember ? "Member updated successfully!" : "Member added successfully!");
      onClose();

    } catch (err) {
      console.error("Submit Error:", err);
      alert(err.message || "Operation failed. Please check console for details.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {editMember 
              ? "Edit Member" 
              : preSelectedMemberType 
                ? `Add New ${preSelectedMemberType}` 
                : "Add Member"}
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            
            {/* --- Photo Upload Section --- */}
            <div className={styles.fileUploadSection}>
              <label>Profile Photo</label>
              <div className={styles.fileInputContainer}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setPhotoFile(e.target.files[0])} 
                />
                <UploadCloud size={20} color="#666"/>
              </div>
              {uploadProgress.photo > 0 && (
                <div className={styles.progressBar}>
                  <div style={{ width: `${uploadProgress.photo}%` }}>
                    {uploadProgress.photo}%
                  </div>
                </div>
              )}
              {formData.photoUrl && !photoFile && (
                <p className={styles.fileStatus}>✓ Current Photo Available</p>
              )}
            </div>

            {/* --- Basic Fields --- */}
            <FormInput 
              label="Name *" 
              value={formData.name} 
              onChange={(v) => setFormData({ ...formData, name: v })} 
              required 
            />
            
            <FormInput 
              label="Father's Name" 
              value={formData.fathersName} 
              onChange={(v) => setFormData({ ...formData, fathersName: v })} 
            />
            
            <FormInput 
              label="Mobile Number *" 
              value={formData.mobileNumber} 
              onChange={(v) => setFormData({ ...formData, mobileNumber: v })} 
              required 
            />
            
            <FormInput 
              label="Email *" 
              value={formData.email} 
              onChange={(v) => setFormData({ ...formData, email: v })} 
              required 
            />
            
            <DropdownSelect
              label="Gender"
              value={formData.gender}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" }
              ]}
              onChange={(v) => setFormData({ ...formData, gender: v })}
            />

            <DateSelect
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleDOBChange}
            />

            {formData.age && (
              <FormInput
                label="Age"
                value={formData.age}
                readOnly
              />
            )}

            <FormInput 
              label="District *" 
              value={formData.district} 
              onChange={(v) => setFormData({ ...formData, district: v })} 
              required 
            />

            <FormInput 
              label="Address" 
              value={formData.address} 
              onChange={(v) => setFormData({ ...formData, address: v })} 
              placeholder="Full address"
            />

            <FormInput 
              label="Native Place" 
              value={formData.nativePlace} 
              onChange={(v) => setFormData({ ...formData, nativePlace: v })} 
            />

            <FormInput 
              label="Profession" 
              value={formData.profession} 
              onChange={(v) => setFormData({ ...formData, profession: v })} 
            />

            <DropdownSelect
              label=" Solidarity Member Status"
              value={formData.symMemberStatus}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Interested in joining", label: "Interested in joining" },
                { value: "No", label: "No" }
              ]}
              onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
            />

            {/* --- Member Type Dropdown (Hidden if preSelectedMemberType is passed) --- */}
            {!preSelectedMemberType && (
              <DropdownSelect
                label="Member Type *"
                value={formData.memberType}
                options={[
                  { value: "Job Seeker", label: "Job Seeker" },
                  { value: "Oppurtunity Provider", label: "Opportunity Provider" },
                  { value: "Referee", label: "Referee" },
                  { value: "Mentor", label: "Mentor" },
                  { value: "In need of Upskilling", label: "In need of Upskilling" },
                ]}
                onChange={(v) => setFormData({ ...formData, memberType: v })}
                required
              />
            )}

            {/* Group Tags */}
            <FormInput 
              label="Group Tags (comma separated)" 
              value={Array.isArray(formData.forGrouping) ? formData.forGrouping.join(", ") : formData.forGrouping} 
              onChange={(v) => setFormData({ 
                ...formData, 
                forGrouping: v.split(",").map(tag => tag.trim()).filter(tag => tag) 
              })} 
              placeholder="e.g., Tech, Marketing, Leadership"
            />

            {/* ================= CONDITIONAL FIELDS ================= */}

            {/* Common: Mentor & Job Seeker */}
            {(formData.memberType === "Mentor" || formData.memberType === "Job Seeker") && (
              <FormInput 
                label="Current Institution/Company" 
                value={formData.currentInstitutionOrCompany} 
                onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })} 
                placeholder="e.g. Google, IIT" 
              />
            )}

            {/* Mentor Specific */}
            {formData.memberType === "Mentor" && (
              <>
                <FormInput 
                  label="Designation / Job Role" 
                  value={formData.designation} 
                  onChange={(v) => setFormData({ ...formData, designation: v })} 
                  placeholder="e.g. Senior Engineer" 
                />
                <FormInput 
                  label="Expertise / Domain" 
                  value={formData.fieldofStudy_Interest} 
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} 
                  placeholder="e.g. AI, Data Science" 
                />
                <FormInput 
                  label="Experience (Years)" 
                  value={formData.workExp} 
                  onChange={(v) => setFormData({ ...formData, workExp: v })} 
                />
              </>
            )}

            {/* Job Seeker Specific */}
            {formData.memberType === "Job Seeker" && (
              <>
                <FormInput 
                  label="Member Need" 
                  value={formData.seekerNeed} 
                  onChange={(v) => setFormData({ ...formData, seekerNeed: v })} 
                />
                <FormInput 
                  label="Highest Education" 
                  value={formData.highest_education} 
                  onChange={(v) => setFormData({ ...formData, highest_education: v })} 
                />
                <FormInput 
                  label="Field of Study Interest" 
                  value={formData.fieldofStudy_Interest} 
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} 
                />
                <FormInput 
                  label="Preferred Job Role" 
                  value={formData.preferredJobRole_Sector} 
                  onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })} 
                />
                <FormInput 
                  label="Work Experience" 
                  value={formData.workExp} 
                  onChange={(v) => setFormData({ ...formData, workExp: v })} 
                />
                <FormInput 
                  label="Relocation Status" 
                  value={formData.relocationStatus} 
                  onChange={(v) => setFormData({ ...formData, relocationStatus: v })} 
                />
                <FormInput 
                  label="Preferred Job Location" 
                  value={formData.preferredJobLocation} 
                  onChange={(v) => setFormData({ ...formData, preferredJobLocation: v })} 
                />
                
                {/* Resume Upload */}
                <div className={styles.fileUploadSection}>
                  <label>Upload Resume (PDF/DOC)</label>
                  <div className={styles.fileInputContainer}>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={(e) => setResumeFile(e.target.files[0])} 
                    />
                    <UploadCloud size={20} color="#666"/>
                  </div>
                  {uploadProgress.resume > 0 && (
                    <div className={styles.progressBar}>
                      <div style={{ width: `${uploadProgress.resume}%` }}>
                        {uploadProgress.resume}%
                      </div>
                    </div>
                  )}
                  {formData.resumeLink && !resumeFile && (
                    <p className={styles.fileStatus}>✓ Current Resume Available</p>
                  )}
                </div>
              </>
            )}

            {/* Opportunity Provider Specific */}
            {formData.memberType === "Oppurtunity Provider" && (
              <>
                <FormInput 
                  label="Job Offer Type" 
                  value={formData.jobOfferType} 
                  onChange={(v) => setFormData({ ...formData, jobOfferType: v })} 
                />
                <FormInput 
                  label="Offering Sector" 
                  value={formData.offeringSector} 
                  onChange={(v) => setFormData({ ...formData, offeringSector: v })} 
                />
                <FormInput 
                  label="Opportunity Description" 
                  value={formData.opportunityDescription} 
                  onChange={(v) => setFormData({ ...formData, opportunityDescription: v })} 
                />
                <FormInput 
                  label="Offer Location" 
                  value={formData.offer_Location} 
                  onChange={(v) => setFormData({ ...formData, offer_Location: v })} 
                />
                <FormInput 
                  label="Contact For Seekers" 
                  value={formData.contactForSeekers} 
                  onChange={(v) => setFormData({ ...formData, contactForSeekers: v })} 
                />
              </>
            )}
            
            {/* Referee Specific */}
            {formData.memberType === "Referee" && (
              <>
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
                <FormInput 
                  label="Referrer Contact" 
                  value={formData.referrerContact} 
                  onChange={(v) => setFormData({ ...formData, referrerContact: v })} 
                />
                
                {/* NEW: Occupation and Company Details for Referees only */}
                <FormInput 
                  label="Occupation" 
                  value={formData.occupation} 
                  onChange={(v) => setFormData({ ...formData, occupation: v })} 
                  placeholder="e.g., Software Engineer, Doctor, Teacher"
                />

                <FormInput 
                  label="Company Details" 
                  value={formData.companyDetails} 
                  onChange={(v) => setFormData({ ...formData, companyDetails: v })} 
                  placeholder="e.g., Company Name, Industry, Role"
                />
              </>
            )}

            {/* Upskilling Specific */}
            {formData.memberType === "In need of Upskilling" && (
              <>
                <FormInput 
                  label="Skills to Improve (comma separated)" 
                  value={Array.isArray(formData.skillsToImprove) ? formData.skillsToImprove.join(", ") : formData.skillsToImprove} 
                  onChange={(v) => setFormData({ 
                    ...formData, 
                    skillsToImprove: v.split(",").map(skill => skill.trim()).filter(skill => skill) 
                  })} 
                />
                <FormInput 
                  label="Interest in Skill Building Program" 
                  value={formData.interest_SkillBuildingProgram} 
                  onChange={(v) => setFormData({ ...formData, interest_SkillBuildingProgram: v })} 
                />
                <FormInput 
                  label="Field of Study Interest" 
                  value={formData.fieldofStudy_Interest} 
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} 
                />
              </>
            )}

          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
              {btnLoading ? "Saving..." : editMember ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMember;