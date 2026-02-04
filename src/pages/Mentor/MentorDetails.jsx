//-------------------31/01------------------4.48-------------------------

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, Briefcase, Building2, User, 
  Award, Edit, CheckCircle 
} from 'lucide-react';
import API from '../../axios';
import { useAuth } from '../../context/AuthContext';
import AddMentor from './AddMentor';

// Styles (Kept original as requested, just ensuring consistency)
const styles = {
  page: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', fontSize: '14px' },
  editButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  mentorCard: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
  mentorHeader: { display: 'flex', alignItems: 'center', padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', gap: '25px' },
  mentorImage: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' },
  mentorBasicInfo: { flex: 1 },
  detailsContainer: { padding: '30px' },
  section: { marginBottom: '30px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f3f4f6' },
  sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  detailItem: { padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  detailLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' },
  detailValue: { fontSize: '16px', color: '#111827', fontWeight: '500', lineHeight: '1.5' },
  spinner: { display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite', marginRight: '8px' },
  notFound: { textAlign: 'center', padding: '100px 20px' },
  successMessage: { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', marginTop: '16px', border: '1px solid #bbf7d0' }
};

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    } catch (error) {
      console.error("Failed to fetch mentor details:", error);
      setError('Failed to load mentor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorDetails();
  }, [id]);

  const handleEditSuccess = (updatedData) => {
    setMentor(updatedData);
    setIsEditing(false);
    setSuccessMessage('Mentor details updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const displayDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div style={styles.page}><div style={styles.notFound}><div style={styles.spinner}></div><p>Loading...</p></div></div>;
  if (error || !mentor) return <div style={styles.page}><div style={styles.notFound}><h2>{error || 'Mentor not found'}</h2><button onClick={() => navigate('/mentors')} style={styles.backButton}><ArrowLeft size={20} /> Back to Mentors</button></div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/mentors')} style={styles.backButton}>
          <ArrowLeft size={20} /> Back to Mentors
        </button>
        <h1 style={{ margin: 0, color: '#333', fontSize: '24px', flex: 1 }}>Mentor Details</h1>
        
        <div style={styles.headerActions}>
          {user?.role === 'Admin' && (
            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
              <Edit size={16} /> Edit Mentor
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} /> <span>{successMessage}</span>
        </div>
      )}

      {isEditing && (
        <AddMentor 
          editData={mentor}
          isEditing={true}
          onSuccess={handleEditSuccess}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Profile Card */}
      <div style={styles.mentorCard}>
        <div style={styles.mentorHeader}>
          <img 
            src={mentor.photoUrl || "/members/AnonymousImage.jpg"} 
            alt={mentor.name}
            style={styles.mentorImage}
            onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
          />
          <div style={styles.mentorBasicInfo}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{mentor.name}</h2>
            <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>{mentor.designation}</p>
          </div>
        </div>

        <div style={styles.detailsContainer}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.sectionGrid}>
              <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> NAME</div><div style={styles.detailValue}>{mentor.name}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> GENDER</div><div style={styles.detailValue}>{mentor.gender}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Mail size={18}/> EMAIL</div><div style={styles.detailValue}>{mentor.email}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Phone size={18}/> MOBILE</div><div style={styles.detailValue}>{mentor.mobileNumber}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Calendar size={18}/> DATE OF BIRTH</div><div style={styles.detailValue}>{displayDate(mentor.dateOfBirth)}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> AGE</div><div style={styles.detailValue}>{mentor.dateOfBirth ? `${calculateAge(mentor.dateOfBirth)} years` : '-'}</div></div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Information</h3>
            <div style={styles.sectionGrid}>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Building2 size={18}/> INSTITUTION</div><div style={styles.detailValue}>{mentor.currentInstitutionOrCompany}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Briefcase size={18}/> DESIGNATION</div><div style={styles.detailValue}>{mentor.designation}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Award size={18}/> EXPERTISE</div><div style={styles.detailValue}>{mentor.fieldofStudy_Interest}</div></div>
              <div style={styles.detailItem}><div style={styles.detailLabel}><Calendar size={18}/> EXPERIENCE</div><div style={styles.detailValue}>{mentor.workExp} years</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetails;