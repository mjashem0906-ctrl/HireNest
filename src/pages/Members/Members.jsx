// // //--------------------------------------20/01-------------1.54------

// // import React, { useEffect, useState } from 'react';
// // import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2, ListFilter, Search } from 'lucide-react';
// // import { useNavigate, useOutletContext } from "react-router-dom";
// // import * as XLSX from 'xlsx';
// // import { saveAs } from 'file-saver';

// // // Components
// // import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
// // import CustomCard from '../../components/UI/CustomCard';
// // import DataTable from '../../components/Table/DataTable';
// // import Filter from '../../components/Filter/Filter';
// // import AddMember from '../../components/Models/AddMember';
// // import FilterStatus from '../../components/Filter/FIlterStatus';

// // // Context & Utils
// // import API from '../../axios';
// // import { useData } from '../../context/DataContext';
// // import { useAuth } from '../../context/AuthContext';
// // import { parseDOB } from '../../utils/dateUtils';
// // import styles from './Members.module.scss';

// // function Members() {
// //   const outletContext = useOutletContext();
// //   const sidebarCollapsed = outletContext ? outletContext.sidebarCollapsed : false;
// //   const sidebarWidth = sidebarCollapsed ? 90 : 280;

// //   const navigate = useNavigate();
// //   const { memberContext, setMemberContext } = useData();
// //   const { user } = useAuth();

// //   // --- STATE ---
// //   const [allMembers, setAllMembers] = useState([]); // Master Data
// //   const [membersData, setMembersData] = useState([]); // Filtered Data
// //   const [view, setView] = useState('card');
// //   const [globalFilter, setGlobalFilter] = useState('');
// //   const [editMember, setEditMember] = useState(null);
// //   const [showModal, setShowModal] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [activeFilters, setActiveFilters] = useState({});
// //   const [filterValues, setFilterValues] = useState({});

// //   // --- COLUMNS ---
// //   const memberColumns = [
// //     { accessorKey: 'memberReferenceNumber', header: 'Ref. No', enableResizing: true, size: 100 },
// //     { accessorKey: 'name', header: 'Name', enableResizing: true, size: 200 },
// //     { accessorKey: 'memberType', header: 'Member Type', enableResizing: true, size: 160 },
// //     { accessorKey: 'symMemberStatus', header: 'Solidarity Member Status', enableResizing: true, size: 160 },
// //     { accessorKey: 'gender', header: 'Gender', enableResizing: true, size: 100 },
// //     { accessorKey: 'age', header: 'Age', enableResizing: true, size: 70 },
// //     { accessorKey: 'district', header: 'District', enableResizing: true, size: 150 },
// //   ];

// //   // --- INITIAL FETCH ---
// //   useEffect(() => {
// //     fetchData();
// //   }, [memberContext]);

// //   const fetchData = () => {
// //       const sortedMembers = sortByReferenceNumber(memberContext);

// //       setAllMembers(sortedMembers);
// //       setMembersData(sortedMembers);
// //       setLoading(false);
// //     };

// //     const sortByReferenceNumber = (list = []) =>
// //       [...list].sort(
// //         (a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0)
// //       );

// //   // --- HELPERS ---
// //   const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  
// //   const getDirectImageUrl = (driveUrl) => {
// //     if (!driveUrl) return null;
// //     let fileId = null;
    
// //     // Case 1: id= in query params
// //     let match = driveUrl.match(/[?&]id=([^&]+)/);
// //     if (match) fileId = match[1];

// //     // Case 2: /d/{fileId}/ in path
// //     if (!fileId) {
// //       match = driveUrl.match(/\/d\/([^/]+)/);
// //       if (match) fileId = match[1];
// //     }

// //     // Case 3: uc?id=FILE_ID format
// //     if (!fileId) {
// //       match = driveUrl.match(/uc\?id=([^&]+)/);
// //       if (match) fileId = match[1];
// //     }

// //     // Case 4: direct fileId pasted
// //     if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
// //       fileId = driveUrl;
// //     }

// //     return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
// //   };

// //   const calculateAge = (dob) => {
// //     if (!dob) return;

// //     const birthDate = parseDOB(dob);
// //     if (!birthDate || isNaN(birthDate)) return;

// //     const today = new Date();

// //     let years = today.getFullYear() - birthDate.getFullYear();
// //     let months = today.getMonth() - birthDate.getMonth();
// //     let days = today.getDate() - birthDate.getDate();

// //     if (days < 0) {
// //       months -= 1;
// //       days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
// //     }

// //     if (months < 0) {
// //       years -= 1;
// //       months += 12;
// //     }

// //     return { years, months, days };
// //   };

// //   const formatAge = (dob) => {
// //     const age = calculateAge(dob);
// //     return age ? `${age.years} years, ${age.months} months` : "—";
// //   };

// //   // --- EXPORT LOGIC ---
// //   const buildExportRows = () => {
// //     return membersData.map(m => ({
// //       // Core
// //       RefNo: m.memberReferenceNumber || "",
// //       Name: m.name || "",
// //       Age: m.age || "",
// //       Gender: m.gender || "",
// //       Mobile: m.mobileNumber || "",
// //       Email: m.email || "",
// //       District: m.district || "",
// //       Role: m.memberType || "",
// //       'Solidarity Member Status': m.symMemberStatus || "",
      
// //       // Additional personal info
// //       Profession: m.profession || "",
// //       NativeDistrict: m.nativePlace || "",
// //       Address: m.address || "",
      
// //       // Job Seeker
// //       SeekerNeed: (m.seekerNeed || []).join(", "),
// //       Education: m.highest_education || "",
// //       FieldOfStudy: m.fieldofStudy_Interest || "",
// //       PreferredRole: m.preferredJobRole_Sector || "",
// //       Experience: m.workExp || "",
// //       Relocation: m.relocationStatus || "",
// //       PreferredLocation: m.preferredJobLocation || "",
// //       ResumeLink: m.resumeLink || "",
      
// //       // Opportunity Provider
// //       OfferType: (m.jobOfferType || []).join(", "),
// //       OfferingSector: (m.offeringSector || []).join(", "),
// //       OpportunityDescription: m.opportunityDescription || "",
// //       OfferLocation: m.offer_Location || "",
// //       ContactForSeekers: m.contactForSeekers || "",
      
// //       // Referee
// //       ReferrerStatus: m.referrerStatus || "",
// //       ReferringOfferType: (m.referringOfferType || []).join(", "),
// //       ReferringSector: (m.referringSector || []).join(", "),
// //       ReferringFor: m.referringFor || "",
// //       LevelOfSupport: (m.levelOfSupport || []).join(", "),
// //       ReferrerContact: m.referrerContact || "",
      
// //       // Upskiller
// //       SkillProgram: m.interest_SkillBuildingProgram || "",
// //       SkillsToImprove: (m.skillsToImprove || []).join(", "),
      
// //       // Grouping
// //       GroupTags: (m.forGrouping || []).join(", "),
      
// //       // Timestamps
// //       CreatedDate: m.timestamp || "",
// //       SubmittedEmail: m.submittingEmail || "",
// //     }));
// //   };

// //   const exportToExcel = () => {
// //     const data = buildExportRows();
// //     const ws = XLSX.utils.json_to_sheet(data);
// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Members");
// //     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
// //     saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
// //   };

// //   const exportToCSV = () => {
// //     const data = buildExportRows();
// //     const ws = XLSX.utils.json_to_sheet(data);
// //     const csv = XLSX.utils.sheet_to_csv(ws);
// //     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Members_${new Date().toISOString().slice(0, 10)}.csv`);
// //   };

// //   // --- FILTER LOGIC ---
// //   const membersFilterConfig = {
// //     labels: {
// //       name: 'Name', 
// //       initialNumber: 'Min Age', 
// //       finalNumber: 'Max Age', 
// //       district: 'District',
// //       nDistrict: 'Native District',
// //       profession: 'Profession',
// //       memberType: 'Member Type', 
// //       gender: 'Gender', 
// //       symMemberStatus: 'Solidarity Member Status',
// //       seekerNeed: 'Seeker Need', 
// //       highest_education: 'Highest Education', 
// //       preferredJobRole_Sector: 'Preferred Job Role',
// //       workExp: 'Work Experience', 
// //       relocationStatus: 'Relocation Status', 
// //       jobOfferType: 'Job Offer Type',
// //       offeringSector: 'Offering Sector', 
// //       referrerStatus: 'Referrer Status', 
// //       levelOfSupport: 'Level Of Support',
// //       interest_SkillBuildingProgram: 'Skill Program',
// //       forGrouping: 'Group Tags'
// //     },
// //     fieldTypes: {
// //       name: 'string', 
// //       initialNumber: 'number', 
// //       finalNumber: 'number', 
// //       district: 'string',
// //       nDistrict: 'string',
// //       profession: 'string',
// //       memberType: 'string', 
// //       gender: 'string', 
// //       symMemberStatus: 'string', 
// //       seekerNeed: 'array',
// //       highest_education: 'string', 
// //       preferredJobRole_Sector: 'string', 
// //       workExp: 'string',
// //       relocationStatus: 'string', 
// //       jobOfferType: 'array', 
// //       offeringSector: 'array',
// //       referrerStatus: 'string', 
// //       levelOfSupport: 'array', 
// //       interest_SkillBuildingProgram: 'string',
// //       forGrouping: 'array'
// //     },
// //     formatters: {
// //       array: (value) => Array.isArray(value) ? value.join(', ') : value,
// //       number: (value) => value ? value.toString() : '',
// //     }
// //   };

// //   const applyFilters = (filters) => {
// //     if (!filters || Object.values(filters).every((v) => v === "" || v === null || (Array.isArray(v) && v.length === 0))) {
// //       setMembersData(allMembers);
// //       setActiveFilters({});
// //       setFilterValues({});
// //       return;
// //     }

// //     let filtered = [...allMembers];
// //     const newActiveFilters = {};

// //     // Exact Match Filters
// //     const exactFilters = [
// //       'name', 'district', 'memberType', 'gender', 'symMemberStatus', 'profession', 
// //       'highest_education', 'preferredJobRole_Sector', 'workExp', 'relocationStatus', 
// //       'referrerStatus', 'interest_SkillBuildingProgram'
// //     ];
    
// //     exactFilters.forEach(key => {
// //       if (filters[key]) {
// //         filtered = filtered.filter(p => p[key] === filters[key]);
// //         newActiveFilters[key] = filters[key];
// //       }
// //     });

// //     // Specific Mapping Filters
// //     if (filters.nDistrict) {
// //       filtered = filtered.filter(p => p.nativePlace === filters.nDistrict);
// //       newActiveFilters.nDistrict = filters.nDistrict;
// //     }

// //     // Number Ranges
// //     if (filters.initialNumber !== undefined && filters.initialNumber !== "") {
// //       filtered = filtered.filter((p) => p.age >= Number(filters.initialNumber));
// //       newActiveFilters.initialNumber = filters.initialNumber;
// //     }
// //     if (filters.finalNumber !== undefined && filters.finalNumber !== "") {
// //       filtered = filtered.filter((p) => p.age <= Number(filters.finalNumber));
// //       newActiveFilters.finalNumber = filters.finalNumber;
// //     }

// //     // Array Filters (Contains)
// //     const arrayFilters = ['seekerNeed', 'jobOfferType', 'offeringSector', 'levelOfSupport', 'forGrouping'];
// //     arrayFilters.forEach(key => {
// //       if (filters[key]?.length) {
// //         filtered = filtered.filter(p => {
// //           const memberArray = p[key] || [];
// //           return filters[key].some(filterValue => memberArray.includes(filterValue));
// //         });
// //         newActiveFilters[key] = filters[key];
// //       }
// //     });

// //     const sortedFiltered = sortByReferenceNumber(filtered);
// //     setMembersData(sortedFiltered);
// //     setActiveFilters(newActiveFilters);
// //     setFilterValues(filters);
// //   };

// //   const clearFilter = (filterKey) => {
// //     const newActiveFilters = { ...activeFilters };
// //     const newFilterValues = { ...filterValues };
// //     delete newActiveFilters[filterKey];
// //     delete newFilterValues[filterKey];
// //     setActiveFilters(newActiveFilters);
// //     setFilterValues(newFilterValues);
// //     applyFilters(newFilterValues);
// //   };

// //   const clearAllFilters = () => {
// //     setMembersData(allMembers);
// //     setActiveFilters({});
// //     setFilterValues({});
// //   };

// //   // --- CRUD OPERATIONS ---
// //   const handleEditMember = async (updated) => {
// //     try {
// //       const updateList = (list) => list.map((m) => m._id === updated._id ? updated : m);
// //       setMembersData(prev => updateList(prev));
// //       setAllMembers(prev => updateList(prev));
// //       setMemberContext(prev => updateList(prev));
// //       setEditMember(null);
// //       setShowModal(false);
// //     } catch (error) {
// //       console.error("Error updating member:", error);
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
// //       try {
// //         await API.delete(`/member/${id}`);
// //         alert("Member deleted successfully");
// //         const remaining = allMembers.filter(member => member._id !== id);
// //         setAllMembers(remaining);
// //         setMembersData(remaining);
// //         setMemberContext(remaining);
// //       } catch (err) {
// //         console.error("Delete failed:", err);
// //         alert("Failed to delete member.");
// //       }
// //     }
// //   };

// //   const handleEdit = (member) => {
// //     setEditMember({ ...member });
// //     setShowModal(true);
// //   };

// //   const handleRowClick = (row) => {
// //     navigate(`/member/${row._id}`);
// //   };

// //   const handleToggle = (newView) => { 
// //     setView(newView); 
// //   };

// //   if (loading) return <div className={styles.app}><div className={styles.loader}></div></div>;

// //   // Prepare filter options
// //   const districts = unique(allMembers.map((m) => m.district));
// //   const professions = unique(allMembers.map((m) => m.profession));
// //   const memberTypes = unique(allMembers.map((m) => m.memberType));
// //   const groupTags = unique(allMembers.flatMap((m) => m.forGrouping || []).filter(Boolean));

// //   return (
// //     <div className={styles.members}>
// //       {/* HEADER */}
// //       <div
// //   className={styles.headerWrapper}
// //   style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
// // >
// //  <div className={styles.headerContent}>
// //     {/* Global Filter Input */}
// //     <div className={styles.cardSearch}>
// //       <Search size={20} />
// //       <input
// //         type="text"
// //         placeholder="Search members..."
// //         value={globalFilter || ''}
// //         onChange={(e) => setGlobalFilter(e.target.value)}
// //       />
// //     </div>

// //     <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
// //     <div className={styles.exportButtons}>
// //       <button onClick={exportToExcel} className={`${styles.excel}`}>
// //           Export Excel
// //       </button>
// //       <button onClick={exportToCSV} className={`${styles.csv}`}>
// //           Export CSV
// //       </button>
// //       </div>

// //     <Filter
// //       fields={[
// //         { name: "name", label: "Name", type: "select", options: unique(allMembers.map(m => m.name)) },
// //         { name: "initialNumber", label: "Min Age", type: "initialNumber" },
// //         { name: "finalNumber", label: "Max Age", type: "finalNumber" },
// //         { name: "district", label: "District", type: "select", options: districts },
// //         { name: "memberType", label: "Member Type", type: "select", options: memberTypes },
// //         { name: "gender", label: "Gender", type: "select", options: unique(allMembers.map(m => m.gender)) },
// //         { name: "symMemberStatus", label: "Solidarity Member Status", type: "select", options: unique(allMembers.map(m => m.symMemberStatus)) },
// //         { name: "highest_education", label: "Highest Education", type: "select", options: unique(allMembers.map(m => m.highest_education)) },
// //         { name: "preferredJobRole_Sector", label: "Preferred Job Role", type: "select", options: unique(allMembers.map(m => m.preferredJobRole_Sector)) },
// //         { name: "relocationStatus", label: "Relocation Status", type: "select", options: unique(allMembers.map(m => m.relocationStatus)) },
// //         { name: "referrerStatus", label: "Referrer Status", type: "select", options: unique(allMembers.map(m => m.referrerStatus)) },
// //         // { name: "levelOfSupport", label: "Level Of Support", type: "multiSelect", options: unique(allMembers.flatMap(m => m.levelOfSupport || [])) },
// //       ]}
// //       onApplyFilters={applyFilters}
// //       initialValues={filterValues}
// //     />

// //   </div>
// // </div>

// //       <div style={{ height: 120 }}></div>

// //       {/* MODAL & STATUS BAR */}
// //       <AddMember
// //         isOpen={showModal}
// //         onClose={() => { setShowModal(false); setEditMember(null); }}
// //         onSuccess={handleEditMember}
// //         editMember={editMember}
// //       />

// //       <FilterStatus
// //         activeFilters={activeFilters}
// //         onClearFilter={clearFilter}
// //         onClearAll={clearAllFilters}
// //         filterConfig={membersFilterConfig}
// //         data-page-type="members"
// //       />

// //       {/* CONTENT VIEWS */}
// //       {view === 'table' ? (
// //         <div className={styles.tableView}>
// //           <DataTable 
// //             data={membersData} 
// //             columns={memberColumns} 
// //             globalFilter={globalFilter}
// //             onGlobalFilterChange={setGlobalFilter} 
// //             onRowClick={handleRowClick} 
// //           />
// //         </div>
// //       ) : (
// //         <div className={styles.cardView}>
// //           <div className={styles.membersList}>
// //             {membersData.filter(member => {
// //               const search = globalFilter?.toLowerCase() || '';
// //               return (
// //                 member.name?.toLowerCase().includes(search) ||
// //                 member.email?.toLowerCase().includes(search) ||
// //                 member.profession?.toLowerCase().includes(search) ||
// //                 member.personalEmail?.toLowerCase().includes(search) ||
// //                 member.mobileNumber?.toLowerCase().includes(search) ||
// //                 member.memberReferenceNumber?.toString().includes(search)
// //               );
// //             }).map((member) => (
// //               <CustomCard key={member._id} className={styles.memberCard} hover>
// //                 <div className={styles.memberHeader}>
// //                   <img
// //                     onClick={() => navigate(`/member/${member._id}`)}
// //                     src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
// //                     alt={member.name}
// //                     className={styles.avatar}
// //                     onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
// //                   />
// //                   <div className={styles.memberInfo} onClick={() => navigate(`/member/${member._id}`)}>
// //                     <h3>{member.name}</h3>
// //                     <p>{member.memberType}</p>
// //                   </div>
// //                   {user?.role === 'Admin' && (
// //                     <div className={styles.memberActions}>
// //                       <button className={styles.editButton} onClick={() => handleEdit(member)} title="Edit member">
// //                         <Edit size={16} />
// //                       </button>
// //                       <button className={styles.deleteButton} onClick={() => handleDelete(member._id)} title="Delete member">
// //                         <Trash2 size={16} />
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>
// //                 <div onClick={() => navigate(`/member/${member._id}`)} className={styles.memberDetails}>
// //                   <div><p>Ref No: {member.memberReferenceNumber}</p></div>
// //                   <div><Mail size={16} /> {member.email}</div>
// //                   <div><Phone size={16} /> {member.mobileNumber}</div>
// //                   <div><Calendar size={16} /> {member.age || formatAge(member.dob)}</div>
// //                   <div><Building size={16} /> {member.district}</div>
// //                 </div>
// //               </CustomCard>
// //             ))}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default Members;

// import React, { useEffect, useState } from 'react';
// import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2, ListFilter, Search, Filter, X } from 'lucide-react';
// import { useNavigate, useOutletContext } from "react-router-dom";
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // Components
// import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
// import CustomCard from '../../components/UI/CustomCard';
// import DataTable from '../../components/Table/DataTable';
// import AddMember from '../../components/Models/AddMember';
// import FilterStatus from '../../components/Filter/FIlterStatus';

// // Context & Utils
// import API from '../../axios';
// import { useData } from '../../context/DataContext';
// import { useAuth } from '../../context/AuthContext';
// import { parseDOB } from '../../utils/dateUtils';
// import styles from './Members.module.scss';

// function Members() {
//   const outletContext = useOutletContext();
//   const sidebarCollapsed = outletContext ? outletContext.sidebarCollapsed : false;
//   const sidebarWidth = sidebarCollapsed ? 90 : 280;

//   const navigate = useNavigate();
//   const { memberContext, setMemberContext } = useData();
//   const { user } = useAuth();

//   // --- STATE ---
//   const [allMembers, setAllMembers] = useState([]); // Master Data
//   const [membersData, setMembersData] = useState([]); // Filtered Data
//   const [view, setView] = useState('card');
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [editMember, setEditMember] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [activeFilters, setActiveFilters] = useState({});
//   const [filterValues, setFilterValues] = useState({});
//   const [showFilters, setShowFilters] = useState(true); // New state for filter visibility

//   // --- COLUMNS ---
//   const memberColumns = [
//     { accessorKey: 'memberReferenceNumber', header: 'Ref. No', enableResizing: true, size: 100 },
//     { accessorKey: 'name', header: 'Name', enableResizing: true, size: 200 },
//     { accessorKey: 'memberType', header: 'Member Type', enableResizing: true, size: 160 },
//     { accessorKey: 'symMemberStatus', header: 'Solidarity Member Status', enableResizing: true, size: 160 },
//     { accessorKey: 'gender', header: 'Gender', enableResizing: true, size: 100 },
//     { accessorKey: 'age', header: 'Age', enableResizing: true, size: 70 },
//     { accessorKey: 'district', header: 'District', enableResizing: true, size: 150 },
//   ];

//   // --- INITIAL FETCH ---
//   useEffect(() => {
//     fetchData();
//   }, [memberContext]);

//   const fetchData = () => {
//       const sortedMembers = sortByReferenceNumber(memberContext);

//       setAllMembers(sortedMembers);
//       setMembersData(sortedMembers);
//       setLoading(false);
//     };

//     const sortByReferenceNumber = (list = []) =>
//       [...list].sort(
//         (a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0)
//       );

//   // --- HELPERS ---
//   const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  
//   const getDirectImageUrl = (driveUrl) => {
//     if (!driveUrl) return null;
//     let fileId = null;
    
//     // Case 1: id= in query params
//     let match = driveUrl.match(/[?&]id=([^&]+)/);
//     if (match) fileId = match[1];

//     // Case 2: /d/{fileId}/ in path
//     if (!fileId) {
//       match = driveUrl.match(/\/d\/([^/]+)/);
//       if (match) fileId = match[1];
//     }

//     // Case 3: uc?id=FILE_ID format
//     if (!fileId) {
//       match = driveUrl.match(/uc\?id=([^&]+)/);
//       if (match) fileId = match[1];
//     }

//     // Case 4: direct fileId pasted
//     if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
//       fileId = driveUrl;
//     }

//     return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
//   };

//   const calculateAge = (dob) => {
//     if (!dob) return;

//     const birthDate = parseDOB(dob);
//     if (!birthDate || isNaN(birthDate)) return;

//     const today = new Date();

//     let years = today.getFullYear() - birthDate.getFullYear();
//     let months = today.getMonth() - birthDate.getMonth();
//     let days = today.getDate() - birthDate.getDate();

//     if (days < 0) {
//       months -= 1;
//       days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
//     }

//     if (months < 0) {
//       years -= 1;
//       months += 12;
//     }

//     return { years, months, days };
//   };

//   const formatAge = (dob) => {
//     const age = calculateAge(dob);
//     return age ? `${age.years} years, ${age.months} months` : "—";
//   };

//   // --- EXPORT LOGIC ---
//   const buildExportRows = () => {
//     return membersData.map(m => ({
//       // Core
//       RefNo: m.memberReferenceNumber || "",
//       Name: m.name || "",
//       Age: m.age || "",
//       Gender: m.gender || "",
//       Mobile: m.mobileNumber || "",
//       Email: m.email || "",
//       District: m.district || "",
//       Role: m.memberType || "",
//       'Solidarity Member Status': m.symMemberStatus || "",
      
//       // Additional personal info
//       Profession: m.profession || "",
//       NativeDistrict: m.nativePlace || "",
//       Address: m.address || "",
      
//       // Job Seeker
//       SeekerNeed: (m.seekerNeed || []).join(", "),
//       Education: m.highest_education || "",
//       FieldOfStudy: m.fieldofStudy_Interest || "",
//       PreferredRole: m.preferredJobRole_Sector || "",
//       Experience: m.workExp || "",
//       Relocation: m.relocationStatus || "",
//       PreferredLocation: m.preferredJobLocation || "",
//       ResumeLink: m.resumeLink || "",
      
//       // Opportunity Provider
//       OfferType: (m.jobOfferType || []).join(", "),
//       OfferingSector: (m.offeringSector || []).join(", "),
//       OpportunityDescription: m.opportunityDescription || "",
//       OfferLocation: m.offer_Location || "",
//       ContactForSeekers: m.contactForSeekers || "",
      
//       // Referee
//       ReferrerStatus: m.referrerStatus || "",
//       ReferringOfferType: (m.referringOfferType || []).join(", "),
//       ReferringSector: (m.referringSector || []).join(", "),
//       ReferringFor: m.referringFor || "",
//       LevelOfSupport: (m.levelOfSupport || []).join(", "),
//       ReferrerContact: m.referrerContact || "",
      
//       // Upskiller
//       SkillProgram: m.interest_SkillBuildingProgram || "",
//       SkillsToImprove: (m.skillsToImprove || []).join(", "),
      
//       // Grouping
//       GroupTags: (m.forGrouping || []).join(", "),
      
//       // Timestamps
//       CreatedDate: m.timestamp || "",
//       SubmittedEmail: m.submittingEmail || "",
//     }));
//   };

//   const exportToExcel = () => {
//     const data = buildExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Members");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
//   };

//   const exportToCSV = () => {
//     const data = buildExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(ws);
//     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Members_${new Date().toISOString().slice(0, 10)}.csv`);
//   };

//   // --- FILTER LOGIC ---
//   const membersFilterConfig = {
//     labels: {
//       name: 'Name', 
//       initialNumber: 'Min Age', 
//       finalNumber: 'Max Age', 
//       district: 'District',
//       nDistrict: 'Native District',
//       profession: 'Profession',
//       memberType: 'Member Type', 
//       gender: 'Gender', 
//       symMemberStatus: 'Solidarity Member Status',
//       seekerNeed: 'Seeker Need', 
//       highest_education: 'Highest Education', 
//       preferredJobRole_Sector: 'Preferred Job Role',
//       workExp: 'Work Experience', 
//       relocationStatus: 'Relocation Status', 
//       jobOfferType: 'Job Offer Type',
//       offeringSector: 'Offering Sector', 
//       referrerStatus: 'Referrer Status', 
//       levelOfSupport: 'Level Of Support',
//       interest_SkillBuildingProgram: 'Skill Program',
//       forGrouping: 'Group Tags'
//     },
//     fieldTypes: {
//       name: 'string', 
//       initialNumber: 'number', 
//       finalNumber: 'number', 
//       district: 'string',
//       nDistrict: 'string',
//       profession: 'string',
//       memberType: 'string', 
//       gender: 'string', 
//       symMemberStatus: 'string', 
//       seekerNeed: 'array',
//       highest_education: 'string', 
//       preferredJobRole_Sector: 'string', 
//       workExp: 'string',
//       relocationStatus: 'string', 
//       jobOfferType: 'array', 
//       offeringSector: 'array',
//       referrerStatus: 'string', 
//       levelOfSupport: 'array', 
//       interest_SkillBuildingProgram: 'string',
//       forGrouping: 'array'
//     },
//     formatters: {
//       array: (value) => Array.isArray(value) ? value.join(', ') : value,
//       number: (value) => value ? value.toString() : '',
//     }
//   };

//   const applyFilters = (filters) => {
//     if (!filters || Object.values(filters).every((v) => v === "" || v === null || (Array.isArray(v) && v.length === 0))) {
//       setMembersData(allMembers);
//       setActiveFilters({});
//       setFilterValues({});
//       return;
//     }

//     let filtered = [...allMembers];
//     const newActiveFilters = {};

//     // Exact Match Filters
//     const exactFilters = [
//       'name', 'district', 'memberType', 'gender', 'symMemberStatus', 'profession', 
//       'highest_education', 'preferredJobRole_Sector', 'workExp', 'relocationStatus', 
//       'referrerStatus', 'interest_SkillBuildingProgram'
//     ];
    
//     exactFilters.forEach(key => {
//       if (filters[key]) {
//         filtered = filtered.filter(p => p[key] === filters[key]);
//         newActiveFilters[key] = filters[key];
//       }
//     });

//     // Specific Mapping Filters
//     if (filters.nDistrict) {
//       filtered = filtered.filter(p => p.nativePlace === filters.nDistrict);
//       newActiveFilters.nDistrict = filters.nDistrict;
//     }

//     // Number Ranges
//     if (filters.initialNumber !== undefined && filters.initialNumber !== "") {
//       filtered = filtered.filter((p) => p.age >= Number(filters.initialNumber));
//       newActiveFilters.initialNumber = filters.initialNumber;
//     }
//     if (filters.finalNumber !== undefined && filters.finalNumber !== "") {
//       filtered = filtered.filter((p) => p.age <= Number(filters.finalNumber));
//       newActiveFilters.finalNumber = filters.finalNumber;
//     }

//     // Array Filters (Contains)
//     const arrayFilters = ['seekerNeed', 'jobOfferType', 'offeringSector', 'levelOfSupport', 'forGrouping'];
//     arrayFilters.forEach(key => {
//       if (filters[key]?.length) {
//         filtered = filtered.filter(p => {
//           const memberArray = p[key] || [];
//           return filters[key].some(filterValue => memberArray.includes(filterValue));
//         });
//         newActiveFilters[key] = filters[key];
//       }
//     });

//     const sortedFiltered = sortByReferenceNumber(filtered);
//     setMembersData(sortedFiltered);
//     setActiveFilters(newActiveFilters);
//     setFilterValues(filters);
//   };

//   const clearFilter = (filterKey) => {
//     const newActiveFilters = { ...activeFilters };
//     const newFilterValues = { ...filterValues };
//     delete newActiveFilters[filterKey];
//     delete newFilterValues[filterKey];
//     setActiveFilters(newActiveFilters);
//     setFilterValues(newFilterValues);
//     applyFilters(newFilterValues);
//   };

//   const clearAllFilters = () => {
//     setMembersData(allMembers);
//     setActiveFilters({});
//     setFilterValues({});
//   };

//   // --- CRUD OPERATIONS ---
//   const handleEditMember = async (updated) => {
//     try {
//       const updateList = (list) => list.map((m) => m._id === updated._id ? updated : m);
//       setMembersData(prev => updateList(prev));
//       setAllMembers(prev => updateList(prev));
//       setMemberContext(prev => updateList(prev));
//       setEditMember(null);
//       setShowModal(false);
//     } catch (error) {
//       console.error("Error updating member:", error);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
//       try {
//         await API.delete(`/member/${id}`);
//         alert("Member deleted successfully");
//         const remaining = allMembers.filter(member => member._id !== id);
//         setAllMembers(remaining);
//         setMembersData(remaining);
//         setMemberContext(remaining);
//       } catch (err) {
//         console.error("Delete failed:", err);
//         alert("Failed to delete member.");
//       }
//     }
//   };

//   const handleEdit = (member) => {
//     setEditMember({ ...member });
//     setShowModal(true);
//   };

//   const handleRowClick = (row) => {
//     navigate(`/member/${row._id}`);
//   };

//   const handleToggle = (newView) => { 
//     setView(newView); 
//   };

//   const toggleFilters = () => {
//     setShowFilters(!showFilters);
//   };

//   if (loading) return <div className={styles.app}><div className={styles.loader}></div></div>;

//   // Prepare filter options
//   const districts = unique(allMembers.map((m) => m.district));
//   const memberTypes = unique(allMembers.map((m) => m.memberType));
//   const highestEducationOptions = unique(allMembers.map((m) => m.highest_education));
//   const preferredJobRoleOptions = unique(allMembers.map((m) => m.preferredJobRole_Sector));
//   const relocationStatusOptions = unique(allMembers.map((m) => m.relocationStatus));
//   const referrerStatusOptions = unique(allMembers.map((m) => m.referrerStatus));

//   return (
//     <div className={styles.members}>
//       {/* HEADER */}
//       <div
//         className={styles.headerWrapper}
//         style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
//       >
//         <div className={styles.headerContent}>
//           {/* Global Filter Input */}
//           <div className={styles.cardSearch}>
//             <Search size={20} />
//             <input
//               type="text"
//               placeholder="Search members..."
//               value={globalFilter || ''}
//               onChange={(e) => setGlobalFilter(e.target.value)}
//             />
//           </div>

//           <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
          
//           {/* Filter Toggle Button */}
//           <button 
//             className={styles.filterToggleButton}
//             onClick={toggleFilters}
//             title={showFilters ? "Hide Filters" : "Show Filters"}
//           >
//             {showFilters ? <X size={18} /> : <Filter size={18} />}
//             <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
//           </button>

//           <div className={styles.exportButtons}>
//             <button onClick={exportToExcel} className={`${styles.excel}`}>
//                 Export Excel
//             </button>
//             <button onClick={exportToCSV} className={`${styles.csv}`}>
//                 Export CSV
//             </button>
//           </div>

//         </div>
//       </div>

//       <div style={{ height: 120 }}></div>

//       {/* SINGLE ROW HORIZONTAL FILTER WITH SCROLL */}
//       {showFilters && (
//         <div className={styles.horizontalFilterContainer}>
//           <div className={styles.filterRowWithScroll}>
//             <div className={styles.filterRowContent}>
//               {/* Name Filter */}
//               <div className={styles.filterField}>
//                 <label>NAME</label>
//                 <select
//                   value={filterValues.name || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, name: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">Select Name</option>
//                   {unique(allMembers.map(m => m.name)).map(name => (
//                     <option key={name} value={name}>{name.length > 15 ? `${name.substring(0, 15)}...` : name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Min Age Filter */}
//               <div className={styles.filterField}>
//                 <label>MIN AGE</label>
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={filterValues.initialNumber || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, initialNumber: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 />
//               </div>

//               {/* Max Age Filter */}
//               <div className={styles.filterField}>
//                 <label>MAX AGE</label>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={filterValues.finalNumber || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, finalNumber: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 />
//               </div>

//               {/* District Filter */}
//               <div className={styles.filterField}>
//                 <label>DISTRICT</label>
//                 <select
//                   value={filterValues.district || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, district: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">All Districts</option>
//                   {districts.map(district => (
//                     <option key={district} value={district}>
//                       {district.length > 15 ? `${district.substring(0, 15)}...` : district}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Member Type Filter */}
//               <div className={styles.filterField}>
//                 <label>MEMBER TYPE</label>
//                 <select
//                   value={filterValues.memberType || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, memberType: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">All Types</option>
//                   {memberTypes.map(type => (
//                     <option key={type} value={type}>
//                       {type.length > 15 ? `${type.substring(0, 15)}...` : type}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Gender Filter */}
//               <div className={styles.filterField}>
//                 <label>GENDER</label>
//                 <select
//                   value={filterValues.gender || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, gender: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">All Gender</option>
//                   {unique(allMembers.map(m => m.gender)).map(gender => (
//                     <option key={gender} value={gender}>
//                       {gender.length > 15 ? `${gender.substring(0, 15)}...` : gender}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Solidarity Status Filter */}
//               <div className={styles.filterField}>
//                 <label>SOLIDARITY STATUS</label>
//                 <select
//                   value={filterValues.symMemberStatus || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, symMemberStatus: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">All Status</option>
//                   {unique(allMembers.map(m => m.symMemberStatus)).map(status => (
//                     <option key={status} value={status}>
//                       {status.length > 15 ? `${status.substring(0, 15)}...` : status}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Highest Education Filter */}
//               <div className={styles.filterField}>
//                 <label>HIGHEST EDUCATION</label>
//                 <select
//                   value={filterValues.highest_education || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, highest_education: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">Select Highest Education</option>
//                   {highestEducationOptions.map(edu => (
//                     <option key={edu} value={edu}>
//                       {edu.length > 20 ? `${edu.substring(0, 20)}...` : edu}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Preferred Job Role Filter */}
//               <div className={styles.filterField}>
//                 <label>PREFERRED JOB ROLE</label>
//                 <select
//                   value={filterValues.preferredJobRole_Sector || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, preferredJobRole_Sector: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">Select Preferred Job Role</option>
//                   {preferredJobRoleOptions.map(role => (
//                     <option key={role} value={role}>
//                       {role.length > 20 ? `${role.substring(0, 20)}...` : role}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Relocation Status Filter */}
//               <div className={styles.filterField}>
//                 <label>RELOCATION STATUS</label>
//                 <select
//                   value={filterValues.relocationStatus || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, relocationStatus: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">Select Relocation Status</option>
//                   {relocationStatusOptions.map(status => (
//                     <option key={status} value={status}>
//                       {status.length > 20 ? `${status.substring(0, 20)}...` : status}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Referrer Status Filter */}
//               <div className={styles.filterField}>
//                 <label>REFERRER STATUS</label>
//                 <select
//                   value={filterValues.referrerStatus || ''}
//                   onChange={(e) => {
//                     const newFilters = { ...filterValues, referrerStatus: e.target.value || null };
//                     setFilterValues(newFilters);
//                     applyFilters(newFilters);
//                   }}
//                 >
//                   <option value="">Select Referrer Status</option>
//                   {referrerStatusOptions.map(status => (
//                     <option key={status} value={status}>
//                       {status.length > 20 ? `${status.substring(0, 20)}...` : status}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Clear All Button */}
//               <button 
//                 className={styles.clearAllButton}
//                 onClick={clearAllFilters}
//               >
//                 CLEAR ALL
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL & STATUS BAR */}
//       <AddMember
//         isOpen={showModal}
//         onClose={() => { setShowModal(false); setEditMember(null); }}
//         onSuccess={handleEditMember}
//         editMember={editMember}
//       />

//       <FilterStatus
//         activeFilters={activeFilters}
//         onClearFilter={clearFilter}
//         onClearAll={clearAllFilters}
//         filterConfig={membersFilterConfig}
//         data-page-type="members"
//       />

//       {/* CONTENT VIEWS */}
//       {view === 'table' ? (
//         <div className={styles.tableView}>
//           <DataTable 
//             data={membersData} 
//             columns={memberColumns} 
//             globalFilter={globalFilter}
//             onGlobalFilterChange={setGlobalFilter} 
//             onRowClick={handleRowClick} 
//           />
//         </div>
//       ) : (
//         <div className={styles.cardView}>
//           <div className={styles.membersList}>
//             {membersData.filter(member => {
//               const search = globalFilter?.toLowerCase() || '';
//               return (
//                 member.name?.toLowerCase().includes(search) ||
//                 member.email?.toLowerCase().includes(search) ||
//                 member.profession?.toLowerCase().includes(search) ||
//                 member.personalEmail?.toLowerCase().includes(search) ||
//                 member.mobileNumber?.toLowerCase().includes(search) ||
//                 member.memberReferenceNumber?.toString().includes(search)
//               );
//             }).map((member) => (
//               <CustomCard key={member._id} className={styles.memberCard} hover>
//                 <div className={styles.memberHeader}>
//                   <img
//                     onClick={() => navigate(`/member/${member._id}`)}
//                     src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
//                     alt={member.name}
//                     className={styles.avatar}
//                     onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
//                   />
//                   <div className={styles.memberInfo} onClick={() => navigate(`/member/${member._id}`)}>
//                     <h3>{member.name}</h3>
//                     <p>{member.memberType}</p>
//                   </div>
//                   {user?.role === 'Admin' && (
//                     <div className={styles.memberActions}>
//                       <button className={styles.editButton} onClick={() => handleEdit(member)} title="Edit member">
//                         <Edit size={16} />
//                       </button>
//                       <button className={styles.deleteButton} onClick={() => handleDelete(member._id)} title="Delete member">
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <div onClick={() => navigate(`/member/${member._id}`)} className={styles.memberDetails}>
//                   <div><p>Ref No: {member.memberReferenceNumber}</p></div>
//                   <div><Mail size={16} /> {member.email}</div>
//                   <div><Phone size={16} /> {member.mobileNumber}</div>
//                   <div><Calendar size={16} /> {member.age || formatAge(member.dob)}</div>
//                   <div><Building size={16} /> {member.district}</div>
//                 </div>
//               </CustomCard>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Members;

////////////////////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2, ListFilter, Search, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Components
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import CustomCard from '../../components/UI/CustomCard';
import DataTable from '../../components/Table/DataTable';
import AddMember from '../../components/Models/AddMember';
import FilterStatus from '../../components/Filter/FIlterStatus';

// Context & Utils
import API from '../../axios';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { parseDOB } from '../../utils/dateUtils';
import styles from './Members.module.scss';

function Members() {
  const outletContext = useOutletContext();
  const sidebarCollapsed = outletContext ? outletContext.sidebarCollapsed : false;
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const navigate = useNavigate();
  const location = useLocation(); 
  const { memberContext, setMemberContext } = useData();
  const { user } = useAuth();

  // --- STATE ---
  const [allMembers, setAllMembers] = useState([]); // Master Data
  const [membersData, setMembersData] = useState([]); // Filtered Data
  const [view, setView] = useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});
  const [showFilters, setShowFilters] = useState(true);

  // --- COLUMNS ---
  const memberColumns = [
    { accessorKey: 'memberReferenceNumber', header: 'Ref. No', enableResizing: true, size: 100 },
    { accessorKey: 'name', header: 'Name', enableResizing: true, size: 200 },
    { accessorKey: 'memberType', header: 'Member Type', enableResizing: true, size: 160 },
    { accessorKey: 'symMemberStatus', header: 'Solidarity Member Status', enableResizing: true, size: 160 },
    { accessorKey: 'gender', header: 'Gender', enableResizing: true, size: 100 },
    { accessorKey: 'age', header: 'Age', enableResizing: true, size: 70 },
    { accessorKey: 'district', header: 'District', enableResizing: true, size: 150 },
  ];

  // --- INITIAL FETCH & DASHBOARD FILTER LOGIC ---
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberContext, location.state]);

  const fetchData = () => {
    const sortedMembers = sortByReferenceNumber(memberContext);
    setAllMembers(sortedMembers);

    let initialDisplayData = [...sortedMembers];

    // ✅ Catch and apply filters sent from the Dashboard
    if (location.state) {
      if (location.state.expFilter === "fresher") {
        initialDisplayData = initialDisplayData.filter((m) => {
          const exp = String(m.workExp || "").toLowerCase().trim();
          return exp === "0" || exp === "fresher" || exp === "0 years";
        });
      } else if (location.state.expFilter === "experienced") {
        initialDisplayData = initialDisplayData.filter((m) => {
          const exp = String(m.workExp || "").toLowerCase().trim();
          return exp !== "" && exp !== "0" && exp !== "fresher" && exp !== "0 years" && exp !== "unknown" && exp !== "null";
        });
      } else if (location.state.exactExp) {
        initialDisplayData = initialDisplayData.filter((m) => {
          const exp = String(m.workExp || "").trim();
          if (location.state.exactExp === "Unknown") {
            return exp === "" || exp.toLowerCase() === "unknown" || exp === "null";
          }
          return exp === location.state.exactExp;
        });
      } 
      else if (location.state.exactEdu) {
        initialDisplayData = initialDisplayData.filter((m) => {
          const edu = String(m.highest_education || "").trim();
          if (location.state.exactEdu === "Unknown") {
            return edu === "" || edu.toLowerCase() === "unknown" || edu === "null";
          }
          return edu === location.state.exactEdu;
        });
      }
      // ✅ Catch Skill clicks from the dashboard
      else if (location.state.exactSkill) {
        initialDisplayData = initialDisplayData.filter((m) => {
          // Note: Change "m.skills" if your database uses a different field name for skills
          let userSkills = m.skills || []; 
          
          if (typeof userSkills === 'string') {
            userSkills = userSkills.split(',').map(s => s.trim().toLowerCase());
          } else if (Array.isArray(userSkills)) {
            userSkills = userSkills.map(s => String(s).trim().toLowerCase());
          }

          if (location.state.exactSkill === "Unknown") {
            return userSkills.length === 0 || userSkills.includes("unknown");
          }
          
          return userSkills.includes(location.state.exactSkill.toLowerCase());
        });
      }
    }

    setMembersData(initialDisplayData);
    setLoading(false);
  };

  const sortByReferenceNumber = (list = []) =>
    [...list].sort((a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0));

  // --- HELPERS ---
  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  
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
    if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
      fileId = driveUrl;
    }
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
  };

  const calculateAge = (dob) => {
    if (!dob) return;
    const birthDate = parseDOB(dob);
    if (!birthDate || isNaN(birthDate)) return;
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months, days };
  };

  const formatAge = (dob) => {
    const age = calculateAge(dob);
    return age ? `${age.years} years, ${age.months} months` : "—";
  };

  // --- EXPORT LOGIC ---
  const buildExportRows = () => {
    return membersData.map(m => ({
      RefNo: m.memberReferenceNumber || "",
      Name: m.name || "",
      Age: m.age || "",
      Gender: m.gender || "",
      Mobile: m.mobileNumber || "",
      Email: m.email || "",
      District: m.district || "",
      Role: m.memberType || "",
      'Solidarity Member Status': m.symMemberStatus || "",
      Profession: m.profession || "",
      NativeDistrict: m.nativePlace || "",
      Address: m.address || "",
      SeekerNeed: (m.seekerNeed || []).join(", "),
      Education: m.highest_education || "",
      FieldOfStudy: m.fieldofStudy_Interest || "",
      PreferredRole: m.preferredJobRole_Sector || "",
      Experience: m.workExp || "",
      Relocation: m.relocationStatus || "",
      PreferredLocation: m.preferredJobLocation || "",
      ResumeLink: m.resumeLink || "",
      OfferType: (m.jobOfferType || []).join(", "),
      OfferingSector: (m.offeringSector || []).join(", "),
      OpportunityDescription: m.opportunityDescription || "",
      OfferLocation: m.offer_Location || "",
      ContactForSeekers: m.contactForSeekers || "",
      ReferrerStatus: m.referrerStatus || "",
      ReferringOfferType: (m.referringOfferType || []).join(", "),
      ReferringSector: (m.referringSector || []).join(", "),
      ReferringFor: m.referringFor || "",
      LevelOfSupport: (m.levelOfSupport || []).join(", "),
      ReferrerContact: m.referrerContact || "",
      SkillProgram: m.interest_SkillBuildingProgram || "",
      SkillsToImprove: (m.skillsToImprove || []).join(", "),
      GroupTags: (m.forGrouping || []).join(", "),
      CreatedDate: m.timestamp || "",
      SubmittedEmail: m.submittingEmail || "",
    }));
  };

  const exportToExcel = () => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToCSV = () => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Members_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // --- FILTER LOGIC ---
  const membersFilterConfig = {
    labels: {
      name: 'Name', initialNumber: 'Min Age', finalNumber: 'Max Age', district: 'District',
      nDistrict: 'Native District', profession: 'Profession', memberType: 'Member Type', gender: 'Gender', 
      symMemberStatus: 'Solidarity Member Status', seekerNeed: 'Seeker Need', highest_education: 'Highest Education', 
      preferredJobRole_Sector: 'Preferred Job Role', workExp: 'Work Experience', relocationStatus: 'Relocation Status', 
      jobOfferType: 'Job Offer Type', offeringSector: 'Offering Sector', referrerStatus: 'Referrer Status', 
      levelOfSupport: 'Level Of Support', interest_SkillBuildingProgram: 'Skill Program', forGrouping: 'Group Tags'
    },
    fieldTypes: {
      name: 'string', initialNumber: 'number', finalNumber: 'number', district: 'string',
      nDistrict: 'string', profession: 'string', memberType: 'string', gender: 'string', symMemberStatus: 'string', 
      seekerNeed: 'array', highest_education: 'string', preferredJobRole_Sector: 'string', workExp: 'string',
      relocationStatus: 'string', jobOfferType: 'array', offeringSector: 'array', referrerStatus: 'string', 
      levelOfSupport: 'array', interest_SkillBuildingProgram: 'string', forGrouping: 'array'
    },
    formatters: {
      array: (value) => Array.isArray(value) ? value.join(', ') : value,
      number: (value) => value ? value.toString() : '',
    }
  };

  const applyFilters = (filters) => {
    if (!filters || Object.values(filters).every((v) => v === "" || v === null || (Array.isArray(v) && v.length === 0))) {
      setMembersData(allMembers);
      setActiveFilters({});
      setFilterValues({});
      if (location.state) window.history.replaceState({}, document.title);
      return;
    }

    let filtered = [...allMembers];
    const newActiveFilters = {};

    const exactFilters = [
      'name', 'district', 'memberType', 'gender', 'symMemberStatus', 'profession', 
      'highest_education', 'preferredJobRole_Sector', 'workExp', 'relocationStatus', 
      'referrerStatus', 'interest_SkillBuildingProgram'
    ];
    
    exactFilters.forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(p => p[key] === filters[key]);
        newActiveFilters[key] = filters[key];
      }
    });

    if (filters.nDistrict) {
      filtered = filtered.filter(p => p.nativePlace === filters.nDistrict);
      newActiveFilters.nDistrict = filters.nDistrict;
    }

    if (filters.initialNumber !== undefined && filters.initialNumber !== "") {
      filtered = filtered.filter((p) => p.age >= Number(filters.initialNumber));
      newActiveFilters.initialNumber = filters.initialNumber;
    }
    if (filters.finalNumber !== undefined && filters.finalNumber !== "") {
      filtered = filtered.filter((p) => p.age <= Number(filters.finalNumber));
      newActiveFilters.finalNumber = filters.finalNumber;
    }

    const arrayFilters = ['seekerNeed', 'jobOfferType', 'offeringSector', 'levelOfSupport', 'forGrouping'];
    arrayFilters.forEach(key => {
      if (filters[key]?.length) {
        filtered = filtered.filter(p => {
          const memberArray = p[key] || [];
          return filters[key].some(filterValue => memberArray.includes(filterValue));
        });
        newActiveFilters[key] = filters[key];
      }
    });

    const sortedFiltered = sortByReferenceNumber(filtered);
    setMembersData(sortedFiltered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters);
  };

  const clearFilter = (filterKey) => {
    const newActiveFilters = { ...activeFilters };
    const newFilterValues = { ...filterValues };
    delete newActiveFilters[filterKey];
    delete newFilterValues[filterKey];
    setActiveFilters(newActiveFilters);
    setFilterValues(newFilterValues);
    applyFilters(newFilterValues);
  };

  const clearAllFilters = () => {
    setMembersData(allMembers);
    setActiveFilters({});
    setFilterValues({});
    if (location.state) window.history.replaceState({}, document.title);
  };

  // --- CRUD OPERATIONS ---
  const handleEditMember = async (updated) => {
    try {
      const updateList = (list) => list.map((m) => m._id === updated._id ? updated : m);
      setMembersData(prev => updateList(prev));
      setAllMembers(prev => updateList(prev));
      setMemberContext(prev => updateList(prev));
      setEditMember(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
      try {
        await API.delete(`/member/${id}`);
        alert("Member deleted successfully");
        const remaining = allMembers.filter(member => member._id !== id);
        setAllMembers(remaining);
        setMembersData(remaining);
        setMemberContext(remaining);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete member.");
      }
    }
  };

  const handleEdit = (member) => {
    setEditMember({ ...member });
    setShowModal(true);
  };

  const handleRowClick = (row) => {
    navigate(`/member/${row._id}`);
  };

  const handleToggle = (newView) => { 
    setView(newView); 
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) return <div className={styles.app}><div className={styles.loader}></div></div>;

  const districts = unique(allMembers.map((m) => m.district));
  const memberTypes = unique(allMembers.map((m) => m.memberType));
  const highestEducationOptions = unique(allMembers.map((m) => m.highest_education));
  const preferredJobRoleOptions = unique(allMembers.map((m) => m.preferredJobRole_Sector));
  const relocationStatusOptions = unique(allMembers.map((m) => m.relocationStatus));
  const referrerStatusOptions = unique(allMembers.map((m) => m.referrerStatus));

  return (
    <div className={styles.members}>
      {/* HEADER */}
      <div
        className={styles.headerWrapper}
        style={{ left: sidebarWidth + 'px' }}
      >
        <div className={styles.headerContent}>
          <div className={styles.cardSearch}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
          
          <button 
            className={styles.filterToggleButton}
            onClick={toggleFilters}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? <X size={18} /> : <Filter size={18} />}
            <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>

          <div className={styles.exportButtons}>
            <button onClick={exportToExcel} className={`${styles.excel}`}>Export Excel</button>
            <button onClick={exportToCSV} className={`${styles.csv}`}>Export CSV</button>
          </div>
        </div>
      </div>

      <div style={{ height: 120 }}></div>

      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>
              
              <div className={styles.filterField}>
                <label>NAME</label>
                <select
                  value={filterValues.name || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, name: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">Select Name</option>
                  {unique(allMembers.map(m => m.name)).map(name => (
                    <option key={name} value={name}>{name.length > 15 ? `${name.substring(0, 15)}...` : name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>MIN AGE</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filterValues.initialNumber || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, initialNumber: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                />
              </div>

              <div className={styles.filterField}>
                <label>MAX AGE</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterValues.finalNumber || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, finalNumber: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                />
              </div>

              <div className={styles.filterField}>
                <label>DISTRICT</label>
                <select
                  value={filterValues.district || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, district: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district.length > 15 ? `${district.substring(0, 15)}...` : district}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>MEMBER TYPE</label>
                <select
                  value={filterValues.memberType || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, memberType: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">All Types</option>
                  {memberTypes.map(type => (
                    <option key={type} value={type}>
                      {type.length > 15 ? `${type.substring(0, 15)}...` : type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>GENDER</label>
                <select
                  value={filterValues.gender || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, gender: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">All Gender</option>
                  {unique(allMembers.map(m => m.gender)).map(gender => (
                    <option key={gender} value={gender}>
                      {gender.length > 15 ? `${gender.substring(0, 15)}...` : gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>SOLIDARITY STATUS</label>
                <select
                  value={filterValues.symMemberStatus || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, symMemberStatus: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">All Status</option>
                  {unique(allMembers.map(m => m.symMemberStatus)).map(status => (
                    <option key={status} value={status}>
                      {status.length > 15 ? `${status.substring(0, 15)}...` : status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>HIGHEST EDUCATION</label>
                <select
                  value={filterValues.highest_education || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, highest_education: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">Select Highest Education</option>
                  {highestEducationOptions.map(edu => (
                    <option key={edu} value={edu}>
                      {edu.length > 20 ? `${edu.substring(0, 20)}...` : edu}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>PREFERRED JOB ROLE</label>
                <select
                  value={filterValues.preferredJobRole_Sector || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, preferredJobRole_Sector: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">Select Preferred Job Role</option>
                  {preferredJobRoleOptions.map(role => (
                    <option key={role} value={role}>
                      {role.length > 20 ? `${role.substring(0, 20)}...` : role}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>RELOCATION STATUS</label>
                <select
                  value={filterValues.relocationStatus || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, relocationStatus: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">Select Relocation Status</option>
                  {relocationStatusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.length > 20 ? `${status.substring(0, 20)}...` : status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>REFERRER STATUS</label>
                <select
                  value={filterValues.referrerStatus || ''}
                  onChange={(e) => {
                    const newFilters = { ...filterValues, referrerStatus: e.target.value || null };
                    setFilterValues(newFilters);
                    applyFilters(newFilters);
                  }}
                >
                  <option value="">Select Referrer Status</option>
                  {referrerStatusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.length > 20 ? `${status.substring(0, 20)}...` : status}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className={styles.clearAllButton}
                onClick={clearAllFilters}
              >
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL & STATUS BAR */}
      <AddMember
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditMember(null); }}
        onSuccess={handleEditMember}
        editMember={editMember}
      />

      <FilterStatus
        activeFilters={activeFilters}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
        filterConfig={membersFilterConfig}
        data-page-type="members"
      />

      {/* CONTENT VIEWS */}
      {view === 'table' ? (
        <div className={styles.tableView}>
          <DataTable 
            data={membersData} 
            columns={memberColumns} 
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} 
            onRowClick={handleRowClick} 
          />
        </div>
      ) : (
        <div className={styles.cardView}>
          <div className={styles.membersList}>
            {membersData.filter(member => {
              const search = globalFilter?.toLowerCase() || '';
              return (
                member.name?.toLowerCase().includes(search) ||
                member.email?.toLowerCase().includes(search) ||
                member.profession?.toLowerCase().includes(search) ||
                member.personalEmail?.toLowerCase().includes(search) ||
                member.mobileNumber?.toLowerCase().includes(search) ||
                member.memberReferenceNumber?.toString().includes(search)
              );
            }).map((member) => (
              <CustomCard key={member._id} className={styles.memberCard} hover>
                <div className={styles.memberHeader}>
                  <img
                    onClick={() => navigate(`/member/${member._id}`)}
                    src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                    alt={member.name}
                    className={styles.avatar}
                    onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                  />
                  <div className={styles.memberInfo} onClick={() => navigate(`/member/${member._id}`)}>
                    <h3>{member.name}</h3>
                    <p>{member.memberType}</p>
                  </div>
                  {user?.role === 'Admin' && (
                    <div className={styles.memberActions}>
                      <button className={styles.editButton} onClick={() => handleEdit(member)} title="Edit member">
                        <Edit size={16} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(member._id)} title="Delete member">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div onClick={() => navigate(`/member/${member._id}`)} className={styles.memberDetails}>
                  <div><p>Ref No: {member.memberReferenceNumber}</p></div>
                  <div><Mail size={16} /> {member.email}</div>
                  <div><Phone size={16} /> {member.mobileNumber}</div>
                  <div><Calendar size={16} /> {member.age || formatAge(member.dob)}</div>
                  <div><Building size={16} /> {member.district}</div>
                </div>
              </CustomCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;