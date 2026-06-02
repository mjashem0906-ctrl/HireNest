// //------------------------------31/01----------------4.35---------------------

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, Mail, Phone, Briefcase, Building2, User, 
//   FileText, Target, Layers, Award, Edit, Save, X,
//   MapPin, Shield, Users
// } from 'lucide-react';
// import { useData } from "../../context/DataContext";
// import API from "../../axios";

// const RefereeDetailsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { memberContext, refreshData } = useData();
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(false);

//   // Find the referee by ID
//   const referee = memberContext?.find(m => 
//     m._id === id
//   );

//   // Initialize form data with ALL fields
//   useEffect(() => {
//     if (referee) {
//       setFormData({
//         name: referee.name || "",
//         mobileNumber: referee.mobileNumber || "",
//         email: referee.email || "",
//         gender: referee.gender || "",
//         age: referee.age || "",
//         referrerStatus: referee.referrerStatus || "",
//         occupation: referee.occupation || "",
//         companyDetails: referee.companyDetails || "",
//         referringSector: referee.referringSector || "",
//         jobOfferType: referee.jobOfferType || "",
//         referringOfferType: referee.referringOfferType || "",
//         levelOfSupport: referee.levelOfSupport || "",
//         referringFor: referee.referringFor || "",
//         solidarityMemberStatus: referee.solidarityMemberStatus || "Active",
//         district: referee.district || "",
//         address: referee.address || "",
//         sector: referee.sector || "",
//         referrerContact: referee.referrerContact || "",
//         offer_Location: referee.offer_Location || "", // Updated to match AddReferee
//         opportunityDescription: referee.opportunityDescription || "",
//       });
//     }
//   }, [referee]);

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     // Reset to original data
//     if (referee) {
//       setFormData({
//         name: referee.name || "",
//         mobileNumber: referee.mobileNumber || "",
//         email: referee.email || "",
//         gender: referee.gender || "",
//         age: referee.age || "",
//         referrerStatus: referee.referrerStatus || "",
//         occupation: referee.occupation || "",
//         companyDetails: referee.companyDetails || "",
//         referringSector: referee.referringSector || "",
//         jobOfferType: referee.jobOfferType || "",
//         referringOfferType: referee.referringOfferType || "",
//         levelOfSupport: referee.levelOfSupport || "",
//         referringFor: referee.referringFor || "",
//         solidarityMemberStatus: referee.solidarityMemberStatus || "Active",
//         district: referee.district || "",
//         address: referee.address || "",
//         sector: referee.sector || "",
//         referrerContact: referee.referrerContact || "",
//         offer_Location: referee.offer_Location || "",
//         opportunityDescription: referee.opportunityDescription || "",
//       });
//     }
//   };

//   const handleSave = async () => {
//     if (!referee) return;
    
//     setLoading(true);
//     try {
//       await API.put(`/member/${referee._id}`, formData);
//       alert("Referee updated successfully!");
//       if (refreshData) refreshData();
//       setIsEditing(false);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update referee");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const statusOptions = [
//     "Active", "Inactive", "May be in Future", "Yes", "No"
//   ];

//   // Inline styles
//   const styles = {
//     page: {
//       padding: '20px',
//       maxWidth: '1200px',
//       margin: '0 auto',
//       fontFamily: 'Arial, sans-serif'
//     },
//     header: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '20px',
//       marginBottom: '30px',
//       flexWrap: 'wrap'
//     },
//     headerActions: {
//       display: 'flex',
//       gap: '10px',
//       alignItems: 'center'
//     },
//     backButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '8px 16px',
//       background: '#f3f4f6',
//       border: '1px solid #e5e7eb',
//       borderRadius: '6px',
//       cursor: 'pointer',
//       color: '#4b5563',
//       fontSize: '14px',
//       textDecoration: 'none'
//     },
//     editButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '8px 16px',
//       background: '#4f46e5',
//       color: 'white',
//       border: 'none',
//       borderRadius: '6px',
//       cursor: 'pointer',
//       fontSize: '14px'
//     },
//     saveButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '8px 16px',
//       background: '#10b981',
//       color: 'white',
//       border: 'none',
//       borderRadius: '6px',
//       cursor: 'pointer',
//       fontSize: '14px'
//     },
//     cancelButton: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '8px 16px',
//       background: '#f3f4f6',
//       border: '1px solid #e5e7eb',
//       borderRadius: '6px',
//       cursor: 'pointer',
//       color: '#4b5563',
//       fontSize: '14px'
//     },
//     refereeCard: {
//       background: 'white',
//       borderRadius: '12px',
//       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//       overflow: 'hidden'
//     },
//     refereeHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       padding: '30px',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       color: 'white',
//       gap: '25px'
//     },
//     refereeImage: {
//       width: '120px',
//       height: '120px',
//       borderRadius: '50%',
//       border: '4px solid white',
//       objectFit: 'cover'
//     },
//     refereeBasicInfo: {
//       flex: 1
//     },
//     statusBadge: {
//       display: 'inline-block',
//       padding: '6px 16px',
//       borderRadius: '20px',
//       fontSize: '14px',
//       fontWeight: '500',
//       marginBottom: '10px',
//       backgroundColor: 'rgba(255, 255, 255, 0.2)'
//     },
//     detailsContainer: {
//       padding: '30px'
//     },
//     section: {
//       marginBottom: '40px',
//       paddingBottom: '20px',
//       borderBottom: '2px solid #e5e7eb'
//     },
//     sectionTitle: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: '#374151',
//       marginBottom: '20px',
//       paddingBottom: '10px',
//       borderBottom: '2px solid #f3f4f6'
//     },
//     sectionGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//       gap: '20px'
//     },
//     detailItem: {
//       padding: '15px',
//       background: '#f9fafb',
//       borderRadius: '8px',
//       border: '1px solid #e5e7eb'
//     },
//     detailLabel: {
//       fontSize: '12px',
//       color: '#6b7280',
//       textTransform: 'uppercase',
//       letterSpacing: '0.5px',
//       marginBottom: '8px',
//       fontWeight: '600',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px'
//     },
//     detailValue: {
//       fontSize: '16px',
//       color: '#111827',
//       fontWeight: '500',
//       lineHeight: '1.5'
//     },
//     editInput: {
//       width: '100%',
//       padding: '8px 12px',
//       border: '1px solid #d1d5db',
//       borderRadius: '6px',
//       fontSize: '14px'
//     },
//     editTextarea: {
//       width: '100%',
//       padding: '8px 12px',
//       border: '1px solid #d1d5db',
//       borderRadius: '6px',
//       fontSize: '14px',
//       resize: 'vertical',
//       minHeight: '80px',
//       fontFamily: 'inherit'
//     },
//     spinner: {
//       display: 'inline-block',
//       width: '16px',
//       height: '16px',
//       border: '2px solid rgba(255, 255, 255, 0.3)',
//       borderRadius: '50%',
//       borderTopColor: 'white',
//       animation: 'spin 1s ease-in-out infinite',
//       marginRight: '8px'
//     },
//     notFound: {
//       textAlign: 'center',
//       padding: '100px 20px'
//     }
//   };

//   if (!referee) {
//     return (
//       <div style={styles.page}>
//         <div style={styles.notFound}>
//           <h2>Referee not found</h2>
//           <button onClick={() => navigate('/referees')} style={styles.backButton}>
//             <ArrowLeft size={20} /> Back to Referees
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Define ALL sections with ALL fields
//   const sections = [
//     {
//       title: "Personal Information",
//       items: [
//         { icon: <User size={18} />, label: "NAME", field: "name", value: formData.name },
//         { icon: <User size={18} />, label: "GENDER", field: "gender", value: formData.gender },
//         { icon: <Mail size={18} />, label: "EMAIL", field: "email", value: formData.email },
//         { icon: <Phone size={18} />, label: "MOBILE NUMBER", field: "mobileNumber", value: formData.mobileNumber },
//         { icon: <User size={18} />, label: "AGE", field: "age", value: formData.age },
//         { icon: <Target size={18} />, label: "REFERRER STATUS", field: "referrerStatus", value: formData.referrerStatus },
//         { icon: <Briefcase size={18} />, label: "OCCUPATION", field: "occupation", value: formData.occupation },
//         { icon: <Shield size={18} />, label: "SOLIDARITY MEMBER STATUS", field: "solidarityMemberStatus", value: formData.solidarityMemberStatus },
//       ]
//     },
//     {
//       title: "Location Information",
//       items: [
//         { icon: <MapPin size={18} />, label: "DISTRICT", field: "district", value: formData.district },
//         { icon: <MapPin size={18} />, label: "ADDRESS", field: "address", value: formData.address },
//         { icon: <MapPin size={18} />, label: "OFFER LOCATION", field: "offer_Location", value: formData.offer_Location },
//       ]
//     },
//     {
//       title: "Company & Sector Information",
//       items: [
//         { icon: <Building2 size={18} />, label: "COMPANY DETAILS", field: "companyDetails", value: formData.companyDetails },
//         { icon: <Layers size={18} />, label: "SECTOR", field: "sector", value: formData.sector },
//         { icon: <Layers size={18} />, label: "REFERRING SECTOR", field: "referringSector", value: formData.referringSector },
//       ]
//     },
//     {
//       title: "Offer & Job Information",
//       items: [
//         { icon: <FileText size={18} />, label: "JOB OFFER TYPE", field: "jobOfferType", value: formData.jobOfferType },
//         { icon: <FileText size={18} />, label: "REFERRING OFFER TYPE", field: "referringOfferType", value: formData.referringOfferType },
//         { icon: <FileText size={18} />, label: "REFERRING FOR", field: "referringFor", value: formData.referringFor },
//         { icon: <Award size={18} />, label: "LEVEL OF SUPPORT", field: "levelOfSupport", value: formData.levelOfSupport },
//         { icon: <Phone size={18} />, label: "REFERRER CONTACT", field: "referrerContact", value: formData.referrerContact },
//       ]
//     },
//     {
//       title: "Additional Information",
//       items: [
//         { icon: <Users size={18} />, label: "DESCRIPTION", field: "opportunityDescription", value: formData.opportunityDescription, fullWidth: true },
//       ]
//     }
//   ];

//   return (
//     <div style={styles.page}>
//       <div style={styles.header}>
//         <button onClick={() => navigate('/referees')} style={styles.backButton}>
//           <ArrowLeft size={20} /> Back to Referees
//         </button>
//         <h1 style={{ margin: 0, color: '#333', fontSize: '24px', flex: 1 }}>Referee Details</h1>
        
//         <div style={styles.headerActions}>
//           {isEditing ? (
//             <>
//               <button onClick={handleCancel} style={styles.cancelButton}>
//                 <X size={16} /> Cancel
//               </button>
//               <button onClick={handleSave} style={styles.saveButton} disabled={loading}>
//                 {loading ? (
//                   <>
//                     <span style={styles.spinner}></span> Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={16} /> Save Changes
//                   </>
//                 )}
//               </button>
//             </>
//           ) : (
//             <button onClick={handleEdit} style={styles.editButton}>
//               <Edit size={16} /> Edit Referee
//             </button>
//           )}
//         </div>
//       </div>

//       <div style={styles.refereeCard}>
//         <div style={styles.refereeHeader}>
//           <img 
//             src={referee.photoUrl || "/members/AnonymousImage.jpg"} 
//             alt={formData.name || referee.name}
//             style={styles.refereeImage}
//             onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
//           />
//           <div style={styles.refereeBasicInfo}>
//             <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
//               {formData.name || referee.name}
//             </h2>
//             <span style={{
//               ...styles.statusBadge,
//               backgroundColor: (formData.solidarityMemberStatus || referee.solidarityMemberStatus) === 'Active' 
//                 ? 'rgba(34, 197, 94, 0.2)' 
//                 : 'rgba(255, 255, 255, 0.2)',
//               color: (formData.solidarityMemberStatus || referee.solidarityMemberStatus) === 'Active' 
//                 ? '#16a34a' 
//                 : 'white'
//             }}>
//               {formData.solidarityMemberStatus || referee.solidarityMemberStatus || "Active"}
//             </span>
//             {(formData.occupation || referee.occupation) && (
//               <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>
//                 {formData.occupation || referee.occupation}
//               </p>
//             )}
//           </div>
//         </div>

//         <div style={styles.detailsContainer}>
//           {sections.map((section, sectionIndex) => (
//             <div key={sectionIndex} style={styles.section}>
//               <h3 style={styles.sectionTitle}>{section.title}</h3>
//               <div style={{
//                 ...styles.sectionGrid,
//                 ...(section.items.some(item => item.fullWidth) ? { gridTemplateColumns: '1fr' } : {})
//               }}>
//                 {section.items.map((item, itemIndex) => (
//                   <div key={itemIndex} style={{
//                     ...styles.detailItem,
//                     ...(item.fullWidth ? { gridColumn: '1 / -1' } : {})
//                   }}>
//                     <div style={styles.detailLabel}>
//                       {item.icon}
//                       {item.label}
//                     </div>
//                     <div style={styles.detailValue}>
//                       {isEditing ? (
//                         // Check field type for appropriate input
//                         item.field === "gender" ? (
//                           <select 
//                             value={formData[item.field] || ""}
//                             onChange={(e) => handleInputChange(item.field, e.target.value)}
//                             style={styles.editInput}
//                           >
//                             <option value="">Select Gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                             <option value="Other">Other</option>
//                           </select>
//                         ) : item.field === "referrerStatus" || item.field === "solidarityMemberStatus" ? (
//                           <select 
//                             value={formData[item.field] || ""}
//                             onChange={(e) => handleInputChange(item.field, e.target.value)}
//                             style={styles.editInput}
//                           >
//                             <option value="">Select Status</option>
//                             {statusOptions.map(option => (
//                               <option key={option} value={option}>{option}</option>
//                             ))}
//                           </select>
//                         ) : item.field === "opportunityDescription" ? (
//                           <textarea
//                             value={formData[item.field] || ""}
//                             onChange={(e) => handleInputChange(item.field, e.target.value)}
//                             style={styles.editTextarea}
//                             placeholder={`Enter ${item.label.toLowerCase()}`}
//                             rows="4"
//                           />
//                         ) : (
//                           <input
//                             type="text"
//                             value={formData[item.field] || ""}
//                             onChange={(e) => handleInputChange(item.field, e.target.value)}
//                             style={styles.editInput}
//                             placeholder={`Enter ${item.label.toLowerCase()}`}
//                           />
//                         )
//                       ) : (
//                         <strong>{item.value || "-"}</strong>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         @media (max-width: 768px) {
//           .section-grid {
//             grid-template-columns: 1fr !important;
//             gap: 15px !important;
//           }
//           .referee-header {
//             flex-direction: column !important;
//             text-align: center !important;
//             padding: 20px !important;
//           }
//           .header {
//             flex-direction: column !important;
//             align-items: flex-start !important;
//             gap: 10px !important;
//           }
//           .header-actions {
//             width: 100% !important;
//             justify-content: flex-end !important;
//           }
//           .referee-image {
//             width: 100px !important;
//             height: 100px !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RefereeDetailsPage;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building2, User, 
  FileText, Target, Award, Edit, Save, X, MapPin, Star, Users, Layers, ExternalLink, Clock, Shield
} from 'lucide-react';
import { useData } from "../../context/DataContext";
import API from "../../axios";
import styles from './RefereeDetails.module.scss';

// ── Skeleton Loader Component ──────────────────────────────
const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <div className={`${styles.skeleton} ${className}`} style={{ width, height }} />
);

// ── Profile Hero Skeleton ──────────────────────────────────
const ProfileHeroSkeleton = () => (
  <div className={`${styles.mainProfileCard} ${styles.skeletonCard}`}>
    <div className={styles.profileHero}>
      <SkeletonLoader width="80px" height="80px" className={styles.avatarSkeleton} />
      <div className={styles.heroText}>
        <SkeletonLoader width="200px" height="28px" />
        <SkeletonLoader width="150px" height="18px" style={{ marginTop: '8px' }} />
        <SkeletonLoader width="180px" height="16px" style={{ marginTop: '12px' }} />
      </div>
    </div>
  </div>
);

// ── Info Card Skeleton ────────────────────────────────────
const InfoCardSkeleton = () => (
  <section className={`${styles.infoCard} ${styles.skeletonCard}`}>
    <div className={styles.cardHeader}>
      <SkeletonLoader width="40px" height="40px" />
      <SkeletonLoader width="150px" height="24px" />
    </div>
    <div className={styles.detailsGrid}>
      {Array(4).fill(0).map((_, i) => (
        <div key={i}>
          <SkeletonLoader width="100px" height="12px" />
          <SkeletonLoader width="100%" height="18px" style={{ marginTop: '8px' }} />
        </div>
      ))}
    </div>
  </section>
);

const RefereeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberContext, refreshData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [referredJobs, setReferredJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [changesPending, setChangesPending] = useState(false);
  const debounceTimerRef = useRef(null);

  // ── 3D tilt refs & handlers ─────────────────────────────
  const mainCardRef = useRef(null);
  const personalCardRef = useRef(null);
  const professionalCardRef = useRef(null);
  const supportCardRef = useRef(null);
  const jobsCardRef = useRef(null);
  const rafRef = useRef({});

  const handleCardMouseMove = (e, ref, cardId) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    rafRef.current[cardId] = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const max = 7; // subtle premium tilt
      
      el.style.setProperty("--rx", `${(-(py - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    });
  };

  const handleCardMouseLeave = (ref, cardId) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  const referee = memberContext?.find(m => m._id === id);

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      if (referee) {
        setFormData({ ...referee });
        setLoading(false);
        fetchReferredJobs();
      } else if (id) {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [referee, id]);

  const fetchReferredJobs = async () => {
    if (!id) return;
    setLoadingJobs(true);
    try {
      console.log("Fetching referred jobs for referee ID:", id);
      const response = await API.get(`/referee/${id}/referred-jobs`);
      console.log("Referred jobs response:", response.data);
      if (response.data.success) {
        setReferredJobs(response.data.data);
        console.log("Set referred jobs:", response.data.data);
      } else {
        console.warn("Response not successful:", response.data);
      }
    } catch (error) {
      console.error("Error fetching referred jobs:", error);
      setReferredJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSave = async () => {
    if (!referee || !changesPending) return;
    
    setSaving(true);
    setError(null);
    try {
      const response = await API.put(`/member/${referee._id}`, formData);
      if (response.status === 200) {
        if (refreshData) refreshData();
        setIsEditing(false);
        setChangesPending(false);
        // Show success message (optional toast notification)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update referee');
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...referee });
    setChangesPending(false);
    setError(null);
  };

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setChangesPending(true);

    // Clear error when user starts editing
    if (error) setError(null);
  }, [error]);

  if (!referee) {
    if (loading) {
      return (
        <div className={styles.pageContainer}>
          <div className={styles.banner}>
            <div className={styles.bannerGlow}></div>
            <div className={styles.bannerGlowTwo}></div>
          </div>
          <div className={styles.topActions}>
            <SkeletonLoader width="150px" height="40px" />
          </div>
          <ProfileHeroSkeleton />
          <div className={styles.contentGrid}>
            <InfoCardSkeleton />
            <InfoCardSkeleton />
            <InfoCardSkeleton />
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.pageContainer}>
        <div className={styles.topActions}>
          <button onClick={() => navigate('/referees')} className={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Directory
          </button>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Referee Not Found</h2>
          <p>We couldn't find the referee you're looking for.</p>
          <button onClick={() => navigate('/referees')} className={styles.resetBtn}>
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* BANNER */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow}></div>
        <div className={styles.bannerGlowTwo}></div>
      </div>

      {/* TOP ACTIONS */}
      <div className={styles.topActions}>
        <button onClick={() => navigate('/referees')} className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>

      {/* MAIN PROFILE CARD */}
      <div 
        ref={mainCardRef}
        onMouseMove={(e) => handleCardMouseMove(e, mainCardRef, "main")}
        onMouseLeave={() => handleCardMouseLeave(mainCardRef, "main")}
        className={`${styles.mainProfileCard} ${styles.animateIn}`}
      >
        <div className={styles.cardGlow} />
        <div className={styles.cardShine} />

        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            <img 
              src={referee.photoUrl || "/members/AnonymousImage.jpg"} 
              alt={formData.name || referee.name} 
              className={styles.avatar}
              onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }} 
            />
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              {formData.solidarityMemberStatus?.toUpperCase() || 'ACTIVE'}
            </div>
          </div>

          <div className={styles.heroText}>
            <h1>{formData.name || referee.name}</h1>
            <p className={styles.designation}>{formData.occupation || referee.occupation || 'Job Referee'}</p>
            <div className={styles.quickMeta}>
              <span><MapPin size={16}/> {formData.district || 'Remote'}</span>
              <span><Star size={16}/> {formData.referrerStatus || 'Verified'}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardBtns}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCancel} className={styles.cancelBtn} disabled={saving}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} className={styles.saveBtn} disabled={saving || !changesPending}>
                {saving ? <span className={styles.spinner}></span> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <Edit size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className={styles.contentGrid}>
        
        {/* PERSONAL DETAILS CARD */}
        <section 
          ref={personalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, personalCardRef, "personal")}
          onMouseLeave={() => handleCardMouseLeave(personalCardRef, "personal")}
          className={styles.infoCard}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />
          
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <User size={20} />
            </div>
            <h2>Personal Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Full Name</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.name || ''} 
                  onChange={e => handleFieldChange('name', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.name || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Gender</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.gender || ''} 
                  onChange={e => handleFieldChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.gender || 'Not Specified'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Email Address</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.email || ''} 
                  onChange={e => handleFieldChange('email', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.email || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Mobile Number</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.mobileNumber || ''} 
                  onChange={e => handleFieldChange('mobileNumber', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.mobileNumber || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Age</label>
              {isEditing ? (
                <input 
                  type="number"
                  className={styles.editInput} 
                  value={formData.age || ''} 
                  onChange={e => handleFieldChange('age', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.age ? `${formData.age} Years` : '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Solidarity Status</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.solidarityMemberStatus || 'Active'} 
                  onChange={e => handleFieldChange('solidarityMemberStatus', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="May be in Future">May be in Future</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.solidarityMemberStatus || 'Active'}</div>
              )}
            </div>
          </div>
        </section>

        {/* PROFESSIONAL INFO CARD */}
        <section 
          ref={professionalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, professionalCardRef, "professional")}
          onMouseLeave={() => handleCardMouseLeave(professionalCardRef, "professional")}
          className={styles.infoCard}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Briefcase size={20} />
            </div>
            <h2>Professional Info</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Occupation</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.occupation || ''} 
                  onChange={e => handleFieldChange('occupation', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.occupation || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Company Details</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.companyDetails || ''} 
                  onChange={e => handleFieldChange('companyDetails', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.companyDetails || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Sector</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.sector || ''} 
                  onChange={e => handleFieldChange('sector', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.sector || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referring Sector</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringSector || ''} 
                  onChange={e => handleFieldChange('referringSector', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringSector || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referrer Status</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.referrerStatus || 'Verified'} 
                  onChange={e => handleFieldChange('referrerStatus', e.target.value)}
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.referrerStatus || 'Verified'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referrer Contact</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referrerContact || ''} 
                  onChange={e => handleFieldChange('referrerContact', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referrerContact || '—'}</div>
              )}
            </div>
          </div>
        </section>

        {/* SUPPORT & OFFER DETAILS CARD */}
        <section 
          ref={supportCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, supportCardRef, "support")}
          onMouseLeave={() => handleCardMouseLeave(supportCardRef, "support")}
          className={`${styles.infoCard} ${styles.fullWidth}`}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Target size={20} />
            </div>
            <h2>Support & Offer Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Referring For</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringFor || ''} 
                  onChange={e => handleFieldChange('referringFor', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringFor || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Offer Location</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.offer_Location || ''} 
                  onChange={e => handleFieldChange('offer_Location', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.offer_Location || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Job Offer Type</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.jobOfferType || ''} 
                  onChange={e => handleFieldChange('jobOfferType', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.jobOfferType || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referring Offer Type</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringOfferType || ''} 
                  onChange={e => handleFieldChange('referringOfferType', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringOfferType || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Level of Support</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.levelOfSupport || ''} 
                  onChange={e => handleFieldChange('levelOfSupport', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.levelOfSupport || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>District / Area</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.district || ''} 
                  onChange={e => handleFieldChange('district', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.district || '—'}</div>
              )}
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Full Address</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.address || ''} 
                  onChange={e => handleFieldChange('address', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.address || '—'}</div>
              )}
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Opportunity Description</label>
              {isEditing ? (
                <textarea 
                  className={styles.editTextarea} 
                  value={formData.opportunityDescription || ''} 
                  onChange={e => handleFieldChange('opportunityDescription', e.target.value)}
                />
              ) : (
                <div className={styles.value} style={{ whiteSpace: 'pre-wrap' }}>{formData.opportunityDescription || '—'}</div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* REFERRED JOBS SECTION */}
      <div 
        ref={jobsCardRef}
        onMouseMove={(e) => handleCardMouseMove(e, jobsCardRef, "jobs")}
        onMouseLeave={() => handleCardMouseLeave(jobsCardRef, "jobs")}
        style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0' }}
      >
        <section className={styles.infoCard}>
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Briefcase size={20}/>
            </div>
            <h2>Referred Jobs</h2>
          </div>
          
          {loadingJobs ? (
            <div className={styles.jobEmptyState}>
              <div className={styles.spinner}></div>
              <p>Loading referred jobs...</p>
            </div>
          ) : referredJobs.length === 0 ? (
            <div className={styles.jobEmptyState}>
              <Users size={40} style={{ opacity: 0.3 }} />
              <p>No jobs referred by this referee yet</p>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {referredJobs.map((job) => (
                <div key={job._id} className={styles.jobCard}>
                  <div className={styles.jobCardTop}>
                    <h3 className={styles.jobCardTitle}>{job.title}</h3>
                    <span className={styles.jobTypeBadge}>
                      {job.employmentType || 'Full-time'}
                    </span>
                  </div>

                  <p className={styles.jobDescription}>
                    {job.description?.substring(0, 100)}...
                  </p>

                  <div className={styles.jobMeta}>
                    {job.jobId && (
                      <div>
                        <label className={styles.jobMetaLabel}>Job ID</label>
                        <div className={styles.jobMetaValue}>{job.jobId}</div>
                      </div>
                    )}
                    {job.companyName && (
                      <div>
                        <label className={styles.jobMetaLabel}>Company</label>
                        <div className={styles.jobMetaValue}>{job.companyName}</div>
                      </div>
                    )}
                    {job.location && (
                      <div>
                        <label className={styles.jobMetaLabel}>Location</label>
                        <div className={styles.jobMetaValue}>
                          <MapPin size={14} /> {job.location}
                        </div>
                      </div>
                    )}
                    {job.salary && (
                      <div>
                        <label className={styles.jobMetaLabel}>Salary</label>
                        <div className={styles.jobMetaValueGreen}>{job.salary}</div>
                      </div>
                    )}
                    {job.experience && (
                      <div>
                        <label className={styles.jobMetaLabel}>Experience</label>
                        <div className={styles.jobMetaValue}>{job.experience}</div>
                      </div>
                    )}
                    {job.createdAt && (
                      <div>
                        <label className={styles.jobMetaLabel}>Posted</label>
                        <div className={styles.jobMetaValue}>
                          <Clock size={14} />
                          {new Date(job.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View Details <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RefereeDetailsPage;