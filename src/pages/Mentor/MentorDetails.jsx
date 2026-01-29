import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, Briefcase, Building2, User, 
  Award, Edit, CheckCircle 
} from 'lucide-react';
import API from '../../axios';
import { useAuth } from '../../context/AuthContext';
import AddMentor from './AddMentor';

// 👇 KEEPING YOUR ORIGINAL STYLES EXACTLY AS THEY WERE
const styles = {
  page: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#4b5563',
    fontSize: '14px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  mentorCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  mentorHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    gap: '25px'
  },
  mentorImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid white',
    objectFit: 'cover'
  },
  mentorBasicInfo: {
    flex: 1
  },
  detailsContainer: {
    padding: '30px'
  },
  section: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f3f4f6'
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  detailItem: {
    padding: '15px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '16px',
    color: '#111827',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    marginRight: '8px'
  },
  notFound: {
    textAlign: 'center',
    padding: '100px 20px'
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#dcfce7',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px',
    border: '1px solid #bbf7d0'
  }
};

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/member/${id}`);
        
        if (res.data.memberType?.toLowerCase() !== 'mentor') {
          setError('This member is not a mentor');
          return;
        }
        
        setMentor(res.data);
        setEditData({
          _id: res.data._id,
          name: res.data.name || "",
          mobileNumber: res.data.mobileNumber || "",
          email: res.data.email || "",
          gender: res.data.gender || "",
          dateOfBirth: res.data.dateOfBirth || null,
          currentInstitutionOrCompany: res.data.currentInstitutionOrCompany || "",
          designation: res.data.designation || "",
          fieldofStudy_Interest: res.data.fieldofStudy_Interest || "",
          workExp: res.data.workExp || "",
          district: res.data.district || "",
        });
        
      } catch (error) {
        console.error("Failed to fetch mentor details:", error);
        setError('Failed to load mentor details');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorDetails();
  }, [id]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const displayDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditSuccess = (updatedData) => {
    setMentor(updatedData);
    setEditData(updatedData);
    setIsEditing(false);
    setSuccessMessage('Mentor details updated successfully!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <div style={styles.spinner}></div>
          <p>Loading mentor details...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <h2>{error || 'Mentor not found'}</h2>
          <button onClick={() => navigate('/mentors')} style={styles.backButton}>
            <ArrowLeft size={20} /> Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const personalInfoItems = [
    { 
      icon: <User size={18} />, 
      label: "NAME", 
      field: "name", 
      value: mentor?.name || "-",
      isBold: true
    },
    { 
      icon: <User size={18} />, 
      label: "GENDER", 
      field: "gender", 
      value: mentor?.gender || "-",
      isBold: true
    },
    { 
      icon: <Mail size={18} />, 
      label: "EMAIL", 
      field: "email", 
      value: mentor?.email || "-",
      isBold: true
    },
    { 
      icon: <Phone size={18} />, 
      label: "MOBILE NUMBER", 
      field: "mobileNumber", 
      value: mentor?.mobileNumber || "-"
    },
    { 
      icon: <Calendar size={18} />, 
      label: "AGE", 
      field: "age", 
      value: mentor?.dateOfBirth ? `${calculateAge(mentor.dateOfBirth)} years` : "-"
    },
    { 
      icon: <Calendar size={18} />, 
      label: "DATE OF BIRTH", 
      field: "dateOfBirth", 
      value: displayDate(mentor?.dateOfBirth)
    }
  ];

  const professionalInfoItems = [
    { 
      icon: <Building2 size={18} />, 
      label: "CURRENT COMPANY / INSTITUTION", 
      field: "currentInstitutionOrCompany", 
      value: mentor?.currentInstitutionOrCompany || "-"
    },
    { 
      icon: <Briefcase size={18} />, 
      label: "JOB ROLE / DESIGNATION", 
      field: "designation", 
      value: mentor?.designation || "-"
    },
    { 
      icon: <Award size={18} />, 
      label: "EXPERTISE / DOMAIN", 
      field: "fieldofStudy_Interest", 
      value: mentor?.fieldofStudy_Interest || "-"
    },
    { 
      icon: <Calendar size={18} />, 
      label: "YEARS OF EXPERIENCE", 
      field: "workExp", 
      value: mentor?.workExp || "-"
    }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/mentors')} style={styles.backButton}>
          <ArrowLeft size={20} /> Back to Mentors
        </button>
        <h1 style={{ margin: 0, color: '#333', fontSize: '24px', flex: 1 }}>Mentor Details</h1>
        
        <div style={styles.headerActions}>
          {user?.role === 'Admin' && mentor && (
            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
              <Edit size={16} /> Edit Mentor
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {isEditing && mentor && (
        <AddMentor 
          editData={editData}
          isEditing={true}
          onSuccess={handleEditSuccess}
          onClose={handleCloseEdit}
        />
      )}

      <div style={styles.mentorCard}>
        <div style={styles.mentorHeader}>
          <img 
            src={mentor?.photoUrl || "/members/AnonymousImage.jpg"} 
            alt={mentor?.name}
            style={styles.mentorImage}
            onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
          />
          <div style={styles.mentorBasicInfo}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
              {mentor?.name || "-"}
            </h2>
            {mentor?.designation && (
              <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>
                {mentor?.designation}
              </p>
            )}
          </div>
        </div>

        <div style={styles.detailsContainer}>
          {/* Personal Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.sectionGrid}>
              {personalInfoItems.map((item, index) => (
                <div key={index} style={styles.detailItem}>
                  <div style={styles.detailLabel}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</div>
                    {item.label}
                  </div>
                  <div style={styles.detailValue}>
                    {item.isBold ? <strong>{item.value}</strong> : item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Information</h3>
            <div style={styles.sectionGrid}>
              {professionalInfoItems.map((item, index) => (
                <div key={index} style={styles.detailItem}>
                  <div style={styles.detailLabel}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</div>
                    {item.label}
                  </div>
                  <div style={styles.detailValue}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .section-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .mentor-header {
            flex-direction: column !important;
            text-align: center !important;
            padding: 20px !important;
          }
          
          .header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          
          .header-actions {
            width: 100% !important;
            justify-content: flex-end !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MentorDetails;