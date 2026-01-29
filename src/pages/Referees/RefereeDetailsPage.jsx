import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building2, User, 
  FileText, Target, Layers, Award, Edit, CheckCircle,
  MapPin, Shield, Users
} from 'lucide-react';
import API from "../../axios";
import AddReferee from './AddReferee';
import styles from './RefereeDetails.module.scss';

const RefereeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referee, setReferee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRefereeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/member/${id}`);
        
        if (res.data.memberType?.toLowerCase() !== 'referee') {
          setError('This member is not a referee');
          return;
        }
        
        setReferee(res.data);
        setEditData({
          _id: res.data._id,
          name: res.data.name || "",
          mobileNumber: res.data.mobileNumber || "",
          email: res.data.email || "",
          gender: res.data.gender || "",
          age: res.data.age || "",
          referrerStatus: res.data.referrerStatus || "",
          occupation: res.data.occupation || "",
          companyDetails: res.data.companyDetails || "",
          referringSector: res.data.referringSector || "",
          jobOfferType: res.data.jobOfferType || "",
          referringOfferType: res.data.referringOfferType || "",
          levelOfSupport: res.data.levelOfSupport || "",
          referringFor: res.data.referringFor || "",
          symMemberStatus: res.data.symMemberStatus || "Active",
          district: res.data.district || "",
          address: res.data.address || "",
          sector: res.data.sector || "",
          referrerContact: res.data.referrerContact || "",
          offer_Location: res.data.offer_Location || "",
          opportunityDescription: res.data.opportunityDescription || "",
        });
        
      } catch (error) {
        console.error("Failed to fetch referee details:", error);
        setError('Failed to load referee details');
      } finally {
        setLoading(false);
      }
    };

    fetchRefereeDetails();
  }, [id]);

  const handleEditSuccess = (updatedData) => {
    setReferee(updatedData);
    setEditData(updatedData);
    setIsEditing(false);
    setSuccessMessage('Referee details updated successfully!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const statusOptions = [
    "Active", "Inactive", "May be in Future", "Yes", "No"
  ];

  // Inline styles matching MentorDetails
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
    refereeCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    refereeHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      gap: '25px'
    },
    refereeImage: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '4px solid white',
      objectFit: 'cover'
    },
    refereeBasicInfo: {
      flex: 1
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <div style={styles.spinner}></div>
          <p>Loading referee details...</p>
        </div>
      </div>
    );
  }

  if (error || !referee) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <h2>{error || 'Referee not found'}</h2>
          <button onClick={() => navigate('/referees')} style={styles.backButton}>
            <ArrowLeft size={20} /> Back to Referees
          </button>
        </div>
      </div>
    );
  }

  // Define sections with referee data
  const sections = [
    {
      title: "Personal Information",
      items: [
        { icon: <User size={18} />, label: "NAME", field: "name", value: referee.name || "-", isBold: true },
        { icon: <User size={18} />, label: "GENDER", field: "gender", value: referee.gender || "-", isBold: true },
        { icon: <Mail size={18} />, label: "EMAIL", field: "email", value: referee.email || "-", isBold: true },
        { icon: <Phone size={18} />, label: "MOBILE NUMBER", field: "mobileNumber", value: referee.mobileNumber || "-" },
        { icon: <User size={18} />, label: "AGE", field: "age", value: referee.age || "-" },
        { icon: <Target size={18} />, label: "REFERRER STATUS", field: "referrerStatus", value: referee.referrerStatus || "-" },
        { icon: <Briefcase size={18} />, label: "OCCUPATION", field: "occupation", value: referee.occupation || "-" },
        { icon: <Shield size={18} />, label: "SOLIDARITY MEMBER STATUS", field: "symMemberStatus", value: referee.symMemberStatus || "Active" },
      ]
    },
    {
      title: "Location Information",
      items: [
        { icon: <MapPin size={18} />, label: "DISTRICT", field: "district", value: referee.district || "-" },
        { icon: <MapPin size={18} />, label: "ADDRESS", field: "address", value: referee.address || "-" },
        { icon: <MapPin size={18} />, label: "OFFER LOCATION", field: "offer_Location", value: referee.offer_Location || "-" },
      ]
    },
    {
      title: "Company & Sector Information",
      items: [
        { icon: <Building2 size={18} />, label: "COMPANY DETAILS", field: "companyDetails", value: referee.companyDetails || "-" },
        { icon: <Layers size={18} />, label: "SECTOR", field: "sector", value: referee.sector || "-" },
        { icon: <Layers size={18} />, label: "REFERRING SECTOR", field: "referringSector", value: referee.referringSector || "-" },
      ]
    },
    {
      title: "Offer & Job Information",
      items: [
        { icon: <FileText size={18} />, label: "JOB OFFER TYPE", field: "jobOfferType", value: referee.jobOfferType || "-" },
        { icon: <FileText size={18} />, label: "REFERRING OFFER TYPE", field: "referringOfferType", value: referee.referringOfferType || "-" },
        { icon: <FileText size={18} />, label: "REFERRING FOR", field: "referringFor", value: referee.referringFor || "-" },
        { icon: <Award size={18} />, label: "LEVEL OF SUPPORT", field: "levelOfSupport", value: referee.levelOfSupport || "-" },
        { icon: <Phone size={18} />, label: "REFERRER CONTACT", field: "referrerContact", value: referee.referrerContact || "-" },
      ]
    },
    {
      title: "Additional Information",
      items: [
        { icon: <Users size={18} />, label: "DESCRIPTION", field: "opportunityDescription", value: referee.opportunityDescription || "-" },
      ]
    }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/referees')} style={styles.backButton}>
          <ArrowLeft size={20} /> Back to Referees
        </button>
        <h1 style={{ margin: 0, color: '#333', fontSize: '24px', flex: 1 }}>Referee Details</h1>
        
        <div style={styles.headerActions}>
          <button onClick={() => setIsEditing(true)} style={styles.editButton}>
            <Edit size={16} /> Edit Referee
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {isEditing && referee && (
        <AddReferee 
          editData={editData}
          isEditing={true}
          onSuccess={handleEditSuccess}
          onClose={handleCloseEdit}
        />
      )}

      <div style={styles.refereeCard}>
        <div style={styles.refereeHeader}>
          <img 
            src={referee.photoUrl || "/members/AnonymousImage.jpg"} 
            alt={referee.name}
            style={styles.refereeImage}
            onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
          />
          <div style={styles.refereeBasicInfo}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
              {referee.name || "-"}
            </h2>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: (referee.symMemberStatus || "Active") === 'Active' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)',
              color: (referee.symMemberStatus || "Active") === 'Active' 
                ? '#16a34a' 
                : 'white'
            }}>
              {referee.symMemberStatus || "Active"}
            </span>
            {referee.occupation && (
              <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>
                {referee.occupation}
              </p>
            )}
          </div>
        </div>

        <div style={styles.detailsContainer}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={styles.section}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={{
                ...styles.sectionGrid,
                ...(section.title === "Additional Information" ? { gridTemplateColumns: '1fr' } : {})
              }}>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{
                    ...styles.detailItem,
                    ...(section.title === "Additional Information" ? { gridColumn: '1 / -1' } : {})
                  }}>
                    <div style={styles.detailLabel}>
                      {item.icon}
                      {item.label}
                    </div>
                    <div style={styles.detailValue}>
                      {item.isBold ? <strong>{item.value}</strong> : item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          
          .referee-header {
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

export default RefereeDetailsPage;