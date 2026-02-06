// //---------------------------31/01---------------------4.24---------------------------

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { X } from 'lucide-react';
// import styles from './AddRecruiterModal.module.scss';

// const AddRecruiterModal = ({ isOpen, onClose, onSuccess, recruiterToEdit }) => {
//   const initialFormState = {
//     fullName: '', email: '', phone: '', designation: '', department: '',
//     employeeId: '', companyName: 'JobBridge Karnataka', location: '',
//     industries: '', hiringVolume: '', teamSize: 'Individual Contributor'
//   };

//   const [formData, setFormData] = useState(initialFormState);
//   const isEditMode = Boolean(recruiterToEdit);

//   // --- DROPDOWN OPTIONS ---
//   const departmentOptions = [
//     "Human Resources", "IT / Engineering", "Sales", "Marketing",
//     "Finance", "Operations", "Legal", "Product Management"
//   ];

//   const regionOptions = [
//     "Bangalore, India", "Mumbai, India", "Delhi NCR, India",
//     "Hyderabad, India", "Chennai, India", "Pune, India",
//     "Remote (Global)", "Remote (India)", "USA", "UK", "Dubai / UAE"
//   ];

//   const industryOptions = [
//     "Information Technology", "Healthcare", "FinTech", "E-commerce",
//     "Manufacturing", "Education / EdTech", "Real Estate",
//     "Consulting", "Media & Entertainment"
//   ];

//   const volumeOptions = [
//     "1-5 positions / month", "5-10 positions / month",
//     "10-20 positions / month", "20-50 positions / month",
//     "50+ positions (High Volume)"
//   ];

//   useEffect(() => {
//     if (isOpen) {
//       if (isEditMode && recruiterToEdit) {
//         setFormData({
//           fullName: recruiterToEdit.fullName || '',
//           email: recruiterToEdit.email || '',
//           phone: recruiterToEdit.phone || '',
//           designation: recruiterToEdit.designation || '',
//           department: recruiterToEdit.department || '',
//           employeeId: recruiterToEdit.employeeId || '',
//           companyName: recruiterToEdit.companyName || '',
//           location: recruiterToEdit.location || '',
//           // Handle industries if it's an array or string
//           industries: Array.isArray(recruiterToEdit.industries)
//             ? recruiterToEdit.industries.join(', ')
//             : recruiterToEdit.industries || '',
//           hiringVolume: recruiterToEdit.hiringVolume || '',
//           teamSize: recruiterToEdit.teamSize || 'Individual Contributor',
//         });
//       } else {
//         setFormData(initialFormState);
//       }
//     }
//   }, [isOpen, isEditMode, recruiterToEdit]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const dataToSend = {
//         ...formData,
//         // Safe split: check if industries is a string first
//         industries: typeof formData.industries === 'string'
//           ? formData.industries.split(',').map(item => item.trim())
//           : formData.industries,
//       };

//       if (isEditMode) {
//         await axios.put(`${import.meta.env.VITE_API_URL}/api/recruiters/${recruiterToEdit._id}`, dataToSend);
//         alert("Recruiter updated successfully!");
//       } else {
//         await axios.post(`${import.meta.env.VITE_API_URL}/api/recruiters`, dataToSend);
//         alert("Recruiter added successfully!");
//       }

//       if (onSuccess) onSuccess();
//       onClose();
//     } catch (error) {
//       console.error("Error saving recruiter:", error);
//       alert(error.response?.data?.message || "Failed to save recruiter");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modalContainer}>

//         <div className={styles.header}>
//           <h2>{isEditMode ? 'Edit Recruiter' : 'Add New Recruiter'}</h2>
//           <button onClick={onClose} className={styles.closeBtn}>
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className={styles.formGrid} style={{ maxHeight: '70vh', overflowY: 'auto' }}>

//             {/* --- SECTION 1: Personal Info --- */}
//             <h3 className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1 mt-0">Personal Details</h3>

//             <div className={styles.inputGroup}>
//               <label>Full Name *</label>
//               <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Mobile Number *</label>
//               <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Email ID *</label>
//               <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Employee ID</label>
//               <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="Optional" />
//             </div>

//             {/* --- SECTION 2: Professional Info --- */}
//             <h3 className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1 mt-4">Professional Details</h3>

//             <div className={styles.inputGroup}>
//               <label>Designation *</label>
//               <input type="text" name="designation" value={formData.designation} onChange={handleChange} required />
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Department *</label>
//               <input list="departmentOptions" name="department" value={formData.department} onChange={handleChange} placeholder="Select or Type Department" required />
//               <datalist id="departmentOptions">
//                 {departmentOptions.map((opt, i) => <option key={i} value={opt} />)}
//               </datalist>
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Company Name</label>
//               <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} />
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Hiring Region (Location)</label>
//               <input list="regionOptions" name="location" value={formData.location} onChange={handleChange} placeholder="Select or Type Region" />
//               <datalist id="regionOptions">
//                 {regionOptions.map((opt, i) => <option key={i} value={opt} />)}
//               </datalist>
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Industries (Comma separated)</label>
//               <input list="industryOptions" name="industries" value={formData.industries} onChange={handleChange} placeholder="e.g. IT, Healthcare" />
//               <datalist id="industryOptions">
//                 {industryOptions.map((opt, i) => <option key={i} value={opt} />)}
//               </datalist>
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Hiring Volume (Monthly)</label>
//               <input list="volumeOptions" name="hiringVolume" value={formData.hiringVolume} onChange={handleChange} placeholder="Select or Type Volume" />
//               <datalist id="volumeOptions">
//                 {volumeOptions.map((opt, i) => <option key={i} value={opt} />)}
//               </datalist>
//             </div>

//             <div className={styles.inputGroup}>
//               <label>Team Size</label>
//               <select name="teamSize" value={formData.teamSize} onChange={handleChange}>
//                 <option value="Individual Contributor">Individual Contributor</option>
//                 <option value="Small Team (1-5)">Small Team (1-5)</option>
//                 <option value="Large Team (5+)">Large Team (5+)</option>
//               </select>
//             </div>

//           </div>

//           <div className={styles.footer}>
//             <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
//             <button type="submit" className={styles.submitBtn}>
//               {isEditMode ? 'Update Recruiter' : '+ Add Recruiter'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddRecruiterModal;

//-----------------------6/2-------------3.11--------------

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Briefcase, Globe, Users } from 'lucide-react';
import styles from './AddRecruiterModal.module.scss';

const AddRecruiterModal = ({ isOpen, onClose, onSuccess, recruiterToEdit }) => {
  const initialFormState = {
    fullName: '', email: '', phone: '', designation: '', department: '',
    employeeId: '', companyName: 'JobBridge Karnataka', location: '',
    industries: '', hiringVolume: '', teamSize: 'Individual Contributor'
  };

  const [formData, setFormData] = useState(initialFormState);
  const isEditMode = Boolean(recruiterToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && recruiterToEdit) {
        setFormData({
          ...recruiterToEdit,
          industries: Array.isArray(recruiterToEdit.industries)
            ? recruiterToEdit.industries.join(', ')
            : recruiterToEdit.industries || '',
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, isEditMode, recruiterToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        industries: typeof formData.industries === 'string'
          ? formData.industries.split(',').map(item => item.trim())
          : formData.industries,
      };

      const url = `${import.meta.env.VITE_API_URL}/api/recruiters`;
      if (isEditMode) {
        await axios.put(`${url}/${recruiterToEdit._id}`, dataToSend);
      } else {
        await axios.post(url, dataToSend);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save recruiter");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h2>{isEditMode ? 'Update Recruiter' : 'Register New Recruiter'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGrid}>
            
            {/* --- SECTION 1 --- */}
            <div className={styles.sectionTitle}>Personal Details</div>

            <div className={styles.inputGroup}>
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Email ID *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Mobile Number *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Employee ID</label>
              <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-001" />
            </div>

            {/* --- SECTION 2 --- */}
            <div className={styles.sectionTitle}>Professional Profile</div>

            <div className={styles.inputGroup}>
              <label>Designation *</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Senior Talent Acquisition" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                <option value="Human Resources">Human Resources</option>
                <option value="IT / Engineering">IT / Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Hiring Region</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, India" />
            </div>

            <div className={styles.inputGroup}>
              <label>Monthly Hiring Volume</label>
              <select name="hiringVolume" value={formData.hiringVolume} onChange={handleChange}>
                <option value="">Select Volume</option>
                <option value="1-5 positions">1-5 positions</option>
                <option value="5-15 positions">5-15 positions</option>
                <option value="15+ positions">15+ positions</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Team Size</label>
              <select name="teamSize" value={formData.teamSize} onChange={handleChange}>
                <option value="Individual Contributor">Individual Contributor</option>
                <option value="Small Team (1-5)">Small Team (1-5)</option>
                <option value="Large Team (5+)">Large Team (5+)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} />
            </div>

          </div>
        </form>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Discard</button>
          <button type="submit" onClick={handleSubmit} className={styles.submitBtn}>
            {isEditMode ? 'Save Changes' : 'Confirm & Add Recruiter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecruiterModal;