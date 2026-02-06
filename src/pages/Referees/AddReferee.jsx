// //------------31/01--------------------------------4.33---------------------------

// import React, { useState } from "react";
// import { X, Plus } from "lucide-react";
// import FormInput from "../../components/UI/FormInput";
// import DropdownSelect from "../../components/UI/DropdownSelect";
// import API from "../../axios";
// import styles from "../../components/Models/AddModel.module.scss"; // Ensure you have this SCSS file

// const initialState = {
//   name: "",
//   mobileNumber: "",
//   email: "",
//   gender: "",
//   age: "",
//   memberType: "Referee",

//   // Referee Specific Fields
//   referrerStatus: "",
//   referringOfferType: "", 
//   referringSector: "", 
//   referringFor: "",
//   levelOfSupport: "", 
//   occupation: "",
//   companyDetails: "",
//   sector: "", 
//   jobOfferType: "", 
//   opportunityDescription: "", 
//   referrerContact: "",
//   offer_Location: "", // Note: matches backend underscore convention
//   symMemberStatus: "Active", 
//   address: "",
//   district: "",
// };

// function AddReferee({ onSuccess }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [formData, setFormData] = useState(initialState);
//   const [btnLoading, setBtnLoading] = useState(false);

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//     if (!isOpen) setFormData(initialState);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (btnLoading) return;
//     setBtnLoading(true);

//     try {
//       // DEBUG: Log what we're sending
//       console.log("=== FRONTEND DEBUG: Sending referee data ===");
//       console.log("Full formData:", JSON.stringify(formData, null, 2));
      
//       const res = await API.post("/member", formData);
      
//       if (onSuccess) onSuccess(res.data);
//       alert("Referee added successfully!");
//       toggleModal();
//     } catch (err) {
//       console.error("Error adding referee:", err);
//       console.error("Error response:", err.response?.data);
//       alert("Failed to add referee. Check console for details.");
//     } finally {
//       setBtnLoading(false);
//     }
//   };

//   const statusOptions = [
//     { value: "Active", label: "Active" },
//     { value: "Inactive", label: "Inactive" },
//     { value: "May be in Future", label: "May be in Future" },
//     { value: "Yes", label: "Yes" },
//     { value: "No", label: "No" },
//   ];

//   return (
//     <>
//       <button onClick={toggleModal} className={styles.addRefereeBtn} style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', background:'#8b5cf6', color:'white', border:'none', borderRadius:'6px', cursor:'pointer'}}>
//         <Plus size={20} />
//         Add Job Referee
//       </button>

//       {isOpen && (
//         <div className={styles.overlay}>
//           <div className={styles.modal}>
//             <div className={styles.header}>
//               <h2>Add New Referee</h2>
//               <button onClick={toggleModal} className={styles.closeButton}>
//                 <X size={18} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className={styles.form}>
//               <div className={styles.formGrid}>
//                 {/* Basic Info */}
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

//                 <FormInput 
//                   label="Age" 
//                   value={formData.age}
//                   onChange={(v) => setFormData({ ...formData, age: v })} 
//                   type="number"
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

//                 <FormInput 
//                   label="Occupation" 
//                   value={formData.occupation}
//                   onChange={(v) => setFormData({ ...formData, occupation: v })} 
//                 />

//                 <FormInput 
//                   label="Company Details" 
//                   value={formData.companyDetails}
//                   onChange={(v) => setFormData({ ...formData, companyDetails: v })} 
//                 />

//                 {/* Status Fields */}
//                 <DropdownSelect
//                   label="Solidarity Member Status"
//                   value={formData.symMemberStatus}
//                   options={statusOptions}
//                   onChange={(v) => setFormData({ ...formData, symMemberStatus: v })}
//                 />

//                 <DropdownSelect
//                   label="Referrer Status"
//                   value={formData.referrerStatus}
//                   options={statusOptions}
//                   onChange={(v) => setFormData({ ...formData, referrerStatus: v })}
//                 />

//                 {/* Location Fields */}
//                 <FormInput 
//                   label="District" 
//                   value={formData.district}
//                   onChange={(v) => setFormData({ ...formData, district: v })} 
//                 />

//                 <FormInput 
//                   label="Address" 
//                   value={formData.address}
//                   onChange={(v) => setFormData({ ...formData, address: v })} 
//                 />

//                 {/* IMPORTANT: Field name is offer_Location (with underscore) */}
//                 <FormInput 
//                   label="Offer Location" 
//                   value={formData.offer_Location}
//                   onChange={(v) => setFormData({ ...formData, offer_Location: v })} 
//                 />

//                 {/* Sector Fields */}
//                 <FormInput 
//                   label="Sector" 
//                   value={formData.sector}
//                   onChange={(v) => setFormData({ ...formData, sector: v })} 
//                 />

//                 <FormInput 
//                   label="Referring Sector" 
//                   value={formData.referringSector}
//                   onChange={(v) => setFormData({ ...formData, referringSector: v })} 
//                 />

//                 {/* Offer Type Fields */}
//                 <FormInput 
//                   label="Job Offer Type" 
//                   value={formData.jobOfferType}
//                   onChange={(v) => setFormData({ ...formData, jobOfferType: v })} 
//                 />

//                 <FormInput 
//                   label="Referring Offer Type" 
//                   value={formData.referringOfferType}
//                   onChange={(v) => setFormData({ ...formData, referringOfferType: v })} 
//                 />

//                 {/* Additional Fields */}
//                 <FormInput 
//                   label="Referring For" 
//                   value={formData.referringFor}
//                   onChange={(v) => setFormData({ ...formData, referringFor: v })} 
//                 />

//                 <FormInput 
//                   label="Level of Support" 
//                   value={formData.levelOfSupport}
//                   onChange={(v) => setFormData({ ...formData, levelOfSupport: v })} 
//                 />

//                 <FormInput 
//                   label="Referrer Contact" 
//                   value={formData.referrerContact}
//                   onChange={(v) => setFormData({ ...formData, referrerContact: v })} 
//                 />

//                 {/* Description */}
//                 <div style={{ gridColumn: "1 / -1" }}>
//                   <FormInput 
//                     label="Description" 
//                     value={formData.opportunityDescription}
//                     onChange={(v) => setFormData({ ...formData, opportunityDescription: v })}
//                     textarea
//                     rows={4}
//                   />
//                 </div>
//               </div>

//               <div className={styles.actions}>
//                 <button 
//                   type="button" 
//                   onClick={toggleModal} 
//                   className={styles.cancelButton}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   disabled={btnLoading} 
//                   className={styles.submitButton}
//                 >
//                   {btnLoading ? "Saving..." : "Save Referee"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default AddReferee;

//-------------6/2------------------------------6.23---------------------------

import React, { useState } from "react";
import { X, Plus, UserPlus, FileText, MapPin, Briefcase, Info } from "lucide-react";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import API from "../../axios";
import styles from "./AddModel.module.scss";

const initialState = {
  name: "", mobileNumber: "", email: "", gender: "", age: "",
  memberType: "Referee", referrerStatus: "", referringOfferType: "", 
  referringSector: "", referringFor: "", levelOfSupport: "", occupation: "",
  companyDetails: "", sector: "", jobOfferType: "", opportunityDescription: "", 
  referrerContact: "", offer_Location: "", symMemberStatus: "Active", 
  address: "", district: "",
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
      alert("Job Referee registered successfully!");
      toggleModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add referee.");
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

  return (
    <>
      <button 
        onClick={toggleModal} 
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700',
          cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.2)'
        }}
      >
        <UserPlus size={18} />
        Add Job Referee
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Register Job Referee</h2>
              <button onClick={toggleModal} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                
                {/* --- SECTION 1: PERSONAL --- */}
                <div className={styles.sectionTitle}>Personal Profile</div>
                <FormInput label="Full Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                <FormInput label="Email ID" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                <FormInput label="Mobile Number" value={formData.mobileNumber} onChange={(v) => setFormData({ ...formData, mobileNumber: v })} />
                <div className={styles.formGrid} style={{gridColumn: 'span 1', gap: '15px'}}>
                   <FormInput label="Age" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} type="number" />
                   <DropdownSelect label="Gender" value={formData.gender} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} onChange={(v) => setFormData({ ...formData, gender: v })} />
                </div>

                {/* --- SECTION 2: PROFESSIONAL --- */}
                <div className={styles.sectionTitle}>Professional Info</div>
                <FormInput label="Current Occupation" value={formData.occupation} onChange={(v) => setFormData({ ...formData, occupation: v })} />
                <FormInput label="Company Details" value={formData.companyDetails} onChange={(v) => setFormData({ ...formData, companyDetails: v })} />
                <FormInput label="Primary Industry/Sector" value={formData.sector} onChange={(v) => setFormData({ ...formData, sector: v })} />
                <DropdownSelect label="Solidarity Status" value={formData.symMemberStatus} options={statusOptions} onChange={(v) => setFormData({ ...formData, symMemberStatus: v })} />

                {/* --- SECTION 3: REFERRAL SCOPE --- */}
                <div className={styles.sectionTitle}>Referral Context</div>
                <DropdownSelect label="Referrer Eligibility" value={formData.referrerStatus} options={statusOptions} onChange={(v) => setFormData({ ...formData, referrerStatus: v })} />
                <FormInput label="Referring For (Role)" value={formData.referringFor} onChange={(v) => setFormData({ ...formData, referringFor: v })} />
                <FormInput label="Referring Sector" value={formData.referringSector} onChange={(v) => setFormData({ ...formData, referringSector: v })} />
                <FormInput label="Job Offer Type" value={formData.jobOfferType} onChange={(v) => setFormData({ ...formData, jobOfferType: v })} />
                <FormInput label="Level of Support" value={formData.levelOfSupport} onChange={(v) => setFormData({ ...formData, levelOfSupport: v })} />
                <FormInput label="Referrer Contact Ref" value={formData.referrerContact} onChange={(v) => setFormData({ ...formData, referrerContact: v })} />

                {/* --- SECTION 4: LOCATION --- */}
                <div className={styles.sectionTitle}>Location Details</div>
                <FormInput label="District" value={formData.district} onChange={(v) => setFormData({ ...formData, district: v })} />
                <FormInput label="Offer Location" value={formData.offer_Location} onChange={(v) => setFormData({ ...formData, offer_Location: v })} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormInput label="Full Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
                </div>

                {/* --- SECTION 5: DESCRIPTION --- */}
                <div className={styles.sectionTitle}>Opportunity Description</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormInput 
                    label="Briefly describe the referral opportunity" 
                    value={formData.opportunityDescription}
                    onChange={(v) => setFormData({ ...formData, opportunityDescription: v })}
                    textarea
                    rows={3}
                  />
                </div>
              </div>
            </form>

            <div className={styles.actions}>
              <button type="button" onClick={toggleModal} className={styles.cancelButton}>Discard</button>
              <button type="submit" onClick={handleSubmit} disabled={btnLoading} className={styles.submitButton}>
                {btnLoading ? "Processing..." : "Confirm & Save Referee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddReferee;