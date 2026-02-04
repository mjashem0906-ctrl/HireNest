//------------------------------31/01----------------4.35---------------------

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building2, User, 
  FileText, Target, Layers, Award, Edit, Save, X,
  MapPin, Shield, Users
} from 'lucide-react';
import { useData } from "../../context/DataContext";
import API from "../../axios";

const RefereeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberContext, refreshData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Find the referee by ID
  const referee = memberContext?.find(m => 
    m._id === id
  );

  // Initialize form data with ALL fields
  useEffect(() => {
    if (referee) {
      setFormData({
        name: referee.name || "",
        mobileNumber: referee.mobileNumber || "",
        email: referee.email || "",
        gender: referee.gender || "",
        age: referee.age || "",
        referrerStatus: referee.referrerStatus || "",
        occupation: referee.occupation || "",
        companyDetails: referee.companyDetails || "",
        referringSector: referee.referringSector || "",
        jobOfferType: referee.jobOfferType || "",
        referringOfferType: referee.referringOfferType || "",
        levelOfSupport: referee.levelOfSupport || "",
        referringFor: referee.referringFor || "",
        solidarityMemberStatus: referee.solidarityMemberStatus || "Active",
        district: referee.district || "",
        address: referee.address || "",
        sector: referee.sector || "",
        referrerContact: referee.referrerContact || "",
        offer_Location: referee.offer_Location || "", // Updated to match AddReferee
        opportunityDescription: referee.opportunityDescription || "",
      });
    }
  }, [referee]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    if (referee) {
      setFormData({
        name: referee.name || "",
        mobileNumber: referee.mobileNumber || "",
        email: referee.email || "",
        gender: referee.gender || "",
        age: referee.age || "",
        referrerStatus: referee.referrerStatus || "",
        occupation: referee.occupation || "",
        companyDetails: referee.companyDetails || "",
        referringSector: referee.referringSector || "",
        jobOfferType: referee.jobOfferType || "",
        referringOfferType: referee.referringOfferType || "",
        levelOfSupport: referee.levelOfSupport || "",
        referringFor: referee.referringFor || "",
        solidarityMemberStatus: referee.solidarityMemberStatus || "Active",
        district: referee.district || "",
        address: referee.address || "",
        sector: referee.sector || "",
        referrerContact: referee.referrerContact || "",
        offer_Location: referee.offer_Location || "",
        opportunityDescription: referee.opportunityDescription || "",
      });
    }
  };

  const handleSave = async () => {
    if (!referee) return;
    
    setLoading(true);
    try {
      await API.put(`/member/${referee._id}`, formData);
      alert("Referee updated successfully!");
      if (refreshData) refreshData();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update referee");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const statusOptions = [
    "Active", "Inactive", "May be in Future", "Yes", "No"
  ];

  // Inline styles
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
      fontSize: '14px',
      textDecoration: 'none'
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
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    cancelButton: {
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
      marginBottom: '40px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e5e7eb'
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    detailItem: {
      padding: '15px',
      background: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    detailLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    detailValue: {
      fontSize: '16px',
      color: '#111827',
      fontWeight: '500',
      lineHeight: '1.5'
    },
    editInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px'
    },
    editTextarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
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
    }
  };

  if (!referee) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <h2>Referee not found</h2>
          <button onClick={() => navigate('/referees')} style={styles.backButton}>
            <ArrowLeft size={20} /> Back to Referees
          </button>
        </div>
      </div>
    );
  }

  // Define ALL sections with ALL fields
  const sections = [
    {
      title: "Personal Information",
      items: [
        { icon: <User size={18} />, label: "NAME", field: "name", value: formData.name },
        { icon: <User size={18} />, label: "GENDER", field: "gender", value: formData.gender },
        { icon: <Mail size={18} />, label: "EMAIL", field: "email", value: formData.email },
        { icon: <Phone size={18} />, label: "MOBILE NUMBER", field: "mobileNumber", value: formData.mobileNumber },
        { icon: <User size={18} />, label: "AGE", field: "age", value: formData.age },
        { icon: <Target size={18} />, label: "REFERRER STATUS", field: "referrerStatus", value: formData.referrerStatus },
        { icon: <Briefcase size={18} />, label: "OCCUPATION", field: "occupation", value: formData.occupation },
        { icon: <Shield size={18} />, label: "SOLIDARITY MEMBER STATUS", field: "solidarityMemberStatus", value: formData.solidarityMemberStatus },
      ]
    },
    {
      title: "Location Information",
      items: [
        { icon: <MapPin size={18} />, label: "DISTRICT", field: "district", value: formData.district },
        { icon: <MapPin size={18} />, label: "ADDRESS", field: "address", value: formData.address },
        { icon: <MapPin size={18} />, label: "OFFER LOCATION", field: "offer_Location", value: formData.offer_Location },
      ]
    },
    {
      title: "Company & Sector Information",
      items: [
        { icon: <Building2 size={18} />, label: "COMPANY DETAILS", field: "companyDetails", value: formData.companyDetails },
        { icon: <Layers size={18} />, label: "SECTOR", field: "sector", value: formData.sector },
        { icon: <Layers size={18} />, label: "REFERRING SECTOR", field: "referringSector", value: formData.referringSector },
      ]
    },
    {
      title: "Offer & Job Information",
      items: [
        { icon: <FileText size={18} />, label: "JOB OFFER TYPE", field: "jobOfferType", value: formData.jobOfferType },
        { icon: <FileText size={18} />, label: "REFERRING OFFER TYPE", field: "referringOfferType", value: formData.referringOfferType },
        { icon: <FileText size={18} />, label: "REFERRING FOR", field: "referringFor", value: formData.referringFor },
        { icon: <Award size={18} />, label: "LEVEL OF SUPPORT", field: "levelOfSupport", value: formData.levelOfSupport },
        { icon: <Phone size={18} />, label: "REFERRER CONTACT", field: "referrerContact", value: formData.referrerContact },
      ]
    },
    {
      title: "Additional Information",
      items: [
        { icon: <Users size={18} />, label: "DESCRIPTION", field: "opportunityDescription", value: formData.opportunityDescription, fullWidth: true },
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
          {isEditing ? (
            <>
              <button onClick={handleCancel} style={styles.cancelButton}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} style={styles.saveButton} disabled={loading}>
                {loading ? (
                  <>
                    <span style={styles.spinner}></span> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button onClick={handleEdit} style={styles.editButton}>
              <Edit size={16} /> Edit Referee
            </button>
          )}
        </div>
      </div>

      <div style={styles.refereeCard}>
        <div style={styles.refereeHeader}>
          <img 
            src={referee.photoUrl || "/members/AnonymousImage.jpg"} 
            alt={formData.name || referee.name}
            style={styles.refereeImage}
            onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
          />
          <div style={styles.refereeBasicInfo}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
              {formData.name || referee.name}
            </h2>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: (formData.solidarityMemberStatus || referee.solidarityMemberStatus) === 'Active' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)',
              color: (formData.solidarityMemberStatus || referee.solidarityMemberStatus) === 'Active' 
                ? '#16a34a' 
                : 'white'
            }}>
              {formData.solidarityMemberStatus || referee.solidarityMemberStatus || "Active"}
            </span>
            {(formData.occupation || referee.occupation) && (
              <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>
                {formData.occupation || referee.occupation}
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
                ...(section.items.some(item => item.fullWidth) ? { gridTemplateColumns: '1fr' } : {})
              }}>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{
                    ...styles.detailItem,
                    ...(item.fullWidth ? { gridColumn: '1 / -1' } : {})
                  }}>
                    <div style={styles.detailLabel}>
                      {item.icon}
                      {item.label}
                    </div>
                    <div style={styles.detailValue}>
                      {isEditing ? (
                        // Check field type for appropriate input
                        item.field === "gender" ? (
                          <select 
                            value={formData[item.field] || ""}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            style={styles.editInput}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : item.field === "referrerStatus" || item.field === "solidarityMemberStatus" ? (
                          <select 
                            value={formData[item.field] || ""}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            style={styles.editInput}
                          >
                            <option value="">Select Status</option>
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : item.field === "opportunityDescription" ? (
                          <textarea
                            value={formData[item.field] || ""}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            style={styles.editTextarea}
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                            rows="4"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData[item.field] || ""}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            style={styles.editInput}
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                          />
                        )
                      ) : (
                        <strong>{item.value || "-"}</strong>
                      )}
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
          .referee-image {
            width: 100px !important;
            height: 100px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RefereeDetailsPage;