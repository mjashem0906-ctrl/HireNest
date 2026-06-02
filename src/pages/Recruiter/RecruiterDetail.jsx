import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Building,
  Calendar, Edit, MapPin, Layers, Users, BarChart, Hash, CheckCircle, Trash2, Share2
} from 'lucide-react';
import styles from './RecruiterDetail.module.scss';
import AddRecruiterModal from './AddRecruiterModal';

const RecruiterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchRecruiter = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters/${id}`);
      setRecruiter(data);
    } catch (error) {
      console.error("Error fetching recruiter:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this recruiter profile? This action cannot be undone.")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/recruiters/${id}`);
        navigate('/recruiters'); // Redirect back to directory
      } catch (error) {
        console.error("Error deleting recruiter:", error);
        alert("Failed to delete recruiter. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchRecruiter();
  }, [id]);

  if (!recruiter) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>Loading Recruiter Intelligence...</p>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.banner}>
        <div className={styles.topNav}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft size={18} /> Back to Directory
          </button>
          <div style={{display: 'flex', gap: '12px'}}>
            <button className={styles.editButton} onClick={() => setIsEditOpen(true)}>
              <Edit size={16} /> Edit Recruiter
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              <Trash2 size={16} /> Delete Recruiter
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overlapping Profile Card */}
      <div className={styles.profileHeaderCard}>
        <div className={styles.heroMain}>
          <div className={styles.avatarWrapper}>
            {recruiter.profilePicture ? (
              <img src={recruiter.profilePicture} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatar} style={{display:'flex', alignItems:'center', justifyContent:'center', background:'#fff5f5'}}>
                <User size={64} color="#e11d48" />
              </div>
            )}
            <div className={styles.roleBadge}>RECRUITER</div>
          </div>
 
          <div className={styles.heroText}>
            <h1>{recruiter.fullName}</h1>
            <p className={styles.designationText}>{recruiter.designation}</p>
            <div className={styles.badgesRow}>
                <span className={styles.infoBadge}><MapPin size={14} /> {recruiter.location || "Online"}</span>
                <span className={styles.infoBadge}><Building size={14} /> {recruiter.companyName || "JobBridge Karnataka"}</span>
                <span className={styles.infoBadge}><CheckCircle size={14} color="#22c55e"/> Verified</span>
              </div>
          </div>
        </div>
      </div>
 
      {/* 3. Animated Content Sections */}
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          {/* Section 1 */}
          <section className={styles.detailCard} style={{animationDelay: '0.1s'}}>
            <div className={styles.cardHeader}><User size={20} /> Personal Information</div>
            <div className={styles.infoList}>
              <div className={styles.item}>
                <label>Full Name</label>
                <div className={styles.value}>{recruiter.fullName}</div>
              </div>
              <div className={styles.item}>
                <label>Employee ID</label>
                <div className={styles.value}>{recruiter.employeeId || "Not Provided"}</div>
              </div>
              <div className={styles.item}>
                <label>Email Address</label>
                <div className={styles.value}>{recruiter.email}</div>
              </div>
              <div className={styles.item}>
                <label>Phone Number</label>
                <div className={styles.value}>{recruiter.phone}</div>
              </div>
            </div>
          </section>
 
          {/* Section 2 */}
          <section className={styles.detailCard} style={{animationDelay: '0.2s'}}>
            <div className={styles.cardHeader}><Briefcase size={20} /> Professional Scope</div>
            <div className={styles.infoList}>
              <div className={styles.item}>
                <label>Department</label>
                <div className={styles.value}>{recruiter.department}</div>
              </div>
              <div className={styles.item}>
                <label>Team Size</label>
                <div className={styles.value}>{recruiter.teamSize || "Individual Contributor"}</div>
              </div>
              <div className={styles.item}>
                <label>Company Name</label>
                <div className={styles.value}>{recruiter.companyName || "JobBridge Karnataka"}</div>
              </div>
              <div className={styles.item}>
                <label>Company GST</label>
                <div className={styles.value}>{recruiter.companyGST || "Not Provided"}</div>
              </div>
              <div className={styles.item}>
                <label>Company Email</label>
                <div className={styles.value}>{recruiter.companyEmail || "Not Provided"}</div>
              </div>
              <div className={styles.item} style={{gridColumn: 'span 2'}}>
                <label>Specialized Industries</label>
                <div className={styles.value} style={{color: '#e11d48'}}>
                  {Array.isArray(recruiter.industries) && recruiter.industries.length > 0 
                    ? recruiter.industries.join(" • ") 
                    : "General Recruitment"}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className={styles.rightColumn}>
          <section className={styles.detailCard} style={{animationDelay: '0.3s'}}>
            <div className={styles.cardHeader}><BarChart size={20} /> Recruitment Metrics</div>
            <div className={styles.infoList} style={{gridTemplateColumns: '1fr'}}>
              <div className={styles.item}>
                <label>Hiring Volume</label>
                <div className={styles.value}>{recruiter.hiringVolume || "N/A"}</div>
              </div>
              <div className={styles.item}>
                <label>Hiring Region</label>
                <div className={styles.value}>{recruiter.location || "Global"}</div>
              </div>
              <div className={styles.item}>
                <label>Member Since</label>
                <div className={styles.value}>
                  {new Date(recruiter.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
              <div className={styles.item}>
                <label>Registration Source</label>
                <div className={styles.value} style={{color: recruiter.registeredVia && recruiter.registeredVia !== 'admin' ? '#0d9488' : '#64748b'}}>
                  {recruiter.registeredVia && recruiter.registeredVia !== 'admin'
                    ? 'Self-registered via Form Link'
                    : 'Added by Admin'}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AddRecruiterModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        recruiterToEdit={recruiter}
        onSuccess={fetchRecruiter}
      />
    </div>
  );
};

export default RecruiterDetail;