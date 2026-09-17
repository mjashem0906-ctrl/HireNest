
//-----------------------6/2-------------3.11--------------

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, User, Briefcase, Globe, Users, Eye, EyeOff } from 'lucide-react';
import styles from './AddRecruiterModal.module.scss';

const AddRecruiterModal = ({ isOpen, onClose, onSuccess, recruiterToEdit }) => {
  const initialFormState = {
    fullName: '', email: '', phone: '', designation: '', department: '',
    employeeId: '', companyName: '', companyGST: '', companyEmail: '', location: '',
    industries: '', hiringVolume: '', teamSize: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showCredentialsSection, setShowCredentialsSection] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const isEditMode = Boolean(recruiterToEdit);
  const formBodyRef = useRef(null);
  const credentialsRef = useRef(null);

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
        setCredentials({
          username: recruiterToEdit.username || recruiterToEdit.email || '',
          password:
            recruiterToEdit.plainPassword ||
            recruiterToEdit.rawPassword ||
            (recruiterToEdit.password && !recruiterToEdit.password.startsWith('$2')
              ? recruiterToEdit.password
              : ''),
        });
        setShowCredentialsSection(false);
      } else {
        setFormData(initialFormState);
        setCredentials({ username: '', password: '' });
        setShowCredentialsSection(false);
      }
      setShowPassword(false);
    }
  }, [isOpen, isEditMode, recruiterToEdit]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'email' && (!credentials.username || credentials.username === prev.email)) {
        setCredentials((c) => ({ ...c, username: value }));
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate primary recruiter fields
    const nameVal = formData.fullName || formData.name;
    if (
      !nameVal || !formData.email || !formData.phone || !formData.designation ||
      !formData.department || !formData.location || !formData.hiringVolume ||
      !formData.teamSize || !formData.companyName || !formData.companyEmail || !formData.industries
    ) {
      alert("Please fill in all required fields marked with *.");
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      alert("Mobile Number must be exactly 10 digits.");
      return;
    }

    // 2. If credentials section is not revealed yet, open it directly below the form
    if (!showCredentialsSection) {
      setCredentials((prev) => ({
        ...prev,
        username: prev.username || formData.email || '',
        password:
          prev.password !== undefined && prev.password !== ''
            ? prev.password
            : recruiterToEdit?.plainPassword ||
              recruiterToEdit?.rawPassword ||
              (recruiterToEdit?.password && !recruiterToEdit?.password.startsWith('$2')
                ? recruiterToEdit?.password
                : ''),
      }));
      setShowCredentialsSection(true);

      setTimeout(() => {
        if (credentialsRef.current) {
          credentialsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (formBodyRef.current) {
          formBodyRef.current.scrollTo({
            top: formBodyRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
      return;
    }

    // 3. Validate credentials before saving
    if (!credentials.username || !String(credentials.username).trim()) {
      alert("Please enter a valid Email or Username for recruiter login.");
      return;
    }

    if (!isEditMode && (!credentials.password || !String(credentials.password).trim())) {
      alert("Please enter a password for the recruiter to login.");
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        username: String(credentials.username).trim(),
        loginUsername: String(credentials.username).trim(),
        ...(credentials.password && String(credentials.password).trim()
          ? { password: String(credentials.password).trim() }
          : {}),
        industries: typeof formData.industries === 'string'
          ? formData.industries.split(',').map((item) => item.trim()).filter(Boolean)
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

        <form onSubmit={handleSubmit} className={styles.formBody} ref={formBodyRef}>
          <div className={styles.formGrid}>

            {/* --- SECTION 1 --- */}
            <div className={styles.sectionTitle}>Personal Details</div>

            <div className={styles.inputGroup}>
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>

            <div className={styles.inputGroup}>
              <label>HR Email ID *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Mobile Number *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" required />
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
              <label>Company / Institution / Organization Name *</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>

            <div className={styles.inputGroup}>
              <label>Company GST</label>
              <input type="text" name="companyGST" value={formData.companyGST || ''} onChange={handleChange} placeholder="e.g. 29AAAAA1111A1Z1" />
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

            {/* --- SECTION 3: RECRUITER'S CREDENTIALS --- */}
            {showCredentialsSection && (
              <>
                <div ref={credentialsRef} className={styles.sectionTitle}>
                  Recruiter's Credentials
                </div>

                <div className={styles.inputGroup}>
                  <label>Email or Username *</label>
                  <input
                    type="text"
                    name="loginUsername"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="e.g. john@company.com or john_recruiter"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Password {isEditMode ? '(leave blank to keep current)' : '*'}</label>
                  <div className={styles.pwWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="loginPassword"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      placeholder="••••••••••"
                      className={styles.pwInput}
                      required={!isEditMode}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

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