// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Plus, Search, Download, Briefcase, Building, Building2, UserCircle, Trash2, Mail, Phone, Link2, CheckCircle2, Share2, Filter, X
// } from 'lucide-react';
// import AddRecruiterModal from './AddRecruiterModal';
// import styles from './RecruitersPage.module.scss';
// import FilterStatus from '../../components/Filter/FIlterStatus';

// const RecruitersPage = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [recruiters, setRecruiters] = useState([]); 
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [linkCopied, setLinkCopied] = useState(false);
//   const [showFilters, setShowFilters] = useState(true);
//   const [filterValues, setFilterValues] = useState({
//     department: '',
//     designation: '',
//     location: '',
//     companyName: '',
//     registeredVia: '',
//   });
//   const [activeFilters, setActiveFilters] = useState({});
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (location.state?.openAddModal) {
//       setIsModalOpen(true);
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state]);

//   const fetchRecruiters = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
//       setRecruiters(response.data);
//     } catch (error) {
//       console.error("Error fetching recruiters:", error);
//     } finally {
//       setTimeout(() => setLoading(false), 500); // Small delay for smooth animation transition
//     }
//   };

//   const handleDelete = async (e, id) => {
//     e.stopPropagation(); // Prevent navigation to details
//     if (window.confirm("Are you sure you want to permanently remove this recruiter?")) {
//       try {
//         await axios.delete(`${import.meta.env.VITE_API_URL}/api/recruiters/${id}`);
//         fetchRecruiters(); // Refresh list after deletion
//       } catch (error) {
//         console.error("Error deleting recruiter:", error);
//         alert("Could not delete recruiter. Please try again.");
//       }
//     }
//   };

//   const handleCopyLink = () => {
//     const shareUrl = `${window.location.origin}/recruiters/add`;
//     navigator.clipboard.writeText(shareUrl).then(() => {
//       setLinkCopied(true);
//       setTimeout(() => setLinkCopied(false), 2500);
//     }).catch(() => {
//       // Fallback for older browsers
//       const el = document.createElement('textarea');
//       el.value = shareUrl;
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand('copy');
//       document.body.removeChild(el);
//       setLinkCopied(true);
//       setTimeout(() => setLinkCopied(false), 2500);
//     });
//   };

//   useEffect(() => {
//     fetchRecruiters();
//   }, []);

//   // Auto-refresh list when the "Add Recruiter" popup window submits successfully
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.data === 'recruiter-added') {
//         fetchRecruiters();
//       }
//     };
//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // Unique Departments
//   const allDepartments = useMemo(() => {
//     const deptSet = new Set();
//     recruiters.forEach((r) => {
//       if (r.department) {
//         const trimmed = r.department.trim();
//         if (trimmed) deptSet.add(trimmed);
//       }
//     });
//     return Array.from(deptSet).sort();
//   }, [recruiters]);

//   // Unique Designations
//   const allDesignations = useMemo(() => {
//     const desSet = new Set();
//     recruiters.forEach((r) => {
//       if (r.designation) {
//         const trimmed = r.designation.trim();
//         if (trimmed) desSet.add(trimmed);
//       }
//     });
//     return Array.from(desSet).sort();
//   }, [recruiters]);

//   // Unique Locations
//   const allLocations = useMemo(() => {
//     const locSet = new Set();
//     recruiters.forEach((r) => {
//       if (r.location) {
//         const trimmed = r.location.trim();
//         if (trimmed) locSet.add(trimmed);
//       }
//     });
//     return Array.from(locSet).sort();
//   }, [recruiters]);

//   // Unique Company Names
//   const allCompanyNames = useMemo(() => {
//     const companySet = new Set();
//     recruiters.forEach((r) => {
//       if (r.companyName) {
//         const trimmed = r.companyName.trim();
//         if (trimmed) companySet.add(trimmed);
//       }
//     });
//     return Array.from(companySet).sort();
//   }, [recruiters]);

//   const recruitersFilterConfig = {
//     labels: {
//       department: "Department",
//       designation: "Role / Designation",
//       location: "Hiring Region",
//       companyName: "Company Name",
//       registeredVia: "Registration Source",
//     },
//   };

//   const handleFilterChange = (key, value) => {
//     const updatedValues = { ...filterValues, [key]: value || "" };
//     setFilterValues(updatedValues);

//     const updatedActive = { ...activeFilters };
//     if (value) {
//       if (key === 'registeredVia') {
//         updatedActive[key] = value === 'form' ? 'Registered via Form Link' : 'Admin added';
//       } else {
//         updatedActive[key] = value;
//       }
//     } else {
//       delete updatedActive[key];
//     }
//     setActiveFilters(updatedActive);
//   };

//   const clearFilter = (key) => {
//     handleFilterChange(key, "");
//   };

//   const clearAllFilters = () => {
//     setFilterValues({
//       department: "",
//       designation: "",
//       location: "",
//       companyName: "",
//       registeredVia: "",
//     });
//     setActiveFilters({});
//     setSearchTerm("");
//   };

//   const filteredRecruiters = recruiters.filter(recruiter => {
//     // 1. Search term
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       !searchTerm ||
//       recruiter.fullName?.toLowerCase().includes(term) ||
//       recruiter.email?.toLowerCase().includes(term) ||
//       recruiter.phone?.toLowerCase().includes(term) ||
//       recruiter.companyName?.toLowerCase().includes(term);

//     // 2. Department
//     const matchesDept =
//       !filterValues.department ||
//       recruiter.department?.trim().toLowerCase() === filterValues.department.trim().toLowerCase();

//     // 3. Designation
//     const matchesDesignation =
//       !filterValues.designation ||
//       recruiter.designation?.trim().toLowerCase() === filterValues.designation.trim().toLowerCase();

//     // 4. Location
//     const matchesLocation =
//       !filterValues.location ||
//       recruiter.location?.trim().toLowerCase() === filterValues.location.trim().toLowerCase();

//     // 5. Company Name
//     const matchesCompany =
//       !filterValues.companyName ||
//       recruiter.companyName?.trim().toLowerCase() === filterValues.companyName.trim().toLowerCase();

//     // 6. Registered source
//     let matchesSource = true;
//     if (filterValues.registeredVia) {
//       if (filterValues.registeredVia === 'form') {
//         matchesSource = recruiter.registeredVia && recruiter.registeredVia !== 'admin';
//       } else {
//         matchesSource = !recruiter.registeredVia || recruiter.registeredVia === 'admin';
//       }
//     }

//     return matchesSearch && matchesDept && matchesDesignation && matchesLocation && matchesCompany && matchesSource;
//   });

//   return (
//     <div className={styles.container}>

//       {/* ── Link Copied Toast ── */}
//       <div className={`${styles.copyToast} ${linkCopied ? styles.copyToastVisible : ''}`}>
//         <CheckCircle2 size={18} />
//         Shareable link copied to clipboard!
//       </div>
      
//       {/* Header Section */}
//       <div className={styles.header}>
//         <div className={styles.searchWrapper}>
//           <Search className={styles.searchIcon} size={20} />
//           <input
//             type="text"
//             placeholder="Search recruiters by name, email, or company..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className={styles.actions}>
//           {/* Filter Toggle Button */}
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={styles.filterToggleButton}
//             title={showFilters ? "Hide Filters" : "Show Filters"}
//           >
//             {showFilters ? <X size={18} /> : <Filter size={18} />}
//             {showFilters ? 'Hide Filters' : 'Filters'}
//           </button>

//           <button className={styles.btnExcel}><Download size={18} /> Excel</button>
//           <button className={styles.btnCsv}><Download size={18} /> CSV</button>

//           {/* Shareable Link Button */}
//           <button
//             className={`${styles.btnShareLink} ${linkCopied ? styles.btnShareLinkCopied : ''}`}
//             onClick={handleCopyLink}
//             title="Copy shareable registration link for new recruiters"
//           >
//             {linkCopied ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
//             {linkCopied ? 'Copied!' : 'ShareForm Link'}
//           </button>

//           <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
//             <Plus size={20} /> Add Recruiter
//           </button>
//         </div>
//       </div>

//       {/* Expandable Filter Panel */}
//       {showFilters && (
//         <div className={styles.horizontalFilterContainer}>
//           <div className={styles.filterRowWithScroll}>
//             <div className={styles.filterRowContent}>
              
//               {/* Department */}
//               <div className={styles.filterField}>
//                 <label>Department</label>
//                 <select
//                   value={filterValues.department || ""}
//                   onChange={(e) => handleFilterChange("department", e.target.value)}
//                 >
//                   <option value="">All Departments</option>
//                   {allDepartments.map((d) => (
//                     <option key={d} value={d}>
//                       {d}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Designation */}
//               <div className={styles.filterField}>
//                 <label>Designation / Role</label>
//                 <select
//                   value={filterValues.designation || ""}
//                   onChange={(e) => handleFilterChange("designation", e.target.value)}
//                 >
//                   <option value="">All Roles</option>
//                   {allDesignations.map((d) => (
//                     <option key={d} value={d}>
//                       {d}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Hiring Region / Location */}
//               <div className={styles.filterField}>
//                 <label>Hiring Region</label>
//                 <select
//                   value={filterValues.location || ""}
//                   onChange={(e) => handleFilterChange("location", e.target.value)}
//                 >
//                   <option value="">All Regions</option>
//                   {allLocations.map((l) => (
//                     <option key={l} value={l}>
//                       {l}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Company Name */}
//               <div className={styles.filterField}>
//                 <label>Company Name</label>
//                 <select
//                   value={filterValues.companyName || ""}
//                   onChange={(e) => handleFilterChange("companyName", e.target.value)}
//                 >
//                   <option value="">All Companies</option>
//                   {allCompanyNames.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Registration Source */}
//               <div className={styles.filterField}>
//                 <label>Source</label>
//                 <select
//                   value={filterValues.registeredVia || ""}
//                   onChange={(e) => handleFilterChange("registeredVia", e.target.value)}
//                 >
//                   <option value="">All Sources</option>
//                   <option value="form">Registered via Form Link</option>
//                   <option value="admin">Admin Added</option>
//                 </select>
//               </div>

//               <button
//                 className={styles.clearAllButton}
//                 onClick={clearAllFilters}
//               >
//                 Clear All
//               </button>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filter Status Badge Bar */}
//       <FilterStatus
//         activeFilters={activeFilters}
//         onClearFilter={clearFilter}
//         onClearAll={clearAllFilters}
//         filterConfig={recruitersFilterConfig}
//       />

//       {/* Count Info Panel */}
//       <div className={styles.countInfo}>
//         <span className={styles.countText}>
//           Showing <strong>{filteredRecruiters.length}</strong> of <strong>{recruiters.length}</strong> recruitment professionals
//         </span>
//       </div>

//       {/* Grid */}
//       <div className={styles.grid}>
//         {loading ? (
//           <div className={styles.loadingState}>
//             <div className={styles.spinner}></div>
//             <p>Gathering recruitment professionals...</p>
//           </div>
//         ) : filteredRecruiters.length > 0 ? (
//           filteredRecruiters.map((recruiter, index) => (
//             <div 
//               key={recruiter._id} 
//               className={styles.card}
//               onClick={() => navigate(`/recruiters/${recruiter._id}`)}
//               style={{ animationDelay: `${index * 0.1}s` }} // STAGGERED ANIMATION
//             >
//               <div className={styles.avatarRing}>
//                 <UserCircle size={48} strokeWidth={1.5} />
//               </div>

//               <button 
//                 className={styles.deleteBtn}
//                 onClick={(e) => handleDelete(e, recruiter._id)}
//                 title="Delete Recruiter"
//               >
//                 <Trash2 size={18} />
//               </button>
              
//               <div className={styles.info}>
//                 <div className={styles.nameRow}>
//                   <h3>{recruiter.fullName}</h3>
//                   <span className={styles.roleBadge}>Recruiter</span>
//                 </div>
                
//                 <div className={styles.contact}>
//                   <div className={styles.row}><Mail size={16} /> {recruiter.email}</div>
//                   <div className={styles.row}><Phone size={16} /> {recruiter.phone || 'No Phone listed'}</div>
//                 </div>

//                 <div className={styles.meta}>
//                   <p><strong><Building size={14} style={{marginRight: '5px'}}/> Company:</strong> {recruiter.companyName || 'JobBridge Karnataka'}</p>
//                   <p><strong><Building2 size={14} style={{marginRight: '5px'}}/> Dept:</strong> {recruiter.department || 'General'}</p>
//                   <p><strong><Briefcase size={14} style={{marginRight: '5px'}}/> Role:</strong> {recruiter.designation || 'Specialist'}</p>
//                   {recruiter.registeredVia && recruiter.registeredVia !== 'admin' && (
//                     <p className={styles.sourceText}><Share2 size={12} style={{marginRight: '5px'}}/> Registered via: Form Link</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className={styles.emptyState}>
//              <Search size={48} color="#e2e8f0" />
//              <h3>No professionals matched your search</h3>
//              <p>Try refining your search terms or adding a new recruiter.</p>
//           </div>
//         )}
//       </div>

//       <AddRecruiterModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={fetchRecruiters}
//       />
//     </div>
//   );
// };

// export default RecruitersPage;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search, Download, Briefcase, Building, Building2, UserCircle,
  Trash2, Mail, Phone, Link2, CheckCircle2, Share2, Filter, X,
  TrendingUp, UserPlus, Users, ArrowUpRight, ArrowDownRight, MoreVertical,
  ChevronLeft, ChevronRight, ChevronDown, Grid, List, MapPin, Eye
} from 'lucide-react';
import AddRecruiterModal from './AddRecruiterModal';
import FilterStatus from '../../components/Filter/FIlterStatus';
import styles from './RecruitersPage.module.scss';

// ----------------------------------------------------------------------
// Helper components for new UI (Sparkline, DonutChart, AvatarBadge)
// ----------------------------------------------------------------------
const SP = {
  blue:   [20,22,19,25,23,28,26,30,29,33],
  teal:   [15,17,14,19,18,22,20,24,23,27],
  purple: [18,20,17,23,21,26,24,28,27,31],
  orange: [10,12,11,14,13,16,15,18,17,20],
  pink:   [8,10,9,12,11,14,13,16,15,18],
};

function Sparkline({ points, color }) {
  const W = 120, H = 32;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map((v) => H - ((v - min) / range) * H);
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const fill = line + ` L${W},${H} L0,${H} Z`;
  const id = `rsp${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '32px' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ data, size = 160, thickness = 30 }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;

  const nonZeroData = data.filter(d => d.value > 0);
  const total = nonZeroData.reduce((s, d) => s + d.value, 0) || 1;
  const gap = nonZeroData.length > 1 ? 3 : 0;
  const segments = [];
  let offset = 0;
  nonZeroData.forEach((seg, i) => {
    const pct = (seg.value / total) * (circ - nonZeroData.length * gap);
    segments.push({ ...seg, pct, offset, index: i });
    offset += pct + gap;
  });
  const hovSeg = hovered !== null ? segments[hovered] : null;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      onMouseMove={(e) => {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', overflow: 'visible', cursor: 'pointer' }}>
        {segments.map((seg) => {
          const isHov = hovered === seg.index;
          const rr = isHov ? r + 4 : r;
          const cc = 2 * Math.PI * rr;
          const pp = (seg.value / total) * (cc - segments.length * gap);
          return (
            <circle key={seg.index} cx={size / 2} cy={size / 2} r={rr}
              fill="none" stroke={seg.color} strokeWidth={isHov ? thickness + 4 : thickness}
              strokeDasharray={`${Math.max(pp, 0)} ${cc}`} strokeDashoffset={-seg.offset * (cc / circ)}
              strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'r 0.18s, stroke-width 0.18s', cursor: 'pointer',
                filter: isHov ? `drop-shadow(0 0 7px ${seg.color}aa)` : 'none' }}
              onMouseEnter={() => setHovered(seg.index)} onMouseLeave={() => setHovered(null)} />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: hovSeg ? '1.3rem' : '1.6rem', fontWeight: 800, color: hovSeg ? hovSeg.color : 'var(--rec-text)', lineHeight: 1, transition: 'all 0.2s' }}>
          {hovSeg ? hovSeg.value : total}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--rec-muted)', marginTop: 2, textAlign: 'center' }}>
          {hovSeg ? hovSeg.name : 'Total'}
        </span>
      </div>
      {hovSeg && (
        <div style={{ position: 'absolute', left: mousePos.x + 14, top: mousePos.y - 40,
          background: '#1e293b', color: '#fff', padding: '5px 10px', borderRadius: 7,
          fontSize: '0.7rem', fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap',
          zIndex: 99, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', borderLeft: `3px solid ${hovSeg.color}`, lineHeight: 1.5 }}>
          <span style={{ color: hovSeg.color }}>{hovSeg.name}</span><br />
          {hovSeg.value} ({Math.round(hovSeg.value / total * 100)}%)
        </div>
      )}
    </div>
  );
}

const AVATAR_COLORS = ['#6366f1','#0891b2','#d97706','#16a34a','#c0392b','#7c3aed','#ec4899'];
function AvatarBadge({ name, size = 36 }) {
  const initials = (name || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const color = AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || '#6366f1';
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.35, flexShrink: 0,
    }}>{initials}</div>
  );
}

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return '—';
  }
};

// Helper functions for live statistics calculation
const getCumulativeTrend = (list) => {
  if (list.length === 0) return Array(10).fill(0);
  const sorted = [...list]
    .filter(r => r.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  if (sorted.length === 0) return Array(10).fill(list.length);
  
  const oldestDate = new Date(sorted[0].createdAt);
  const now = new Date();
  const totalTime = now - oldestDate || 1;
  
  const trend = [];
  for (let i = 0; i < 10; i++) {
    const targetTime = new Date(oldestDate.getTime() + (totalTime / 9) * i);
    const count = sorted.filter(r => new Date(r.createdAt) <= targetTime).length;
    trend.push(count);
  }
  return trend;
};

const getActiveTrend = (list) => {
  const activeList = list.filter(r => (r.status || 'active').toLowerCase() === 'active');
  return getCumulativeTrend(activeList);
};

const getNewTrend = (list) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sorted = [...list]
    .filter(r => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
  const trend = [];
  const stepMs = (30 * 24 * 3600 * 1000) / 9;
  for (let i = 0; i < 10; i++) {
    const intervalEnd = new Date(thirtyDaysAgo.getTime() + stepMs * i);
    const count = sorted.filter(r => new Date(r.createdAt) <= intervalEnd).length;
    trend.push(count);
  }
  return trend;
};

const getGrowthRate = (list) => {
  if (list.length === 0) return 0;
  
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  
  const thisMonthCount = list.filter(r => r.createdAt && new Date(r.createdAt) >= thisMonthStart).length;
  const lastMonthCount = list.filter(r => r.createdAt && new Date(r.createdAt) >= lastMonthStart && new Date(r.createdAt) <= lastMonthEnd).length;
  
  if (lastMonthCount === 0) {
    return thisMonthCount > 0 ? 100 : 0;
  }
  
  const growth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  return Math.round(growth);
};

const getActiveGrowthRate = (list) => {
  const activeList = list.filter(r => (r.status || 'active').toLowerCase() === 'active');
  return getGrowthRate(activeList);
};

const getNewGrowthRate = (list) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 3600 * 1000);
  
  const current30d = list.filter(r => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo).length;
  const previous30d = list.filter(r => r.createdAt && new Date(r.createdAt) >= sixtyDaysAgo && new Date(r.createdAt) < thirtyDaysAgo).length;
  
  if (previous30d === 0) {
    return current30d > 0 ? 100 : 0;
  }
  return Math.round(((current30d - previous30d) / previous30d) * 100);
};

// ----------------------------------------------------------------------

const RecruitersPage = () => {
  // ----- ALL ORIGINAL STATE -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filterValues, setFilterValues] = useState({
    department: '',
    designation: '',
    location: '',
    companyName: '',
    registeredVia: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [viewType, setViewType] = useState('list');

  const navigate = useNavigate();
  const location = useLocation();

  const rafRef = useRef({});

  const handleCardMouseMoveDirect = (e) => {
    const el = e.currentTarget;
    const cardId = el.getAttribute("data-card-id") || "direct";
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    rafRef.current[cardId] = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const max = 7;
      
      el.style.setProperty("--rx", `${(-(py - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    });
  };

  const handleCardMouseLeaveDirect = (e) => {
    const el = e.currentTarget;
    const cardId = el.getAttribute("data-card-id") || "direct";
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
      setRecruiters(response.data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently remove this recruiter?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/recruiters/${id}`);
        fetchRecruiters();
      } catch (error) {
        console.error("Error deleting recruiter:", error);
        alert("Could not delete recruiter. Please try again.");
      }
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/recruiters/add`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'recruiter-added') fetchRecruiters();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ----- ORIGINAL FILTER LOGIC -----
  const allDepartments = useMemo(() => [...new Set(recruiters.map(r => r.department?.trim()).filter(Boolean))].sort(), [recruiters]);
  const allDesignations = useMemo(() => [...new Set(recruiters.map(r => r.designation?.trim()).filter(Boolean))].sort(), [recruiters]);
  const allLocations = useMemo(() => [...new Set(recruiters.map(r => r.location?.trim()).filter(Boolean))].sort(), [recruiters]);
  const allCompanyNames = useMemo(() => [...new Set(recruiters.map(r => r.companyName?.trim()).filter(Boolean))].sort(), [recruiters]);

  const recruitersFilterConfig = {
    labels: {
      department: "Department",
      designation: "Role / Designation",
      location: "Hiring Region",
      companyName: "Company Name",
      registeredVia: "Registration Source",
    },
  };

  const handleFilterChange = (key, value) => {
    const updatedValues = { ...filterValues, [key]: value || "" };
    setFilterValues(updatedValues);
    const updatedActive = { ...activeFilters };
    if (value) {
      if (key === 'registeredVia') {
        updatedActive[key] = value === 'form' ? 'Registered via Form Link' : 'Admin added';
      } else {
        updatedActive[key] = value;
      }
    } else {
      delete updatedActive[key];
    }
    setActiveFilters(updatedActive);
    setPage(1);
  };

  const clearFilter = (key) => handleFilterChange(key, "");
  const clearAllFilters = () => {
    setFilterValues({ department: '', designation: '', location: '', companyName: '', registeredVia: '' });
    setActiveFilters({});
    setSearchTerm("");
    setPage(1);
  };

  const filteredRecruiters = useMemo(() => {
    return recruiters.filter(recruiter => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        recruiter.fullName?.toLowerCase().includes(term) ||
        recruiter.email?.toLowerCase().includes(term) ||
        recruiter.phone?.toLowerCase().includes(term) ||
        recruiter.companyName?.toLowerCase().includes(term);

      const matchesDept = !filterValues.department ||
        recruiter.department?.trim().toLowerCase() === filterValues.department.trim().toLowerCase();
      const matchesDesignation = !filterValues.designation ||
        recruiter.designation?.trim().toLowerCase() === filterValues.designation.trim().toLowerCase();
      const matchesLocation = !filterValues.location ||
        recruiter.location?.trim().toLowerCase() === filterValues.location.trim().toLowerCase();
      const matchesCompany = !filterValues.companyName ||
        recruiter.companyName?.trim().toLowerCase() === filterValues.companyName.trim().toLowerCase();

      let matchesSource = true;
      if (filterValues.registeredVia) {
        if (filterValues.registeredVia === 'form') matchesSource = recruiter.registeredVia && recruiter.registeredVia !== 'admin';
        else matchesSource = !recruiter.registeredVia || recruiter.registeredVia === 'admin';
      }
      return matchesSearch && matchesDept && matchesDesignation && matchesLocation && matchesCompany && matchesSource;
    });
  }, [recruiters, searchTerm, filterValues]);

  // ----- Computed data for new UI stat cards & donut -----
  const totalRecruiters = recruiters.length;
  const activeCount = recruiters.filter(r => (r.status || 'active').toLowerCase() === 'active').length || totalRecruiters;

  const inactiveCount = recruiters.filter(r => (r.status || '').toLowerCase() === 'inactive').length;
  const pendingCount = recruiters.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  const newRecruitersCount = recruiters.filter(r => {
    if (!r.createdAt) return false;
    const daysDiff = (new Date() - new Date(r.createdAt)) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  }).length;

  const industryMap = {};
  recruiters.forEach(r => {
    const ind = r.department || 'General';
    industryMap[ind] = (industryMap[ind] || 0) + 1;
  });
  const topIndustries = Object.entries(industryMap).length > 0
    ? Object.entries(industryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6)
    : [{ name: 'General', value: totalRecruiters }];
  const maxInd = topIndustries[0]?.value || 1;
  const totalInd = topIndustries.reduce((s, i) => s + i.value, 0) || 1;
  const IND_COLORS = ['#2563eb','#0891b2','#7c3aed','#d97706','#16a34a','#9ca3af'];

  const donutData = [
    { name: 'Active',   value: activeCount  || totalRecruiters, color: '#22c55e' },
    { name: 'Inactive', value: inactiveCount || 0, color: '#ef4444' },
    { name: 'Pending',  value: pendingCount  || 0, color: '#f97316' },
  ];

  const recentRecruiters = [...recruiters]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // ----- Table sorting & pagination -----
  const sortedRecruiters = useMemo(() => {
    const list = [...filteredRecruiters];
    if (sortBy === 'Newest') return list.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === 'Oldest') return list.sort((a,b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (sortBy === 'Name A-Z') return list.sort((a,b) => (a.fullName || '').localeCompare(b.fullName || ''));
    return list;
  }, [filteredRecruiters, sortBy]);

  const totalPages = Math.ceil(sortedRecruiters.length / rowsPerPage) || 1;
  const pageData = sortedRecruiters.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedRows.size === pageData.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageData.map(r => r._id)));
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  const exportToCSV = (type) => {
    const headers = ['Full Name', 'Email', 'Phone', 'Company', 'Department', 'Designation', 'Registration Source'];
    const rows = filteredRecruiters.map(r => [
      r.fullName || '', r.email || '', r.phone || '', r.companyName || '',
      r.department || '', r.designation || '', r.registeredVia === 'admin' ? 'Admin added' : (r.registeredVia ? 'Form Link' : '')
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recruiters_${type.toLowerCase()}_${new Date().toISOString().slice(0,19)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // close action menu on outside click
  useEffect(() => {
    const handler = () => setActionMenuOpen(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // ------------------------------------------------------------------
  // RENDER – NEW UI LAYOUT (with old filter panel styling via SCSS overrides)
  // ------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Toast */}
      <div className={`${styles.copyToast} ${linkCopied ? styles.copyToastVisible : ''}`}>
        <CheckCircle2 size={16} /> Shareable link copied to clipboard!
      </div>

      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarCenter}>
          <div className={styles.searchBox}>
            <Search size={15} color="var(--rec-muted)" />
            <input
              className={styles.searchInput}
              placeholder="Search recruiter, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={styles.searchKbd}>⌘ K</span>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.topbarActions}>
            <button className={styles.filterBtn} onClick={() => setShowFilters(!showFilters)} title="Filter recruiters">
              {showFilters ? <X size={15} /> : <Filter size={15} />} {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button className={styles.exportBtn} onClick={() => exportToCSV('Excel')}><Download size={15} /> Excel</button>
            <button className={styles.exportBtn} onClick={() => exportToCSV('CSV')}><Download size={15} /> CSV</button>
            <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Recruiter
            </button>
            <button className={styles.btnShareLink} onClick={handleCopyLink} title="Copy shareable registration link">
              {linkCopied ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
              {linkCopied ? 'Copied!' : 'ShareForm Link'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Horizontal Filter Panel (old design enforced via SCSS overrides) */}
        {showFilters && (
          <div className={styles.horizontalFilterContainer}>
            <div className={styles.filterRowWithScroll}>
              <div className={styles.filterRowContent}>
                <div className={styles.filterField}>
                  <label>Department</label>
                  <select value={filterValues.department || ""} onChange={(e) => handleFilterChange("department", e.target.value)}>
                    <option value="">All Departments</option>
                    {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Designation / Role</label>
                  <select value={filterValues.designation || ""} onChange={(e) => handleFilterChange("designation", e.target.value)}>
                    <option value="">All Roles</option>
                    {allDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Hiring Region</label>
                  <select value={filterValues.location || ""} onChange={(e) => handleFilterChange("location", e.target.value)}>
                    <option value="">All Regions</option>
                    {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Company Name</label>
                  <select value={filterValues.companyName || ""} onChange={(e) => handleFilterChange("companyName", e.target.value)}>
                    <option value="">All Companies</option>
                    {allCompanyNames.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Source</label>
                  <select value={filterValues.registeredVia || ""} onChange={(e) => handleFilterChange("registeredVia", e.target.value)}>
                    <option value="">All Sources</option>
                    <option value="form">Registered via Form Link</option>
                    <option value="admin">Admin Added</option>
                  </select>
                </div>
                <button className={styles.clearAllButton} onClick={clearAllFilters}>Clear All</button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Status Badges */}
        <FilterStatus
          activeFilters={activeFilters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
          filterConfig={recruitersFilterConfig}
        />


        {/* Stat Cards */}
        <div className={styles.statRow}>
          {[
            { 
              label: 'Total Recruiters',     
              value: totalRecruiters, 
              icon: Users,     
              color: '#2563eb', 
              spark: getCumulativeTrend(recruiters),   
              growth: getGrowthRate(recruiters) 
            },
            { 
              label: 'Active Recruiters',    
              value: activeCount,      
              icon: Building2, 
              color: '#0891b2', 
              spark: getActiveTrend(recruiters),   
              growth: getActiveGrowthRate(recruiters) 
            },
            { 
              label: 'New Recruiters (30d)', 
              value: newRecruitersCount, 
              icon: UserPlus, 
              color: '#d97706', 
              spark: getNewTrend(recruiters), 
              growth: getNewGrowthRate(recruiters)  
            },
          ].map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statCardTop}>
                <div className={styles.statNumbers}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statValue}>{s.value.toLocaleString()}</div>
                </div>
                <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>
                  <s.icon size={22} />
                </div>
              </div>
              <div className={`${styles.statTrend} ${s.growth >= 0 ? styles.trendUp : styles.trendDown}`}>
                {s.growth >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {Math.abs(s.growth)}% <span>from last month</span>
              </div>
              <div className={styles.sparkWrap}>
                <Sparkline points={s.spark} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Mid Row: Donut | Industries | Recent */}
        <div className={styles.midRow}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Recruiters by Status</span>
            </div>
            <div className={styles.donutSection}>
              <DonutChart data={donutData} size={170} thickness={32} />
              <div className={styles.donutLegend}>
                {donutData.map((d, i) => (
                  <div key={i} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: d.color }} />
                    <span className={styles.legendName}>{d.name}</span>
                    <span className={styles.legendVal}>{d.value} ({Math.round(d.value / (totalRecruiters || 1) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Top Department</span>
            </div>
            <div className={styles.industryList}>
              {topIndustries.map((ind, i) => (
                <div key={i} className={styles.industryRow} onClick={() => handleFilterChange('department', ind.name)}>
                  <div className={styles.industryIcon} style={{ background: `${IND_COLORS[i % IND_COLORS.length]}15`, color: IND_COLORS[i % IND_COLORS.length] }}>
                    <Briefcase size={14} />
                  </div>
                  <div className={styles.industryInfo}>
                    <div className={styles.industryMeta}>
                      <span className={styles.industryName}>{ind.name}</span>
                      <span className={styles.industryCount}>{ind.value} ({Math.round(ind.value / totalInd * 100)}%)</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${(ind.value / maxInd) * 100}%`, background: IND_COLORS[i % IND_COLORS.length] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Recent Recruiters</span>
            </div>
            <div className={styles.recentList}>
              {recentRecruiters.map((r) => (
                <div key={r._id} className={styles.recentRow} onClick={() => navigate(`/recruiters/${r._id}`)}>
                  <AvatarBadge name={r.fullName} size={34} />
                  <div className={styles.recentInfo}>
                    <div className={styles.recentName}>{r.fullName}</div>
                    <div className={styles.recentEmail}>{r.email}</div>
                  </div>
                  <span className={styles.recentTime}>{getTimeAgo(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Section Header (with view toggle and sort) */}
        <div className={styles.directoryHeaderRow}>
          <div className={styles.directoryTitleGroup}>
            <h2>Recruiters Directory</h2>
            <span className={styles.directorySub}>
              Showing <strong>{filteredRecruiters.length}</strong> of <strong>{recruiters.length}</strong> recruitment professionals
            </span>
          </div>

          <div className={styles.tableControls}>
            {/* List / Grid view toggle */}
            <div className={styles.toggleGroupContainer}>
              <button
                onClick={() => setViewType("list")}
                className={`${styles.toggleBtn} ${viewType === "list" ? styles.activeToggle : ""}`}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewType("grid")}
                className={`${styles.toggleBtn} ${viewType === "grid" ? styles.activeToggle : ""}`}
                title="Grid View"
              >
                <Grid size={15} />
              </button>
            </div>

            <div className={styles.sortSelect}>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                <option>Newest</option>
                <option>Oldest</option>
                <option>Name A-Z</option>
              </select>
              <ChevronDown size={13} className={styles.sortArrow} />
            </div>
          </div>
        </div>

        <div className={viewType === 'list' ? styles.tableCard : styles.cardsViewWrapper}>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Gathering recruitment professionals...</p>
            </div>
          ) : (
            <>
              {viewType === 'list' ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th><input type="checkbox" checked={selectedRows.size === pageData.length && pageData.length > 0} onChange={toggleAll} className={styles.checkbox} /></th>
                      <th>Recruiter / Company</th>
                      <th>Contact Person</th>
                      <th>Email</th>
                      <th>Industry</th>
                      <th>Status</th>
                      <th>Joined On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map(r => {
                      const isSelected = selectedRows.has(r._id);
                      return (
                        <tr key={r._id} className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ''}`} onClick={() => navigate(`/recruiters/${r._id}`)}>
                          <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={() => toggleRow(r._id)} className={styles.checkbox} /></td>
                          <td>
                            <div className={styles.recruiterCell}>
                              <AvatarBadge name={r.fullName} size={32} />
                              <span className={styles.recruiterName}>{r.fullName}</span>
                              {r.registeredVia && r.registeredVia !== 'admin' && (
                                <span className={styles.selfRegBadge}>Via Form Link</span>
                              )}
                            </div>
                          </td>
                          <td className={styles.cellMuted}>{r.designation || r.contactPerson || '—'}</td>
                          <td className={styles.cellMuted}>{r.email}</td>
                          <td className={styles.cellMuted}>{r.department || 'General'}</td>
                          <td><span className={`${styles.statusBadge} ${styles.status_active}`}>Active</span></td>
                          <td className={styles.cellMuted}>{formatDate(r.createdAt)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={{ position: 'relative' }}>
                              <button className={styles.actionDotBtn} onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === r._id ? null : r._id); }}>
                                <MoreVertical size={16} />
                              </button>
                              {actionMenuOpen === r._id && (
                                <div className={styles.actionMenu}>
                                  <button onClick={() => navigate(`/recruiters/${r._id}`)}>View Profile</button>
                                  <button onClick={(e) => handleDelete(e, r._id)} style={{ color: '#ef4444' }}>Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pageData.length === 0 && (
                      <tr><td colSpan={8} className={styles.emptyRow}><Search size={36} style={{ opacity: 0.2, marginBottom: 8 }} /><div>No recruiters found</div></td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className={styles.recruiterCardGrid}>
                  {pageData.map(r => (
                    <div
                      key={r._id}
                      data-card-id={`recruiter-${r._id}`}
                      onMouseMove={handleCardMouseMoveDirect}
                      onMouseLeave={handleCardMouseLeaveDirect}
                      className={styles.premiumRecruiterCard}
                      onClick={() => navigate(`/recruiters/${r._id}`)}
                    >
                      <div className={styles.cardGlow} />
                      <div className={styles.cardShine} />
                      
                      <div className={styles.cardHeaderRow}>
                        <div className={styles.cardAvatarWrap}>
                          <AvatarBadge name={r.fullName} size={36} />
                        </div>
                        
                        <div className={styles.cardHeaderInfo}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 className={styles.cardNameText}>{r.fullName}</h3>
                            {r.registeredVia && r.registeredVia !== 'admin' && (
                              <span className={styles.selfRegBadge}>Via Form Link</span>
                            )}
                          </div>
                          <span className={styles.cardEmailText}>{r.email || "No email"}</span>
                        </div>
                      </div>

                      <div className={styles.cardDomainBadgeRow}>
                        <span className={styles.cardDomainBadge}>
                          {r.department || "General"}
                        </span>
                        <span className={`${styles.statusBadge} ${styles.status_active}`}>
                          Active
                        </span>
                      </div>

                      <div className={styles.cardContentList}>
                        <div className={styles.cardContentItem}>
                          <Building size={13} />
                          <span>{r.companyName || 'JobBridge Karnataka'}</span>
                        </div>
                        <div className={styles.cardContentItem}>
                          <Briefcase size={13} />
                          <span>{r.designation || 'Specialist'}</span>
                        </div>
                        {r.phone && (
                          <div className={styles.cardContentItem}>
                            <Phone size={13} />
                            <span>{r.phone}</span>
                          </div>
                        )}
                        <div className={styles.cardContentItem}>
                          <MapPin size={13} />
                          <span>{r.location || "Remote"}</span>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recruiters/${r._id}`);
                          }}
                          className={styles.cardViewDetailsBtn}
                          title="View Details"
                        >
                          <Eye size={14} /> Profile
                        </button>
                        
                        <button
                          className={styles.cardDeleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e, r._id);
                          }}
                          title="Delete Recruiter"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {pageData.length === 0 && (
                    <div className={styles.emptyGridState}>
                      <Search size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
                      <div>No recruiters found</div>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Showing {Math.min((page - 1) * rowsPerPage + 1, sortedRecruiters.length)} to {Math.min(page * rowsPerPage, sortedRecruiters.length)} of {sortedRecruiters.length} entries
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return <button key={p} className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  {totalPages > 5 && <span className={styles.pageDots}>...</span>}
                  {totalPages > 5 && <button className={`${styles.pageBtn} ${page === totalPages ? styles.pageBtnActive : ''}`} onClick={() => setPage(totalPages)}>{totalPages}</button>}
                  <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AddRecruiterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchRecruiters} />
    </div>
  );
};

export default RecruitersPage;