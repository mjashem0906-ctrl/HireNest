// import React, { useEffect, useState } from 'react';
// import { User, Search, Mail, Phone, Building } from 'lucide-react';
// import { useNavigate, useOutletContext } from "react-router-dom";
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // Components & Context
// import CustomCard from '../../components/UI/CustomCard';
// import AddMentor from './AddMentor';
// import API from '../../axios';
// import { useAuth } from '../../context/AuthContext';
// import styles from '../Members/Members.module.scss'; // Reusing Members styles

// const MentorsPage = () => {
//   const { sidebarCollapsed } = useOutletContext();
//   const sidebarWidth = sidebarCollapsed ? 90 : 280;

//   const [mentors, setMentors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // --- FETCH DATA ---
//   useEffect(() => {
//     const fetchMentors = async () => {
//       try {
//         setLoading(true);
//         // Fetch all members and filter for Mentors client-side
//         const res = await API.get('/member'); 
//         const mentorList = res.data.filter(m => 
//            m.memberType && m.memberType.toLowerCase() === 'mentor'
//         );
//         setMentors(mentorList);
//       } catch (error) {
//         console.error("Failed to fetch mentors:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMentors();
//   }, []);

//   // --- HANDLERS ---
//   const handleNewMentor = (newMentor) => {
//     setMentors((prev) => [newMentor, ...prev]);
//   };

//   const getDirectImageUrl = (driveUrl) => {
//     if (!driveUrl) return null;
//     let fileId = null;
//     let match = driveUrl.match(/[?&]id=([^&]+)/);
//     if (match) fileId = match[1];
//     if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
//     if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
//     return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
//   };

//   // --- EXPORT LOGIC ---
//   const buildMentorExportRows = () => {
//     return mentors
//       .filter(member => {
//         const search = searchTerm.toLowerCase();
//         return (
//           member.name?.toLowerCase().includes(search) ||
//           member.email?.toLowerCase().includes(search)
//         );
//       })
//       .map(m => ({
//         memberReferenceNumber: m.memberReferenceNumber || "",
//         name: m.name || "",
//         age: m.age || "",
//         gender: m.gender || "",
//         mobileNumber: m.mobileNumber || "",
//         email: m.email || "",
//         district: m.district || "",
//         mentorExpertise: (m.mentorExpertise || []).join(", "),
//         mentorSpecialization: (m.mentorSpecialization || []).join(", "),
//         fieldofStudy_Interest: m.fieldofStudy_Interest || "",
//         levelOfSupport: (m.levelOfSupport || []).join(", "),
//         createdAt: m.createdAt || ""
//       }));
//   };

//   const exportMentorsToExcel = () => {
//     const data = buildMentorExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Mentors");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), `Mentors_${new Date().toISOString().slice(0,10)}.xlsx`);
//   };

//   const exportMentorsToCSV = () => {
//     const data = buildMentorExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(ws);
//     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Mentors_${new Date().toISOString().slice(0,10)}.csv`);
//   };

//   return (
//     <div className={styles.members}>
//       {/* HEADER */}
//       <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
//         <div className={styles.headerContent}>
          
//           {/* Search Bar */}
//           <div className={styles.cardSearch}>
//             <Search size={20} />
//             <input 
//               type="text" 
//               placeholder="Search mentors..." 
//               value={searchTerm} 
//               onChange={(e) => setSearchTerm(e.target.value)} 
//             />
//           </div>

//           {/* Export Buttons (Admin Only) */}
//           {user?.role === 'Admin' && (
//             <div className={styles.exportButtons}>
//               <button onClick={exportMentorsToExcel} className={styles.excel}>Export Excel</button>
//               <button onClick={exportMentorsToCSV} className={styles.csv}>Export CSV</button>
//             </div>
//           )}
          
//           {/* Add Mentor (Admin Only) */}
//           {user?.role === 'Admin' && (
//             <AddMentor onSuccess={handleNewMentor} />
//           )}
//         </div>
//       </div>

//       <div style={{ height: 120 }}></div>

//       {/* CONTENT */}
//       <div className={styles.cardView}>
//         {loading ? (
//           <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
//             <div className={styles.loader} style={{margin:'0 auto 20px'}}></div>
//             Loading Mentors...
//           </div>
//         ) : (
//           <div className={styles.membersList}>
//             {mentors.filter(member => {
//               const search = searchTerm.toLowerCase();
//               return (
//                 member.name?.toLowerCase().includes(search) ||
//                 member.email?.toLowerCase().includes(search)
//               );
//             }).map((member) => (
//               <CustomCard key={member._id} className={styles.memberCard} hover>
//                 <div className={styles.memberHeader}>
//                   <img 
//                     // Only make clickable for Admin users
//                     onClick={user?.role === 'Admin' ? () => navigate(`/member/${member._id}`) : undefined}
//                     src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
//                     alt={member.name}
//                     className={styles.avatar}
//                     onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
//                     style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
//                   />
//                   <div 
//                     className={styles.memberInfo} 
//                     onClick={user?.role === 'Admin' ? () => navigate(`/member/${member._id}`) : undefined}
//                     style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
//                   >
//                     <h3>{member.name}</h3>
//                     <span style={{
//                       backgroundColor: '#f3e8ff', color: '#7e22ce', 
//                       padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'
//                     }}>
//                       Mentor
//                     </span>
//                   </div>
//                 </div>
                
//                 {/* Only make details clickable for Admin users */}
//                 <div 
//                   onClick={user?.role === 'Admin' ? () => navigate(`/member/${member._id}`) : undefined}
//                   style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
//                 >
//                   <div className={styles.memberDetails}>
//                     <div><Mail size={16} /> {member.email}</div>
//                     <div><Phone size={16} /> {member.mobileNumber}</div>
//                     {member.currentInstitutionOrCompany && 
//                       <div><Building size={16} /> {member.currentInstitutionOrCompany}</div>
//                     }
                    
//                     {member.fieldofStudy_Interest && (
//                       <div style={{marginTop:'8px', color:'#555', fontSize:'0.85rem', lineHeight:'1.4'}}>
//                         <strong>Expertise:</strong> {member.fieldofStudy_Interest}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CustomCard>
//             ))}
            
//             {!loading && mentors.length === 0 && (
//               <div style={{textAlign:'center', width:'100%', padding:'20px', color:'#666'}}>
//                 No Mentors found.
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MentorsPage;

import React, { useEffect, useState } from 'react';
import { User, Search, Mail, Phone, Building, Plus } from 'lucide-react';
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Components & Context
import CustomCard from '../../components/UI/CustomCard';
import AddMentor from './AddMentor';
import API from '../../axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../Members/Members.module.scss';

const MentorsPage = () => {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await API.get('/member'); 
        const mentorList = res.data.filter(m => 
          m.memberType && m.memberType.toLowerCase() === 'mentor'
        );
        setMentors(mentorList);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // --- HANDLERS ---
  const handleNewMentor = (newMentor) => {
    setMentors((prev) => [newMentor, ...prev]);
  };

  const getDirectImageUrl = (driveUrl) => {
    if (!driveUrl) return null;
    let fileId = null;
    let match = driveUrl.match(/[?&]id=([^&]+)/);
    if (match) fileId = match[1];
    if (!fileId) { 
      match = driveUrl.match(/\/d\/([^/]+)/); 
      if (match) fileId = match[1]; 
    }
    if (!fileId) { 
      match = driveUrl.match(/uc\?id=([^&]+)/); 
      if (match) fileId = match[1]; 
    }
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
  };

  // --- EXPORT LOGIC ---
  const buildMentorExportRows = () => {
    return mentors
      .filter(member => {
        const search = searchTerm.toLowerCase();
        return (
          member.name?.toLowerCase().includes(search) ||
          member.email?.toLowerCase().includes(search)
        );
      })
      .map(m => ({
        memberReferenceNumber: m.memberReferenceNumber || "",
        name: m.name || "",
        age: m.age || "",
        gender: m.gender || "",
        mobileNumber: m.mobileNumber || "",
        email: m.email || "",
        district: m.district || "",
        mentorExpertise: (m.mentorExpertise || []).join(", "),
        mentorSpecialization: (m.mentorSpecialization || []).join(", "),
        fieldofStudy_Interest: m.fieldofStudy_Interest || "",
        levelOfSupport: (m.levelOfSupport || []).join(", "),
        createdAt: m.createdAt || ""
      }));
  };

  const exportMentorsToExcel = () => {
    const data = buildMentorExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mentors");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `Mentors_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportMentorsToCSV = () => {
    const data = buildMentorExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Mentors_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className={styles.members}>
      {/* HEADER - Updated to match Members page layout */}
      <div 
        className={styles.headerWrapper}
        style={{ 
          left: sidebarWidth + 'px',
          width: `calc(100% - ${sidebarWidth}px)` 
        }}
      >
        <div className={styles.headerContent}>
          {/* Top Row: Search, Export, Add Mentor */}
          <div className={styles.topRow}>
            {/* Search Bar */}
            <div className={styles.cardSearch}>
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search mentors..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* Right side actions */}
            <div className={styles.topRowActions}>
              {/* Export Buttons - Admin Only */}
              {user?.role === 'Admin' && (
                <div className={styles.exportButtons}>
                  <button onClick={exportMentorsToExcel} className={styles.excel}>
                    Export Excel
                  </button>
                  <button onClick={exportMentorsToCSV} className={styles.csv}>
                    Export CSV
                  </button>
                </div>
              )}
              
              {/* Add Mentor Button - Admin Only */}
              {user?.role === 'Admin' && (
                <AddMentor onSuccess={handleNewMentor} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer with fixed height */}
      <div style={{ height: '120px' }}></div>

      {/* CONTENT */}
      <div className={styles.cardView}>
        {loading ? (
          <div className={styles.app}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          <div className={styles.membersList}>
            {mentors.filter(member => {
              const search = searchTerm.toLowerCase();
              return (
                member.name?.toLowerCase().includes(search) ||
                member.email?.toLowerCase().includes(search)
              );
            }).map((member) => (
              <CustomCard key={member._id} className={styles.memberCard} hover>
                <div className={styles.memberHeader}>
                  <img 
                    onClick={user?.role === 'Admin' ? () => navigate(`/mentor/${member._id}`) : undefined}
                    src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                    alt={member.name}
                    className={styles.avatar}
                    onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                    style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
                  />
                  <div 
                    className={styles.memberInfo} 
                    onClick={user?.role === 'Admin' ? () => navigate(`/mentor/${member._id}`) : undefined}
                    style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
                  >
                    <h3>{member.name}</h3>
                    <span style={{
                      backgroundColor: '#f3e8ff', 
                      color: '#7e22ce', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '500'
                    }}>
                      Mentor
                    </span>
                  </div>
                </div>
                
                <div 
                  onClick={user?.role === 'Admin' ? () => navigate(`/mentor/${member._id}`) : undefined}
                  style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
                >
                  <div className={styles.memberDetails}>
                    <div><Mail size={16} /> {member.email}</div>
                    <div><Phone size={16} /> {member.mobileNumber}</div>
                    {member.currentInstitutionOrCompany && 
                      <div><Building size={16} /> {member.currentInstitutionOrCompany}</div>
                    }
                    
                    {member.fieldofStudy_Interest && (
                      <div style={{marginTop:'8px', color:'#555', fontSize:'0.85rem', lineHeight:'1.4'}}>
                        <strong>Expertise:</strong> {member.fieldofStudy_Interest}
                      </div>
                    )}
                  </div>
                </div>
              </CustomCard>
            ))}
            
            {!loading && mentors.length === 0 && (
              <div style={{textAlign:'center', width:'100%', padding:'40px', color:'#666', fontSize:'16px'}}>
                <User size={48} style={{marginBottom:'16px', opacity:'0.5'}} />
                <p>No Mentors found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;