import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  Search,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  FileSpreadsheet,
  Download,
  Plus,
  FileText,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Filter,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import styles from './JobSeekersPage.module.scss';
import API from '../../axios';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import AddMember from '../../components/Models/AddMember';
import FilterStatus from '../../components/Filter/FIlterStatus';

// ── avatar helpers (matching Members module) ───────────────────
const AVATAR_PALETTE = [
  '#6366f1', '#2563eb', '#0891b2', '#16a34a', '#d97706', '#c0392b', '#7c3aed', '#ec4899', '#0d9488', '#78716c',
];

function getInitials(name) {
  if (!name) return 'NA';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function avatarColor(name) {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function AvatarCircle({ name, size = 38, photo }) {
  const [imgErr, setImgErr] = useState(false);
  if (photo && !imgErr) {
    return (
      <img src={photo} alt={name} onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarColor(name),
      color: '#fff', fontWeight: 800, fontSize: size * 0.35,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}

const formatJoinedDate = (timestamp, createdAt) => {
  const d = createdAt || timestamp;
  if (!d) return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '—';
  }
};

// ── Data-cleaning helpers for email/phone separation ───
const extractCleanEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') return '—';
  const trimmed = rawEmail.trim();
  const match = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
  if (match) {
    return match[1];
  }
  return trimmed || '—';
};

const extractCleanPhone = (rawPhone, rawEmail) => {
  if (rawPhone) {
    const pStr = String(rawPhone).trim();
    if (pStr && pStr !== 'null' && pStr !== 'undefined' && pStr !== '—') {
      return pStr;
    }
  }
  if (rawEmail && typeof rawEmail === 'string') {
    const phoneMatch = rawEmail.trim().match(/^(\+?[0-9]{10,13})/);
    if (phoneMatch) {
      return phoneMatch[1];
    }
  }
  return '—';
};

// ── Wrapped role tags: max 3 visible + "+N more" chip ───
const RoleTags = ({ roles }) => {
  const [showAll, setShowAll] = useState(false);

  const parsedRoles = useMemo(() => {
    if (!roles) return [];
    let list = [];
    if (Array.isArray(roles)) {
      list = roles.flatMap((r) =>
        typeof r === 'string'
          ? r.split(',').map((s) => s.trim()).filter(Boolean)
          : r ? [String(r).trim()] : []
      );
    } else if (typeof roles === 'string') {
      list = roles.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [...new Set(list)];
  }, [roles]);

  if (!parsedRoles || parsedRoles.length === 0) {
    return <span className={styles.roleTagMuted}>Not Specified</span>;
  }

  const visibleRoles = showAll ? parsedRoles : parsedRoles.slice(0, 3);
  const remainingCount = parsedRoles.length - 3;

  return (
    <div className={styles.roleTagsWrap} onClick={(e) => e.stopPropagation()}>
      {visibleRoles.map((role, idx) => (
        <span key={idx} className={styles.roleTag} title={role}>
          {role}
        </span>
      ))}
      {!showAll && remainingCount > 0 && (
        <button
          type="button"
          className={styles.moreRoleTag}
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(true);
          }}
          title={`View ${remainingCount} more roles`}
        >
          +{remainingCount} more
        </button>
      )}
      {showAll && remainingCount > 0 && (
        <button
          type="button"
          className={styles.moreRoleTag}
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(false);
          }}
          title="Show fewer roles"
        >
          Show less
        </button>
      )}
    </div>
  );
};

const PreferredRolesCell = ({ roles }) => {
  const [expanded, setExpanded] = useState(false);

  const rolesArray = useMemo(() => {
    if (!roles) return [];
    if (Array.isArray(roles)) {
      return roles.flatMap(r => {
        if (typeof r === 'string') {
          return r.split(',').map(s => s.trim()).filter(Boolean);
        }
        return r ? [String(r).trim()] : [];
      }).filter(Boolean);
    }
    if (typeof roles === 'string') {
      return roles.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [roles]);

  if (!rolesArray || rolesArray.length === 0) {
    return <span className={styles.cellMuted}>—</span>;
  }

  const displayedRoles = expanded ? rolesArray : rolesArray.slice(0, 5);
  const hasMore = rolesArray.length > 5;

  return (
    <div className={styles.roleListCell} onClick={(e) => e.stopPropagation()}>
      {displayedRoles.map((role, idx) => (
        <span key={idx} className={styles.roleBadgeMini}>
          {role}
        </span>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className={styles.seeAllRolesBtn}
        >
          {expanded ? "See less" : `See all (+${rolesArray.length - 5})`}
        </button>
      )}
    </div>
  );
};

const JobSeekersPage = () => {
  const context = useOutletContext();
  const sidebarCollapsed = context?.sidebarCollapsed || false;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { memberContext, setMemberContext, refreshData } = useData();

  // --- STATE ---
  const [seekers, setSeekers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [experienceTab, setExperienceTab] = useState("all"); // "all" | "fresher" | "experienced"
  const [view, setView] = useState("card"); // "card" | "table" (matching Members module)
  const [sortBy, setSortBy] = useState("Recent"); // "Recent" | "Ascending" | "Descending" | "A→Z" | "Z→A"
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});

  // Scroll listener for floating scroll button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolledDown(scrollPos > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = () => {
    if (isScrolledDown) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  // Parse Google Drive urls to direct image URLs
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

  // Sync with Location state (from dashboard redirect)
  useEffect(() => {
    if (location.state) {
      let initialFilterValues = {};
      let initialActiveFilters = {};

      if (location.state.expFilter) {
        setExperienceTab(location.state.expFilter);
      }

      if (location.state.exactEdu) {
        initialFilterValues.highest_education = location.state.exactEdu;
        initialActiveFilters.highest_education = location.state.exactEdu;
      }

      if (location.state.exactDistrict) {
        initialFilterValues.district = location.state.exactDistrict;
        initialActiveFilters.district = location.state.exactDistrict;
      }

      if (location.state.exactSkill) {
        initialFilterValues.skills = location.state.exactSkill;
        initialActiveFilters.skills = location.state.exactSkill;
      }

      if (location.state.openAddModal) {
        setShowModal(true);
      }

      if (Object.keys(initialFilterValues).length > 0) {
        setFilterValues(initialFilterValues);
        setActiveFilters(initialActiveFilters);
      }
    }
  }, [location.state]);

  // Load Seekers from Context
  useEffect(() => {
    if (memberContext && memberContext.length > 0) {
      const filtered = memberContext.filter(m =>
        (m.memberType || "").toLowerCase().includes("job seeker")
      );

      // Sort by reference number ascending
      const sorted = [...filtered].sort((a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0));
      setSeekers(sorted);
      setLoading(false);
    } else if (memberContext && memberContext.length === 0) {
      setLoading(false);
    }
  }, [memberContext]);

  // Sync experienceTab with filter values and active filters
  useEffect(() => {
    if (experienceTab === "all") {
      if (filterValues.experienceTab) {
        const newFilters = { ...filterValues };
        delete newFilters.experienceTab;
        setFilterValues(newFilters);
      }
      if (activeFilters.experienceTab) {
        const newActive = { ...activeFilters };
        delete newActive.experienceTab;
        setActiveFilters(newActive);
      }
    } else {
      if (filterValues.experienceTab !== experienceTab) {
        setFilterValues(prev => ({ ...prev, experienceTab }));
      }
      const label = experienceTab === "fresher" ? "Fresher" : "Experienced";
      if (activeFilters.experienceTab !== label) {
        setActiveFilters(prev => ({ ...prev, experienceTab: label }));
      }
    }
  }, [experienceTab]);

  // CRUD callbacks
  const handleSuccess = (updated) => {
    if (refreshData) {
      refreshData();
    } else {
      const updateList = (list) => list.map((m) => m._id === updated._id ? updated : m);
      setSeekers(prev => updateList(prev));
      if (setMemberContext) setMemberContext(prev => updateList(prev));
    }
    setShowModal(false);
    setEditMember(null);
  };

  const handleEdit = (e, member) => {
    e.stopPropagation();
    setEditMember({ ...member });
    setShowModal(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to PERMANENTLY delete this Job Seeker?')) {
      try {
        await API.delete(`/member/${id}`);
        alert("Job Seeker deleted successfully");
        if (refreshData) {
          refreshData();
        } else {
          const remaining = seekers.filter(m => m._id !== id);
          setSeekers(remaining);
          if (setMemberContext) setMemberContext(remaining);
        }
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete member.");
      }
    }
  };

  // Helper to determine if a member is a fresher or experienced
  const isFresher = (m) => {
    const workExp = typeof m === "object" && m !== null ? m.workExp : m;
    if (!workExp) return true;
    const str = String(workExp).toLowerCase().trim();
    if (
      !str ||
      str === "undefined" ||
      str === "null" ||
      str === "0" ||
      str === "0.0" ||
      str === "0 years" ||
      str === "0 yr" ||
      str === "nil" ||
      str === "no" ||
      str === "none" ||
      str === "n/a" ||
      str.includes("no experience") ||
      str.includes("fresher")
    ) {
      return true;
    }
    const val = parseFloat(str);
    if (!isNaN(val) && val === 0) return true;
    return false;
  };

  // --- HELPERS FOR UNIQUE OPTION EXTRACATION ---
  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const districts = unique(seekers.map((m) => m.district));
  const highestEducationOptions = unique(seekers.map((m) => m.highest_education));
  const preferredJobRoleOptions = unique(
    seekers.flatMap((m) => {
      let r = m.preferredJobRole_Sector || [];
      if (typeof r === 'string') {
        return r.split(',').map(item => item.trim());
      }
      if (Array.isArray(r)) {
        return r.map(item => String(item).trim());
      }
      return [];
    })
  );
  const relocationStatusOptions = unique(seekers.map((m) => m.relocationStatus));
  const referrerStatusOptions = unique(seekers.map((m) => m.referrerStatus));

  const skillsOptions = unique(
    seekers.flatMap(m => {
      let s = m.skills || [];
      if (typeof s === 'string') {
        return s.split(',').map(item => item.trim());
      }
      if (Array.isArray(s)) {
        return s.map(item => String(item).trim());
      }
      return [];
    })
  );

  // Seeker filter configuration for badge renders
  const seekerFilterConfig = {
    labels: {
      name: 'Name', initialNumber: 'Min Age', finalNumber: 'Max Age', district: 'District',
      gender: 'Gender', symMemberStatus: 'Solidarity Member Status', highest_education: 'Highest Education',
      preferredJobRole_Sector: 'Preferred Job Role', relocationStatus: 'Relocation Status',
      referrerStatus: 'Referrer Status', startDate: 'Member Since From', endDate: 'Member Since To',
      skills: 'Skills', experienceTab: 'Experience'
    },
    fieldTypes: {
      name: 'string', initialNumber: 'number', finalNumber: 'number', district: 'string',
      gender: 'string', symMemberStatus: 'string', highest_education: 'string',
      preferredJobRole_Sector: 'string', relocationStatus: 'string', referrerStatus: 'string',
      startDate: 'date', endDate: 'date', skills: 'string', experienceTab: 'string'
    },
    formatters: {
      array: (value) => Array.isArray(value) ? value.join(', ') : value,
      number: (value) => value ? value.toString() : '',
    }
  };

  const parseMemberDate = (member) => {
    const d = member.createdAt || member.timestamp;
    if (!d) return null;
    try {
      return new Date(d);
    } catch (e) {
      return null;
    }
  };

  // --- FILTER HANDLERS ---
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filterValues };
    if (value === "" || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilterValues(newFilters);

    const newActive = { ...activeFilters };
    if (value === "" || value === null) {
      delete newActive[key];
    } else {
      newActive[key] = value;
    }
    setActiveFilters(newActive);
  };

  const clearFilter = (filterKey) => {
    const newFilters = { ...filterValues };
    delete newFilters[filterKey];
    setFilterValues(newFilters);

    const newActive = { ...activeFilters };
    delete newActive[filterKey];
    setActiveFilters(newActive);

    if (filterKey === 'experienceTab') {
      setExperienceTab('all');
    }
  };

  const clearAllFilters = () => {
    setFilterValues({});
    setActiveFilters({});
    setExperienceTab('all');
    if (location.state) window.history.replaceState({}, document.title);
  };

  // --- PIPELINE FILTERING (Reactive inline computing) ---
  const filteredSeekers = seekers.filter(m => {
    // 1. Search term (global search)
    const search = searchTerm.toLowerCase();
    if (search) {
      const matchesSearch = (
        m.name?.toLowerCase().includes(search) ||
        m.email?.toLowerCase().includes(search) ||
        (Array.isArray(m.preferredJobRole_Sector)
          ? m.preferredJobRole_Sector.some(r => r?.toLowerCase().includes(search))
          : m.preferredJobRole_Sector?.toLowerCase().includes(search)) ||
        m.highest_education?.toLowerCase().includes(search) ||
        m.district?.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
    }

    // 2. Segment Tab filter
    if (experienceTab === "fresher") {
      if (!isFresher(m)) return false;
    } else if (experienceTab === "experienced") {
      if (isFresher(m)) return false;
    }

    // 3. Horizontal Select/Input filters
    if (filterValues.name && m.name !== filterValues.name) return false;

    if (filterValues.initialNumber && (Number(m.age) < Number(filterValues.initialNumber) || !m.age)) return false;

    if (filterValues.finalNumber && (Number(m.age) > Number(filterValues.finalNumber) || !m.age)) return false;

    if (filterValues.startDate) {
      const start = new Date(filterValues.startDate).setHours(0, 0, 0, 0);
      const dt = parseMemberDate(m);
      if (!dt || dt.getTime() < start) return false;
    }

    if (filterValues.endDate) {
      const end = new Date(filterValues.endDate).setHours(23, 59, 59, 999);
      const dt = parseMemberDate(m);
      if (!dt || dt.getTime() > end) return false;
    }

    if (filterValues.skills) {
      let userSkills = m.skills || [];
      if (typeof userSkills === 'string') {
        userSkills = userSkills.split(',').map(s => s.trim().toLowerCase());
      } else if (Array.isArray(userSkills)) {
        userSkills = userSkills.map(s => String(s).trim().toLowerCase());
      }
      if (!userSkills.includes(filterValues.skills.toLowerCase())) return false;
    }

    if (filterValues.district && m.district !== filterValues.district) return false;

    if (filterValues.gender && m.gender !== filterValues.gender) return false;

    if (filterValues.symMemberStatus && m.symMemberStatus !== filterValues.symMemberStatus) return false;

    if (filterValues.highest_education && m.highest_education !== filterValues.highest_education) return false;

    if (filterValues.preferredJobRole_Sector) {
      const roles = m.preferredJobRole_Sector || [];
      if (Array.isArray(roles)) {
        if (!roles.includes(filterValues.preferredJobRole_Sector)) return false;
      } else {
        if (roles !== filterValues.preferredJobRole_Sector) return false;
      }
    }

    if (filterValues.relocationStatus && m.relocationStatus !== filterValues.relocationStatus) return false;

    if (filterValues.referrerStatus && m.referrerStatus !== filterValues.referrerStatus) return false;

    return true;
  });

  // --- SORTING PIPELINE ---
  const sortedSeekers = [...filteredSeekers].sort((a, b) => {
    if (sortBy === 'Recent') {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime() || 0;
      if (timeA !== timeB) return timeB - timeA;
      return (Number(b.memberReferenceNumber) || 0) - (Number(a.memberReferenceNumber) || 0);
    }
    if (sortBy === 'Ascending') {
      return (Number(a.memberReferenceNumber) || 0) - (Number(b.memberReferenceNumber) || 0);
    }
    if (sortBy === 'Descending') {
      return (Number(b.memberReferenceNumber) || 0) - (Number(a.memberReferenceNumber) || 0);
    }
    if (sortBy === 'A→Z' || sortBy === 'A->Z') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'Z→A' || sortBy === 'Z->A') {
      return (b.name || '').localeCompare(a.name || '');
    }
    return 0;
  });

  // Export Data
  const exportData = (type) => {
    const data = sortedSeekers.map(m => ({
      'Reference No': m.memberReferenceNumber || '',
      Name: m.name || '',
      Email: m.email || '',
      Phone: m.mobileNumber || '',
      Age: m.age || '',
      Gender: m.gender || '',
      District: m.district || '',
      Education: m.highest_education || '',
      Branch: m.branch || m.highestEducationSpecialization || '',
      'Passout Year': m.passOutYear || m.highestEducationPassedOutYear || '',
      'Preferred Job Role / Sector': Array.isArray(m.preferredJobRole_Sector) ? m.preferredJobRole_Sector.join(", ") : (m.preferredJobRole_Sector || ''),
      'Work Experience (Years)': isFresher(m) ? 'Fresher' : (m.workExp || 'Experienced'),
      'Relocation Preference': m.relocationStatus || '',
      'Preferred Job Location': m.preferredJobLocation || '',
      'Resume Link': m.resumeLink || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const dateStr = new Date().toISOString().slice(0, 10);

    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Job Seekers");
      XLSX.writeFile(wb, `Job_Seekers_${dateStr}.xlsx`);
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Job_Seekers_${dateStr}.csv`);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className={styles.container}>
      {/* 1. TOP TOOLBAR */}
      <div className={styles.topToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search seekers by name, role, education or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.toolbarActionCluster}>
          {/* Group 1: Sort + Show Filters (8px gap) */}
          <div className={styles.filterControlGroup}>
            <div className={styles.sortWrapper}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
                title="Sort Seekers"
              >
                <option value="Recent">Recent</option>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
                <option value="A→Z">A→Z</option>
                <option value="Z→A">Z→A</option>
              </select>
              <ChevronDown size={14} className={styles.sortChevron} />
            </div>

            <button
              type="button"
              className={`${styles.filterOutlineBtn} ${showFilters ? styles.filterOutlineBtnActive : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              {showFilters ? <X size={15} /> : <Filter size={15} />}
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>

          {/* Group 2: Excel, CSV, + Add Seeker (8px gap) */}
          <div className={styles.exportAddGroup}>
            <button
              type="button"
              onClick={() => exportData('excel')}
              className={styles.excelBtn}
              title="Export to Excel"
            >
              <FileSpreadsheet size={17} className={styles.excelIcon} />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={() => exportData('csv')}
              className={styles.csvBtn}
              title="Export to CSV"
            >
              <Download size={17} className={styles.csvIcon} />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={() => { setEditMember(null); setShowModal(true); }}
              className={styles.addSeekerBtn}
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>Add Seeker</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER PANEL */}
      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>

              {/* Name Filter */}
              <div className={styles.filterField}>
                <label>NAME</label>
                <select
                  value={filterValues.name || ''}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                >
                  <option value="">Select Name</option>
                  {unique(seekers.map(m => m.name)).map(name => (
                    <option key={name} value={name}>{name.length > 15 ? `${name.substring(0, 15)}...` : name}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div className={styles.filterField}>
                <label>EXPERIENCE</label>
                <select
                  value={experienceTab}
                  onChange={(e) => setExperienceTab(e.target.value)}
                >
                  <option value="all">All ({seekers.length})</option>
                  <option value="fresher">Freshers ({seekers.filter(isFresher).length})</option>
                  <option value="experienced">Experienced ({seekers.filter(m => !isFresher(m)).length})</option>
                </select>
              </div>

              {/* Min Age Filter */}
              <div className={styles.filterField}>
                <label>MIN AGE</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filterValues.initialNumber || ''}
                  onChange={(e) => handleFilterChange('initialNumber', e.target.value)}
                />
              </div>

              {/* Max Age Filter */}
              <div className={styles.filterField}>
                <label>MAX AGE</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterValues.finalNumber || ''}
                  onChange={(e) => handleFilterChange('finalNumber', e.target.value)}
                />
              </div>

              {/* Date From */}
              <div className={styles.filterField}>
                <label>MEMBER SINCE FROM</label>
                <input
                  type="date"
                  value={filterValues.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className={styles.filterField}>
                <label>MEMBER SINCE TO</label>
                <input
                  type="date"
                  value={filterValues.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              {/* Skills */}
              <div className={styles.filterField}>
                <label>SKILLS</label>
                <select
                  value={filterValues.skills || ''}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                >
                  <option value="">All Skills</option>
                  {skillsOptions.map(skill => (
                    <option key={skill} value={skill}>
                      {skill.length > 20 ? `${skill.substring(0, 20)}...` : skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className={styles.filterField}>
                <label>DISTRICT</label>
                <select
                  value={filterValues.district || ''}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district.length > 15 ? `${district.substring(0, 15)}...` : district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className={styles.filterField}>
                <label>GENDER</label>
                <select
                  value={filterValues.gender || ''}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">All Gender</option>
                  {unique(seekers.map(m => m.gender)).map(gender => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Solidarity Status */}
              <div className={styles.filterField}>
                <label>SOLIDARITY STATUS</label>
                <select
                  value={filterValues.symMemberStatus || ''}
                  onChange={(e) => handleFilterChange('symMemberStatus', e.target.value)}
                >
                  <option value="">All Status</option>
                  {unique(seekers.map(m => m.symMemberStatus)).map(status => (
                    <option key={status} value={status}>
                      {status.length > 15 ? `${status.substring(0, 15)}...` : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Highest Education */}
              <div className={styles.filterField}>
                <label>HIGHEST EDUCATION</label>
                <select
                  value={filterValues.highest_education || ''}
                  onChange={(e) => handleFilterChange('highest_education', e.target.value)}
                >
                  <option value="">Select Highest Education</option>
                  {highestEducationOptions.map(edu => (
                    <option key={edu} value={edu}>
                      {edu.length > 20 ? `${edu.substring(0, 20)}...` : edu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Job Role */}
              <div className={styles.filterField}>
                <label>PREFERRED JOB ROLE</label>
                <select
                  value={filterValues.preferredJobRole_Sector || ''}
                  onChange={(e) => handleFilterChange('preferredJobRole_Sector', e.target.value)}
                >
                  <option value="">Select Preferred Job Role</option>
                  {preferredJobRoleOptions.map(role => (
                    <option key={role} value={role}>
                      {role.length > 20 ? `${role.substring(0, 20)}...` : role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Relocation Status */}
              <div className={styles.filterField}>
                <label>RELOCATION STATUS</label>
                <select
                  value={filterValues.relocationStatus || ''}
                  onChange={(e) => handleFilterChange('relocationStatus', e.target.value)}
                >
                  <option value="">Select Relocation Status</option>
                  {relocationStatusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.length > 20 ? `${status.substring(0, 20)}...` : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referrer Status */}
              <div className={styles.filterField}>
                <label>REFERRER STATUS</label>
                <select
                  value={filterValues.referrerStatus || ''}
                  onChange={(e) => handleFilterChange('referrerStatus', e.target.value)}
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

      {/* Filter Status Badge Bar */}
      <FilterStatus
        activeFilters={activeFilters}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
        filterConfig={seekerFilterConfig}
        data-page-type="seekers"
      />

      {/* 2. RESULTS BAR */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing <strong>{sortedSeekers.length}</strong> of <strong>{seekers.length}</strong> job seekers
        </span>
        <div className={styles.viewToggleGroup}>
          <button
            className={`${styles.viewToggleBtn} ${view === 'card' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setView('card')}
            type="button"
            title="Card view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`${styles.viewToggleBtn} ${view === 'table' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setView('table')}
            type="button"
            title="Table view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* 2. CONDITIONAL RENDERING */}
      {loading ? (
        <div className={styles.loadingArea}>
          <div className={styles.spinner}></div>
          <p>Syncing Seeker Database...</p>
        </div>
      ) : sortedSeekers.length > 0 ? (
        view === 'table' ? (
          <div className={styles.tableWrapper}>
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>EMAIL</th>
                  <th>MOBILE</th>
                  <th>Experience</th>
                  <th>Industry</th>
                  <th>Preferred Job Role</th>
                  <th>Location Preference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSeekers.map((member) => (
                  <tr key={member._id} className={styles.tableRow} onClick={() => navigate(`/member/${member._id}`)}>
                    <td data-label="Member">
                      <div className={styles.memberCell}>
                        <AvatarCircle
                          name={member.name}
                          photo={member.photoUrl ? getDirectImageUrl(member.photoUrl) : null}
                          size={38}
                        />
                        <div className={styles.memberIdentity}>
                          <strong>{member.name || 'Unnamed Member'}</strong>
                          <span>Ref No: {member.memberReferenceNumber || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="EMAIL" className={styles.cellMuted}>
                      {extractCleanEmail(member.email)}
                    </td>
                    <td data-label="MOBILE">
                      <div className={styles.inlineIconText}>
                        <Phone size={13} />
                        <span>{extractCleanPhone(member.mobileNumber, member.email)}</span>
                      </div>
                    </td>
                    <td data-label="Experience">
                      <span
                        className={styles.roleBadge}
                        onClick={(e) => { e.stopPropagation(); navigate(`/member/${member._id}`); }}
                        style={{ cursor: 'pointer' }}
                        title="View profile"
                      >
                        {isFresher(member) ? "Fresher" : `${member.workExp || "Experienced"}`}
                      </span>
                    </td>
                    <td data-label="Industry" className={styles.cellMuted}>
                      {member.industry || member.careerProfile?.industry || member.branch || member.fieldofStudy_Interest || member.highestEducationSpecialization || '—'}
                    </td>
                    <td data-label="Preferred Job Role">
                      <PreferredRolesCell
                        roles={member.preferredJobRole_Sector || member.careerProfile?.role}
                      />
                    </td>
                    <td data-label="Location Preference">
                      <div className={styles.inlineIconText}>
                        <MapPin size={13} />
                        <span>
                          {member.preferredJobLocation || (member.relocationStatus ? `${member.district || 'Any'} (${member.relocationStatus})` : member.district) || '—'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Status">
                      {(() => {
                        const rawStatus = member.solidarityMember || member.symMemberStatus;
                        const displayStatus = rawStatus || 'Yes';
                        const isNo = String(displayStatus).toLowerCase() === 'no';
                        return (
                          <span className={`${styles.tableStatusBadge} ${isNo ? styles.tableStatusNo : ''}`}>
                            <span className={`${styles.tableStatusDot} ${isNo ? styles.tableStatusDotNo : ''}`} />
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.actionIconBtn}
                          title="View Profile"
                          onClick={() => navigate(`/member/${member._id}`)}
                          type="button"
                        >
                          <Eye size={14} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              className={styles.actionIconBtn}
                              title="Edit"
                              onClick={(e) => handleEdit(e, member)}
                              type="button"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className={`${styles.actionIconBtn} ${styles.actionIconBtnDel}`}
                              title="Delete"
                              onClick={(e) => handleDelete(e, member._id)}
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.seekerGrid}>
            {sortedSeekers.map((member, index) => {
              const fresherStatus = isFresher(member);
              const branchText = member.branch || member.highestEducationSpecialization || "";
              const passedOutText = member.passOutYear || member.highestEducationPassedOutYear || "";
              const educationDisplay = `${member.highest_education || "N/A"}${branchText ? ` (${branchText})` : ""}${passedOutText ? ` - ${passedOutText}` : ""}`;
              const cleanEmailVal = extractCleanEmail(member.email);
              const cleanPhoneVal = extractCleanPhone(member.mobileNumber, member.email);

              return (
                <div
                  key={member._id}
                  className={styles.seekerCard}
                  onClick={() => navigate(`/member/${member._id}`)}
                >
                  {/* Row 1: avatar (48px circle) left, name + status badge + Ref badge stacked to the right */}
                  <div className={styles.cardHeaderRow}>
                    <img
                      src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                      alt={member.name || "Seeker"}
                      className={styles.avatarImg}
                      onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                    />
                    <div className={styles.headerInfoStack}>
                      <h3 className={styles.seekerName} title={member.name || "Unnamed Member"}>
                        {member.name || "Unnamed Member"}
                      </h3>
                      <div className={styles.badgeRow}>
                        <span className={`${styles.statusBadge} ${fresherStatus ? styles.statusFresher : styles.statusExperienced}`}>
                          {fresherStatus ? "Fresher" : `${member.workExp || "Experienced"}`}
                        </span>
                        {member.memberReferenceNumber && (
                          <span className={styles.refBadge}>
                            Ref: {member.memberReferenceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Education — icon + label + value, single line, ellipsis-truncate if too long */}
                  <div className={styles.cardRow}>
                    <GraduationCap size={15} className={styles.rowIcon} />
                    <span className={styles.rowLabel}>Education:</span>
                    <span className={styles.rowValueTruncate} title={educationDisplay}>
                      {educationDisplay}
                    </span>
                  </div>

                  {/* Row 3: Preferred Role — icon + label, wrapped pill/chip tags (max 3 visible + +N more chip) */}
                  <div className={styles.cardRowRoles}>
                    <Briefcase size={15} className={styles.rowIconRoles} />
                    <span className={styles.rowLabel}>Preferred Role:</span>
                    <RoleTags roles={member.preferredJobRole_Sector || member.careerProfile?.role} />
                  </div>

                  {/* Row 4: Email — icon + value, truncate with ellipsis, own line, never concatenated with phone */}
                  <div className={styles.cardRow}>
                    <Mail size={15} className={styles.rowIcon} />
                    <span className={styles.rowValueTruncate} title={cleanEmailVal}>
                      {cleanEmailVal}
                    </span>
                  </div>

                  {/* Row 5: Phone — separate row, icon + value */}
                  <div className={styles.cardRow}>
                    <Phone size={15} className={styles.rowIcon} />
                    <span className={styles.rowValue}>
                      {cleanPhoneVal}
                    </span>
                  </div>

                  {/* Row 6: Current District — icon + label + value */}
                  <div className={styles.cardRow}>
                    <MapPin size={15} className={styles.rowIcon} />
                    <span className={styles.rowLabel}>Current District:</span>
                    <span className={styles.rowValue}>
                      {member.district || "—"}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className={styles.cardDivider} />

                  {/* Footer Row: Resume link button (left) + Edit/Delete icon buttons (right), all 36px height */}
                  <div className={styles.cardFooterRow}>
                    {member.resumeLink ? (
                      <a
                        href={member.resumeLink}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.resumeBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText size={14} />
                        <span>Resume</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className={styles.noResumeBadge}>
                        No Resume
                      </span>
                    )}

                    <div className={styles.cardActionButtons} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles.actionBtnIcon}
                        title="View Profile"
                        onClick={() => navigate(`/member/${member._id}`)}
                        type="button"
                      >
                        <Eye size={15} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className={styles.actionBtnIcon}
                            title="Edit Seeker"
                            onClick={(e) => handleEdit(e, member)}
                            type="button"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className={`${styles.actionBtnIcon} ${styles.actionBtnDelete}`}
                            title="Delete Seeker"
                            onClick={(e) => handleDelete(e, member._id)}
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className={styles.emptyState}>
          <Users size={60} strokeWidth={1} />
          <h3>No Job Seekers Found</h3>
          <p>We couldn't find any job seekers matching the criteria or search term.</p>
          <button onClick={() => { setSearchTerm(''); clearAllFilters(); }} className={styles.resetBtn}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Floating Right-Side Up/Down Immediate Scroll Button */}
      <button
        type="button"
        onClick={handleScrollClick}
        className={styles.floatingScrollBtn}
        title={isScrolledDown ? "Scroll to Top" : "Scroll to Bottom"}
        aria-label={isScrolledDown ? "Scroll to Top" : "Scroll to Bottom"}
      >
        {isScrolledDown ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
      </button>

      {/* 3. ADD / EDIT DIALOG */}
      <AddMember
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditMember(null); }}
        onSuccess={handleSuccess}
        editMember={editMember}
        preSelectedMemberType="Job Seeker"
      />
    </div>
  );
};

export default JobSeekersPage;
