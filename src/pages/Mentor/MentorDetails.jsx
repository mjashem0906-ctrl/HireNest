// // // //-------------------31/01------------------4.48-------------------------

// // // import React, { useEffect, useState } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { 
// // //   ArrowLeft, Mail, Phone, Calendar, Briefcase, Building2, User, 
// // //   Award, Edit, CheckCircle 
// // // } from 'lucide-react';
// // // import API from '../../axios';
// // // import { useAuth } from '../../context/AuthContext';
// // // import AddMentor from './AddMentor';

// // // // Styles (Kept original as requested, just ensuring consistency)
// // // const styles = {
// // //   page: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
// // //   header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
// // //   headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
// // //   backButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', fontSize: '14px' },
// // //   editButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
// // //   mentorCard: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
// // //   mentorHeader: { display: 'flex', alignItems: 'center', padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', gap: '25px' },
// // //   mentorImage: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' },
// // //   mentorBasicInfo: { flex: 1 },
// // //   detailsContainer: { padding: '30px' },
// // //   section: { marginBottom: '30px' },
// // //   sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f3f4f6' },
// // //   sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
// // //   detailItem: { padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
// // //   detailLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' },
// // //   detailValue: { fontSize: '16px', color: '#111827', fontWeight: '500', lineHeight: '1.5' },
// // //   spinner: { display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite', marginRight: '8px' },
// // //   notFound: { textAlign: 'center', padding: '100px 20px' },
// // //   successMessage: { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', marginTop: '16px', border: '1px solid #bbf7d0' }
// // // };

// // // const MentorDetails = () => {
// // //   const { id } = useParams();
// // //   const navigate = useNavigate();
// // //   const { user } = useAuth();
// // //   const [mentor, setMentor] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState(null);
// // //   const [isEditing, setIsEditing] = useState(false);
// // //   const [successMessage, setSuccessMessage] = useState('');

// // //   const fetchMentorDetails = async () => {
// // //     try {
// // //       setLoading(true);
// // //       setError(null);
// // //       const res = await API.get(`/member/${id}`);
      
// // //       if (res.data.memberType?.toLowerCase() !== 'mentor') {
// // //         setError('This member is not a mentor');
// // //         return;
// // //       }
// // //       setMentor(res.data);
// // //     } catch (error) {
// // //       console.error("Failed to fetch mentor details:", error);
// // //       setError('Failed to load mentor details');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchMentorDetails();
// // //   }, [id]);

// // //   const handleEditSuccess = (updatedData) => {
// // //     setMentor(updatedData);
// // //     setIsEditing(false);
// // //     setSuccessMessage('Mentor details updated successfully!');
// // //     setTimeout(() => setSuccessMessage(''), 3000);
// // //   };

// // //   const calculateAge = (dob) => {
// // //     if (!dob) return null;
// // //     const today = new Date();
// // //     const birthDate = new Date(dob);
// // //     let age = today.getFullYear() - birthDate.getFullYear();
// // //     const m = today.getMonth() - birthDate.getMonth();
// // //     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
// // //       age--;
// // //     }
// // //     return age;
// // //   };

// // //   const displayDate = (dateString) => {
// // //     if (!dateString) return 'Not specified';
// // //     return new Date(dateString).toLocaleDateString();
// // //   };

// // //   if (loading) return <div style={styles.page}><div style={styles.notFound}><div style={styles.spinner}></div><p>Loading...</p></div></div>;
// // //   if (error || !mentor) return <div style={styles.page}><div style={styles.notFound}><h2>{error || 'Mentor not found'}</h2><button onClick={() => navigate('/mentors')} style={styles.backButton}><ArrowLeft size={20} /> Back to Mentors</button></div></div>;

// // //   return (
// // //     <div style={styles.page}>
// // //       <div style={styles.header}>
// // //         <button onClick={() => navigate('/mentors')} style={styles.backButton}>
// // //           <ArrowLeft size={20} /> Back to Mentors
// // //         </button>
// // //         <h1 style={{ margin: 0, color: '#333', fontSize: '24px', flex: 1 }}>Mentor Details</h1>
        
// // //         <div style={styles.headerActions}>
// // //           {user?.role === 'Admin' && (
// // //             <button onClick={() => setIsEditing(true)} style={styles.editButton}>
// // //               <Edit size={16} /> Edit Mentor
// // //             </button>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {successMessage && (
// // //         <div style={styles.successMessage}>
// // //           <CheckCircle size={16} /> <span>{successMessage}</span>
// // //         </div>
// // //       )}

// // //       {isEditing && (
// // //         <AddMentor 
// // //           editData={mentor}
// // //           isEditing={true}
// // //           onSuccess={handleEditSuccess}
// // //           onClose={() => setIsEditing(false)}
// // //         />
// // //       )}

// // //       {/* Profile Card */}
// // //       <div style={styles.mentorCard}>
// // //         <div style={styles.mentorHeader}>
// // //           <img 
// // //             src={mentor.photoUrl || "/members/AnonymousImage.jpg"} 
// // //             alt={mentor.name}
// // //             style={styles.mentorImage}
// // //             onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
// // //           />
// // //           <div style={styles.mentorBasicInfo}>
// // //             <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{mentor.name}</h2>
// // //             <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '16px' }}>{mentor.designation}</p>
// // //           </div>
// // //         </div>

// // //         <div style={styles.detailsContainer}>
// // //           <div style={styles.section}>
// // //             <h3 style={styles.sectionTitle}>Personal Information</h3>
// // //             <div style={styles.sectionGrid}>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> NAME</div><div style={styles.detailValue}>{mentor.name}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> GENDER</div><div style={styles.detailValue}>{mentor.gender}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Mail size={18}/> EMAIL</div><div style={styles.detailValue}>{mentor.email}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Phone size={18}/> MOBILE</div><div style={styles.detailValue}>{mentor.mobileNumber}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Calendar size={18}/> DATE OF BIRTH</div><div style={styles.detailValue}>{displayDate(mentor.dateOfBirth)}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><User size={18}/> AGE</div><div style={styles.detailValue}>{mentor.dateOfBirth ? `${calculateAge(mentor.dateOfBirth)} years` : '-'}</div></div>
// // //             </div>
// // //           </div>

// // //           <div style={styles.section}>
// // //             <h3 style={styles.sectionTitle}>Professional Information</h3>
// // //             <div style={styles.sectionGrid}>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Building2 size={18}/> INSTITUTION</div><div style={styles.detailValue}>{mentor.currentInstitutionOrCompany}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Briefcase size={18}/> DESIGNATION</div><div style={styles.detailValue}>{mentor.designation}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Award size={18}/> EXPERTISE</div><div style={styles.detailValue}>{mentor.fieldofStudy_Interest}</div></div>
// // //               <div style={styles.detailItem}><div style={styles.detailLabel}><Calendar size={18}/> EXPERIENCE</div><div style={styles.detailValue}>{mentor.workExp} years</div></div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default MentorDetails;

// // //-------------------6/2---------------------------11.28--------------------

// // import React, { useEffect, useState } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { 
// //   ArrowLeft, Mail, Phone, Calendar, Briefcase, Building2, User, 
// //   Award, Edit, CheckCircle, MapPin, Star
// // } from 'lucide-react';
// // import API from '../../axios';
// // import { useAuth } from '../../context/AuthContext';
// // import AddMentor from './AddMentor';
// // import styles from './MentorDetails.module.scss';

// // const MentorDetails = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const { user } = useAuth();
// //   const [mentor, setMentor] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [isEditing, setIsEditing] = useState(false);

// //   useEffect(() => {
// //     const fetchDetails = async () => {
// //       try {
// //         setLoading(true);
// //         const res = await API.get(`/member/${id}`);
// //         setMentor(res.data);
// //       } catch (err) { console.error(err); } 
// //       finally { setLoading(false); }
// //     };
// //     fetchDetails();
// //   }, [id]);

// //   const calculateAge = (dob) => {
// //     if (!dob) return null;
// //     const diff = Date.now() - new Date(dob).getTime();
// //     return Math.abs(new Date(diff).getUTCFullYear() - 1970);
// //   };

// //   if (loading) return <div className={styles.pageContainer} style={{display:'flex', justifyContent:'center', alignItems:'center'}}><div className="loader"></div></div>;

// //   return (
// //     <div className={styles.pageContainer}>
// //       <div className={styles.banner}></div>
      
// //       <div className={styles.topActions}>
// //         <button onClick={() => navigate('/mentors')} className={styles.backBtn}>
// //           <ArrowLeft size={18} /> Back to Directory
// //         </button>
// //       </div>

// //       {/* Main Profile Card */}
// //       <div className={`${styles.mainProfileCard} ${styles.animateIn}`}>
// //         <div className={styles.profileHero}>
// //           <div className={styles.avatarWrapper}>
// //             <img 
// //               src={mentor.photoUrl || "/members/AnonymousImage.jpg"} 
// //               className={styles.avatar} 
// //               alt={mentor.name} 
// //             />
// //             <div className={styles.statusBadge}>
// //               <div style={{width:6, height:6, background:'white', borderRadius:'50%'}}></div>
// //               AVAILABLE
// //             </div>
// //           </div>

// //           <div className={styles.heroText}>
// //             <h1>{mentor.name}</h1>
// //             <p className={styles.designation}>{mentor.designation || 'Expert Mentor'}</p>
// //             <div className={styles.quickMeta}>
// //               <span><MapPin size={16} /> {mentor.district || 'Remote'}</span>
// //               <span><Star size={16} /> {mentor.workExp} Years Experience</span>
// //               <span><Calendar size={16} /> Joined {new Date(mentor.createdAt).getFullYear()}</span>
// //             </div>
// //           </div>
// //         </div>

// //         {user?.role === 'Admin' && (
// //           <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
// //             <Edit size={18} /> Edit Profile
// //           </button>
// //         )}
// //       </div>

// //       {/* Details Grid */}
// //       <div className={`${styles.contentGrid} ${styles.animateIn}`} style={{animationDelay: '0.2s'}}>
// //         {/* Personal Card */}
// //         <section className={styles.infoCard}>
// //           <div className={styles.cardHeader}><User size={20} /> Personal Details</div>
// //           <div className={styles.detailsGrid}>
// //             <div className={styles.item}>
// //               <label>Full Name</label>
// //               <div className={styles.value}>{mentor.name}</div>
// //             </div>
// //             <div className={styles.item}>
// //               <label>Gender</label>
// //               <div className={styles.value}>{mentor.gender || 'Not Specified'}</div>
// //             </div>
// //             <div className={styles.item}>
// //               <label>Email Address</label>
// //               <div className={styles.value}>{mentor.email}</div>
// //             </div>
// //             <div className={styles.item}>
// //               <label>Phone Number</label>
// //               <div className={styles.value}>{mentor.mobileNumber}</div>
// //             </div>
// //             <div className={styles.item}>
// //               <label>Age</label>
// //               <div className={styles.value}>{calculateAge(mentor.dateOfBirth)} Years</div>
// //             </div>
// //           </div>
// //         </section>

// //         {/* Professional Card */}
// //         <section className={styles.infoCard}>
// //           <div className={styles.cardHeader}><Briefcase size={20} /> Professional Info</div>
// //           <div className={styles.detailsGrid}>
// //             <div className={styles.item}>
// //               <label>Current Institution</label>
// //               <div className={styles.value}>{mentor.currentInstitutionOrCompany || 'N/A'}</div>
// //             </div>
// //             <div className={styles.item}>
// //               <label>Designation</label>
// //               <div className={styles.value}>{mentor.designation}</div>
// //             </div>
// //             <div className={styles.item} style={{gridColumn: 'span 2'}}>
// //               <label>Core Expertise</label>
// //               <div className={styles.expertiseTags}>
// //                 {mentor.fieldofStudy_Interest?.split(',').map(tag => (
// //                   <span key={tag} className={styles.tag}>{tag.trim()}</span>
// //                 )) || <span className={styles.tag}>Mentorship</span>}
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       </div>

// //       {isEditing && (
// //         <AddMentor 
// //           editData={mentor}
// //           isEditing={true}
// //           onSuccess={(updated) => { setMentor(updated); setIsEditing(false); }}
// //           onClose={() => setIsEditing(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default MentorDetails;

// //-------------------6/2---------------------------11.28--------------------

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Calendar,
//   Briefcase,
//   User,
//   Edit,
//   MapPin,
//   Star,
//   UserCheck,
//   UserX,
//   Trash2,
//   AlertCircle,
// } from "lucide-react";
// import API from "../../axios";
// import { useAuth } from "../../context/AuthContext";
// import AddMentor from "./AddMentor";
// import styles from "./MentorDetails.module.scss";

// const MentorDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [mentor, setMentor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [connectionRequests, setConnectionRequests] = useState([]);
//   const [loadingRequests, setLoadingRequests] = useState(false);
//   const [updatingRequestId, setUpdatingRequestId] = useState(null);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         setLoading(true);
//         const res = await API.get(`/member/${id}`);
//         setMentor(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDetails();
//   }, [id]);

//   // Fetch connection requests for this mentor (admin only)
//   useEffect(() => {
//     if (user?.role !== "Admin" || !id) return;

//     const fetchConnectionRequests = async () => {
//       try {
//         setLoadingRequests(true);
//         const res = await API.get(`/api/mentor-connections/mentor/${id}`);
//         setConnectionRequests(res.data || []);
//       } catch (err) {
//         console.error("Error fetching connection requests:", err);
//       } finally {
//         setLoadingRequests(false);
//       }
//     };

//     fetchConnectionRequests();
//   }, [id, user?.role]);

//   const calculateAge = (dob) => {
//     if (!dob) return null;
//     const diff = Date.now() - new Date(dob).getTime();
//     return Math.abs(new Date(diff).getUTCFullYear() - 1970);
//   };

//   const handleUpdateRequest = async (requestId, newStatus) => {
//     try {
//       setUpdatingRequestId(requestId);
//       const res = await API.put(`/api/mentor-connections/${requestId}`, {
//         status: newStatus,
//       });

//       setConnectionRequests((prev) =>
//         prev.map((req) =>
//           req._id === requestId ? { ...req, status: newStatus } : req
//         )
//       );

//       alert(`Request ${newStatus} successfully!`);
//     } catch (error) {
//       console.error("Error updating request:", error);
//       alert("Failed to update request");
//     } finally {
//       setUpdatingRequestId(null);
//     }
//   };

//   const handleDeleteRequest = async (requestId) => {
//     if (!confirm("Are you sure you want to delete this connection request?")) {
//       return;
//     }

//     try {
//       setUpdatingRequestId(requestId);
//       await API.delete(`/api/mentor-connections/${requestId}`);
//       setConnectionRequests((prev) =>
//         prev.filter((req) => req._id !== requestId)
//       );
//       alert("Request deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting request:", error);
//       alert("Failed to delete request");
//     } finally {
//       setUpdatingRequestId(null);
//     }
//   };

//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#f59e0b";
//       case "accepted":
//         return "#10b981";
//       case "rejected":
//         return "#ef4444";
//       default:
//         return "#6b7280";
//     }
//   };

//   const handleBack = () => {
//     // If user came from mentors list, browser back is perfect.
//     // If opened directly, fallback to /mentors.
//     if (window.history.length > 1) navigate(-1);
//     else navigate("/mentors");
//   };

//   if (loading)
//     return (
//       <div
//         className={styles.pageContainer}
//         style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
//       >
//         <div className="loader"></div>
//       </div>
//     );

//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.banner}></div>

//        <div className={styles.topActions}>
//                 <button onClick={() => navigate('/mentors')} className={styles.backBtn}>
//           <ArrowLeft size={18} /> Back to Directory
//         </button>
//       </div>
      
//       {/* Main Profile Card */}
//       <div className={`${styles.mainProfileCard} ${styles.animateIn}`}>
//         <div className={styles.profileHero}>
//           <div className={styles.avatarWrapper}>
//             <img
//               src={mentor?.photoUrl || "/members/AnonymousImage.jpg"}
//               className={styles.avatar}
//               alt={mentor?.name}
//               onError={(e) => (e.target.src = "/members/AnonymousImage.jpg")}
//             />
//             <div className={styles.statusBadge}>
//               <div
//                 style={{
//                   width: 6,
//                   height: 6,
//                   background: "white",
//                   borderRadius: "50%",
//                 }}
//               ></div>
//               AVAILABLE
//             </div>
//           </div>

//           <div className={styles.heroText}>
//             <h1>{mentor?.name}</h1>
//             <p className={styles.designation}>
//               {mentor?.designation || "Expert Mentor"}
//             </p>
//             <div className={styles.quickMeta}>
//               <span>
//                 <MapPin size={16} /> {mentor?.district || "Remote"}
//               </span>
//               <span>
//                 <Star size={16} /> {mentor?.workExp} Years Experience
//               </span>
//               <span>
//                 <Calendar size={16} /> Joined{" "}
//                 {mentor?.createdAt ? new Date(mentor.createdAt).getFullYear() : "-"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {user?.role === "Admin" && (
//           <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
//             <Edit size={18} /> Edit Profile
//           </button>
//         )}
//       </div>

//       {/* Details Grid */}
//       <div
//         className={`${styles.contentGrid} ${styles.animateIn}`}
//         style={{ animationDelay: "0.2s" }}
//       >
//         {/* Personal Card */}
//         <section className={styles.infoCard}>
//           <div className={styles.cardHeader}>
//             <User size={20} /> Personal Details
//           </div>
//           <div className={styles.detailsGrid}>
//             <div className={styles.item}>
//               <label>Full Name</label>
//               <div className={styles.value}>{mentor?.name}</div>
//             </div>
//             <div className={styles.item}>
//               <label>Gender</label>
//               <div className={styles.value}>
//                 {mentor?.gender || "Not Specified"}
//               </div>
//             </div>
//             <div className={styles.item}>
//               <label>Email Address</label>
//               <div className={styles.value}>{mentor?.email}</div>
//             </div>
//             <div className={styles.item}>
//               <label>Phone Number</label>
//               <div className={styles.value}>{mentor?.mobileNumber}</div>
//             </div>
//             <div className={styles.item}>
//               <label>Age</label>
//               <div className={styles.value}>
//                 {mentor?.dateOfBirth ? `${calculateAge(mentor.dateOfBirth)} Years` : "—"}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Professional Card */}
//         <section className={styles.infoCard}>
//           <div className={styles.cardHeader}>
//             <Briefcase size={20} /> Professional Info
//           </div>
//           <div className={styles.detailsGrid}>
//             <div className={styles.item}>
//               <label>Current Institution</label>
//               <div className={styles.value}>
//                 {mentor?.currentInstitutionOrCompany || "N/A"}
//               </div>
//             </div>
//             <div className={styles.item}>
//               <label>Designation</label>
//               <div className={styles.value}>{mentor?.designation || "—"}</div>
//             </div>
//             <div className={styles.item} style={{ gridColumn: "span 2" }}>
//               <label>Core Expertise</label>
//               <div className={styles.expertiseTags}>
//                 {mentor?.fieldofStudy_Interest ? (
//                   mentor.fieldofStudy_Interest.split(",").map((tag) => (
//                     <span key={tag} className={styles.tag}>
//                       {tag.trim()}
//                     </span>
//                   ))
//                 ) : (
//                   <span className={styles.tag}>Mentorship</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>

//       {isEditing && (
//         <AddMentor
//           editData={mentor}
//           isEditing={true}
//           onSuccess={(updated) => {
//             setMentor(updated);
//             setIsEditing(false);
//           }}
//           onClose={() => setIsEditing(false)}
//         />
//       )}

//       {/* Connection Requests Section (Admin Only) */}
//       {user?.role === "Admin" && (
//         <div
//           className={`${styles.contentGrid} ${styles.animateIn}`}
//           style={{ animationDelay: "0.4s", marginTop: "2rem" }}
//         >
//           <section className={styles.infoCard} style={{ gridColumn: "span 2" }}>
//             <div className={styles.cardHeader}>
//               <UserCheck size={20} /> Connection Requests
//             </div>

//             {loadingRequests ? (
//               <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
//                 Loading connection requests...
//               </div>
//             ) : connectionRequests.length === 0 ? (
//               <div
//                 style={{
//                   padding: "2rem",
//                   textAlign: "center",
//                   color: "#6b7280",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "0.5rem",
//                   justifyContent: "center",
//                 }}
//               >
//                 <AlertCircle size={16} /> No connection requests yet
//               </div>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//                 {connectionRequests.map((request) => (
//                   <div
//                     key={request._id}
//                     style={{
//                       padding: "1.5rem",
//                       border: "1px solid #e5e7eb",
//                       borderRadius: "8px",
//                       display: "grid",
//                       gridTemplateColumns: "1fr 1fr auto",
//                       gap: "1.5rem",
//                       alignItems: "center",
//                       backgroundColor: "#f9fafb",
//                     }}
//                   >
//                     {/* User Info */}
//                     <div>
//                       <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem" }}>
//                         User Information
//                       </div>
//                       <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
//                         {request.userDetails?.name}
//                       </div>
//                       <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
//                         {request.userDetails?.email}
//                       </div>
//                       {request.userDetails?.phone && (
//                         <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
//                           {request.userDetails.phone}
//                         </div>
//                       )}
//                       <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
//                         Role: {request.userDetails?.memberType}
//                       </div>
//                     </div>

//                     {/* Message & Date */}
//                     <div>
//                       {request.message && (
//                         <div>
//                           <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem" }}>
//                             Message
//                           </div>
//                           <div
//                             style={{
//                               fontSize: "0.875rem",
//                               color: "#374151",
//                               fontStyle: "italic",
//                               padding: "0.75rem",
//                               backgroundColor: "white",
//                               borderRadius: "4px",
//                               marginBottom: "0.5rem",
//                             }}
//                           >
//                             "{request.message}"
//                           </div>
//                         </div>
//                       )}
//                       <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
//                         Sent: {new Date(request.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>

//                     {/* Status & Actions */}
//                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
//                       <div
//                         style={{
//                           display: "inline-block",
//                           padding: "0.5rem 1rem",
//                           borderRadius: "20px",
//                           fontSize: "0.75rem",
//                           fontWeight: "700",
//                           color: "white",
//                           backgroundColor: getStatusBadgeColor(request.status),
//                           textTransform: "uppercase",
//                         }}
//                       >
//                         {request.status}
//                       </div>

//                       {request.status === "pending" && (
//                         <div style={{ display: "flex", gap: "0.5rem" }}>
//                           <button
//                             onClick={() =>
//                               handleUpdateRequest(request._id, "accepted")
//                             }
//                             disabled={updatingRequestId === request._id}
//                             style={{
//                               padding: "0.5rem 0.75rem",
//                               fontSize: "0.75rem",
//                               fontWeight: "600",
//                               border: "none",
//                               borderRadius: "4px",
//                               backgroundColor: "#10b981",
//                               color: "white",
//                               cursor: updatingRequestId === request._id ? "not-allowed" : "pointer",
//                               opacity: updatingRequestId === request._id ? 0.6 : 1,
//                               display: "flex",
//                               alignItems: "center",
//                               gap: "0.25rem",
//                             }}
//                           >
//                             <UserCheck size={14} /> Accept
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleUpdateRequest(request._id, "rejected")
//                             }
//                             disabled={updatingRequestId === request._id}
//                             style={{
//                               padding: "0.5rem 0.75rem",
//                               fontSize: "0.75rem",
//                               fontWeight: "600",
//                               border: "none",
//                               borderRadius: "4px",
//                               backgroundColor: "#ef4444",
//                               color: "white",
//                               cursor: updatingRequestId === request._id ? "not-allowed" : "pointer",
//                               opacity: updatingRequestId === request._id ? 0.6 : 1,
//                               display: "flex",
//                               alignItems: "center",
//                               gap: "0.25rem",
//                             }}
//                           >
//                             <UserX size={14} /> Reject
//                           </button>
//                         </div>
//                       )}

//                       <button
//                         onClick={() => handleDeleteRequest(request._id)}
//                         disabled={updatingRequestId === request._id}
//                         style={{
//                           padding: "0.5rem 0.75rem",
//                           fontSize: "0.75rem",
//                           fontWeight: "600",
//                           border: "1px solid #ef4444",
//                           borderRadius: "4px",
//                           backgroundColor: "transparent",
//                           color: "#ef4444",
//                           cursor: updatingRequestId === request._id ? "not-allowed" : "pointer",
//                           opacity: updatingRequestId === request._id ? 0.6 : 1,
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "0.25rem",
//                         }}
//                       >
//                         <Trash2 size={14} /> Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MentorDetails;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  User,
  Edit,
  MapPin,
  Star,
  UserCheck,
  UserPlus,
  UserX,
  Trash2,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  Clock3,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import AddMentor from "./AddMentor";
import styles from "./MentorDetails.module.scss";

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  // Connect button state
  const [connectStatus, setConnectStatus] = useState(null); // null | "pending" | "accepted" | "rejected"
  const [connectingId, setConnectingId] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const role = user?.role?.toLowerCase?.() || "";
  const memberType = user?.memberType?.toLowerCase?.() || "";
  const isCandidate =
    memberType === "candidate" ||
    memberType === "member" ||
    role === "candidate" ||
    role === "member";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/member/${id}`);
        setMentor(res.data);
      } catch (err) {
        console.error("Error fetching mentor details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Fetch this user's connection status with this mentor
  useEffect(() => {
    if (!user?.userId || !id) return;
    const fetchMyStatus = async () => {
      try {
        const res = await API.get("/api/mentor-connections/user/my-connections");
        const conn = (res.data || []).find(
          (c) => String(c.mentorId) === String(id)
        );
        setConnectStatus(conn?.status || null);
      } catch (_) {}
    };
    fetchMyStatus();
  }, [user?.userId, id]);

  useEffect(() => {
    if (!isAdmin || !id) return;

    const fetchConnectionRequests = async () => {
      try {
        setLoadingRequests(true);
        const res = await API.get(`/api/mentor-connections/mentor/${id}`);
        setConnectionRequests(res.data || []);
      } catch (err) {
        console.error("Error fetching connection requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchConnectionRequests();
  }, [id, isAdmin]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleUpdateRequest = async (requestId, newStatus) => {
    try {
      setUpdatingRequestId(requestId);

      await API.put(`/api/mentor-connections/${requestId}`, {
        status: newStatus,
      });

      setConnectionRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );

      alert(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this connection request?"
    );
    if (!confirmed) return;

    try {
      setUpdatingRequestId(requestId);
      await API.delete(`/api/mentor-connections/${requestId}`);

      setConnectionRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );

      alert("Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          className: styles.accepted,
          icon: <CheckCircle2 size={14} />,
        };
      case "rejected":
        return {
          label: "Rejected",
          className: styles.rejected,
          icon: <XCircle size={14} />,
        };
      default:
        return {
          label: "Pending",
          className: styles.pending,
          icon: <Clock3 size={14} />,
        };
    }
  };

  const handleConnectClick = () => {
    setConnectMessage("");
    setShowConnectModal(true);
  };

  const handleSendConnection = async () => {
    try {
      setConnectingId(id);
      const response = await API.post("/api/mentor-connections", {
        mentorId: id,
        message: connectMessage,
      });
      if (response.status === 201) {
        setConnectStatus("pending");
        setShowConnectModal(false);
        setConnectMessage("");
        alert("Connection request sent successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to send request";
      alert(errorMsg);
    } finally {
      setConnectingId(null);
    }
  };

  const handleBack = () => {
    navigate("/mentors");
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingWrap}>
          <div className={styles.loader}></div>
          <p>Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.banner}>
        <div className={styles.bannerGlow}></div>
        <div className={styles.bannerGlowTwo}></div>
      </div>

      <div className={styles.topActions}>
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back to Directory
        </button>
      </div>

      <div className={`${styles.mainProfileCard} ${styles.animateIn}`}>
        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            <img
              src={mentor?.photoUrl || "/members/AnonymousImage.jpg"}
              className={styles.avatar}
              alt={mentor?.name}
              onError={(e) => {
                e.target.src = "/members/AnonymousImage.jpg";
              }}
            />
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              AVAILABLE
            </div>
          </div>

          <div className={styles.heroText}>
            <h1>{mentor?.name || "Mentor"}</h1>
            <p className={styles.designation}>
              {mentor?.designation || "Expert Mentor"}
            </p>

            <div className={styles.quickMeta}>
              <span>
                <MapPin size={16} />
                {mentor?.district || "Remote"}
              </span>
              <span>
                <Star size={16} />
                {mentor?.workExp ? `${mentor.workExp} Years Experience` : "Experience N/A"}
              </span>
              <span>
                <Calendar size={16} />
                Joined{" "}
                {mentor?.createdAt
                  ? new Date(mentor.createdAt).getFullYear()
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            <Edit size={18} />
            Edit Profile
          </button>
        )}

        {isCandidate && (() => {
          let btnClass = styles.connectBtn;
          let btnLabel;
          const isSending = connectingId === id;

          if (connectStatus === "accepted") {
            btnClass = `${styles.connectBtn} ${styles.connectConnected}`;
            btnLabel = <><CheckCircle2 size={17} /> Connected</>;
          } else if (connectStatus === "rejected") {
            btnClass = `${styles.connectBtn} ${styles.connectRejected}`;
            btnLabel = <><XCircle size={17} /> Rejected</>;
          } else if (connectStatus === "pending") {
            btnClass = `${styles.connectBtn} ${styles.connectPending}`;
            btnLabel = <><Clock size={17} /> Pending</>;
          } else {
            btnLabel = isSending
              ? "Sending..."
              : <><UserPlus size={17} /> Connect</>;
          }

          return (
            <button
              onClick={handleConnectClick}
              disabled={!!connectStatus || isSending}
              className={btnClass}
            >
              {btnLabel}
            </button>
          );
        })()}
      </div>

      <div
        className={`${styles.contentGrid} ${styles.animateIn}`}
        style={{ animationDelay: "0.12s" }}
      >
        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <User size={20} />
            Personal Details
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Full Name</label>
              <div className={styles.value}>{mentor?.name || "—"}</div>
            </div>

            <div className={styles.item}>
              <label>Gender</label>
              <div className={styles.value}>{mentor?.gender || "Not Specified"}</div>
            </div>

            <div className={styles.item}>
              <label>Email Address</label>
              <div className={styles.value}>{mentor?.email || "—"}</div>
            </div>

            <div className={styles.item}>
              <label>Phone Number</label>
              <div className={styles.value}>{mentor?.mobileNumber || "—"}</div>
            </div>

            <div className={styles.item}>
              <label>Age</label>
              <div className={styles.value}>
                {mentor?.dateOfBirth
                  ? `${calculateAge(mentor.dateOfBirth)} Years`
                  : "—"}
              </div>
            </div>

            <div className={styles.item}>
              <label>Location</label>
              <div className={styles.value}>{mentor?.district || "Remote"}</div>
            </div>
          </div>
        </section>

        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <Briefcase size={20} />
            Professional Info
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Current Institution</label>
              <div className={styles.value}>
                {mentor?.currentInstitutionOrCompany || "N/A"}
              </div>
            </div>

            <div className={styles.item}>
              <label>Designation</label>
              <div className={styles.value}>{mentor?.designation || "—"}</div>
            </div>

            <div className={styles.item}>
              <label>Experience</label>
              <div className={styles.value}>
                {mentor?.workExp ? `${mentor.workExp} Years` : "N/A"}
              </div>
            </div>

            <div className={styles.item}>
              <label>Member Type</label>
              <div className={styles.value}>{mentor?.memberType || "Mentor"}</div>
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Core Expertise</label>
              <div className={styles.expertiseTags}>
                {mentor?.fieldofStudy_Interest ? (
                  mentor.fieldofStudy_Interest.split(",").map((tag, index) => (
                    <span key={`${tag}-${index}`} className={styles.tag}>
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className={styles.tag}>Mentorship</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Connect Modal */}
      {showConnectModal && mentor && (
        <div className={styles.modalOverlay} onClick={() => setShowConnectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Connect with {mentor.name}</h2>
            <p>Send a message to {mentor.designation || "this mentor"} (optional)</p>
            <textarea
              placeholder="Tell them why you'd like to connect..."
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              className={styles.messageInput}
              rows={4}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowConnectModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                disabled={!!connectingId}
                className={styles.sendBtn}
              >
                {connectingId ? "Sending..." : <><Send size={16} /> Send Request</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <AddMentor
          editData={mentor}
          isEditing={true}
          onSuccess={(updated) => {
            setMentor(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isAdmin && (
        <div
          className={`${styles.requestsSectionWrap} ${styles.animateIn}`}
          style={{ animationDelay: "0.22s" }}
        >
          <section className={styles.requestsCard}>
            <div className={styles.requestsHeader}>
              <div>
                <h2>
                  <UserCheck size={22} />
                  Connection Requests
                </h2>
                <p>Manage mentor requests and view candidate profiles</p>
              </div>

              <div className={styles.requestsCount}>
                {connectionRequests.length} Request
                {connectionRequests.length !== 1 ? "s" : ""}
              </div>
            </div>

            {loadingRequests ? (
              <div className={styles.emptyState}>Loading connection requests...</div>
            ) : connectionRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <AlertCircle size={18} />
                No connection requests yet
              </div>
            ) : (
              <div className={styles.requestsList}>
                {connectionRequests.map((request) => {
                  const status = getStatusConfig(request.status);

                  return (
                    <div key={request._id} className={styles.requestItem}>
                      <div className={styles.requestTop}>
                        <div className={styles.requestUserBlock}>
                          <div className={styles.userAvatar}>
                            {request.userDetails?.photoUrl ? (
                              <img
                                src={request.userDetails.photoUrl}
                                alt={request.userDetails?.name}
                                onError={(e) => {
                                  e.target.src = "/members/AnonymousImage.jpg";
                                }}
                              />
                            ) : (
                              <span>
                                {request.userDetails?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>

                          <div className={styles.userInfo}>
                            <div className={styles.userLabel}>User Information</div>
                            <h3>{request.userDetails?.name || "Unknown User"}</h3>

                            <div className={styles.inlineMeta}>
                              <span>
                                <Mail size={14} />
                                {request.userDetails?.email || "No email"}
                              </span>
                              <span>
                                <Phone size={14} />
                                {request.userDetails?.phone || "No phone"}
                              </span>
                            </div>

                            <div className={styles.roleLine}>
                              Role:{" "}
                              {request.userDetails?.memberType ||
                                request.userDetails?.role ||
                                "User"}
                            </div>
                          </div>
                        </div>

                        <div className={`${styles.statusPill} ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>

                      <div className={styles.requestBody}>
                        <div className={styles.metaCard}>
                          <label>
                            <Calendar size={14} />
                            Request Date
                          </label>
                          <p>
                            {request.createdAt
                              ? new Date(request.createdAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>

                        <div className={styles.metaCard}>
                          <label>
                            <Clock3 size={14} />
                            Last Updated
                          </label>
                          <p>
                            {request.updatedAt
                              ? new Date(request.updatedAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className={styles.messageSection}>
                          <label>
                            <MessageSquare size={14} />
                            User Message
                          </label>
                          <div className={styles.messageBox}>
                            {request.message}
                          </div>
                        </div>
                      )}

                      <div className={styles.requestActions}>
                        {request.userMemberId && (
                          <button
                            type="button"
                            className={styles.viewProfileBtn}
                            onClick={() =>
                              navigate(`/member/${request.userMemberId}`)
                            }
                          >
                            <Eye size={16} />
                            View Profile
                          </button>
                        )}

                        {request.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateRequest(request._id, "accepted")
                              }
                              disabled={updatingRequestId === request._id}
                              className={styles.acceptBtn}
                            >
                              <UserCheck size={15} />
                              {updatingRequestId === request._id
                                ? "Updating..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateRequest(request._id, "rejected")
                              }
                              disabled={updatingRequestId === request._id}
                              className={styles.rejectBtn}
                            >
                              <UserX size={15} />
                              {updatingRequestId === request._id
                                ? "Updating..."
                                : "Reject"}
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(request._id)}
                          disabled={updatingRequestId === request._id}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MentorDetails;