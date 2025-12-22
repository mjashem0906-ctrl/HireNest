import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import FormInput from "../UI/FormInput";
import DropdownSelect from "../UI/DropdownSelect";
import DateSelect from "../UI/DateSelect";
import CreatableSelect from "react-select/creatable";
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
  currentInstitutionOrCompany: "",
  district: "",
  forGrouping: [],

  // Job Seeker
  seekerNeed: "",
  highest_education: "",
  fieldofStudy_Interest: "",
  preferredJobRole_Sector: "",
  workExp: "",
  relocationStatus: "",
  preferredJobLocation: "",
  resumeLink: "",

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
  const [options, setOptions] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    // fetchDropdowns();

    if (editMember) {
      setFormData({
        ...initialState,
        ...editMember,
        dateOfBirth: editMember.dateOfBirth
          ? new Date(editMember.dateOfBirth)
          : null,
        // forGrouping:
        //   editMember.forGrouping?.map((g) => ({
        //     value: g,
        //     label: g,
        //   })) || [],
      });
    } else {
      setFormData(initialState);
    }
  }, [editMember]);

  // const fetchDropdowns = async () => {
  //   try {
  //     const res = await API.get("/dropdown");
  //     setOptions(
  //       res.data.map((d) => ({ value: d.name, label: d.name }))
  //     );
  //   } catch (err) {
  //     console.error("Dropdown fetch failed", err);
  //   }
  // };

  const handleCreate = async (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    try {
      await API.post("/dropdown", { name: inputValue });
      setOptions((prev) => [...prev, newOption]);
      setFormData((prev) => ({
        ...prev,
        forGrouping: [...prev.forGrouping, newOption],
      }));
    } catch (err) {
      console.error("Dropdown create failed", err);
    }
  };

  const formatDOB = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}/${d.getFullYear()}`;
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
      if (editMember) {
        res = await API.put(`/member/${editMember._id}`, payload);
      } else {
        res = await API.post("/member", payload);
      }
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      alert("Member save failed");
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
            <FormInput label="Name" value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })} required />

            {/* <FormInput label="Father Name" value={formData.fathersName}
              onChange={(v) => setFormData({ ...formData, fathersName: v })} /> */}

            <FormInput label="Mobile Number" value={formData.mobileNumber}
              onChange={(v) => setFormData({ ...formData, mobileNumber: v })} />

            <FormInput label="Email" value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })} />

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
              label="Member Type"
              value={formData.memberType}
              options={[
                { value: "Job Seeker", label: "Job Seeker" },
                { value: "Oppurtunity Provider", label: "Oppurtunity Provider" },
                { value: "Referee", label: "Referee" },
                { value: "In need of Upskilling", label: "In need of Upskilling" },
              ]}
              onChange={(v) => setFormData({ ...formData, memberType: v })}
              required
            />
           

            {/* Job Seeker */}
            {formData.memberType === "Job Seeker" && (
              <>
                <FormInput label="Member Need" value={formData.seekerNeed}
                  onChange={(v) => setFormData({ ...formData, seekerNeed: v })} />
                <FormInput label="Highest Education" value={formData.highest_education}
                  onChange={(v) => setFormData({ ...formData, highest_education: v })} />
                <FormInput label="Field of Study Interest" value={formData.fieldofStudy_Interest}
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} />
                <FormInput label="Preferred Job Role" value={formData.preferredJobRole_Sector}
                  onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })} />
                <FormInput label="Work Experience" value={formData.workExp}
                  onChange={(v) => setFormData({ ...formData, workExperience: v })} />
                <FormInput label="Relocation Status" value={formData.relocationStatus}
                  onChange={(v) => setFormData({ ...formData, relocationStatus: v })} />
                <FormInput label="Preferred Job Location" value={formData.preferredJobLocation}
                  onChange={(v) => setFormData({ ...formData, preferredJobLocation: v })} />
                {/* <FormInput label="Resume Link" value={formData.resumeLink}
                  onChange={(v) => setFormData({ ...formData, resumeLink: v })} /> */}
              </>
            )}

            {/* Opportunity Provider */}
            {formData.memberType === "Oppurtunity Provider" && (
              <>
                <FormInput label="Job Offer Type" value={formData.jobOfferType}
                  onChange={(v) => setFormData({ ...formData, jobOfferType: v })} />
                <FormInput label="Offering Sector" value={formData.offeringSector}
                  onChange={(v) => setFormData({ ...formData, offeringSector: v })} />
                <FormInput label="Opportunity Description" value={formData.opportunityDescription}
                  onChange={(v) => setFormData({ ...formData, opportunityDescription: v })} />
                <FormInput label="Offer Location" value={formData.offer_Location}
                  onChange={(v) => setFormData({ ...formData, offer_Location: v })} />
                <FormInput label="Contact For Seekers" value={formData.contactForSeekers}
                  onChange={(v) => setFormData({ ...formData, contactForSeekers: v })} />
              </>
            )}

            {/* Referee */}
            {formData.memberType === "Referee" && (
              <>
                <FormInput label="Referrer Status" value={formData.referrerStatus}
                  onChange={(v) => setFormData({ ...formData, referrerStatus: v })} />
                <FormInput label="Referring Offer Type" value={formData.referringOfferType}
                  onChange={(v) => setFormData({ ...formData, referringOfferType: v })} />
                <FormInput label="Referring Sector" value={formData.referringSector}
                  onChange={(v) => setFormData({ ...formData, referringSector: v })} />
                <FormInput label="Referring For" value={formData.referringFor}
                  onChange={(v) => setFormData({ ...formData, referringFor: v })} />
                <FormInput label="Level of Support" value={formData.levelOfSupport}
                  onChange={(v) => setFormData({ ...formData, levelOfSupport: v })} />
              </>
            )}

            {/* Upskilling */}
            {formData.memberType === "In need of Upskilling" && (
              <>
                <FormInput label="Skills to Improve" value={formData.skillsToImprove}
                  onChange={(v) => setFormData({ ...formData, skillsToImprove: v })} />
                <FormInput label="Field of Study Interest" value={formData.fieldofStudy_Interest}
                  onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })} />
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