// // // //------------------------31/01----------------4.47-----------------------

// // // import React, { useEffect, useState } from 'react';
// // // import { Search, Mail, Phone, Briefcase, Award } from 'lucide-react';
// // // import { useNavigate, useOutletContext } from "react-router-dom";
// // // import * as XLSX from 'xlsx';
// // // import { saveAs } from 'file-saver';

// // // // Components & Context
// // // import AddMentor from './AddMentor';
// // // import API from '../../axios';
// // // import { useAuth } from '../../context/AuthContext';
// // // // We use inline styles for the specific layout in your screenshot
// // // import styles from '../Members/Members.module.scss'; 

// // // const MentorsPage = () => {
// // //   const { sidebarCollapsed } = useOutletContext();
// // //   const sidebarWidth = sidebarCollapsed ? 90 : 280;

// // //   const [mentors, setMentors] = useState([]);
// // //   const [searchTerm, setSearchTerm] = useState('');
// // //   const [loading, setLoading] = useState(true);
// // //   const { user } = useAuth();
// // //   const navigate = useNavigate();

// // //   useEffect(() => {
// // //     const fetchMentors = async () => {
// // //       try {
// // //         setLoading(true);
// // //         const res = await API.get('/member');
// // //         const mentorList = (res.data || []).filter(m =>
// // //           m.memberType && m.memberType.toLowerCase() === 'mentor'
// // //         );
// // //         setMentors(mentorList);
// // //       } catch (error) {
// // //         console.error("Failed to fetch mentors:", error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };
// // //     fetchMentors();
// // //   }, []);

// // //   const handleNewMentor = (newMentor) => {
// // //     setMentors((prev) => [newMentor, ...prev]);
// // //   };

// // //   // --- EXPORT LOGIC ---
// // //   const buildMentorExportRows = () => {
// // //     return mentors.filter(member => {
// // //         const search = searchTerm.toLowerCase();
// // //         return (
// // //           member.name?.toLowerCase().includes(search) ||
// // //           member.email?.toLowerCase().includes(search)
// // //         );
// // //       }).map(m => ({
// // //         name: m.name || "",
// // //         email: m.email || "",
// // //         mobileNumber: m.mobileNumber || "",
// // //         designation: m.designation || "",
// // //         experience: m.workExp || "",
// // //         expertise: m.fieldofStudy_Interest || "",
// // //       }));
// // //   };

// // //   const exportExcel = () => {
// // //     const ws = XLSX.utils.json_to_sheet(buildMentorExportRows());
// // //     const wb = XLSX.utils.book_new();
// // //     XLSX.utils.book_append_sheet(wb, ws, "Mentors");
// // //     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
// // //     saveAs(new Blob([buffer]), `Mentors.xlsx`);
// // //   };

// // //   const exportCSV = () => {
// // //     const ws = XLSX.utils.json_to_sheet(buildMentorExportRows());
// // //     const csv = XLSX.utils.sheet_to_csv(ws);
// // //     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Mentors.csv`);
// // //   };

// // //   const filteredMentors = mentors.filter((member) => {
// // //     const search = searchTerm.toLowerCase();
// // //     return (
// // //       member.name?.toLowerCase().includes(search) ||
// // //       member.email?.toLowerCase().includes(search) ||
// // //       member.designation?.toLowerCase().includes(search)
// // //     );
// // //   });

// // //   return (
// // //     <div className={styles.members}>
// // //       {/* --- HEADER / TOOLBAR --- */}
// // //       <div 
// // //         className={styles.headerWrapper}
// // //         style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}
// // //       >
// // //         <div className={styles.headerContent} style={{padding: '1rem 2rem'}}>
          
// // //           {/* Toolbar Layout matching Screenshot 2 & 4 */}
// // //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            
// // //             {/* Search Bar (Left) */}
// // //             <div style={{ position: 'relative', width: '300px' }}>
// // //               <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
// // //               <input 
// // //                 type="text" 
// // //                 placeholder="Search mentors by name, email..." 
// // //                 value={searchTerm} 
// // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // //                 style={{
// // //                   width: '100%',
// // //                   padding: '10px 10px 10px 36px',
// // //                   borderRadius: '20px',
// // //                   border: '1px solid #e5e7eb',
// // //                   outline: 'none'
// // //                 }}
// // //               />
// // //             </div>

// // //             {/* Actions (Right) */}
// // //             <div style={{ display: 'flex', gap: '10px' }}>
// // //               <button 
// // //                 onClick={exportExcel}
// // //                 style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}
// // //               >
// // //                  Export Excel
// // //               </button>
// // //               <button 
// // //                 onClick={exportCSV}
// // //                 style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}
// // //               >
// // //                  Export CSV
// // //               </button>
// // //               <AddMentor onSuccess={handleNewMentor} />
// // //             </div>
// // //           </div>

// // //         </div>
// // //       </div>

// // //       <div style={{ height: '100px' }}></div>

// // //       {/* --- CONTENT AREA --- */}
// // //       <div className={styles.cardView} style={{ padding: '20px' }}>
        
// // //         {/* Count Text */}
// // //         <p style={{ marginBottom: '15px', color: '#4b5563', fontWeight: '500' }}>
// // //           Showing <strong>{filteredMentors.length}</strong> of <strong>{mentors.length}</strong> mentors
// // //         </p>

// // //         {/* --- GRID LAYOUT --- */}
// // //         <div style={{ 
// // //           display: 'grid', 
// // //           gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
// // //           gap: '20px' 
// // //         }}>
// // //           {filteredMentors.map((member) => (
// // //             <div 
// // //               key={member._id}
// // //               onClick={() => navigate(`/mentors/${member._id}`)}
// // //               style={{
// // //                 backgroundColor: 'white',
// // //                 borderRadius: '8px',
// // //                 padding: '20px',
// // //                 boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
// // //                 cursor: 'pointer',
// // //                 border: '1px solid #f3f4f6'
// // //               }}
// // //             >
// // //               {/* Card Header: Avatar + Name + Location */}
// // //               <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
// // //                 <div style={{ 
// // //                   width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e5e7eb', 
// // //                   overflow: 'hidden', marginRight: '15px' 
// // //                 }}>
// // //                   <img 
// // //                     src={member.photoUrl || "/members/AnonymousImage.jpg"} 
// // //                     alt={member.name}
// // //                     style={{ width: '100%', height: '100%', objectFit: 'cover' }}
// // //                     onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
// // //                   />
// // //                 </div>
// // //                 <div>
// // //                   <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
// // //                     {member.name}
// // //                   </h3>
// // //                   <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
// // //                     {/* Shows "MentorCoimbatore" style location */}
// // //                     Mentor{member.district ? member.district.replace(/\s/g, '') : ""}
// // //                   </p>
// // //                 </div>
// // //               </div>

// // //               {/* Card Body: Details */}
// // //               <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.8' }}>
// // //                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
// // //                   <Mail size={14} style={{ color: '#9ca3af' }} />
// // //                   {member.email || "N/A"}
// // //                 </div>
// // //                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
// // //                   <Phone size={14} style={{ color: '#9ca3af' }} />
// // //                   {member.mobileNumber || "N/A"}
// // //                 </div>
// // //                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
// // //                   <Briefcase size={14} style={{ color: '#9ca3af' }} />
// // //                   <strong>Role:</strong> {member.designation || "N/A"}
// // //                 </div>
// // //                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
// // //                   <Award size={14} style={{ color: '#9ca3af' }} />
// // //                   <strong>Experience:</strong> {member.workExp ? `${member.workExp} years` : "N/A"}
// // //                 </div>
// // //                 <div style={{ marginTop: '5px' }}>
// // //                    <strong>Expertise:</strong> {member.fieldofStudy_Interest || "N/A"}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {filteredMentors.length === 0 && !loading && (
// // //           <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
// // //             No mentors found.
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default MentorsPage;

// // //-------------------------6/2----------------------11.26-----------------------------

// // import React, { useEffect, useState } from "react";
// // import { Search, Mail, MapPin, Briefcase } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import API from "../../axios";
// // import styles from "./Mentors.module.scss";
// // import AddMentor from "./AddMentor";

// // const MentorsPage = () => {
// //   const [mentors, setMentors] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [loading, setLoading] = useState(true);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     fetchMentors();
// //   }, []);

// //   const fetchMentors = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await API.get("/member");
// //       setMentors(
// //         (res.data || []).filter(
// //           (m) => m.memberType?.toLowerCase() === "mentor"
// //         )
// //       );
// //     } catch (e) {
// //       console.error(e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const filtered = mentors.filter(
// //     (m) =>
// //       m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       m.designation?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   return (
// //     <div className={styles.mentorsContainer}>
// //       {/* Search & Actions Area */}
// //       <div className={styles.topToolbar}>
// //         <div className={styles.searchWrapper}>
// //           <Search className={styles.searchIcon} size={18} />
// //           <input
// //             type="text"
// //             value={searchTerm}
// //             placeholder="Search by name, expertise or role..."
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>
// //         <AddMentor onSuccess={fetchMentors} />
// //       </div>

// //       {/* Loading */}
// //       {loading && <div className={styles.loading}>Loading mentors...</div>}

// //       {/* The List of Cards */}
// //       {!loading && (
// //         <div className={styles.mentorGrid}>
// //           {filtered.map((m) => (
// //             <div
// //               key={m._id}
// //               className={styles.mentorCard}
// //               onClick={() => navigate(`/mentors/${m._id}`)}
// //               role="button"
// //               tabIndex={0}
// //               onKeyDown={(e) => {
// //                 if (e.key === "Enter") navigate(`/mentors/${m._id}`);
// //               }}
// //             >
// //               {/* 1. SMALL IMAGE */}
// //               <div className={styles.imageContainer}>
// //                 <img
// //                   src={m.photoUrl || "/members/AnonymousImage.jpg"}
// //                   alt={m.name}
// //                   onError={(e) => (e.target.src = "/members/AnonymousImage.jpg")}
// //                 />
// //               </div>

// //               {/* 2. TEXT CONTENT NEXT TO IMAGE */}
// //               <div className={styles.infoContent}>
// //                 <div className={styles.statusBadge}>Available</div>
// //                 <h3>{m.name}</h3>
// //                 <div className={styles.designation}>
// //                   {m.designation || "Expert Mentor"}
// //                 </div>

// //                 <div className={styles.details}>
// //                   <span>
// //                     <MapPin size={14} /> {m.district || "Remote"}
// //                   </span>
// //                   <span>
// //                     <Mail size={14} /> {m.email}
// //                   </span>
// //                   <span>
// //                     <Briefcase size={14} /> {m.workExp} Years Exp.
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MentorsPage;

// //-------------------------6/2----------------------11.26-----------------------------
// // MentorsPage.jsx (FULL UPDATED)

// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Mail,
//   MapPin,
//   Briefcase,
//   TrendingUp,
//   CheckCircle2,
//   UserPlus,
//   Send,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import API from "../../axios";
// import styles from "./Mentors.module.scss";
// import AddMentor from "./AddMentor";
// import { useAuth } from "../../context/AuthContext";

// const MentorsPage = () => {
//   const [mentors, setMentors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [connectingId, setConnectingId] = useState(null);
//   const [connectedMentors, setConnectedMentors] = useState(new Set());
//   const [showConnectModal, setShowConnectModal] = useState(false);
//   const [selectedMentor, setSelectedMentor] = useState(null);
//   const [connectMessage, setConnectMessage] = useState("");
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   useEffect(() => {
//     fetchMentors();
//     if (user?.id) {
//       fetchUserConnections();
//     }
//   }, [user?.id]);

//   const fetchMentors = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get("/member");
//       setMentors(
//         (res.data || []).filter(
//           (m) => m.memberType?.toLowerCase() === "mentor"
//         )
//       );
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserConnections = async () => {
//     try {
//       const res = await API.get("/api/mentor-connections/user/my-connections");
//       const pendingConnections = res.data
//         .filter((conn) => conn.status === "pending" || conn.status === "accepted")
//         .map((conn) => conn.mentorId);
//       setConnectedMentors(new Set(pendingConnections));
//     } catch (e) {
//       console.error("Error fetching connections:", e);
//     }
//   };

//   const handleConnectClick = (e, mentor) => {
//     e.stopPropagation();
//     setSelectedMentor(mentor);
//     setConnectMessage("");
//     setShowConnectModal(true);
//   };

//   const handleSendConnection = async () => {
//     if (!selectedMentor) return;

//     try {
//       setConnectingId(selectedMentor._id);
//       const response = await API.post("/api/mentor-connections", {
//         mentorId: selectedMentor._id,
//         message: connectMessage,
//       });

//       if (response.status === 201) {
//         setConnectedMentors((prev) =>
//           new Set([...prev, selectedMentor._id])
//         );
//         setShowConnectModal(false);
//         setConnectMessage("");
//         alert("Connection request sent successfully!");
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.error || "Failed to send request";
//       alert(errorMsg);
//     } finally {
//       setConnectingId(null);
//     }
//   };

//   const isConnected = (mentorId) => connectedMentors.has(mentorId);
//   const isAdmin = user?.role?.toLowerCase() === "admin";
//   const isCandidate =
//     user?.memberType?.toLowerCase() === "candidate" ||
//     user?.role?.toLowerCase() === "candidate";

//   const filtered = mentors.filter((m) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       m.name?.toLowerCase().includes(term) ||
//       m.designation?.toLowerCase().includes(term) ||
//       m.district?.toLowerCase().includes(term)
//     );
//   });

//   // ✅ Show Mentor Guidance only for member / candidate users
//   const role = user?.role?.toLowerCase?.() || "";
//   const memberType = user?.memberType?.toLowerCase?.() || "";

//   const showMentorGuidance =
//     role === "member" ||
//     role === "candidate" ||
//     memberType === "member" ||
//     memberType === "candidate";

//   return (
//     <div className={styles.mentorsContainer}>
//       {/* ✅ Show only for Member / Candidate */}
//       {showMentorGuidance && (
//         <section className={styles.guidanceCard}>
//           <div className={styles.guidanceGlow} />
//           <div className={styles.guidanceShine} />
//           <div className={styles.guidanceNoise} />

//           <div className={styles.guidanceInner}>
//             <div className={styles.guidanceHeader}>
//               <div className={styles.guidanceIconWrap}>
//                 <TrendingUp size={26} />
//               </div>

//               <div>
//                 <h2 className={styles.guidanceTitle}>Mentor Guidance</h2>
//                 <p className={styles.guidanceSub}>
//                   Match with the right mentor and grow faster with real support.
//                 </p>
//               </div>
//             </div>

//             <div className={styles.guidanceList}>
//               <div className={styles.guidanceItem}>
//                 <div className={styles.guidanceBullet}>
//                   <CheckCircle2 size={18} />
//                 </div>
//                 <div>
//                   <h4>Career Development</h4>
//                   <p>
//                     Receive expert guidance to plan your career path and achieve
//                     your professional goals.
//                   </p>
//                 </div>
//               </div>

//               <div className={styles.guidanceItem}>
//                 <div className={styles.guidanceBullet}>
//                   <CheckCircle2 size={18} />
//                 </div>
//                 <div>
//                   <h4>Technical Skill Development</h4>
//                   <p>
//                     Learn industry-relevant technical skills and practical
//                     knowledge from experienced mentors.
//                   </p>
//                 </div>
//               </div>

//               <div className={styles.guidanceItem}>
//                 <div className={styles.guidanceBullet}>
//                   <CheckCircle2 size={18} />
//                 </div>
//                 <div>
//                   <h4>Professional Growth</h4>
//                   <p>
//                     Improve employability skills, understand industry
//                     expectations, and prepare for job opportunities.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.guidanceFooter}>
//               <div className={styles.guidanceTip}>
//                 ✅ Select any mentor to match your profile and start your
//                 mentorship journey.
//               </div>

//               <div className={styles.guidanceActions}>
//                 <button
//                   type="button"
//                   className={styles.guidancePrimaryBtn}
//                   onClick={() => {
//                     const el = document.getElementById("mentorList");
//                     el?.scrollIntoView({ behavior: "smooth", block: "start" });
//                   }}
//                 >
//                   View Mentors <span>→</span>
//                 </button>

//                 <button
//                   type="button"
//                   className={styles.guidanceSecondaryBtn}
//                   onClick={() => navigate("/member/me")}
//                 >
//                   Update Profile <span>→</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Search & Actions Area */}
//       <div className={styles.topToolbar}>
//         <div className={styles.searchWrapper}>
//           <Search className={styles.searchIcon} size={18} />
//           <input
//             type="text"
//             value={searchTerm}
//             placeholder="Search by name, expertise or role..."
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <AddMentor onSuccess={fetchMentors} />
//       </div>

//       {/* Loading */}
//       {loading && <div className={styles.loading}>Loading mentors...</div>}

//       {/* Mentor List */}
//       {!loading && (
//         <div id="mentorList" className={styles.mentorGrid}>
//           {filtered.map((m) => (
//             <div
//               key={m._id}
//               className={styles.mentorCard}
//               onClick={() => navigate(`/mentors/${m._id}`)}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") navigate(`/mentors/${m._id}`);
//               }}
//             >
//               <div className={styles.imageContainer}>
//                 <img
//                   src={m.photoUrl || "/members/AnonymousImage.jpg"}
//                   alt={m.name}
//                   onError={(e) =>
//                     (e.target.src = "/members/AnonymousImage.jpg")
//                   }
//                 />
//               </div>

//               <div className={styles.infoContent}>
//                 <div className={styles.cardTopRow}>
//                   <h3>{m.name}</h3>
//                   <div className={styles.statusBadge}>Available</div>
//                 </div>

//                 <div className={styles.designation}>
//                   {m.designation || "Expert Mentor"}
//                 </div>

//                 <div className={styles.details}>
//                   <span>
//                     <MapPin size={14} /> {m.district || "Remote"}
//                   </span>
//                   <span>
//                     <Mail size={14} /> {m.email || "No email"}
//                   </span>
//                   <span>
//                     <Briefcase size={14} />{" "}
//                     {m.workExp ? `${m.workExp} Years Exp.` : "Experience N/A"}
//                   </span>
//                 </div>

//                 {/* Connect Button - Show for Candidates/Members */}
//                 {isCandidate && (
//                   <div className={styles.cardActions}>
//                     <button
//                       onClick={(e) => handleConnectClick(e, m)}
//                       disabled={connectingId === m._id || isConnected(m._id)}
//                       className={`${styles.connectBtn} ${
//                         isConnected(m._id) ? styles.connected : ""
//                       }`}
//                     >
//                       {isConnected(m._id) ? (
//                         <>
//                           <CheckCircle2 size={16} /> Connected
//                         </>
//                       ) : connectingId === m._id ? (
//                         "Sending..."
//                       ) : (
//                         <>
//                           <UserPlus size={16} /> Connect
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Connect Modal */}
//       {showConnectModal && selectedMentor && (
//         <div className={styles.modalOverlay} onClick={() => setShowConnectModal(false)}>
//           <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2>Connect with {selectedMentor.name}</h2>
//             <p>Send a message to {selectedMentor.designation}</p>

//             <textarea
//               placeholder="Tell them why you'd like to connect... (optional)"
//               value={connectMessage}
//               onChange={(e) => setConnectMessage(e.target.value)}
//               className={styles.messageInput}
//               rows={4}
//             />

//             <div className={styles.modalActions}>
//               <button
//                 onClick={() => setShowConnectModal(false)}
//                 className={styles.cancelBtn}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSendConnection}
//                 disabled={connectingId === selectedMentor._id}
//                 className={styles.sendBtn}
//               >
//                 {connectingId === selectedMentor._id ? (
//                   "Sending..."
//                 ) : (
//                   <>
//                     <Send size={16} /> Send Request
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MentorsPage;

import React, { useEffect, useState } from "react";
import {
  Search,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Send,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import styles from "./Mentors.module.scss";
import AddMentor from "./AddMentor";
import { useAuth } from "../../context/AuthContext";

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [connectedMentors, setConnectedMentors] = useState(new Map()); // mentorId → status
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchUserConnections();
    }
  }, [user?.userId]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/member");
      setMentors(
        (res.data || []).filter(
          (m) => m.memberType?.toLowerCase() === "mentor"
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConnections = async () => {
    try {
      const res = await API.get("/api/mentor-connections/user/my-connections");

      const statusMap = new Map();
      (res.data || []).forEach((conn) => {
        statusMap.set(String(conn.mentorId), conn.status);
      });

      setConnectedMentors(statusMap);
    } catch (e) {
      console.error("Error fetching connections:", e);
    }
  };

  const handleConnectClick = (e, mentor) => {
    e.stopPropagation();
    setSelectedMentor(mentor);
    setConnectMessage("");
    setShowConnectModal(true);
  };

  const handleSendConnection = async () => {
    if (!selectedMentor) return;

    try {
      setConnectingId(selectedMentor._id);

      const response = await API.post("/api/mentor-connections", {
        mentorId: selectedMentor._id,
        message: connectMessage,
      });

      if (response.status === 201) {
        setConnectedMentors((prev) => new Map([...prev, [String(selectedMentor._id), "pending"]]));
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

  const getConnectionStatus = (mentorId) => connectedMentors.get(String(mentorId)); // "pending" | "accepted" | "rejected" | undefined

  const role = user?.role?.toLowerCase?.() || "";
  const memberType = user?.memberType?.toLowerCase?.() || "";

  const isCandidate =
    memberType === "candidate" ||
    memberType === "member" ||
    role === "candidate" ||
    role === "member";

  const showMentorGuidance = isCandidate;

  const filtered = mentors.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.designation?.toLowerCase().includes(term) ||
      m.district?.toLowerCase().includes(term) ||
      m.fieldofStudy_Interest?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.mentorsContainer}>
      {showMentorGuidance && (
        <section className={styles.guidanceCard}>
          <div className={styles.guidanceGlow} />
          <div className={styles.guidanceShine} />
          <div className={styles.guidanceNoise} />

          <div className={styles.guidanceInner}>
            <div className={styles.guidanceHeader}>
              <div className={styles.guidanceIconWrap}>
                <TrendingUp size={26} />
              </div>

              <div>
                <h2 className={styles.guidanceTitle}>Mentor Guidance</h2>
                <p className={styles.guidanceSub}>
                  Match with the right mentor and grow faster with real support.
                </p>
              </div>
            </div>

            <div className={styles.guidanceList}>
              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4>Career Development</h4>
                  <p>
                    Receive expert guidance to plan your career path and achieve
                    your professional goals.
                  </p>
                </div>
              </div>

              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4>Technical Skill Development</h4>
                  <p>
                    Learn industry-relevant technical skills and practical
                    knowledge from experienced mentors.
                  </p>
                </div>
              </div>

              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4>Professional Growth</h4>
                  <p>
                    Improve employability skills, understand industry
                    expectations, and prepare for job opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.guidanceFooter}>
              <div className={styles.guidanceTip}>
                ✅ Select any mentor to match your profile and start your
                mentorship journey.
              </div>

              <div className={styles.guidanceActions}>
                <button
                  type="button"
                  className={styles.guidancePrimaryBtn}
                  onClick={() => {
                    const el = document.getElementById("mentorList");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  View Mentors <span>→</span>
                </button>

                <button
                  type="button"
                  className={styles.guidanceSecondaryBtn}
                  onClick={() => navigate("/member/me")}
                >
                  Update Profile <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={styles.topToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by name, expertise or role..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <AddMentor onSuccess={fetchMentors} />
      </div>

      {loading && <div className={styles.loading}>Loading mentors...</div>}

      {!loading && (
        <div id="mentorList" className={styles.mentorGrid}>
          {filtered.map((m) => (
            <div
              key={m._id}
              className={styles.mentorCard}
              onClick={() => navigate(`/mentors/${m._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/mentors/${m._id}`);
              }}
            >
              <div className={styles.imageContainer}>
                <img
                  src={m.photoUrl || "/members/AnonymousImage.jpg"}
                  alt={m.name}
                  onError={(e) => {
                    e.target.src = "/members/AnonymousImage.jpg";
                  }}
                />
              </div>

              <div className={styles.infoContent}>
                <div className={styles.cardTopRow}>
                  <h3>{m.name}</h3>
                  <div className={styles.statusBadge}>Available</div>
                </div>

                <div className={styles.designation}>
                  {m.designation || "Expert Mentor"}
                </div>

                <div className={styles.details}>
                  <span>
                    <MapPin size={14} /> {m.district || "Remote"}
                  </span>
                  <span>
                    <Mail size={14} /> {m.email || "No email"}
                  </span>
                  <span>
                    <Briefcase size={14} />{" "}
                    {m.workExp ? `${m.workExp} Years Exp.` : "Experience N/A"}
                  </span>
                </div>

                {isCandidate && (() => {
                  const connStatus = getConnectionStatus(m._id);
                  const isSending = connectingId === m._id;

                  let btnClass = styles.connectBtn;
                  let btnLabel;
                  let isDisabled = isSending;

                  if (connStatus === "accepted") {
                    btnClass = `${styles.connectBtn} ${styles.connected}`;
                    btnLabel = <><CheckCircle2 size={16} /> Connected</>;
                    isDisabled = true;
                  } else if (connStatus === "rejected") {
                    btnClass = `${styles.connectBtn} ${styles.rejected}`;
                    btnLabel = <><XCircle size={16} /> Rejected</>;
                    isDisabled = true;
                  } else if (connStatus === "pending") {
                    btnClass = `${styles.connectBtn} ${styles.pending}`;
                    btnLabel = <><Clock size={16} /> Pending</>;
                    isDisabled = true;
                  } else if (isSending) {
                    btnLabel = "Sending...";
                    isDisabled = true;
                  } else {
                    btnLabel = <><UserPlus size={16} /> Connect</>;
                  }

                  return (
                    <div className={styles.cardActions}>
                      <button
                        onClick={(e) => handleConnectClick(e, m)}
                        disabled={isDisabled}
                        className={btnClass}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showConnectModal && selectedMentor && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowConnectModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Connect with {selectedMentor.name}</h2>
            <p>Send a message to {selectedMentor.designation || "this mentor"}</p>

            <textarea
              placeholder="Tell them why you'd like to connect... (optional)"
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              className={styles.messageInput}
              rows={4}
            />

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowConnectModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                disabled={connectingId === selectedMentor._id}
                className={styles.sendBtn}
              >
                {connectingId === selectedMentor._id ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={16} /> Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;