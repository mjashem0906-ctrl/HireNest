// //-------------------------31/01------------------4.36------------------

// import React, { useEffect, useState } from 'react';
// import { Search, Mail, Phone, Building, Briefcase, Building2 } from 'lucide-react'; 
// import { useNavigate, useOutletContext } from "react-router-dom";
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // Components & Context
// import styles from '../Members/Members.module.scss'; // Assuming you share Member styles
// import CustomCard from '../../components/UI/CustomCard';
// import { useData } from '../../context/DataContext';
// import AddReferee from './AddReferee'; 

// const RefereePage = () => {
//   const { sidebarCollapsed } = useOutletContext();
//   const sidebarWidth = sidebarCollapsed ? 90 : 280;

//   const [referees, setReferees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { memberContext, refreshData } = useData();
//   const navigate = useNavigate();

//   // Fetch referees
//   useEffect(() => {
//     if (memberContext) {
//       const filtered = memberContext.filter(m => 
//         m.memberType && m.memberType.toLowerCase() === 'referee'
//       );
//       setReferees(filtered);
//     }
//   }, [memberContext]);

//   const handleNewReferee = (newReferee) => {
//     // If you are using context, calling refreshData() usually works better than local state
//     if(refreshData) {
//         refreshData();
//     } else {
//         setReferees((prev) => [newReferee, ...prev]); 
//     }
//   };

//   // Handle click to view referee details
//   const handleRefereeClick = (referee) => {
//     navigate(`/referee/${referee._id}`);
//   };

//   const buildRefereeExportRows = () => {
//     return referees.filter(member => {
//         const search = searchTerm.toLowerCase();
//         return (
//           member.name?.toLowerCase().includes(search) ||
//           member.email?.toLowerCase().includes(search) ||
//           member.district?.toLowerCase().includes(search) ||
//           member.occupation?.toLowerCase().includes(search) ||
//           member.companyDetails?.toLowerCase().includes(search)
//         );
//       }).map(m => ({
//         name: m.name || "",
//         mobileNumber: m.mobileNumber || "",
//         email: m.email || "",
//         age: m.age || "",
//         gender: m.gender || "",
//         occupation: m.occupation || "",
//         companyDetails: m.companyDetails || "",
//         sector: m.sector || "",
//         solidarityMemberStatus: m.solidarityMemberStatus || "",
//         referrerStatus: m.referrerStatus || "",
//         referringOfferType: m.referringOfferType || "",
//         referringSector: m.referringSector || "",
//         referringFor: m.referringFor || "",
//         levelOfSupport: m.levelOfSupport || "",
//         jobOfferType: m.jobOfferType || "",
//         description: m.opportunityDescription || "",
//         referrerContact: m.referrerContact || "",
//         offerLocation: m.offer_Location || "",
//         address: m.address || "",
//         district: m.district || "",
//     }));
//   };

//   const exportRefereesToExcel = () => {
//     const data = buildRefereeExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Referees");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), `Referees_${new Date().toISOString().slice(0,10)}.xlsx`);
//   };

//   const exportRefereesToCSV = () => {
//     const data = buildRefereeExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(ws);
//     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Referees_${new Date().toISOString().slice(0,10)}.csv`);
//   };

//   return (
//     <div className={styles.members}>
//       <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
//         <div className={styles.headerContent}>
//           <div className={styles.cardSearch}>
//             <Search size={20} />
//             <input 
//               type="text" 
//               placeholder="Search job referees..." 
//               value={searchTerm} 
//               onChange={(e) => setSearchTerm(e.target.value)} 
//             />
//           </div>
          
//           <div className={styles.exportButtons}>
//             <button onClick={exportRefereesToExcel} className={styles.excel}>Export Excel</button>
//             <button onClick={exportRefereesToCSV} className={styles.csv}>Export CSV</button>
//           </div>
          
//           <AddReferee onSuccess={handleNewReferee} />
//         </div>
//       </div>

//       <div style={{ height: 120 }}></div>

//       {/* Referee List */}
//       <div className={styles.cardView}>
//         <div className={styles.membersList}>
//           {referees.filter(member => {
//             const search = searchTerm.toLowerCase();
//             return (
//               member.name?.toLowerCase().includes(search) ||
//               member.email?.toLowerCase().includes(search) ||
//               member.district?.toLowerCase().includes(search) ||
//               member.occupation?.toLowerCase().includes(search) ||
//               member.companyDetails?.toLowerCase().includes(search)
//             );
//           }).map((member) => (
//             <CustomCard 
//               key={member._id} 
//               className={styles.memberCard} 
//               hover
//               onClick={() => handleRefereeClick(member)}
//             >
//               <div className={styles.memberHeader}>
//                 <img 
//                   src={member.photoUrl || "/members/AnonymousImage.jpg"}
//                   alt={member.name}
//                   className={styles.avatar}
//                   onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
//                 />
//                 <div className={styles.memberInfo}>
//                   <h3>{member.name}</h3>
//                   <span style={{ 
//                     backgroundColor: '#e0e7ff', color: '#4338ca', 
//                     padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' 
//                   }}>
//                     {member.referrerStatus || member.solidarityMemberStatus || "Referee"}
//                   </span>
//                 </div>
//               </div>
              
//               <div>
//                 <div className={styles.memberDetails}>
//                   {member.email && <div><Mail size={16} /> {member.email}</div>}
//                   {member.mobileNumber && <div><Phone size={16} /> {member.mobileNumber}</div>}
//                   {member.district && <div><Building size={16} /> {member.district}</div>}
                  
//                   {member.occupation && (
//                     <div style={{marginTop:'8px', color:'#555', fontSize:'0.85rem'}}>
//                       <Briefcase size={16} style={{verticalAlign: 'middle', marginRight: '6px'}} />
//                       <strong>Occupation:</strong> {member.occupation}
//                     </div>
//                   )}
                  
//                   {member.companyDetails && (
//                     <div style={{marginTop:'4px', color:'#555', fontSize:'0.85rem'}}>
//                       <Building2 size={16} style={{verticalAlign: 'middle', marginRight: '6px'}} />
//                       <strong>Company:</strong> {member.companyDetails}
//                     </div>
//                   )}
                  
//                   {member.sector && (
//                     <div style={{marginTop:'4px', color:'#555', fontSize:'0.85rem'}}>
//                       <strong>Sector:</strong> {member.sector}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CustomCard>
//           ))}
          
//           {referees.length === 0 && (
//              <div style={{textAlign:'center', width:'100%', padding:'20px', color:'#666'}}>
//                No Referees found.
//              </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RefereePage;

//-------------------------6/02------------------4.52-----------------

import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, Briefcase, Building2, Download, FileSpreadsheet, MapPin, UserPlus, Users } from 'lucide-react'; 
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import styles from './RefereePage.module.scss';
import { useData } from '../../context/DataContext';
import AddReferee from './AddReferee'; 

const RefereePage = () => {
  // Use sidebar context if needed
  const context = useOutletContext();
  const sidebarCollapsed = context?.sidebarCollapsed || false;
  
  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const { memberContext, refreshData } = useData();
  const navigate = useNavigate();

  // Robust Fetching Logic
  useEffect(() => {
    if (memberContext && memberContext.length > 0) {
      // Improved filtering: checks if "referee" exists anywhere in the string
      const filtered = memberContext.filter(m => 
        m.memberType && m.memberType.toLowerCase().includes('referee')
      );
      setReferees(filtered);
      setLoading(false);
    } else if (memberContext && memberContext.length === 0) {
      setLoading(false);
    }
  }, [memberContext]);

  const filteredReferees = referees.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.occupation?.toLowerCase().includes(search) ||
      member.district?.toLowerCase().includes(search)
    );
  });

  const exportData = (type) => {
    const data = filteredReferees.map(m => ({
      Name: m.name, Phone: m.mobileNumber, Email: m.email, 
      Occupation: m.occupation, Company: m.companyDetails, District: m.district
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Referees");
      XLSX.writeFile(wb, `Referees_${new Date().toLocaleDateString()}.xlsx`);
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      saveAs(new Blob([csv], { type: "text/csv" }), "Referees_Directory.csv");
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. TOP TOOLBAR */}
      <div className={styles.topToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email, or company..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className={styles.actionGroup}>
          <button onClick={() => exportData('excel')} className={`${styles.btn} ${styles.excel}`}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={() => exportData('csv')} className={`${styles.btn} ${styles.csv}`}>
            <Download size={18} /> CSV
          </button>
          <AddReferee onSuccess={refreshData} />
        </div>
      </div>

      <p className={styles.countText}>
        Showing <strong>{filteredReferees.length}</strong> active job referees
      </p>

      {/* 2. CONDITIONAL RENDERING */}
      {loading ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Syncing Referee Database...</p>
        </div>
      ) : filteredReferees.length > 0 ? (
        <div className={styles.refereeGrid}>
          {filteredReferees.map((member, index) => (
            <div 
              key={member._id} 
              className={styles.refereeCard}
              onClick={() => navigate(`/referee/${member._id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={styles.avatarWrapper}>
                <img 
                  src={member.photoUrl || "/members/AnonymousImage.jpg"}
                  alt=""
                  onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                />
              </div>
              
              <div className={styles.content}>
                <div className={styles.statusBadge}>
                  {member.referrerStatus || "Verified Referee"}
                </div>
                <h3>{member.name}</h3>
                
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <Mail size={14} /> {member.email || "No Email Provided"}
                  </div>
                  <div className={styles.infoItem}>
                    <Phone size={14} /> {member.mobileNumber || "No Phone Provided"}
                  </div>
                  <div className={styles.infoItem}>
                    <Briefcase size={14} /> <strong>{member.occupation || "Professional"}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <Building2 size={14} /> {member.companyDetails || "Independent"}
                  </div>
                  <div className={styles.infoItem}>
                    <MapPin size={14} /> {member.district || "Location N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users size={60} strokeWidth={1} />
          <h3>No Referees Found</h3>
          <p>We couldn't find any members matching the "Referee" type.</p>
          <button onClick={() => setSearchTerm('')} className={styles.resetBtn}>Clear Search</button>
        </div>
      )}
    </div>
  );
};

export default RefereePage;