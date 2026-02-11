// // //-------------------------30/01-----------------------2.40-------------------------

// // import React, { useEffect, useState } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import styles from './MembersDetail.module.scss';
// // import API from '../../axios';
// // import { useData } from '../../context/DataContext';
// // import { parseDOB } from '../../utils/dateUtils';
// // import { useAuth } from '../../context/AuthContext';
// // import {
// //     ChevronDown, ChevronUp, Users, FileText,
// //     Briefcase, Building, Award, Target, User, Languages,
// //     Home, Smartphone, Mail, Calendar, MapPin, Camera
// // } from 'lucide-react'; // Removed Edit from imports
// // import AddMember from '../../components/Models/AddMember';

// // function MembersDetail() {
// //     const { id } = useParams();
// //     const navigate = useNavigate();
// //     const [member, setMember] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [postedJobs, setPostedJobs] = useState([]);
// //     const [expandedJobIds, setExpandedJobIds] = useState([]);

// //     const { memberContext, userContext } = useData();
// //     const [age, setAge] = useState(null);
// //     const [showModal, setShowModal] = useState(false);
// //     const [editingMember, setEditingMember] = useState(null);
// //     const [initialTab, setInitialTab] = useState("basic");
// //     const { user } = useAuth();

// //     const BACKEND_URL = "http://localhost:5000";

// //     useEffect(() => {
// //         fetchMember();
// //     }, [memberContext, id, userContext]);

// //     const fetchMember = async () => {
// //         try {
// //             setLoading(true);
// //             let filtered = null;

// //             // 1. Try to find in context first (Faster)
// //             if (memberContext && memberContext.length > 0) {
// //                 filtered = memberContext.find(m => String(m._id) === String(id));
// //             }

// //             // 2. If not in context or context is empty, Fetch from API
// //             if (!filtered) {
// //                 try {
// //                     // Logic to handle "me" or specific ID
// //                     let targetId = id;

// //                     // If requesting "me" but we don't know the memberId yet
// //                     if (targetId === 'me') {
// //                         if (user?.memberId) {
// //                             targetId = user.memberId;
// //                         } else {
// //                             // No memberId found for this user. Auto-create a profile now.
// //                             console.log("Auto-creating profile for new user...");
// //                             const createResponse = await API.post('/auth/update-profile', {
// //                                 role: user?.role === 'Mentor' ? 'Mentor' : 'Job Seeker', // Default role
// //                                 profileData: {
// //                                     name: user?.username?.split('@')[0] || "New User",
// //                                     email: user?.username,
// //                                     memberType: user?.role === 'Mentor' ? 'Mentor' : 'Job Seeker',
// //                                     symMemberStatus: 'Active'
// //                                 }
// //                             });

// //                             // Update local user context if possible (optional but good for sync)
// //                             if (createResponse.data.user?.memberId) {
// //                                 // Assuming we could update context, but for now let's just use the ID
// //                                 targetId = createResponse.data.user.memberId;
// //                             }
// //                         }
// //                     }

// //                     if (targetId && targetId !== 'undefined') {
// //                         const response = await API.get(`/member/${targetId}`);
// //                         filtered = response.data;
// //                     }

// //                 } catch (err) {
// //                     console.error("API Fetch Error:", err);

// //                     // Fallback for 404 on specific ID if it matches current user (legacy logic)
// //                     if (err.response?.status === 404 && user?.memberId === id) {
// //                         // ... (existing fallback logic if needed)
// //                     }
// //                 }
// //             }

// //             setMember(filtered);

// //             if (filtered?.dateOfBirth) {
// //                 const calculated = calculateAge(filtered.dateOfBirth);
// //                 setAge(calculated);
// //             }

// //             if (filtered) fetchMemberJobs(filtered._id);

// //         } catch (err) {
// //             console.error("Error in fetching Member details", err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     }

// //     const fetchMemberJobs = async (memberId) => {
// //         try {
// //             if (!memberId || memberId === 'me') return;
// //             const res = await API.get('/service');
// //             const allJobs = res.data.data || res.data;
// //             const myJobs = allJobs.filter(job =>
// //                 String(job.memberId?._id || job.memberId) === String(memberId)
// //             );
// //             setPostedJobs(myJobs);
// //         } catch (err) {
// //             console.error("Error fetching member jobs:", err);
// //         }
// //     };

// //     const toggleJobDetails = (jobId) => {
// //         setExpandedJobIds(prev =>
// //             prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
// //         );
// //     };

// //     const calculateAge = (dob) => {
// //         if (!dob) return;
// //         const birthDate = parseDOB(dob);
// //         if (!birthDate || isNaN(birthDate)) return;
// //         const today = new Date();
// //         let years = today.getFullYear() - birthDate.getFullYear();
// //         let months = today.getMonth() - birthDate.getMonth();
// //         let days = today.getDate() - birthDate.getDate();
// //         if (days < 0) {
// //             months -= 1;
// //             days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
// //         }
// //         if (months < 0) {
// //             years -= 1;
// //             months += 12;
// //         }
// //         return { years, months, days };
// //     };

// //     const handleEdit = (member, tab = "basic") => {
// //         setEditingMember(member);
// //         setInitialTab(tab);
// //         setShowModal(true);
// //     };

// //     const getProfileImageUrl = (url) => {
// //         if (!url) return "/members/AnonymousImage.jpg";
// //         if (url.startsWith("uploads") || url.includes("\\")) {
// //             return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
// //         }
// //         // ... (Google Drive logic kept for compatibility)
// //         let fileId = null;
// //         let match = url.match(/[?&]id=([^&]+)/);
// //         if (match) fileId = match[1];
// //         if (!fileId) { match = url.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
// //         if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}`;
// //         if (url.startsWith("http")) return url;
// //         return url;
// //     };

// //     const handleUpdate = async (field, value) => {
// //         try {
// //             const updatedMember = { ...member };

// //             if (field.includes('.')) {
// //                 const [parent, child] = field.split('.');
// //                 updatedMember[parent] = { ...updatedMember[parent], [child]: value };

// //                 if (field === 'careerProfile.role') updatedMember.preferredJobRole_Sector = value;
// //                 if (field === 'careerProfile.location') updatedMember.preferredJobLocation = value;
// //             } else {
// //                 updatedMember[field] = value;
// //                 if (field === 'preferredJobRole_Sector') {
// //                     updatedMember.careerProfile = { ...updatedMember.careerProfile, role: value };
// //                 }
// //                 if (field === 'preferredJobLocation') {
// //                     updatedMember.careerProfile = { ...updatedMember.careerProfile, location: value };
// //                 }
// //             }

// //             const res = await API.put(`/member/${member._id}`, updatedMember);
// //             setMember(res.data);

// //             if (field === 'dateOfBirth') {
// //                 setAge(calculateAge(value));
// //             }
// //         } catch (err) {
// //             console.error("Update failed", err);
// //         }
// //     };

// //     // REMOVED EditableValue component entirely since we're keeping only the main edit button

// //     const getFileUrl = (url) => {
// //         if (!url) return null;
// //         if (url.startsWith("http")) return url;
// //         if (url.startsWith("uploads") || url.includes("\\")) {
// //             const cleanPath = url.replace(/\\/g, "/");
// //             return `${BACKEND_URL}/${cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`}`;
// //         }
// //         return url;
// //     };

// //     if (loading) {
// //         return (
// //             <div className={styles.loadingContainer}>
// //                 <div className="loader"></div>
// //                 <p>Retrieving profile data...</p>
// //             </div>
// //         );
// //     }

// //     if (!member) {
// //         return (
// //             <div className={styles.errorContainer}>
// //                 <Users size={60} color="#cbd5e1" />
// //                 <h2>Member not found</h2>
// //                 <p>The profile you are looking for doesn't exist or you don't have permission to view it.</p>
// //                 <button onClick={() => navigate(-1)}>Go Back</button>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className={styles.container}>
// //             {/* 1. Header Card (Naukri Style) */}
// //             <div className={styles.headerCard}>
// //                 <div className={styles.profileSection}>
// //                     <div className={styles.avatarWrapper}>
// //                         <img
// //                             src={getProfileImageUrl(member.photoUrl || member.photo)}
// //                             alt={member.name}
// //                             className={styles.avatar}
// //                         />
// //                         {(user?.role === 'Admin' || user?.memberId === member._id || id === 'me') && (
// //                             <button className={styles.editAvatar} title="Change Profile Picture">
// //                                 <Camera size={16} />
// //                             </button>
// //                         )}
// //                     </div>
// //                     <div className={styles.mainInfo}>
// //                         <h1>{member.name}</h1>
// //                         <p className={styles.designation}>{member.designation || "Candidate"}</p>
// //                         <div className={styles.quickStats}>
// //                             <span><MapPin size={14} /> {member.district || "Location N/A"}</span>
// //                             <span><Briefcase size={14} /> {member.workExp || "0"} Years Exp</span>
// //                             <span><Target size={14} /> {member.memberType}</span>
// //                         </div>
// //                     </div>
// //                 </div>
// //                 {/* ONLY EDIT BUTTON IN THE ENTIRE PAGE */}
// //                 {(user?.role === 'Admin' || String(user?.memberId) === String(member._id) || id === 'me') && (
// //                     <button className={styles.editProfileBtn} onClick={() => handleEdit(member)}>
// //                         Edit Profile
// //                     </button>
// //                 )}
// //             </div>

// //             <div className={styles.profileContent}>
// //                 {/* Left Column */}
// //                 <div className={styles.mainColumn}>

// //                     {/* Career Profile Section */}
// //                     <section className={styles.card}>
// //                         <div className={styles.cardHeader}>
// //                             <Target size={20} className={styles.icon} />
// //                             <h3>Career Profile</h3>
// //                             {/* REMOVED edit button */}
// //                         </div>
// //                         <div className={styles.detailsGrid}>
// //                             <div className={styles.item}>
// //                                 <label>Desired Role</label>
// //                                 <span className={styles.value}>{member.careerProfile?.role || member.preferredJobRole_Sector || "N/A"}</span>
// //                             </div>
// //                             <div className={styles.item}>
// //                                 <label>Industry</label>
// //                                 <span className={styles.value}>{member.careerProfile?.industry || "N/A"}</span>
// //                             </div>
// //                             <div className={styles.item}>
// //                                 <label>Desired Location</label>
// //                                 <span className={styles.value}>{member.careerProfile?.location || member.preferredJobLocation || "N/A"}</span>
// //                             </div>
// //                             <div className={styles.item}>
// //                                 <label>Expected Salary</label>
// //                                 <span className={styles.value}>{member.careerProfile?.expectedSalary || "N/A"}</span>
// //                             </div>
// //                         </div>
// //                     </section>

// //                     {/* Certifications Section */}
// //                     <section className={styles.card}>
// //                         <div className={styles.cardHeader}>
// //                             <Award size={20} className={styles.icon} />
// //                             <h3>Certifications</h3>
// //                             {/* REMOVED edit button */}
// //                         </div>
// //                         <div className={styles.certList}>
// //                             {member.certifications?.length > 0 ? member.certifications.map((cert, idx) => (
// //                                 <div key={idx} className={styles.certItem}>
// //                                     <div>
// //                                         <h4>{cert.title}</h4>
// //                                         <p>{cert.organization} • {cert.year}</p>
// //                                     </div>
// //                                     {cert.link && <a href={cert.link} target="_blank">View Certificate</a>}
// //                                 </div>
// //                             )) : (
// //                                 <p className={styles.emptyText}>No certifications added yet.</p>
// //                             )}
// //                         </div>
// //                     </section>

// //                     {/* Education Section */}
// //                     <section className={styles.card}>
// //                         <div className={styles.cardHeader}>
// //                             <Building size={20} className={styles.icon} />
// //                             <h3>Education</h3>
// //                             {/* REMOVED edit button */}
// //                         </div>
// //                         <div className={styles.eduContent}>
// //                             <h4>{member.highest_education || "Education Details N/A"}</h4>
// //                             <p>{member.fieldofStudy_Interest || member.highestEducationSpecialization}</p>
// //                             <p className={styles.meta}>Batch: {member.highestEducationPassedOutYear || "N/A"}</p>
// //                         </div>
// //                     </section>
// //                 </div>

// //                 {/* Right Column */}
// //                 <div className={styles.sideColumn}>

// //                     {/* Personal Details */}
// //                     <section className={styles.card}>
// //                         <div className={styles.cardHeader}>
// //                             <User size={20} className={styles.icon} />
// //                             <h3>Personal Details</h3>
// //                             {/* REMOVED edit button */}
// //                         </div>
// //                         <div className={styles.sideDetails}>
// //                             <div className={styles.sideItem}>
// //                                 <Smartphone size={16} />
// //                                 <div><label>Mobile</label><span className={styles.value}>{member.mobileNumber || "N/A"}</span></div>
// //                             </div>
// //                             <div className={styles.sideItem}>
// //                                 <Mail size={16} />
// //                                 <div><label>Email</label><span className={styles.value}>{member.email || "N/A"}</span></div>
// //                             </div>
// //                             <div className={styles.sideItem}>
// //                                 <Calendar size={16} />
// //                                 <div><label>Age/DOB</label><span className={styles.value}>{member.dateOfBirth || "N/A"}</span></div>
// //                             </div>
// //                             <div className={styles.sideItem}>
// //                                 <Home size={16} />
// //                                 <div><label>Address</label><span className={styles.value}>{member.address || "N/A"}</span></div>
// //                             </div>
// //                         </div>
// //                         <hr />
// //                         <div className={styles.moreDetails}>
// //                             <p><strong>Father's Name:</strong> {member.fatherName || member.fathersName || "N/A"}</p>
// //                             <p><strong>Marital Status:</strong> {member.maritalStatus || "N/A"}</p>
// //                             <p><strong>Hometown:</strong> {member.hometown || "N/A"}</p>
// //                         </div>
// //                     </section>

// //                     {/* Languages Section */}
// //                     <section className={styles.card}>
// //                         <div className={styles.cardHeader}>
// //                             <Languages size={20} className={styles.icon} />
// //                             <h3>Languages</h3>
// //                             {/* REMOVED edit button */}
// //                         </div>
// //                         <div className={styles.tagCloud}>
// //                             {member.languages?.length > 0 ? member.languages.map((lang, idx) => (
// //                                 <span key={idx} className={styles.tag}>{lang}</span>
// //                             )) : <p className={styles.emptyText}>None listed</p>}
// //                         </div>
// //                     </section>

// //                     {/* Resume Card */}
// //                     <section className={`${styles.card} ${styles.resumeCard}`}>
// //                         <h3>Resume</h3>
// //                         {member.resumeLink || member.resume ? (
// //                             <a href={getFileUrl(member.resumeLink || member.resume)} target="_blank" className={styles.resumeBtn}>
// //                                 <FileText size={18} /> View Document
// //                             </a>
// //                         ) : (
// //                             <p>No resume uploaded</p>
// //                         )}
// //                     </section>
// //                 </div>
// //             </div>

// //             <AddMember
// //                 isOpen={showModal}
// //                 onClose={() => {
// //                     setShowModal(false);
// //                     setEditingMember(null);
// //                 }}
// //                 editMember={editingMember}
// //                 initialTab={initialTab}
// //                 onSuccess={(updatedMember) => {
// //                     setMember(updatedMember);
// //                     setShowModal(false);
// //                     setEditingMember(null);
// //                 }}
// //             />
// //         </div>
// //     );
// // }

// // export default MembersDetail;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from './MembersDetail.module.scss';
// import API from '../../axios';
// import { useData } from '../../context/DataContext';
// import { parseDOB } from '../../utils/dateUtils';
// import { useAuth } from '../../context/AuthContext';
// import {
//     Users, FileText, Briefcase, Building, Award,
//     Target, User, Languages, Home, Smartphone,
//     Mail, Calendar, MapPin, Camera, ExternalLink,
//     GraduationCap, DollarSign, Globe, Heart,
//     Award as CertificateIcon, BookOpen, Clock,
//     CheckCircle, Star
// } from 'lucide-react';
// import AddMember from '../../components/Models/AddMember';

// function MembersDetail() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [member, setMember] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [postedJobs, setPostedJobs] = useState([]);
//     const [expandedJobIds, setExpandedJobIds] = useState([]);
//     const [activeTab, setActiveTab] = useState('overview');
//     const [showContactInfo, setShowContactInfo] = useState(false);

//     const { memberContext, userContext } = useData();
//     const [age, setAge] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [editingMember, setEditingMember] = useState(null);
//     const [initialTab, setInitialTab] = useState("basic");
//     const { user } = useAuth();

//     const BACKEND_URL = import.meta.env.VITE_API_URL;

//     useEffect(() => {
//         fetchMember();
//     }, [memberContext, id, userContext]);

//     const fetchMember = async () => {
//         try {
//             setLoading(true);
//             let filtered = null;

//             if (memberContext && memberContext.length > 0) {
//                 filtered = memberContext.find(m => String(m._id) === String(id));
//             }

//             if (!filtered) {
//                 try {
//                     let targetId = id;
//                     if (targetId === 'me') {
//                         if (user?.memberId) {
//                             targetId = user.memberId;
//                         } else {
//                             console.log("Auto-creating profile for new user...");
//                             const createResponse = await API.post('/auth/update-profile', {
//                                 role: user?.role === 'Mentor' ? 'Mentor' : 'Job Seeker',
//                                 profileData: {
//                                     name: user?.username?.split('@')[0] || "New User",
//                                     email: user?.username,
//                                     memberType: user?.role === 'Mentor' ? 'Mentor' : 'Job Seeker',
//                                     symMemberStatus: 'Active'
//                                 }
//                             });
//                             if (createResponse.data.user?.memberId) {
//                                 targetId = createResponse.data.user.memberId;
//                             }
//                         }
//                     }

//                     if (targetId && targetId !== 'undefined') {
//                         const response = await API.get(`/member/${targetId}`);
//                         filtered = response.data;
//                     }

//                 } catch (err) {
//                     console.error("API Fetch Error:", err);
//                 }
//             }

//             setMember(filtered);

//             if (filtered?.dateOfBirth) {
//                 const calculated = calculateAge(filtered.dateOfBirth);
//                 setAge(calculated);
//             }

//             if (filtered) fetchMemberJobs(filtered._id);

//         } catch (err) {
//             console.error("Error in fetching Member details", err);
//         } finally {
//             setLoading(false);
//         }
//     }

//     const fetchMemberJobs = async (memberId) => {
//         try {
//             if (!memberId || memberId === 'me') return;
//             const res = await API.get('/service');
//             const allJobs = res.data.data || res.data;
//             const myJobs = allJobs.filter(job =>
//                 String(job.memberId?._id || job.memberId) === String(memberId)
//             );
//             setPostedJobs(myJobs);
//         } catch (err) {
//             console.error("Error fetching member jobs:", err);
//         }
//     };

//     const toggleJobDetails = (jobId) => {
//         setExpandedJobIds(prev =>
//             prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
//         );
//     };

//     const calculateAge = (dob) => {
//         if (!dob) return;
//         const birthDate = parseDOB(dob);
//         if (!birthDate || isNaN(birthDate)) return;
//         const today = new Date();
//         let years = today.getFullYear() - birthDate.getFullYear();
//         let months = today.getMonth() - birthDate.getMonth();
//         let days = today.getDate() - birthDate.getDate();
//         if (days < 0) {
//             months -= 1;
//             days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
//         }
//         if (months < 0) {
//             years -= 1;
//             months += 12;
//         }
//         return { years, months, days };
//     };

//     const handleEdit = (member, tab = "basic") => {
//         setEditingMember(member);
//         setInitialTab(tab);
//         setShowModal(true);
//     };

//     const getProfileImageUrl = (url) => {
//         if (!url) return "/members/AnonymousImage.jpg";
//         if (url.startsWith("uploads") || url.includes("\\")) {
//             return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
//         }
//         let fileId = null;
//         let match = url.match(/[?&]id=([^&]+)/);
//         if (match) fileId = match[1];
//         if (!fileId) {
//             match = url.match(/\/d\/([^/]+)/);
//             if (match) fileId = match[1];
//         }
//         if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}`;
//         if (url.startsWith("http")) return url;
//         return url;
//     };

//     const getFileUrl = (url) => {
//         if (!url) return null;
//         if (url.startsWith("http")) return url;
//         if (url.startsWith("uploads") || url.includes("\\")) {
//             const cleanPath = url.replace(/\\/g, "/");
//             return `${BACKEND_URL}/${cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`}`;
//         }
//         return url;
//     };

//     const formatExperience = (exp) => {
//         if (!exp) return "0 Years Exp";
//         if (typeof exp === 'string') return exp;
//         return `${exp} Years Exp`;
//     };

//     const getMemberTypeColor = (type) => {
//         const colors = {
//             'Job Seeker': '#3b82f6',
//             'Mentor': '#8b5cf6',
//             'Opportunity Provider': '#10b981',
//             'Referee': '#f59e0b',
//             'Upskiller': '#ec4899'
//         };
//         return colors[type] || '#64748b';
//     };

//     if (loading) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <div className={styles.loader}></div>
//                 <p>Loading Profile...</p>
//             </div>
//         );
//     }

//     if (!member) {
//         return (
//             <div className={styles.errorContainer}>
//                 <Users size={60} color="#cbd5e1" />
//                 <h2>Member Not Found</h2>
//                 <p>The profile you're looking for doesn't exist or you don't have permission to view it.</p>
//                 <button onClick={() => navigate(-1)}>Go Back</button>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.container}>
//             {/* Header Section */}
//             <div className={styles.headerCard}>
//                 <div className={styles.profileSection}>
//                     <div className={styles.avatarWrapper}>
//                         <img
//                             src={getProfileImageUrl(member.photoUrl || member.photo)}
//                             alt={member.name}
//                             className={styles.avatar}
//                         />
//                         {(user?.role === 'Admin' || user?.memberId === member._id || id === 'me') && (
//                             <button className={styles.editAvatar} title="Change Profile Picture">
//                                 <Camera size={16} />
//                             </button>
//                         )}
//                         {member.symMemberStatus === 'Active' && (
//                             <div className={styles.statusBadge}>
//                                 <CheckCircle size={12} />
//                                 Active
//                             </div>
//                         )}
//                     </div>
//                     <div className={styles.mainInfo}>
//                         <div className={styles.nameRow}>
//                             <h1>{member.name}</h1>
//                             <span
//                                 className={styles.memberTypeBadge}
//                                 style={{ backgroundColor: getMemberTypeColor(member.memberType) }}
//                             >
//                                 {member.memberType}
//                             </span>
//                         </div>
//                         <p className={styles.designation}>
//                             {member.designation || member.profession || "Professional"}
//                         </p>
//                         <div className={styles.bio}>
//                             {member.bio || member.professionalSummary || "No bio available"}
//                         </div>
//                         <div className={styles.quickStats}>
//                             <div className={styles.statItem}>
//                                 <MapPin size={16} />
//                                 <span>{member.district || "Location N/A"}</span>
//                             </div>
//                             <div className={styles.statItem}>
//                                 <Briefcase size={16} />
//                                 <span>{formatExperience(member.workExp)}</span>
//                             </div>
//                             <div className={styles.statItem}>
//                                 <Globe size={16} />
//                                 <span>{member.relocationStatus || "Flexible"}</span>
//                             </div>
//                             <div className={styles.statItem}>
//                                 <Calendar size={16} />
//                                 <span>Member since {new Date(member.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className={styles.actionButtons}>
//                     {(user?.role === 'Admin' || String(user?.memberId) === String(member._id) || id === 'me') && (
//                         <button className={styles.editProfileBtn} onClick={() => handleEdit(member)}>
//                             <span>Edit Profile</span>
//                             <ExternalLink size={16} />
//                         </button>
//                     )}
//                     <button className={styles.contactBtn} onClick={() => setShowContactInfo(!showContactInfo)}>
//                         Contact Info
//                     </button>
//                 </div>
//             </div>

//             {/* Contact Info Modal */}
//             {showContactInfo && (
//                 <div className={styles.contactModal}>
//                     <div className={styles.contactContent}>
//                         <h3>Contact Information</h3>
//                         <div className={styles.contactDetails}>
//                             <div>
//                                 <Smartphone size={18} />
//                                 <strong>Phone:</strong> {member.mobileNumber || "Not provided"}
//                             </div>
//                             <div>
//                                 <Mail size={18} />
//                                 <strong>Email:</strong> {member.email || "Not provided"}
//                             </div>
//                             <div>
//                                 <Home size={18} />
//                                 <strong>Address:</strong> {member.address || "Not provided"}
//                             </div>
//                         </div>
//                         <button
//                             className={styles.closeContact}
//                             onClick={() => setShowContactInfo(false)}
//                         >
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Navigation Tabs */}
//             <div className={styles.tabNavigation}>
//                 <button
//                     className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
//                     onClick={() => setActiveTab('overview')}
//                 >
//                     Overview
//                 </button>
//                 <button
//                     className={`${styles.tab} ${activeTab === 'experience' ? styles.active : ''}`}
//                     onClick={() => setActiveTab('experience')}
//                 >
//                     Experience
//                 </button>
//                 <button
//                     className={`${styles.tab} ${activeTab === 'education' ? styles.active : ''}`}
//                     onClick={() => setActiveTab('education')}
//                 >
//                     Education
//                 </button>
//                 <button
//                     className={`${styles.tab} ${activeTab === 'skills' ? styles.active : ''}`}
//                     onClick={() => setActiveTab('skills')}
//                 >
//                     Skills
//                 </button>
//             </div>

//             <div className={styles.profileContent}>
//                 {/* Left Column - Main Content */}
//                 <div className={styles.mainColumn}>
//                     {/* Career Profile Section */}
//                     <section className={styles.card}>
//                         <div className={styles.cardHeader}>
//                             <Target size={20} className={styles.icon} />
//                             <h3>Career Profile</h3>
//                             <Star size={16} className={styles.starIcon} />
//                         </div>
//                         <div className={styles.detailsGrid}>
//                             <div className={styles.item}>
//                                 <label>
//                                     <Target size={14} />
//                                     Desired Role
//                                 </label>
//                                 <span className={styles.value}>
//                                     {member.careerProfile?.role || member.preferredJobRole_Sector || "Not specified"}
//                                 </span>
//                             </div>
//                             <div className={styles.item}>
//                                 <label>
//                                     <Building size={14} />
//                                     Industry
//                                 </label>
//                                 <span className={styles.value}>
//                                     {member.careerProfile?.industry || "Not specified"}
//                                 </span>
//                             </div>
//                             <div className={styles.item}>
//                                 <label>
//                                     <MapPin size={14} />
//                                     Desired Location
//                                 </label>
//                                 <span className={styles.value}>
//                                     {member.careerProfile?.location || member.preferredJobLocation || "Anywhere"}
//                                 </span>
//                             </div>
//                             <div className={styles.item}>
//                                 <label>
//                                     <DollarSign size={14} />
//                                     Expected Salary
//                                 </label>
//                                 <span className={styles.value}>
//                                     {member.careerProfile?.expectedSalary || "Not specified"}
//                                 </span>
//                             </div>
//                         </div>
//                         {member.preferredJobRole_Sector && (
//                             <div className={styles.preferences}>
//                                 <h4>Additional Preferences</h4>
//                                 <div className={styles.tagCloud}>
//                                     {member.preferredJobRole_Sector.split(',').map((role, idx) => (
//                                         <span key={idx} className={styles.tag}>{role.trim()}</span>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </section>

//                     {/* Education Section */}
//                     <section className={styles.card}>
//                         <div className={styles.cardHeader}>
//                             <GraduationCap size={20} className={styles.icon} />
//                             <h3>Education</h3>
//                         </div>
//                         <div className={styles.eduContent}>
//                             <div className={styles.eduHeader}>
//                                 <h4>{member.highest_education || "Education Details"}</h4>
//                                 <span className={styles.eduYear}>
//                                     {member.highestEducationPassedOutYear || "N/A"}
//                                 </span>
//                             </div>
//                             <p className={styles.fieldOfStudy}>
//                                 {member.fieldofStudy_Interest || member.highestEducationSpecialization || "Field of study not specified"}
//                             </p>
//                             <div className={styles.eduMeta}>
//                                 {member.educationInstitution && (
//                                     <span className={styles.institution}>
//                                         <Building size={14} />
//                                         {member.educationInstitution}
//                                     </span>
//                                 )}
//                                 {member.educationGrade && (
//                                     <span className={styles.grade}>
//                                         <Star size={14} />
//                                         Grade: {member.educationGrade}
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                     </section>

//                     {/* Skills Section */}
//                     {member.skillsToImprove && member.skillsToImprove.length > 0 && (
//                         <section className={styles.card}>
//                             <div className={styles.cardHeader}>
//                                 <BookOpen size={20} className={styles.icon} />
//                                 <h3>Skills & Interests</h3>
//                             </div>
//                             <div className={styles.skillsSection}>
//                                 <div className={styles.skillCategory}>
//                                     <h4>Skills to Improve</h4>
//                                     <div className={styles.tagCloud}>
//                                         {member.skillsToImprove.map((skill, idx) => (
//                                             <span key={idx} className={`${styles.tag} ${styles.skillTag}`}>
//                                                 {skill}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                                 {member.interest_SkillBuildingProgram && (
//                                     <div className={styles.skillCategory}>
//                                         <h4>Learning Interests</h4>
//                                         <p className={styles.learningInterest}>
//                                             {member.interest_SkillBuildingProgram}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         </section>
//                     )}
//                 </div>

//                 {/* Right Column - Sidebar */}
//                 <div className={styles.sideColumn}>
//                     {/* Personal Details */}
//                     <section className={styles.card}>
//                         <div className={styles.cardHeader}>
//                             <User size={20} className={styles.icon} />
//                             <h3>Personal Details</h3>
//                         </div>
//                         <div className={styles.sideDetails}>
//                             <div className={styles.sideItem}>
//                                 <Smartphone size={18} />
//                                 <div>
//                                     <label>Mobile</label>
//                                     <span className={styles.value}>
//                                         {member.mobileNumber || "Not provided"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className={styles.sideItem}>
//                                 <Mail size={18} />
//                                 <div>
//                                     <label>Email</label>
//                                     <span className={styles.value}>
//                                         {member.email || "Not provided"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className={styles.sideItem}>
//                                 <Calendar size={18} />
//                                 <div>
//                                     <label>Age/DOB</label>
//                                     <span className={styles.value}>
//                                         {member.dateOfBirth ? `${member.dateOfBirth} (${age?.years || 'N/A'} years)` : "Not provided"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className={styles.sideItem}>
//                                 <Home size={18} />
//                                 <div>
//                                     <label>Address</label>
//                                     <span className={styles.value}>
//                                         {member.address || "Not provided"}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <hr className={styles.divider} />
//                         <div className={styles.moreDetails}>
//                             <div className={styles.detailRow}>
//                                 <strong>Father's Name:</strong>
//                                 <span>{member.fatherName || member.fathersName || "N/A"}</span>
//                             </div>
//                             <div className={styles.detailRow}>
//                                 <strong>Marital Status:</strong>
//                                 <span>{member.maritalStatus || "N/A"}</span>
//                             </div>
//                             <div className={styles.detailRow}>
//                                 <strong>Hometown:</strong>
//                                 <span>{member.hometown || "N/A"}</span>
//                             </div>
//                         </div>
//                     </section>

//                     {/* Languages Section */}
//                     {member.languages && member.languages.length > 0 && (
//                         <section className={styles.card}>
//                             <div className={styles.cardHeader}>
//                                 <Languages size={20} className={styles.icon} />
//                                 <h3>Languages</h3>
//                             </div>
//                             <div className={styles.languageSection}>
//                                 <div className={styles.tagCloud}>
//                                     {member.languages.map((lang, idx) => (
//                                         <span key={idx} className={`${styles.tag} ${styles.languageTag}`}>
//                                             {lang}
//                                             {lang.toLowerCase().includes('english') && ' 🇬🇧'}
//                                             {lang.toLowerCase().includes('hindi') && ' 🇮🇳'}
//                                             {lang.toLowerCase().includes('kannada') && ' 🇮🇳'}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </section>
//                     )}

//                     {/* Certifications Section */}
//                     <section className={styles.card}>
//                         <div className={styles.cardHeader}>
//                             <CertificateIcon size={20} className={styles.icon} />
//                             <h3>Certifications</h3>
//                         </div>
//                         <div className={styles.certList}>
//                             {member.certifications?.length > 0 ? member.certifications.map((cert, idx) => (
//                                 <div key={idx} className={styles.certItem}>
//                                     <div className={styles.certInfo}>
//                                         <h4>{cert.title}</h4>
//                                         <p className={styles.certOrg}>{cert.organization}</p>
//                                         <p className={styles.certYear}>
//                                             <Clock size={12} />
//                                             {cert.year || "N/A"}
//                                         </p>
//                                     </div>
//                                     {cert.link && (
//                                         <a
//                                             href={cert.link}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className={styles.certLink}
//                                         >
//                                             View
//                                         </a>
//                                     )}
//                                 </div>
//                             )) : (
//                                 <div className={styles.emptyCert}>
//                                     <Award size={24} />
//                                     <p>No certifications added yet</p>
//                                 </div>
//                             )}
//                         </div>
//                     </section>

//                     {/* Resume Card */}
//                     <section className={`${styles.card} ${styles.resumeCard}`}>
//                         <div className={styles.resumeHeader}>
//                             <FileText size={24} />
//                             <h3>Resume</h3>
//                         </div>
//                         {member.resumeLink || member.resume ? (
//                             <div className={styles.resumeActions}>
//                                 <a
//                                     href={getFileUrl(member.resumeLink || member.resume)}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className={styles.resumeBtn}
//                                 >
//                                     <FileText size={18} /> View Resume
//                                 </a>
//                                 <a
//                                     href={getFileUrl(member.resumeLink || member.resume)}
//                                     download
//                                     className={styles.downloadBtn}
//                                 >
//                                     Download
//                                 </a>
//                             </div>
//                         ) : (
//                             <div className={styles.noResume}>
//                                 <FileText size={32} />
//                                 <p>No resume uploaded</p>
//                                 {(user?.role === 'Admin' || String(user?.memberId) === String(member._id) || id === 'me') && (
//                                     <button
//                                         className={styles.uploadResume}
//                                         onClick={() => handleEdit(member, 'documents')}
//                                     >
//                                         Upload Resume
//                                     </button>
//                                 )}
//                             </div>
//                         )}
//                     </section>

//                     {/* Group Tags */}
//                     {member.forGrouping && member.forGrouping.length > 0 && (
//                         <section className={styles.card}>
//                             <div className={styles.cardHeader}>
//                                 <Users size={20} className={styles.icon} />
//                                 <h3>Group Tags</h3>
//                             </div>
//                             <div className={styles.tagCloud}>
//                                 {member.forGrouping.map((tag, idx) => (
//                                     <span key={idx} className={`${styles.tag} ${styles.groupTag}`}>
//                                         #{tag}
//                                     </span>
//                                 ))}
//                             </div>
//                         </section>
//                     )}
//                 </div>
//             </div>

//             {/* Edit Profile Modal */}
//             <AddMember
//                 isOpen={showModal}
//                 onClose={() => {
//                     setShowModal(false);
//                     setEditingMember(null);
//                 }}
//                 editMember={editingMember}
//                 initialTab={initialTab}
//                 onSuccess={(updatedMember) => {
//                     setMember(updatedMember);
//                     setShowModal(false);
//                     setEditingMember(null);
//                 }}
//             />
//         </div>
//     );
// }

// export default MembersDetail;

//------------------------------6/2------------------------------11.23-------------------------

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MembersDetail.module.scss";
import API from "../../axios";
import { useData } from "../../context/DataContext";
import { parseDOB } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Briefcase,
  Building,
  Target,
  User,
  Languages,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
  GraduationCap,
  DollarSign,
  Globe,
  Award as CertificateIcon,
  BookOpen,
  FileText,
  CheckCircle,
  Star,
  Phone,
  ClipboardList,
  Wrench,
} from "lucide-react";
import AddMember from "../../components/Models/AddMember";

function MembersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memberContext } = useData();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [age, setAge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberContext, id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      let filtered = null;

      // 1. Check Context first
      if (memberContext && memberContext.length > 0) {
        filtered = memberContext.find((m) => String(m._id) === String(id));
      }

      // 2. Fallback to API if not in context or id is 'me'
      if (!filtered) {
        let targetId = id === "me" ? user?.memberId : id;
        if (targetId && targetId !== "undefined") {
          const response = await API.get(`/member/${targetId}`);
          filtered = response.data;
        }
      }

      setMember(filtered);
      if (filtered?.dateOfBirth) setAge(calculateAge(filtered.dateOfBirth));
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = parseDOB(dob);
    if (!birthDate) return null;
    const today = new Date();
    let a = today.getFullYear() - birthDate.getFullYear();
    return a;
  };

  const getProfileImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("uploads"))
      return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
    return url;
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "??"
    );
  };

  // =========================
  // Helpers for tab data
  // =========================
  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const expList =
    member?.experience ||
    member?.experiences ||
    member?.workExperience ||
    member?.employmentHistory ||
    [];

  const educationList =
    member?.education ||
    member?.educations ||
    member?.educationHistory ||
    [];

  const skillsList =
    normalizeList(member?.skills) ||
    normalizeList(member?.skillSet) ||
    normalizeList(member?.technicalSkills);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading Profile...</p>
      </div>
    );

  if (!member)
    return (
      <div className={styles.loadingContainer}>
        <h2>Profile Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );

  return (
    <div className={styles.container}>
      {/* Top Design Banner */}
      <div className={styles.banner}></div>

      {/* Overlapping Profile Header */}
      <div className={styles.headerCard}>
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            {member.photoUrl || member.photo ? (
              <img
                src={getProfileImageUrl(member.photoUrl || member.photo)}
                alt={member.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatar}>{getInitials(member.name)}</div>
            )}
            {member.symMemberStatus === "Active" && (
              <div className={styles.statusBadge}></div>
            )}
          </div>

          <div className={styles.mainInfo}>
            <div className={styles.nameRow}>
              <h1>{member.name}</h1>
              <span className={`${styles.badge} ${styles.typeBadge}`}>
                {member.memberType}
              </span>
              {member.symMemberStatus === "Active" && (
                <span className={`${styles.badge} ${styles.activeBadge}`}>
                  <CheckCircle size={14} /> Active
                </span>
              )}
            </div>

            <p className={styles.designation}>
              {member.designation || member.profession || "Professional"}
            </p>

            <div className={styles.quickStats}>
              <div className={styles.statItem}>
                <MapPin size={16} /> {member.district || "Location N/A"}
              </div>
              <div className={styles.statItem}>
                <Calendar size={16} /> Member since{" "}
                {member.createdAt
                  ? new Date(member.createdAt).getFullYear()
                  : "N/A"}
              </div>
              <div className={styles.statItem}>
                <Star size={16} /> {member.workExp || 0} Years Experience
              </div>
            </div>
          </div>
        </div>

        {/* Share button removed */}
        <div className={styles.actionButtons}>
          {(user?.role === "Admin" ||
            String(user?.memberId) === String(member._id) ||
            id === "me") && (
            <button
              className={styles.editBtn}
              onClick={() => {
                setEditingMember(member);
                setShowModal(true);
              }}
            >
              <ExternalLink size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        {["overview", "experience", "education", "skills"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* =========================
          TAB CONTENT
         ========================= */}
      {activeTab === "overview" && (
        <div className={styles.profileContent}>
          {/* Left Column - Main Details */}
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Target size={22} className={styles.icon} /> Career Profile
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.item}>
                  <label>Desired Role</label>
                  <div className={styles.value}>
                    {member.careerProfile?.role ||
                      member.preferredJobRole_Sector ||
                      "Not specified"}
                  </div>
                </div>
                <div className={styles.item}>
                  <label>Industry</label>
                  <div className={styles.value}>
                    {member.careerProfile?.industry || "Not specified"}
                  </div>
                </div>
                <div className={styles.item}>
                  <label>Location Preference</label>
                  <div className={styles.value}>
                    {member.preferredJobLocation || "Flexible"}
                  </div>
                </div>
                <div className={styles.item}>
                  <label>Expected Salary</label>
                  <div className={styles.value}>
                    {member.careerProfile?.expectedSalary ||
                      member.expectedSalary ||
                      "Negotiable"}
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <GraduationCap size={22} className={styles.icon} /> Education
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ paddingLeft: "5px" }}>
                  <h4
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      color: "var(--p-text)",
                    }}
                  >
                    {member.highest_education || "Not provided"}
                  </h4>

                  <p
                    style={{
                      color: "var(--p-muted)",
                      margin: "0 0 10px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Building size={16} />{" "}
                    {member.educationInstitution ||
                      "Institution details not provided"}
                  </p>

                  <div
                    className={`${styles.badge} ${styles.typeBadge}`}
                    style={{ display: "inline-block" }}
                  >
                    Class of {member.highestEducationPassedOutYear || "N/A"}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Phone size={22} className={styles.icon} /> Contact Info
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "15px" }}>
                  <Smartphone size={20} />
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "var(--p-muted2)",
                        fontWeight: 700,
                      }}
                    >
                      MOBILE
                    </label>
                    <div style={{ fontWeight: 600, color: "var(--p-text2)" }}>
                      {member.mobileNumber || "N/A"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <Mail size={20} />
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "var(--p-muted2)",
                        fontWeight: 700,
                      }}
                    >
                      EMAIL
                    </label>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--p-text2)",
                        wordBreak: "break-all",
                      }}
                    >
                      {member.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Languages size={22} className={styles.icon} /> Languages
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {member.languages?.length > 0 ? (
                  member.languages.map((lang) => (
                    <span
                      key={lang}
                      style={{
                        background: "rgba(148,163,184,0.10)",
                        border: "1px solid var(--p-border-soft)",
                        color: "var(--p-text2)",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "var(--p-muted)", fontSize: "14px" }}>
                    No languages listed
                  </p>
                )}
              </div>
            </section>

            {/* Resume Card */}
            {(member.resume || member.resumeLink) && (
              <section
                className={styles.card}
                style={{ background: "var(--p-blue)", border: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "white",
                    marginBottom: "20px",
                  }}
                >
                  <FileText size={22} />
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Resume</h3>
                </div>

                <a
                  href={member.resumeLink || `${BACKEND_URL}/${member.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "white",
                    color: "var(--p-blue)",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  View CV
                </a>
              </section>
            )}
          </div>
        </div>
      )}

      {activeTab === "experience" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Briefcase size={22} className={styles.icon} /> Experience
              </div>

              {Array.isArray(expList) && expList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {expList.map((exp, idx) => (
                    <div
                      key={exp?._id || idx}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: "1px solid var(--p-border-soft)",
                        background: "rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                        {exp?.role || exp?.title || exp?.designation || "Role not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted)", marginTop: 6 }}>
                        {exp?.company || exp?.organization || exp?.companyName || "Company not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted2)", fontSize: 13, marginTop: 8 }}>
                        {exp?.startDate || exp?.from || "Start"}{" "}
                        {" - "}
                        {exp?.endDate || exp?.to || "Present"}
                      </div>
                      {exp?.description && (
                        <div style={{ marginTop: 10, color: "var(--p-text2)", lineHeight: 1.6 }}>
                          {exp.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)" }}>No experience details added.</p>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <ClipboardList size={22} className={styles.icon} /> Summary
              </div>
              <div style={{ color: "var(--p-text2)", lineHeight: 1.7 }}>
                <div>
                  <span style={{ color: "var(--p-muted2)", fontWeight: 700 }}>
                    Total Experience:
                  </span>{" "}
                  {member.workExp || 0} Years
                </div>
                {member.designation && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: "var(--p-muted2)", fontWeight: 700 }}>
                      Current Role:
                    </span>{" "}
                    {member.designation}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "education" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <GraduationCap size={22} className={styles.icon} /> Education Details
              </div>

              {Array.isArray(educationList) && educationList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {educationList.map((edu, idx) => (
                    <div
                      key={edu?._id || idx}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: "1px solid var(--p-border-soft)",
                        background: "rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                        {edu?.degree || edu?.qualification || edu?.course || "Degree not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted)", marginTop: 6 }}>
                        <Building size={16} style={{ marginRight: 6 }} />
                        {edu?.institution || edu?.college || edu?.school || "Institution not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted2)", fontSize: 13, marginTop: 8 }}>
                        {edu?.year || edu?.passedOutYear || edu?.fromYear || "Year not specified"}
                      </div>
                      {edu?.description && (
                        <div style={{ marginTop: 10, color: "var(--p-text2)", lineHeight: 1.6 }}>
                          {edu.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ color: "var(--p-text)", fontWeight: 800 }}>
                    {member.highest_education || "Not provided"}
                  </div>
                  <div style={{ color: "var(--p-muted)", marginTop: 8 }}>
                    {member.educationInstitution || "Institution details not provided"}
                  </div>
                  <div style={{ color: "var(--p-muted2)", marginTop: 6 }}>
                    Class of {member.highestEducationPassedOutYear || "N/A"}
                  </div>
                </>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <BookOpen size={22} className={styles.icon} /> Highlights
              </div>
              <p style={{ color: "var(--p-muted)" }}>
                Add multiple education entries to show them here.
              </p>
            </section>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Wrench size={22} className={styles.icon} /> Skills
              </div>

              {skillsList.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {skillsList.map((s, idx) => (
                    <span
                      key={`${s}-${idx}`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: "1px solid rgba(59,130,246,0.35)",
                        background: "rgba(59,130,246,0.12)",
                        color: "var(--p-text)",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)" }}>No skills added.</p>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <CertificateIcon size={22} className={styles.icon} /> Certifications
              </div>
              <p style={{ color: "var(--p-muted)" }}>
                If you store certificates in profile, show them here (optional).
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Reuse your existing Modal */}
      <AddMember
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editMember={editingMember}
        onSuccess={(updated) => {
          setMember(updated);
          setShowModal(false);
        }}
      />
    </div>
  );
}

export default MembersDetail;
