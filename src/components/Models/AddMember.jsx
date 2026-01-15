//------------------15/01--------------------4.10-----
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios"; // Required for Cloudinary upload
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
  memberType: "",
  symMemberStatus: "Active",
  currentInstitutionOrCompany: "",
  district: "",
  forGrouping: [],

  // Mentor Specific
  designation: "",
  workExp: "",

  // Job Seeker
  seekerNeed: "",
  highest_education: "",
  fieldofStudy_Interest: "",
  preferredJobRole_Sector: "",
  relocationStatus: "",
  preferredJobLocation: "",
  
  // Storing Cloudinary URLs here
  photo: "", 
  resume: "",

  // Opportunity Provider
  jobOfferType: "",
  offeringSector: "",
  opportunityDescription: "",
  offer_Location: "",
  contactForSeekers: "",

  // Referee
  referrerStatus: "",
  referringOfferType: "",
  referringSector: "",
  referringFor: "",
  levelOfSupport: "",
  referrerContact: "",

  // Upskilling
  interest_SkillBuildingProgram: "",
  skillsToImprove: "",
};

function AddMember({ isOpen, onClose, editMember, onSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [photoFile, setPhotoFile] = useState(null);   // Store raw file for upload
  const [resumeFile, setResumeFile] = useState(null); // Store raw file for upload
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (editMember) {
      setFormData({
        ...initialState,
        ...editMember,
        dateOfBirth: editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
        designation: editMember.designation || "",
        workExp: editMember.workExp || "",
        currentInstitutionOrCompany: editMember.currentInstitutionOrCompany || "",
        symMemberStatus: editMember.symMemberStatus || "Active",
        photo: editMember.photo || "",
        resume: editMember.resume || "",
      });
      setPhotoFile(null);
      setResumeFile(null);
    } else {
      setFormData(initialState);
      setPhotoFile(null);
      setResumeFile(null);
    }
  }, [editMember]);

  const formatDOB = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- CLOUDINARY UPLOAD FUNCTION ---
  const uploadToCloudinary = async (file, resourceType) => {
    if (!file) return null;

    // Credentials from your code
    const cloudName = "dwelwaavj";       
    const uploadPreset = "jobbridge_preset"; 
    
    // Cloudinary API Endpoint
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(api, data);
      return res.data.secure_url; // Returns the permanent URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Failed to upload file. Check your internet connection.");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (btnLoading) return;

    setBtnLoading(true);

    try {
      // 1. Upload Photo if a new one is selected
      let finalPhotoUrl = formData.photo;
      if (photoFile) {
        finalPhotoUrl = await uploadToCloudinary(photoFile, "image");
      }

      // 2. Upload Resume if a new one is selected
      let finalResumeUrl = formData.resume;
      if (resumeFile) {
        // Use "auto" to automatically detect PDF/Docs/Images
        finalResumeUrl = await uploadToCloudinary(resumeFile, "auto");
      }

      // 3. Prepare Data Object (sending JSON)
      const dataPayload = {
        ...formData,
        dateOfBirth: formatDOB(formData.dateOfBirth),
        photo: finalPhotoUrl,
        resume: finalResumeUrl,
      };

      // 4. Send to Backend
      let res;
      if (editMember) {
        res = await API.put(`/member/${editMember._id}`, dataPayload);
      } else {
        res = await API.post("/member", dataPayload);
      }

      onSuccess?.(res.data);
      onClose();
      alert("Member saved successfully!");

    } catch (err) {
      console.error(err);
      alert("Member save failed.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editMember ? "Edit Member" : "Add Member"}</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            
            {/* --- Photo Upload --- */}
            <div className="flex flex-col gap-1">
                <label style={{fontSize: '0.9rem', fontWeight: 500, color:'#555'}}>Profile Photo</label>
                <div style={{border:'1px solid #ccc', padding:'5px', borderRadius:'4px', background:'white'}}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                    />
                </div>
                {/* Visual feedback if a URL already exists */}
                {formData.photo && !photoFile && (
                   <p style={{fontSize:'0.75rem', color:'green'}}>Current Photo: Available</p>
                )}
            </div>

            <FormInput label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />

            <FormInput label="Mobile Number" value={formData.mobileNumber} onChange={(v) => setFormData({ ...formData, mobileNumber: v })} />

            <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />

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

            <DropdownSelect
              label="Member Status"
              value={formData.symMemberStatus}
              options={[
                { value: "Yes", label: "Yes" },
                { value: "Interested in joining", label: "Interested in joining" },
                { value: "No", label: "No" },
              ]}
              onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
            />

            <DropdownSelect
              label="Member Type *"
              value={formData.memberType}
              options={[
                { value: "Job Seeker", label: "Job Seeker" },
                { value: "Oppurtunity Provider", label: "Oppurtunity Provider" },
                { value: "Referee", label: "Referee" },
                { value: "Mentor", label: "Mentor" },
                { value: "In need of Upskilling", label: "In need of Upskilling" },
              ]}
              onChange={(v) => setFormData({ ...formData, memberType: v })}
              required
            />

            <FormInput label="District / Address" value={formData.district} onChange={(v) => setFormData({ ...formData, district: v })} placeholder="e.g. Bangalore" />
            
            {/* Common Fields */}
            {(formData.memberType === "Mentor" || formData.memberType === "Job Seeker") && (
                 <FormInput label="Current Institution/Company" value={formData.currentInstitutionOrCompany} onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })} />
            )}

            {/* Mentor Specific */}
            {formData.memberType === "Mentor" && (
              <>
                <FormInput label="Designation / Job Role" value={formData.designation} onChange={(v) => setFormData({ ...formData, designation: v })} placeholder="e.g. Senior Engineer" />
                <FormInput label="Expertise / Field" value={formData.fieldofStudy_Interest} onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} placeholder="e.g. AI, Marketing" />
                <FormInput label="Experience (Years)" value={formData.workExp} onChange={(v) => setFormData({ ...formData, workExp: v })} placeholder="e.g. 8" />
              </>
            )}

            {/* Job Seeker */}
            {formData.memberType === "Job Seeker" && (
              <>
                <FormInput label="Member Need" value={formData.seekerNeed} onChange={(v) => setFormData({ ...formData, seekerNeed: v })} />
                <FormInput label="Highest Education" value={formData.highest_education} onChange={(v) => setFormData({ ...formData, highest_education: v })} />
                <FormInput label="Field of Study Interest" value={formData.fieldofStudy_Interest} onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} />
                <FormInput label="Preferred Job Role" value={formData.preferredJobRole_Sector} onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })} />
                <FormInput label="Work Experience" value={formData.workExp} onChange={(v) => setFormData({ ...formData, workExp: v })} />
                <FormInput label="Relocation Status" value={formData.relocationStatus} onChange={(v) => setFormData({ ...formData, relocationStatus: v })} />
                <FormInput label="Preferred Job Location" value={formData.preferredJobLocation} onChange={(v) => setFormData({ ...formData, preferredJobLocation: v })} />
                
                {/* --- Resume Upload --- */}
                <div className="flex flex-col gap-1">
                    <label style={{fontSize: '0.9rem', fontWeight: 500, color:'#555'}}>Upload Resume</label>
                    <div style={{border:'1px solid #ccc', padding:'5px', borderRadius:'4px', background:'white'}}>
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files[0])}
                        />
                    </div>
                    {/* Visual feedback */}
                    {formData.resume && !resumeFile && (
                       <p style={{fontSize:'0.75rem', color:'green'}}>Current Resume: Available</p>
                    )}
                </div>

              </>
            )}

            {/* Opportunity Provider */}
            {formData.memberType === "Oppurtunity Provider" && (
              <>
                <FormInput label="Job Offer Type" value={formData.jobOfferType} onChange={(v) => setFormData({ ...formData, jobOfferType: v })} />
                <FormInput label="Offering Sector" value={formData.offeringSector} onChange={(v) => setFormData({ ...formData, offeringSector: v })} />
                <FormInput label="Opportunity Description" value={formData.opportunityDescription} onChange={(v) => setFormData({ ...formData, opportunityDescription: v })} />
                <FormInput label="Offer Location" value={formData.offer_Location} onChange={(v) => setFormData({ ...formData, offer_Location: v })} />
                <FormInput label="Contact For Seekers" value={formData.contactForSeekers} onChange={(v) => setFormData({ ...formData, contactForSeekers: v })} />
              </>
            )}

            {/* Referee */}
            {formData.memberType === "Referee" && (
              <>
                <FormInput label="Referrer Status" value={formData.referrerStatus} onChange={(v) => setFormData({ ...formData, referrerStatus: v })} />
                <FormInput label="Referring Offer Type" value={formData.referringOfferType} onChange={(v) => setFormData({ ...formData, referringOfferType: v })} />
                <FormInput label="Referring Sector" value={formData.referringSector} onChange={(v) => setFormData({ ...formData, referringSector: v })} />
                <FormInput label="Referring For" value={formData.referringFor} onChange={(v) => setFormData({ ...formData, referringFor: v })} />
                <FormInput label="Level of Support" value={formData.levelOfSupport} onChange={(v) => setFormData({ ...formData, levelOfSupport: v })} />
              </>
            )}

            {/* Upskilling */}
            {formData.memberType === "In need of Upskilling" && (
              <>
                <FormInput label="Skills to Improve" value={formData.skillsToImprove} onChange={(v) => setFormData({ ...formData, skillsToImprove: v })} />
                <FormInput label="Field of Study Interest" value={formData.fieldofStudy_Interest} onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} />
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
              {btnLoading ? "Uploading & Saving..." : editMember ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMember;