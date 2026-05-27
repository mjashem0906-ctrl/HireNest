
//-----------------------6/2-------------3.11--------------

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Briefcase, Globe, Users } from 'lucide-react';
import styles from './AddRecruiterModal.module.scss';

const AddRecruiterModal = ({ isOpen, onClose, onSuccess, recruiterToEdit }) => {
  const initialFormState = {
    fullName: '', email: '', phone: '', designation: '', department: '',
    employeeId: '', companyName: '', companyGST: '', companyEmail: '', location: '',
    industries: '', hiringVolume: '', teamSize: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const isEditMode = Boolean(recruiterToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && recruiterToEdit) {
        setFormData({
          ...recruiterToEdit,
          companyEmail: recruiterToEdit.companyEmail || '',
          companyGST: recruiterToEdit.companyGST || '',
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
              <label>Hiring Region *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, India" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Monthly Hiring Volume *</label>
              <select name="hiringVolume" value={formData.hiringVolume} onChange={handleChange} required>
                <option value="">Select Volume</option>
                <option value="1-5 positions">1-5 positions</option>
                <option value="5-15 positions">5-15 positions</option>
                <option value="15+ positions">15+ positions</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Team Size *</label>
              <select name="teamSize" value={formData.teamSize} onChange={handleChange} required>
                <option value="">Select Team Size</option>
                <option value="Individual Contributor">Individual Contributor</option>
                <option value="Small Team (1-5)">Small Team (1-5)</option>
                <option value="Large Team (5+)">Large Team (5+)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Company Name *</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>

            <div className={styles.inputGroup}>
              <label>Company GST *</label>
              <input type="text" name="companyGST" value={formData.companyGST || ''} onChange={handleChange} placeholder="e.g. 29AAAAA1111A1Z1" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Company Email ID *</label>
              <input type="email" name="companyEmail" value={formData.companyEmail || ''} onChange={handleChange} placeholder="company@example.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Industries (comma separated) *</label>
              <input
                type="text"
                name="industries"
                value={formData.industries}
                onChange={handleChange}
                placeholder="e.g. IT, Healthcare, FinTech"
                required
              />
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