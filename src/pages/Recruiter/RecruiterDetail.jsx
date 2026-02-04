//-------------------------------------------------31/01----------------------------4.23------------------------
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, User, Mail, Phone, Briefcase, Building, 
  Calendar, Edit, MapPin, Layers, Users, BarChart, Hash
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
      const { data } = await axios.get(`http://localhost:5000/api/recruiters/${id}`);
      setRecruiter(data);
    } catch (error) {
      console.error("Error fetching recruiter:", error);
    }
  };

  useEffect(() => {
    fetchRecruiter();
  }, [id]);

  if (!recruiter) return <div className={styles.loading}>Loading Profile...</div>;

  const formatList = (list) => {
    if (Array.isArray(list) && list.length > 0) return list.join(", ");
    return "Not Specified";
  };

  return (
    <div className={styles.container}>
      
      {/* Top Navigation */}
      <div className={styles.topNav}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={18} /> Back to Recruiters
        </button>
        <div className={styles.pageTitle}>Recruiter Details</div>
        
        <button className={styles.editButton} onClick={() => setIsEditOpen(true)}>
          <Edit size={16} /> Edit Recruiter
        </button>
      </div>

      {/* Purple Profile Banner */}
      <div className={styles.profileBanner}>
        <div className={styles.avatarCircle}>
          {recruiter.profilePicture ? (
            <img src={recruiter.profilePicture} alt="Profile" className={styles.avatarImg} />
          ) : (
            <User size={64} color="#a855f7" />
          )}
        </div>
        <div className={styles.profileInfo}>
          <h1>{recruiter.fullName}</h1>
          <p>{recruiter.designation}</p>
          <span className={styles.locationBadge}>
             <MapPin size={14} /> {recruiter.location || "Location N/A"}
          </span>
        </div>
      </div>

      {/* SECTION 1: Personal Information */}
      <div className={styles.section}>
        <h2>Personal Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.label}><User size={14}/> FULL NAME</div>
            <div className={styles.value}>{recruiter.fullName}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Mail size={14}/> EMAIL ADDRESS</div>
            <div className={styles.value}>{recruiter.email}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Phone size={14}/> PHONE NUMBER</div>
            <div className={styles.value}>{recruiter.phone}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Hash size={14}/> EMPLOYEE ID</div>
            <div className={styles.value}>{recruiter.employeeId || "N/A"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Calendar size={14}/> JOINED DATE</div>
            <div className={styles.value}>
              {new Date(recruiter.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Professional Details */}
      <div className={styles.section}>
        <h2>Professional Details</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.label}><Briefcase size={14}/> JOB TITLE / ROLE</div>
            <div className={styles.value}>{recruiter.designation}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Building size={14}/> DEPARTMENT</div>
            <div className={styles.value}>{recruiter.department}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Users size={14}/> TEAM SIZE</div>
            <div className={styles.value}>{recruiter.teamSize || "Individual"}</div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Company & Scope Details */}
      <div className={styles.section}>
        <h2>Company & Scope Details</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.label}><Building size={14}/> COMPANY NAME</div>
            <div className={styles.value}>{recruiter.companyName || "JobBridge Karnataka"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><MapPin size={14}/> HIRING REGION</div>
            <div className={styles.value}>{recruiter.location || "Global"}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><Layers size={14}/> SPECIALIZED INDUSTRIES</div>
            <div className={styles.value}>{formatList(recruiter.industries)}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.label}><BarChart size={14}/> HIRING VOLUME (Monthly)</div>
            <div className={styles.value}>{recruiter.hiringVolume || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AddRecruiterModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        recruiterToEdit={recruiter} 
        onSuccess={fetchRecruiter} // This ensures the page refreshes after edit
      />

    </div>
  );
};

export default RecruiterDetail;