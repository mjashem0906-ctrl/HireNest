// //--------------------------------------20/01-------------1.54------

// import React, { useEffect, useState } from 'react';
// import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2, ListFilter, Search } from 'lucide-react';
// import { useNavigate, useOutletContext } from "react-router-dom";
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // Components
// import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
// import CustomCard from '../../components/UI/CustomCard';
// import DataTable from '../../components/Table/DataTable';
// import Filter from '../../components/Filter/Filter';
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

//   if (loading) return <div className={styles.app}><div className={styles.loader}></div></div>;

//   // Prepare filter options
//   const districts = unique(allMembers.map((m) => m.district));
//   const professions = unique(allMembers.map((m) => m.profession));
//   const memberTypes = unique(allMembers.map((m) => m.memberType));
//   const groupTags = unique(allMembers.flatMap((m) => m.forGrouping || []).filter(Boolean));

//   return (
//     <div className={styles.members}>
//       {/* HEADER */}
//       <div
//   className={styles.headerWrapper}
//   style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
// >
//  <div className={styles.headerContent}>
//     {/* Global Filter Input */}
//     <div className={styles.cardSearch}>
//       <Search size={20} />
//       <input
//         type="text"
//         placeholder="Search members..."
//         value={globalFilter || ''}
//         onChange={(e) => setGlobalFilter(e.target.value)}
//       />
//     </div>

//     <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
//     <div className={styles.exportButtons}>
//       <button onClick={exportToExcel} className={`${styles.excel}`}>
//           Export Excel
//       </button>
//       <button onClick={exportToCSV} className={`${styles.csv}`}>
//           Export CSV
//       </button>
//       </div>

//     <Filter
//       fields={[
//         { name: "name", label: "Name", type: "select", options: unique(allMembers.map(m => m.name)) },
//         { name: "initialNumber", label: "Min Age", type: "initialNumber" },
//         { name: "finalNumber", label: "Max Age", type: "finalNumber" },
//         { name: "district", label: "District", type: "select", options: districts },
//         { name: "memberType", label: "Member Type", type: "select", options: memberTypes },
//         { name: "gender", label: "Gender", type: "select", options: unique(allMembers.map(m => m.gender)) },
//         { name: "symMemberStatus", label: "Solidarity Member Status", type: "select", options: unique(allMembers.map(m => m.symMemberStatus)) },
//         { name: "highest_education", label: "Highest Education", type: "select", options: unique(allMembers.map(m => m.highest_education)) },
//         { name: "preferredJobRole_Sector", label: "Preferred Job Role", type: "select", options: unique(allMembers.map(m => m.preferredJobRole_Sector)) },
//         { name: "relocationStatus", label: "Relocation Status", type: "select", options: unique(allMembers.map(m => m.relocationStatus)) },
//         { name: "referrerStatus", label: "Referrer Status", type: "select", options: unique(allMembers.map(m => m.referrerStatus)) },
//         // { name: "levelOfSupport", label: "Level Of Support", type: "multiSelect", options: unique(allMembers.flatMap(m => m.levelOfSupport || [])) },
//       ]}
//       onApplyFilters={applyFilters}
//       initialValues={filterValues}
//     />

//   </div>
// </div>

//       <div style={{ height: 120 }}></div>

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

//--------------------------------------20/01-------------1.54------

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2, ListFilter, Search, X } from 'lucide-react';
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Select from 'react-select';

// Components
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import CustomCard from '../../components/UI/CustomCard';
import DataTable from '../../components/Table/DataTable';
import AddMember from '../../components/Models/AddMember';

// Context & Utils
import API from '../../axios';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { parseDOB } from '../../utils/dateUtils';
import styles from './Members.module.scss';

// Constants
const MEMBER_COLUMNS = [
  { accessorKey: 'memberReferenceNumber', header: 'Ref. No', enableResizing: true, size: 100 },
  { accessorKey: 'name', header: 'Name', enableResizing: true, size: 200 },
  { accessorKey: 'memberType', header: 'Member Type', enableResizing: true, size: 160 },
  { accessorKey: 'symMemberStatus', header: 'Solidarity Member Status', enableResizing: true, size: 160 },
  { accessorKey: 'gender', header: 'Gender', enableResizing: true, size: 100 },
  { accessorKey: 'age', header: 'Age', enableResizing: true, size: 70 },
  { accessorKey: 'district', header: 'District', enableResizing: true, size: 150 },
];

const FILTER_CONFIG = {
  labels: {
    name: 'Name', 
    initialNumber: 'Min Age', 
    finalNumber: 'Max Age', 
    district: 'District',
    nDistrict: 'Native District',
    profession: 'Profession',
    memberType: 'Member Type', 
    gender: 'Gender', 
    symMemberStatus: 'Solidarity Member Status',
    seekerNeed: 'Seeker Need', 
    highest_education: 'Highest Education', 
    preferredJobRole_Sector: 'Preferred Job Role',
    workExp: 'Work Experience', 
    relocationStatus: 'Relocation Status', 
    jobOfferType: 'Job Offer Type',
    offeringSector: 'Offering Sector', 
    referrerStatus: 'Referrer Status', 
    levelOfSupport: 'Level Of Support',
    interest_SkillBuildingProgram: 'Skill Program',
    forGrouping: 'Group Tags'
  },
  fieldTypes: {
    name: 'string', 
    initialNumber: 'number', 
    finalNumber: 'number', 
    district: 'string',
    nDistrict: 'string',
    profession: 'string',
    memberType: 'string', 
    gender: 'string', 
    symMemberStatus: 'string', 
    seekerNeed: 'array',
    highest_education: 'string', 
    preferredJobRole_Sector: 'string', 
    workExp: 'string',
    relocationStatus: 'string', 
    jobOfferType: 'array', 
    offeringSector: 'array',
    referrerStatus: 'string', 
    levelOfSupport: 'array', 
    interest_SkillBuildingProgram: 'string',
    forGrouping: 'array'
  },
  formatters: {
    array: (value) => Array.isArray(value) ? value.join(', ') : value,
    number: (value) => value ? value.toString() : '',
  }
};

// Custom Select Styles
const CUSTOM_SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    fontSize: '13px',
    borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '34px',
    padding: '0 8px',
    alignItems: 'center',
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '13px',
    margin: 0,
    lineHeight: '1',
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '13px',
    margin: 0,
    lineHeight: '1',
    color: '#9ca3af',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: '13px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '34px',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    marginTop: '8px',
    marginBottom: '8px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '6px',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '6px',
  }),
  menu: (base) => ({
    ...base,
    fontSize: '13px',
    zIndex: 9999,
    minWidth: '180px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '13px',
    padding: '8px 12px',
    minHeight: '36px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  }),
};

// Helper Functions
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

// FilterBar Component
const FilterBar = React.memo(({
  filterConfig,
  uniqueValues,
  activeFilters,
  pendingFilters,
  filterValues,
  getDisplayValue,
  onFilterChange,
  onResetFilter,
  onApplyPendingFilters,
  onCancelPendingFilters,
  onClearAllFilters,
  hasPendingChanges
}) => {
  const getSelectOptions = (values, allLabel) => [
    { value: '', label: allLabel },
    ...values.map(value => ({ value, label: value }))
  ];

  const renderFilterField = (fieldName, label, options, allLabel) => (
    <div className={styles.filterField} key={fieldName}>
      <label className={styles.filterLabel}>{label}</label>
      <div className={styles.selectContainer}>
        <Select
          options={getSelectOptions(options, allLabel)}
          value={getDisplayValue(fieldName) ? { 
            value: getDisplayValue(fieldName), 
            label: getDisplayValue(fieldName) 
          } : { value: '', label: allLabel }}
          onChange={(selected) => onFilterChange(fieldName, selected?.value || "")}
          isSearchable
          isClearable
          placeholder={`Search ${label.toLowerCase()}...`}
          styles={CUSTOM_SELECT_STYLES}
          className={styles.reactSelect}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {pendingFilters[fieldName] !== undefined && pendingFilters[fieldName] !== filterValues[fieldName] && (
          <button 
            className={styles.resetFilterButton}
            onClick={() => onResetFilter(fieldName)}
            title="Reset to previous value"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );

  const renderNumberFilter = (fieldName, label, placeholder, min = 0) => (
    <div className={styles.filterField} key={fieldName}>
      <label className={styles.filterLabel}>{label}</label>
      <div className={styles.inputContainer}>
        <input
          type="number"
          placeholder={placeholder}
          value={getDisplayValue(fieldName) ?? ""}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : "";
            onFilterChange(fieldName, value);
          }}
          min={min}
        />
        {pendingFilters[fieldName] !== undefined && pendingFilters[fieldName] !== filterValues[fieldName] && (
          <button 
            className={styles.resetFilterButton}
            onClick={() => onResetFilter(fieldName)}
            title="Reset to previous value"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.horizontalFilterBar}>
      <div className={styles.filterScrollContainer}>
        <div className={styles.filterRow}>
          {renderFilterField('name', 'NAME', uniqueValues.names, 'All Names')}
          {renderNumberFilter('initialNumber', 'MIN AGE', 'Min', 0)}
          {renderNumberFilter('finalNumber', 'MAX AGE', 'Max', 
            getDisplayValue('initialNumber') !== "" ? getDisplayValue('initialNumber') : 0
          )}
          {renderFilterField('district', 'DISTRICT', uniqueValues.districts, 'All Districts')}
          {renderFilterField('memberType', 'MEMBER TYPE', uniqueValues.memberTypes, 'All Types')}
          {renderFilterField('gender', 'GENDER', uniqueValues.genders, 'All Genders')}
          {renderFilterField('symMemberStatus', 'SOLIDARITY STATUS', uniqueValues.statuses, 'All Status')}
          {renderFilterField('highest_education', 'HIGHEST EDUCATION', uniqueValues.educations, 'All Education')}
          {renderFilterField('preferredJobRole_Sector', 'PREFERRED ROLE', uniqueValues.roles, 'All Roles')}
          {renderFilterField('relocationStatus', 'RELOCATION', uniqueValues.relocations, 'All Status')}
          {renderFilterField('referrerStatus', 'REFERRER STATUS', uniqueValues.referrerStatuses, 'All Status')}
        </div>
      </div>

      {/* Pending filter actions */}
      {hasPendingChanges() && (
        <div className={styles.pendingActions}>
          <button 
            className={styles.applyButton}
            onClick={onApplyPendingFilters}
          >
            Apply Filters
          </button>
          <button 
            className={styles.cancelButton}
            onClick={onCancelPendingFilters}
          >
            Cancel
          </button>
          <span className={styles.pendingCount}>
            {Object.keys(pendingFilters).length} pending change(s)
          </span>
        </div>
      )}

      {/* Clear All Filters Button */}
      {(Object.keys(activeFilters).length > 0 || hasPendingChanges()) && (
        <div className={styles.clearAllContainer}>
          <button 
            className={styles.clearAllButton} 
            onClick={onClearAllFilters}
            title="Clear all filters"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

// MemberCard Component
const MemberCard = React.memo(({ member, user, onEdit, onDelete, onNavigate }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/member/${member._id}`);
  };

  return (
    <CustomCard className={styles.memberCard} hover>
      <div className={styles.memberHeader}>
        <img
          onClick={handleCardClick}
          src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
          alt={member.name}
          className={styles.avatar}
          onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
        />
        <div className={styles.memberInfo} onClick={handleCardClick}>
          <h3>{member.name}</h3>
          <p>{member.memberType}</p>
        </div>
        {user?.role === 'Admin' && (
          <div className={styles.memberActions}>
            <button className={styles.editButton} onClick={() => onEdit(member)} title="Edit member">
              <Edit size={16} />
            </button>
            <button className={styles.deleteButton} onClick={() => onDelete(member._id)} title="Delete member">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <div onClick={handleCardClick} className={styles.memberDetails}>
        <div><p>Ref No: {member.memberReferenceNumber}</p></div>
        <div><Mail size={16} /> {member.email}</div>
        <div><Phone size={16} /> {member.mobileNumber}</div>
        <div><Calendar size={16} /> {member.age || formatAge(member.dob)}</div>
        <div><Building size={16} /> {member.district}</div>
      </div>
    </CustomCard>
  );
});

MemberCard.displayName = 'MemberCard';

// Main Members Component
function Members() {
  const outletContext = useOutletContext();
  const sidebarCollapsed = outletContext ? outletContext.sidebarCollapsed : false;
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const navigate = useNavigate();
  const { memberContext, setMemberContext } = useData();
  const { user } = useAuth();

  // State
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [view, setView] = useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});
  const [pendingFilters, setPendingFilters] = useState({});
  const [headerHeight, setHeaderHeight] = useState(280);
  const headerRef = useRef(null);

  // Memoized values
  const uniqueValues = useMemo(() => {
    const getUnique = (key) => [...new Set(allMembers.map(m => m[key]).filter(Boolean))].sort();
    return {
      districts: getUnique('district'),
      professions: getUnique('profession'),
      memberTypes: getUnique('memberType'),
      genders: getUnique('gender'),
      statuses: getUnique('symMemberStatus'),
      educations: getUnique('highest_education'),
      roles: getUnique('preferredJobRole_Sector'),
      relocations: getUnique('relocationStatus'),
      referrerStatuses: getUnique('referrerStatus'),
      names: getUnique('name'),
    };
  }, [allMembers]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [memberContext]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height + 20);
      }
    };

    updateHeaderHeight();
    const timer = setTimeout(updateHeaderHeight, 100);
    return () => clearTimeout(timer);
  }, [activeFilters, pendingFilters, view, sidebarWidth]);

  // Data fetching
  const fetchData = useCallback(() => {
    const sortedMembers = sortByReferenceNumber(memberContext);
    setAllMembers(sortedMembers);
    setFilteredMembers(sortedMembers);
    setLoading(false);
  }, [memberContext]);

  const sortByReferenceNumber = useCallback((list = []) => 
    [...list].sort((a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0)),
    []
  );

  // Export functions
  const buildExportRows = useCallback(() => {
    return filteredMembers.map(m => ({
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
  }, [filteredMembers]);

  const exportToExcel = useCallback(() => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [buildExportRows]);

  const exportToCSV = useCallback(() => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Members_${new Date().toISOString().slice(0, 10)}.csv`);
  }, [buildExportRows]);

  // Filter functions
  const applyFilters = useCallback((filters) => {
    if (!filters || Object.values(filters).every(v => v === "" || v === null || (Array.isArray(v) && v.length === 0))) {
      setFilteredMembers(allMembers);
      setActiveFilters({});
      setFilterValues({});
      setPendingFilters({});
      return;
    }

    let filtered = [...allMembers];
    const newActiveFilters = {};

    // Apply exact match filters
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

    // Native district filter
    if (filters.nDistrict) {
      filtered = filtered.filter(p => p.nativePlace === filters.nDistrict);
      newActiveFilters.nDistrict = filters.nDistrict;
    }

    // Age range filter
    if (filters.initialNumber !== undefined && filters.initialNumber !== "") {
      filtered = filtered.filter(p => p.age >= Number(filters.initialNumber));
      newActiveFilters.initialNumber = filters.initialNumber;
    }
    if (filters.finalNumber !== undefined && filters.finalNumber !== "") {
      filtered = filtered.filter(p => p.age <= Number(filters.finalNumber));
      newActiveFilters.finalNumber = filters.finalNumber;
    }

    // Array filters
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
    setFilteredMembers(sortedFiltered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters);
    setPendingFilters({});
  }, [allMembers, sortByReferenceNumber]);

  const clearFilter = useCallback((filterKey) => {
    const newActiveFilters = { ...activeFilters };
    const newFilterValues = { ...filterValues };
    const newPendingFilters = { ...pendingFilters };
    
    delete newActiveFilters[filterKey];
    delete newFilterValues[filterKey];
    delete newPendingFilters[filterKey];
    
    setActiveFilters(newActiveFilters);
    setFilterValues(newFilterValues);
    setPendingFilters(newPendingFilters);
    applyFilters(newFilterValues);
  }, [activeFilters, filterValues, pendingFilters, applyFilters]);

  const clearAllFilters = useCallback(() => {
    setFilteredMembers(allMembers);
    setActiveFilters({});
    setFilterValues({});
    setPendingFilters({});
  }, [allMembers]);

  const handleFilterChange = useCallback((name, value) => {
    setPendingFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const applyPendingFilters = useCallback(() => {
    const newFilters = { ...filterValues, ...pendingFilters };
    applyFilters(newFilters);
  }, [filterValues, pendingFilters, applyFilters]);

  const cancelPendingFilters = useCallback(() => {
    setPendingFilters({});
  }, []);

  const resetFilter = useCallback((name) => {
    const newPendingFilters = { ...pendingFilters };
    delete newPendingFilters[name];
    setPendingFilters(newPendingFilters);
    
    if (!filterValues[name]) {
      const newFilterValues = { ...filterValues };
      delete newFilterValues[name];
      setFilterValues(newFilterValues);
    }
  }, [pendingFilters, filterValues]);

  const hasPendingChanges = useCallback(() => {
    return Object.keys(pendingFilters).length > 0;
  }, [pendingFilters]);

  const getDisplayValue = useCallback((fieldName) => {
    if (pendingFilters[fieldName] !== undefined) {
      return pendingFilters[fieldName];
    }
    return filterValues[fieldName] || "";
  }, [pendingFilters, filterValues]);

  // CRUD operations
  const handleEditMember = useCallback(async (updated) => {
    try {
      const updateList = (list) => list.map(m => m._id === updated._id ? updated : m);
      setFilteredMembers(prev => updateList(prev));
      setAllMembers(prev => updateList(prev));
      setMemberContext(prev => updateList(prev));
      setEditMember(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  }, [setMemberContext]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
      try {
        await API.delete(`/member/${id}`);
        alert("Member deleted successfully");
        const remaining = allMembers.filter(member => member._id !== id);
        setAllMembers(remaining);
        setFilteredMembers(remaining);
        setMemberContext(remaining);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete member.");
      }
    }
  }, [allMembers, setMemberContext]);

  const handleEdit = useCallback((member) => {
    setEditMember({ ...member });
    setShowModal(true);
  }, []);

  const handleRowClick = useCallback((row) => {
    navigate(`/member/${row._id}`);
  }, [navigate]);

  const handleToggle = useCallback((newView) => { 
    setView(newView); 
  }, []);

  // Filter search results
  const searchedMembers = useMemo(() => {
    const search = globalFilter?.toLowerCase() || '';
    if (!search) return filteredMembers;
    
    return filteredMembers.filter(member => {
      return (
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.profession?.toLowerCase().includes(search) ||
        member.personalEmail?.toLowerCase().includes(search) ||
        member.mobileNumber?.toLowerCase().includes(search) ||
        member.memberReferenceNumber?.toString().includes(search)
      );
    });
  }, [filteredMembers, globalFilter]);

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.members}>
      {/* Fixed Header */}
      <div
        ref={headerRef}
        className={styles.headerWrapper}
        style={{ 
          left: sidebarWidth + 'px',
          width: `calc(100% - ${sidebarWidth}px)` 
        }}
      >
        <div className={styles.headerContent}>
          {/* Top Row */}
          <div className={styles.topRow}>
            {/* Search Bar - Left */}
            <div className={styles.cardSearch}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search members..."
                value={globalFilter || ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            {/* View Toggle - Centered */}
            <div className={styles.viewToggleContainer}>
              <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
            </div>

            {/* Export Buttons - Right */}
            <div className={styles.exportButtons}>
              <button onClick={exportToExcel} className={`${styles.excel}`}>
                Export Excel
              </button>
              <button onClick={exportToCSV} className={`${styles.csv}`}>
                Export CSV
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filterConfig={FILTER_CONFIG}
            uniqueValues={uniqueValues}
            activeFilters={activeFilters}
            pendingFilters={pendingFilters}
            filterValues={filterValues}
            getDisplayValue={getDisplayValue}
            onFilterChange={handleFilterChange}
            onResetFilter={resetFilter}
            onApplyPendingFilters={applyPendingFilters}
            onCancelPendingFilters={cancelPendingFilters}
            onClearAllFilters={clearAllFilters}
            hasPendingChanges={hasPendingChanges}
          />
        </div>
      </div>

      {/* Spacer */}
      <div 
        className={styles.headerSpacer} 
        style={{ height: `${headerHeight}px` }}
      />

      {/* Modal */}
      <AddMember
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditMember(null); }}
        onSuccess={handleEditMember}
        editMember={editMember}
      />

      {/* Content Views */}
      {view === 'table' ? (
        <div className={styles.tableView}>
          <DataTable 
            data={filteredMembers} 
            columns={MEMBER_COLUMNS} 
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} 
            onRowClick={handleRowClick} 
          />
        </div>
      ) : (
        <div className={styles.cardView}>
          <div className={styles.membersList}>
            {searchedMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNavigate={handleRowClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;