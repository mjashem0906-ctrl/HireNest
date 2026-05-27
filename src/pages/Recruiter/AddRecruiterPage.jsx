import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Link2, Info } from 'lucide-react';
import styles from './AddRecruiterPage.module.scss';

const AddRecruiterPage = () => {

  const initialFormState = {
    fullName: '', email: '', phone: '', designation: '', department: '',
    employeeId: '', companyName: ' ', companyGST: '', companyEmail: '', location: '',
    industries: '', hiringVolume: '', teamSize: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = {
        ...formData,
        industries: typeof formData.industries === 'string'
          ? formData.industries.split(',').map(item => item.trim())
          : formData.industries,
        registeredVia: 'shareable_link', // Mark this as self-registered via the shared form
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/recruiters`, dataToSend);
      if (window.opener) window.opener.postMessage('recruiter-added', '*');
      setFormData(initialFormState);
      showToast();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add recruiter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* ── TOAST NOTIFICATION ── */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        <CheckCircle size={20} />
        Recruiter successfully registered!
      </div>

      <div className={styles.pageHeader}>
        <img src="/Logo.png" alt="JobBridge Logo" className={styles.logo} />
        <h1>Register New Recruiter</h1>
        <p>Fill in the details below to add a new recruiter to the directory.</p>
      </div>

      {/* ── SHAREABLE LINK NOTICE ── */}
      <div className={styles.linkNotice}>
        <Link2 size={16} className={styles.linkNoticeIcon} />
        <div>
          <strong>You're registering via a shared form link.</strong>
          <span> Your profile will be marked as <em>"Via Form Link"</em> in the recruiter directory, so admins know you self-registered.</span>
        </div>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>

          {/* SECTION 1 */}
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

          {/* SECTION 2 */}
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
            <input type="text" name="industries" value={formData.industries} onChange={handleChange} placeholder="e.g. IT, Healthcare" required />
          </div>

          {/* FOOTER */}
          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => setFormData(initialFormState)}>
              Clear
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm & Add Recruiter'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddRecruiterPage;
