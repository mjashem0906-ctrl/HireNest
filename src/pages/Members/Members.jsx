import React, { useEffect, useState } from 'react';
import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2,ListFilter, Search } from 'lucide-react';
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import styles from './Members.module.scss';
import CustomCard from '../../components/UI/CustomCard';
import {  useNavigate } from "react-router-dom";
import DataTable from '../../components/Table/DataTable';
import API from '../../axios';
import Filter from '../../components/Filter/Filter';
import AddMember from '../../components/Models/AddMember'
import { useData } from '../../context/DataContext';
import FilterStatus from '../../components/Filter/FIlterStatus';
import { parseDOB } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Members() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar

  const memberColumns = [
  { accessorKey: 'memberReferenceNumber', header: 'Ref. No', enableResizing: true, size: 100 },
  { accessorKey: 'name', header: 'Name', enableResizing: true, size: 200  },
  { accessorKey: 'memberType', header: 'Member Type', enableResizing: true, size: 160  },
  { accessorKey: 'symMemberStatus', header: 'Member Status', enableResizing: true, size: 160  },
  { accessorKey: 'gender', header: 'Gender', enableResizing: true, size: 100  },
  { accessorKey: 'age', header: 'Age', enableResizing: true, size: 70  },
  { accessorKey: 'district', header: 'District', enableResizing: true, size: 150  },
];

    const [allMembers,setAllMembers] = useState([]); //All data
    const [membersData, setMembersData]=useState([]); // Filtered Data
    const [view, setView] = useState('card');
    const [globalFilter, setGlobalFilter] = useState('');
    const [editMember, setEditMember] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
    const [filterValues,setFilterValues] = useState({});//for two way filter change
    const {memberContext,setMemberContext} = useData(); // get all Member data from data context (Initial fetch during login)
    const {user} = useAuth();
        useEffect(() => {
          fetchData();
          }, [memberContext]);

    const fetchData = async()=>{
      const member = await memberContext.sort((a,b)=>a.memberReferenceNumber-b.memberReferenceNumber)
      setMembersData(member);
      setAllMembers(memberContext);
      setLoading(false);
      
    }
 //Filter the subtasks based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setMembersData(allMembers); // ✅ show all again
           setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allMembers];
         const newActiveFilters = {};
        if (filters.name) {
          filtered = filtered.filter(
            (p) => p.name === filters.name
          );
          newActiveFilters.name = filters.name;
        }

         if (filters.initialNumber !== undefined && filters.initialNumber !== "") {
    filtered = filtered.filter((p) => p.age >= Number(filters.initialNumber));
    newActiveFilters.initialNumber = filters.initialNumber;
  }

  if (filters.finalNumber !== undefined && filters.finalNumber !== "") {
    filtered = filtered.filter((p) => p.age <= Number(filters.finalNumber));
    newActiveFilters.finalNumber = filters.finalNumber;
  }
        
        if (filters.district) {
          filtered = filtered.filter(
            (p) => p.district === filters.district
          );
          newActiveFilters.district = filters.district;
        }

        if (filters.nDistrict) {
          filtered = filtered.filter(
            (p) => p.nativePlace === filters.nDistrict
          );
          newActiveFilters.nDistrict = filters.nDistrict;
        }
        if (filters.profession) {
          filtered = filtered.filter(
            (p) => p.profession === filters.profession
          );
          newActiveFilters.profession = filters.profession;
        }
        
        if (filters.memberType) {
          filtered = filtered.filter(
            (p) => p.memberType === filters.memberType
          );
          newActiveFilters.memberType = filters.memberType;
        }
        if (filters.forGrouping && filters.forGrouping.length > 0) {
          filtered = filtered.filter(
            (p) =>
              Array.isArray(p.forGrouping) &&
              p.forGrouping.some((tag) => filters.forGrouping.includes(tag))
          );
           newActiveFilters.forGrouping = filters.forGrouping;
        }
      
        setMembersData(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters);
      };

      // Filter configuration for members
  const membersFilterConfig = {
    labels: {
      name: 'Name',
      initialNumber: 'Min Age',
      finalNumber: 'Max Age',
      district: 'District',
      nDistrict: 'Native District',
      profession: 'Profession',
      memberType: 'Member Type',
      forGrouping: 'Member Skill'
    },
    fieldTypes: {
      name: 'string',
      initialNumber: 'number',
      finalNumber: 'number',
      district: 'string',
      nDistrict: 'string',
      profession: 'string',
      memberType: 'string',
      forGrouping: 'array'
    },
    formatters: {
      array: (value) => {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      },
      number: (value) => {
        return value ? value.toString() : '';
      }
    }
  };


        // Clear individual filter
  const clearFilter = (filterKey) => {
    const newActiveFilters = { ...activeFilters };
    const newFilterValues = { ...filterValues };
    
    delete newActiveFilters[filterKey];
    delete newFilterValues[filterKey];
    
    setActiveFilters(newActiveFilters);
    setFilterValues(newFilterValues);
    
    applyFilters(newFilterValues);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setMembersData(allMembers);
    setActiveFilters({});
    setFilterValues({});
  };

    const handleToggle = (newView) => {setView(newView); };

   const handleEditMember = async(updated) => {
     try {
        setMembersData(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
        setAllMembers(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
        setMemberContext(prev =>
          prev.map((member) => member._id === updated._id ? updated : member)
        );
      setEditMember(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

   const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
      try {
        // ---------------------------------------------------------
        // ✅ STEP 1: Send the delete command to the Backend
        // NOTE: Check your server.js to see if this should be '/members' or '/user'
        // Since your route is router.delete("/:id"), we just need the base + id
        // ---------------------------------------------------------
        await API.delete(`/member/${id}`); 
        
        // ✅ STEP 2: If Backend succeeds, update the Frontend
        alert("Member deleted successfully");

        // Update all states to remove the deleted member locally
        const remainingMembers = allMembers.filter(member => member._id !== id);
        setAllMembers(remainingMembers);
        setMembersData(remainingMembers); // Update current view
        setMemberContext(remainingMembers); // Update context
           
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete member. Please check your connection.");
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

const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;

  let fileId = null;

  // Case 1: id= in query params (open?id=FILE_ID, uc?id=FILE_ID, etc.)
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];

  // Case 2: /d/{fileId}/ in path
  if (!fileId) {
    match = driveUrl.match(/\/d\/([^/]+)/);
    if (match) fileId = match[1];
  }

  // Case 3: uc?id=FILE_ID format
  if (!fileId) {
    match = driveUrl.match(/uc\?id=([^&]+)/);
    if (match) fileId = match[1];
  }

  // Case 4: direct fileId pasted (25+ chars, alphanumeric + _-)
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
    fileId = driveUrl;
  }

  // If still not found, return original link
  if (!fileId) return driveUrl;

  // Default: always return a working thumbnail link
  return `https://drive.google.com/thumbnail?id=${fileId}`;
};

const unique = (arr) => [...new Set(arr.filter(Boolean))]; // Removes duplicates & empty

const districts = unique(allMembers.map((m) => m.district)).sort((a,b)=> a.localeCompare(b));
const professions = unique(allMembers.map((m) => m.profession)).sort((a,b)=> a.localeCompare(b));
const memberTypes = unique(allMembers.map((m) => m.memberType)).sort((a,b)=> a.localeCompare(b));
const groupTags = unique(allMembers.flatMap((m) => m.forGrouping || []).filter(Boolean)).sort((a,b)=> a.localeCompare(b));
const buildExportRows = () => {
  return membersData.map(m => ({
    // Core
    memberReferenceNumber: m.memberReferenceNumber || "",
    timestamp: m.timestamp || "",
    name: m.name || "",
    age: m.age || "",
    gender: m.gender || "",
    mobileNumber: m.mobileNumber || "",
    email: m.email || "",
    district: m.district || "",
    symMemberStatus: m.symMemberStatus || "",
    memberType: m.memberType || "",

    // Job Seeker
    seekerNeed: (m.seekerNeed || []).join(", "),
    highest_education: m.highest_education || "",
    fieldofStudy_Interest: m.fieldofStudy_Interest || "",
    preferredJobRole_Sector: m.preferredJobRole_Sector || "",
    workExp: m.workExp || "",
    relocationStatus: m.relocationStatus || "",
    preferredJobLocation: m.preferredJobLocation || "",
    resumeLink: m.resumeLink || "",
    declaration_Seeker: m.declaration_Seeker || "",

    // Opportunity Provider
    jobOfferType: (m.jobOfferType || []).join(", "),
    offeringSector: (m.offeringSector || []).join(", "),
    opportunityDescription: m.opportunityDescription || "",
    offer_Location: m.offer_Location || "",
    contactForSeekers: m.contactForSeekers || "",
    declaration_Recruiter: m.declaration_Recruiter || "",

    // Referee
    referrerStatus: m.referrerStatus || "",
    referringOfferType: (m.referringOfferType || []).join(", "),
    referringSector: (m.referringSector || []).join(", "),
    referringFor: m.referringFor || "",
    levelOfSupport: (m.levelOfSupport || []).join(", "),
    referrerContact: m.referrerContact || "",
    declaration_Referee: m.declaration_Referee || "",

    // Upskiller
    interest_SkillBuildingProgram: m.interest_SkillBuildingProgram || "",
    skillsToImprove: (m.skillsToImprove || []).join(", "),
    declaration_Upskiller: m.declaration_Upskiller || "",
    submittingEmail: m.submittingEmail || "",
  }));
};

const exportToExcel = () => {
  const data = buildExportRows();

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new Blob([buffer], { type: "application/octet-stream" });

  saveAs(file, `Members_Full_${new Date().toISOString().slice(0,10)}.xlsx`);
};

const exportToCSV = () => {
  const data = buildExportRows();
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `Members_Full_${new Date().toISOString().slice(0,10)}.csv`);
};
if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    
    <div className={styles.members}>
<div
  className={styles.headerWrapper}
  style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
>
 <div className={styles.headerContent}>
    {/* Global Filter Input */}
    <div className={styles.cardSearch}>
      <Search size={20} />
      <input
        type="text"
        placeholder="Search..."
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
    </div>

    <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
    <div className={styles.exportButtons}>
      <button onClick={exportToExcel}>Export Excel</button>
      <button onClick={exportToCSV}>Export CSV</button>
    </div>

    <Filter
      fields={[
        { name: "name", label: "Name", type: "select", options: allMembers.map(member => member.name) },
        { name: "initialNumber", label: "Min Age", type: "initialNumber" },
        { name: "finalNumber", label: "Max Age", type: "finalNumber" },
        { name: "district", label: "District", type: "select", options: districts },
        { name: "memberType", label: "Member Type", type: "select", options: memberTypes },
      ]}
      onApplyFilters={(filters) => applyFilters(filters)}
      initialValues={filterValues}
    />
  </div>
</div>

      <div style={{height:120}}></div>
       <AddMember
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMember(null);
        }}
        onEdit={handleEditMember}
        editMember={editMember}
      />
        {view === 'table' &&
                <div className={styles.tableView}>
                  {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={membersFilterConfig}
                data-page-type="members"
              />

                  <DataTable data={membersData}  columns={memberColumns} globalFilter={globalFilter}
                    onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick} />
                </div>
              }

        {view === 'card' &&
        (
      <div className={styles.cardView}>
             {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={membersFilterConfig}
                data-page-type="members"
              />

        <div className={styles.membersList}>
          {membersData.filter(member => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            member.name?.toLowerCase().includes(search) ||
            member.profession?.toLowerCase().includes(search) ||
            member.personalEmail?.toLowerCase().includes(search) ||
            member.mobileNumber?.toLowerCase().includes(search) ||
            member.memberReferenceNumber?.toString().includes(search)
          );
        }).map((member) => 
                   (
            
            
            <CustomCard key={member._id} className={styles.memberCard} hover >
              
              <div className={styles.memberHeader} >
                    
                  <img onClick={()=>{navigate(`/member/${member._id}`)}}
                      src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                      alt={member.name}
                      className={styles.avatar}
                      onError={(e) => {
                        e.target.src = "/members/AnonymousImage.jpg";
                      }}
                    />
            
                
                <div className={styles.memberInfo} onClick={()=>{navigate(`/member/${member._id}`)}}>
                  <h3>{member.name}</h3>
                  <p>{member.memberType}</p>
                </div>
                {user?.role === 'Admin' && (
                <div className={styles.memberActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(member)}
                    title="Edit member"
                  >
                    <Edit size={16} />
                  </button> 
                
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(member._id)}
                    title="Delete member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>)}
              </div>
              <div onClick={()=>{navigate(`/member/${member._id}`)}} >
              <div className={styles.memberDetails}>
                <div><p>Ref No: {member.memberReferenceNumber}</p></div>
                <div><Mail size={16} /> {member.email}</div>
                <div><Phone size={16} /> {member.mobileNumber}</div>
                <div><Calendar size={16} />{member.age}</div>
                <div><Building size={16} /> {member.district}</div>
              </div>
              </div>
            </CustomCard>
          ))}

        </div>
        </div>
        
       ) }
        

      
        </div>  
  )
}

export default Members