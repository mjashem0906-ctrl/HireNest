// MSA1 

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  User, Phone, Mail, Calendar, Building, Edit, Trash2,
  Search, Filter, X, Eye, Briefcase, Star, Building2,
  LayoutGrid, List, ArrowUpRight, ArrowDownRight, ChevronLeft,
  ChevronRight, ChevronDown, MapPin, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddMember from '../../components/Models/AddMember';
import FilterStatus from '../../components/Filter/FIlterStatus';
import API from '../../axios';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { parseDOB } from '../../utils/dateUtils';
import styles from './Members.module.scss';

// ── sparkline ────────────────────────────────────────────────────────────────
const SP = {
  blue: [30, 35, 28, 40, 38, 45, 42, 50, 48, 55],
  green: [20, 25, 22, 28, 30, 27, 35, 32, 38, 40],
  purple: [15, 18, 14, 20, 19, 22, 20, 25, 23, 28],
  orange: [40, 38, 42, 45, 43, 48, 50, 52, 55, 58],
  pink: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18],
};

function Sparkline({ points, color }) {
  const W = 120, H = 32;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map((v) => H - ((v - min) / range) * H);
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const fill = line + ` L${W},${H} L0,${H} Z`;
  const id = `msp${color.replace('#', '')}`;
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

// ── avatar helpers ───────────────────────────────────────────────────────────
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

// ── main ─────────────────────────────────────────────────────────────────────
function Members() {
  const outletContext = useOutletContext();
  const sidebarCollapsed = outletContext ? outletContext.sidebarCollapsed : false;
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const navigate = useNavigate();
  const location = useLocation();
  const { memberContext, setMemberContext } = useData();
  const { user } = useAuth();

  const [allMembers, setAllMembers] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [view, setView] = useState('table');
  const [globalFilter, setGlobalFilter] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('All Members');
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [recruiters, setRecruiters] = useState([]);

  // dark mode toggle
  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') setDarkMode(true);
  }, []);

  // fetch recruiters from the separate /api/recruiters collection
  useEffect(() => {
    API.get('/api/recruiters')
      .then(res => setRecruiters(res.data || []))
      .catch(() => setRecruiters([]))
  }, []);

  useEffect(() => {
    fetchData();
  }, [memberContext, recruiters, location.state]);

  const sortByReferenceNumber = (list = []) =>
    [...list].sort((a, b) => (a.memberReferenceNumber ?? 0) - (b.memberReferenceNumber ?? 0));

  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

  const getDirectImageUrl = (driveUrl) => {
    if (!driveUrl) return null;
    let fileId = null;
    let match = driveUrl.match(/[?&]id=([^&]+)/);
    if (match) fileId = match[1];
    if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
    if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
    if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) fileId = driveUrl;
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
    if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years -= 1; months += 12; }
    return { years, months, days };
  };

  const formatAge = (dob) => {
    const age = calculateAge(dob);
    return age ? `${age.years} years, ${age.months} months` : '—';
  };

  const normalizeRecruiter = (r) => ({
    _id: r._id,
    name: r.fullName || r.name || '',
    email: r.email || '',
    mobileNumber: r.phone || r.mobileNumber || '',
    memberType: 'Recruiter',
    symMemberStatus: 'Active',
    district: r.location || '',
    profession: r.designation || '',
    timestamp: r.createdAt || r.timestamp || '',
    createdAt: r.createdAt || '',
    photoUrl: r.profilePicture || '',
    memberReferenceNumber: r.memberReferenceNumber || null,
    _isRecruiter: true,
  });

  const fetchData = () => {
    const normalizedRecruiters = recruiters.map(normalizeRecruiter);
    const combined = sortByReferenceNumber([
      ...memberContext,
      ...normalizedRecruiters,
    ]);
    setAllMembers(combined);
    let initialDisplayData = [...combined];
    let dashboardFilterValues = {};
    let dashboardActiveFilters = {};

    if (location.state) {
      if (location.state.expFilter === 'fresher') {
        initialDisplayData = initialDisplayData.filter(m => {
          const exp = String(m.workExp || '').toLowerCase().trim();
          return exp === '0' || exp === 'fresher' || exp === '0 years' || parseFloat(exp) === 0;
        });
        dashboardFilterValues = { workExp: 'fresher' };
        dashboardActiveFilters = { workExp: 'fresher' };
      } else if (location.state.expFilter === 'experienced') {
        initialDisplayData = initialDisplayData.filter(m => {
          const exp = String(m.workExp || '').toLowerCase().trim();
          return exp !== '' && exp !== 'unknown' && exp !== 'null' && parseFloat(exp) > 0;
        });
        dashboardFilterValues = { workExp: 'experienced' };
        dashboardActiveFilters = { workExp: 'experienced' };
      } else if (location.state.exactExp) {
        initialDisplayData = initialDisplayData.filter(m => {
          const exp = String(m.workExp || '').trim();
          if (location.state.exactExp === 'Unknown') return exp === '' || exp.toLowerCase() === 'unknown' || exp === 'null';
          return exp === location.state.exactExp;
        });
        dashboardFilterValues = { workExp: location.state.exactExp };
        dashboardActiveFilters = { workExp: location.state.exactExp };
      } else if (location.state.exactEdu) {
        initialDisplayData = initialDisplayData.filter(m => {
          const edu = String(m.highest_education || '').trim();
          if (location.state.exactEdu === 'Unknown') return edu === '' || edu.toLowerCase() === 'unknown' || edu === 'null';
          return edu === location.state.exactEdu;
        });
        dashboardFilterValues = { highest_education: location.state.exactEdu };
        dashboardActiveFilters = { highest_education: location.state.exactEdu };
      } else if (location.state.exactDistrict) {
        initialDisplayData = initialDisplayData.filter(m => {
          const district = String(m.district || '').trim();
          if (location.state.exactDistrict === 'Unknown') return district === '' || district.toLowerCase() === 'unknown' || district === 'null';
          return district === location.state.exactDistrict;
        });
        dashboardFilterValues = { district: location.state.exactDistrict };
        dashboardActiveFilters = { district: location.state.exactDistrict };
      } else if (location.state.exactSkill) {
        initialDisplayData = initialDisplayData.filter(m => {
          let userSkills = m.skills || [];
          if (typeof userSkills === 'string') userSkills = userSkills.split(',').map(s => s.trim().toLowerCase());
          else if (Array.isArray(userSkills)) userSkills = userSkills.map(s => String(s).trim().toLowerCase());
          if (location.state.exactSkill === 'Unknown') return userSkills.length === 0 || userSkills.includes('unknown');
          return userSkills.includes(location.state.exactSkill.toLowerCase());
        });
        dashboardFilterValues = { skills: location.state.exactSkill };
        dashboardActiveFilters = { skills: location.state.exactSkill };
      } else if (location.state.exactMemberType) {
        initialDisplayData = initialDisplayData.filter(m => m.memberType === location.state.exactMemberType);
        dashboardFilterValues = { memberType: location.state.exactMemberType };
        dashboardActiveFilters = { memberType: location.state.exactMemberType };
      }
    }

    setMembersData(initialDisplayData);
    if (Object.keys(dashboardFilterValues).length > 0) {
      setFilterValues(dashboardFilterValues);
      setActiveFilters(dashboardActiveFilters);
    }
    setLoading(false);
  };

  const buildExportRows = () => membersData.map(m => ({
    RefNo: m.memberReferenceNumber || '', Name: m.name || '', Age: m.age || '',
    Gender: m.gender || '', Mobile: m.mobileNumber || '', Email: m.email || '',
    District: m.district || '', Role: m.memberType || '',
    'Solidarity Member Status': m.symMemberStatus || '', Profession: m.profession || '',
    NativeDistrict: m.nativePlace || '', Address: m.address || '',
    SeekerNeed: (m.seekerNeed || []).join(', '), Education: m.highest_education || '',
    FieldOfStudy: m.fieldofStudy_Interest || '', PreferredRole: m.preferredJobRole_Sector || '',
    Experience: m.workExp || '', Relocation: m.relocationStatus || '',
    PreferredLocation: m.preferredJobLocation || '', ResumeLink: m.resumeLink || '',
    OfferType: (m.jobOfferType || []).join(', '), OfferingSector: (m.offeringSector || []).join(', '),
    OpportunityDescription: m.opportunityDescription || '', OfferLocation: m.offer_Location || '',
    ContactForSeekers: m.contactForSeekers || '', ReferrerStatus: m.referrerStatus || '',
    ReferringOfferType: (m.referringOfferType || []).join(', '),
    ReferringSector: (m.referringSector || []).join(', '), ReferringFor: m.referringFor || '',
    LevelOfSupport: (m.levelOfSupport || []).join(', '), ReferrerContact: m.referrerContact || '',
    SkillProgram: m.interest_SkillBuildingProgram || '',
    SkillsToImprove: (m.skillsToImprove || []).join(', '),
    GroupTags: (m.forGrouping || []).join(', '), CreatedDate: m.timestamp || '',
    SubmittedEmail: m.submittingEmail || '',
  }));

  const exportToExcel = () => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToCSV = () => {
    const data = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `Members_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const parseMemberDate = (member) => {
    const d = member.createdAt || member.timestamp;
    if (!d) return null;
    return parseDOB(d);
  };

  const applyFilters = (filters) => {
    if (!filters || Object.values(filters).every(v => v === '' || v === null || (Array.isArray(v) && v.length === 0))) {
      setMembersData(allMembers); setActiveFilters({}); setFilterValues({});
      if (location.state) window.history.replaceState({}, document.title);
      return;
    }
    let filtered = [...allMembers];
    const newActiveFilters = {};
    const exactFilters = ['name', 'district', 'memberType', 'gender', 'symMemberStatus', 'profession', 'highest_education', 'preferredJobRole_Sector', 'workExp', 'relocationStatus', 'referrerStatus', 'interest_SkillBuildingProgram'];
    exactFilters.forEach(key => {
      if (filters[key]) {
        if (key === 'memberType') {
          filtered = filtered.filter(p => (p.memberType || "").includes(filters[key]));
        } else if (key === 'preferredJobRole_Sector') {
          filtered = filtered.filter(p => {
            const role = p.preferredJobRole_Sector || [];
            if (Array.isArray(role)) {
              return role.includes(filters[key]);
            }
            return String(role) === filters[key];
          });
        } else {
          filtered = filtered.filter(p => p[key] === filters[key]);
        }
        newActiveFilters[key] = filters[key];
      }
    });

    if (filters.nDistrict) { filtered = filtered.filter(p => p.nativePlace === filters.nDistrict); newActiveFilters.nDistrict = filters.nDistrict; }
    if (filters.initialNumber !== undefined && filters.initialNumber !== '') { filtered = filtered.filter(p => p.age >= Number(filters.initialNumber)); newActiveFilters.initialNumber = filters.initialNumber; }
    if (filters.finalNumber !== undefined && filters.finalNumber !== '') { filtered = filtered.filter(p => p.age <= Number(filters.finalNumber)); newActiveFilters.finalNumber = filters.finalNumber; }

    if (filters.startDate) {
      const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => { const dt = parseMemberDate(p); return dt && dt.getTime() >= start; });
      newActiveFilters.startDate = filters.startDate;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => { const dt = parseMemberDate(p); return dt && dt.getTime() <= end; });
      newActiveFilters.endDate = filters.endDate;
    }

    if (filters.skills) {
      filtered = filtered.filter(p => {
        let userSkills = p.skills || [];
        if (typeof userSkills === 'string') userSkills = userSkills.split(',').map(s => s.trim().toLowerCase());
        else if (Array.isArray(userSkills)) userSkills = userSkills.map(s => String(s).trim().toLowerCase());
        return userSkills.includes(filters.skills.toLowerCase());
      });
      newActiveFilters.skills = filters.skills;
    }

    const arrayFilters = ['seekerNeed', 'jobOfferType', 'offeringSector', 'levelOfSupport', 'forGrouping'];
    arrayFilters.forEach(key => {
      if (filters[key]?.length) {
        filtered = filtered.filter(p => { const arr = p[key] || []; return filters[key].some(v => arr.includes(v)); });
        newActiveFilters[key] = filters[key];
      }
    });
    setMembersData(sortByReferenceNumber(filtered));
    setActiveFilters(newActiveFilters);
    setFilterValues(filters);
    setPage(1);
  };

  const clearFilter = (filterKey) => {
    const newActiveFilters = { ...activeFilters };
    const newFilterValues = { ...filterValues };
    delete newActiveFilters[filterKey]; delete newFilterValues[filterKey];
    setActiveFilters(newActiveFilters); setFilterValues(newFilterValues);
    applyFilters(newFilterValues);
  };

  const clearAllFilters = () => {
    setMembersData(allMembers); setActiveFilters({}); setFilterValues({});
    setActiveTab('All Members'); setPage(1);
    if (location.state) window.history.replaceState({}, document.title);
  };

  const handleEditMember = async (updated) => {
    try {
      const updateList = (list) => list.map(m => m._id === updated._id ? updated : m);
      setMembersData(prev => updateList(prev));
      setAllMembers(prev => updateList(prev));
      setMemberContext(prev => updateList(prev));
      setEditMember(null); setShowModal(false);
    } catch (error) { console.error('Error updating member:', error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this member?')) {
      try {
        await API.delete(`/member/${id}`);
        alert('Member deleted successfully');
        const remaining = allMembers.filter(m => m._id !== id);
        setAllMembers(remaining); setMembersData(remaining); setMemberContext(remaining);
      } catch (err) { console.error('Delete failed:', err); alert('Failed to delete member.'); }
    }
  };

  const handleEdit = (member) => { setEditMember({ ...member }); setShowModal(true); };
  // Returns the correct detail route based on memberType
  const getDetailRoute = (member) => {
    const type = String(member.memberType || '').toLowerCase();
    if (type.includes('mentor')) return `/mentors/${member._id}`;
    if (type.includes('recruiter')) return `/recruiters/${member._id}`;
    if (type.includes('referee')) return `/referee/${member._id}`;
    return `/member/${member._id}`;
  };

  const handleRowClick = (row) => { navigate(getDetailRoute(row)); };

  const formatJoinedDate = (timestamp, createdAt) => {
    const raw = timestamp || createdAt;
    if (!raw) return '—';
    const date = new Date(raw);
    if (isNaN(date.getTime())) return String(raw).slice(0, 10);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filterByTab = (member) => {
    const type = String(member.memberType || '').toLowerCase();
    switch (activeTab) {
      case 'Job Seekers': return type.includes('seeker');
      case 'Providers': return type.includes('provider');
      case 'Mentors': return type.includes('mentor');
      case 'Recruiters': return type.includes('recruiter');
      case 'Referees': return type.includes('referee');
      default: return true;
    }
  };

  const filteredMembers = membersData
    .filter(filterByTab)
    .filter(member => {
      const search = globalFilter?.toLowerCase() || '';
      return (
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.profession?.toLowerCase().includes(search) ||
        member.personalEmail?.toLowerCase().includes(search) ||
        member.mobileNumber?.toLowerCase().includes(search) ||
        member.memberReferenceNumber?.toString().includes(search) ||
        member.district?.toLowerCase().includes(search)
      );
    });

  // pagination
  const totalPages = Math.ceil(filteredMembers.length / perPage) || 1;
  const pageData = filteredMembers.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (id) => {
    setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selectedRows.size === pageData.length && pageData.length > 0) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageData.map(r => r._id)));
  };

  // stats
  const totalMembers = allMembers.length;
  const activeMembers = allMembers.filter(m => String(m.symMemberStatus || '').toLowerCase() === 'active').length || allMembers.length;
  const newThisMonth = allMembers.filter(m => {
    const raw = m.createdAt || m.timestamp;
    if (!raw) return false;
    const d = new Date(raw), now = new Date();
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const jobSeekers = allMembers.filter(m => String(m.memberType || '').toLowerCase().includes('seeker')).length;
  const providers = allMembers.filter(m => String(m.memberType || '').toLowerCase().includes('provider')).length;

  // Calculate dynamic 6-month trends for sparklines
  const pastMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months;
  }, []);

  const getMemberTime = (member) => {
    const d = member.timestamp || member.createdAt;
    if (!d) return 0;
    const time = new Date(d).getTime();
    return isNaN(time) ? 0 : time;
  };

  const totalTrend = useMemo(() => {
    return pastMonths.map(m => {
      const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999).getTime();
      return allMembers.filter(member => getMemberTime(member) <= endOfMonth).length;
    });
  }, [allMembers, pastMonths]);

  const activeTrend = useMemo(() => {
    return pastMonths.map(m => {
      const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999).getTime();
      return allMembers.filter(member => {
        const isActive = String(member.symMemberStatus || '').toLowerCase() === 'active';
        return isActive && getMemberTime(member) <= endOfMonth;
      }).length;
    });
  }, [allMembers, pastMonths]);

  const newTrend = useMemo(() => {
    return pastMonths.map(m => {
      const startOfMonth = new Date(m.year, m.month, 1, 0, 0, 0, 0).getTime();
      const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999).getTime();
      return allMembers.filter(member => {
        const t = getMemberTime(member);
        return t >= startOfMonth && t <= endOfMonth;
      }).length;
    });
  }, [allMembers, pastMonths]);

  const seekerTrend = useMemo(() => {
    return pastMonths.map(m => {
      const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999).getTime();
      return allMembers.filter(member => {
        const isSeeker = String(member.memberType || '').toLowerCase().includes('seeker');
        return isSeeker && getMemberTime(member) <= endOfMonth;
      }).length;
    });
  }, [allMembers, pastMonths]);

  const totalGrowth = useMemo(() => {
    const len = totalTrend.length;
    if (len < 2) return 0;
    const current = totalTrend[len - 1];
    const previous = totalTrend[len - 2] || 1;
    return Math.round(((current - previous) / previous) * 100);
  }, [totalTrend]);

  const activeGrowth = useMemo(() => {
    const len = activeTrend.length;
    if (len < 2) return 0;
    const current = activeTrend[len - 1];
    const previous = activeTrend[len - 2] || 1;
    return Math.round(((current - previous) / previous) * 100);
  }, [activeTrend]);

  const newGrowth = useMemo(() => {
    const len = newTrend.length;
    if (len < 2) return 0;
    const current = newTrend[len - 1];
    const previous = newTrend[len - 2];
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [newTrend]);

  const seekerGrowth = useMemo(() => {
    const len = seekerTrend.length;
    if (len < 2) return 0;
    const current = seekerTrend[len - 1];
    const previous = seekerTrend[len - 2] || 1;
    return Math.round(((current - previous) / previous) * 100);
  }, [seekerTrend]);

  const districts = unique(allMembers.map(m => m.district));
  const memberTypes = unique(allMembers.map(m => m.memberType));
  const highestEducationOpts = unique(allMembers.map(m => m.highest_education));
  const preferredJobRoleOpts = unique(
    allMembers.flatMap((m) => {
      let r = m.preferredJobRole_Sector || [];
      if (typeof r === 'string') return r.split(',').map(item => item.trim());
      if (Array.isArray(r)) return r.map(item => String(item).trim());
      return [];
    })
  );
  const relocationStatusOpts = unique(allMembers.map(m => m.relocationStatus));
  const referrerStatusOpts = unique(allMembers.map(m => m.referrerStatus));

  const skillsOptions = unique(
    allMembers.flatMap(m => {
      let s = m.skills || [];
      if (typeof s === 'string') return s.split(',').map(item => item.trim());
      if (Array.isArray(s)) return s.map(item => String(item).trim());
      return [];
    })
  );

  const membersFilterConfig = {
    labels: {
      name: 'Name', initialNumber: 'Min Age', finalNumber: 'Max Age', district: 'District',
      nDistrict: 'Native District', profession: 'Profession', memberType: 'Member Type', gender: 'Gender',
      symMemberStatus: 'Solidarity Member Status', seekerNeed: 'Seeker Need', highest_education: 'Highest Education',
      preferredJobRole_Sector: 'Preferred Job Role', workExp: 'Work Experience', relocationStatus: 'Relocation Status',
      jobOfferType: 'Job Offer Type', offeringSector: 'Offering Sector', referrerStatus: 'Referrer Status',
      levelOfSupport: 'Level Of Support', interest_SkillBuildingProgram: 'Skill Program', forGrouping: 'Group Tags',
      startDate: 'Member Since From', endDate: 'Member Since To', skills: 'Skills'
    },
    fieldTypes: {
      name: 'string', initialNumber: 'number', finalNumber: 'number', district: 'string',
      nDistrict: 'string', profession: 'string', memberType: 'string', gender: 'string', symMemberStatus: 'string',
      seekerNeed: 'array', highest_education: 'string', preferredJobRole_Sector: 'string', workExp: 'string',
      relocationStatus: 'string', jobOfferType: 'array', offeringSector: 'array', referrerStatus: 'string',
      levelOfSupport: 'array', interest_SkillBuildingProgram: 'string', forGrouping: 'array',
      startDate: 'date', endDate: 'date', skills: 'string'
    },
    formatters: { array: (v) => Array.isArray(v) ? v.join(', ') : v, number: (v) => v ? v.toString() : '' },
  };

  if (loading) return (
    <div className={styles.loaderWrap}><div className={styles.loader} /></div>
  );

  const statCards = [
    { label: 'Total Members', value: totalMembers, icon: User, color: '#2563eb', spark: totalTrend, growth: totalGrowth },
    { label: 'Active Members', value: activeMembers, icon: Briefcase, color: '#16a34a', spark: activeTrend, growth: activeGrowth },
    { label: 'New This Month', value: newThisMonth, icon: User, color: '#7c3aed', spark: newTrend, growth: newGrowth },
    { label: 'Job Seekers', value: jobSeekers, icon: Star, color: '#d97706', spark: seekerTrend, growth: seekerGrowth },
  ];

  const TABS = ['All Members', 'Job Seekers', 'Providers', 'Mentors', 'Recruiters', 'Referees'];

  // page number list
  const getPageNums = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className={styles.membersPage}>

      <div className={styles.pageBody}>

        {/* ── topToolbar ── */}
        <div className={styles.topToolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search members by name, email, phone or location..."
              value={globalFilter || ''}
              onChange={(e) => { setGlobalFilter(e.target.value); setPage(1); }}
            />
          </div>

          <div className={styles.actionGroup}>
            <button className={`${styles.actionBtn} ${showFilters ? styles.actionBtnActive : ''}`}
              onClick={() => setShowFilters(!showFilters)} type="button">
              {showFilters ? <X size={15} /> : <Filter size={15} />} Filters
            </button>
            <button onClick={exportToExcel} className={`${styles.actionBtn} ${styles.actionBtnExcel}`} type="button">
              <Download size={15} /> Export Excel
            </button>
            <button onClick={exportToCSV} className={`${styles.actionBtn} ${styles.actionBtnCsv}`} type="button">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className={styles.statsGrid}>
          {statCards.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statCardTop}>
                <div className={styles.statIconWrap} style={{ background: `${s.color}15`, color: s.color }}>
                  <s.icon size={22} />
                </div>
                <div className={styles.statNumbers}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <h3 className={styles.statValue}>{s.value.toLocaleString()}</h3>
                </div>
              </div>
              <div className={styles.statTrend} style={{ color: s.growth >= 0 ? '#16a34a' : '#dc2626' }}>
                {s.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {Math.abs(s.growth)}% <span>from last month</span>
              </div>
              <div className={styles.sparkWrap}>
                <Sparkline points={s.spark} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* ── PRESERVED HORIZONTAL SCROLLABLE FILTER PANEL ── */}
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
                  <label>MEMBER SINCE FROM</label>
                  <input
                    type="date"
                    value={filterValues.startDate || ''}
                    onChange={(e) => {
                      const newFilters = { ...filterValues, startDate: e.target.value || null };
                      setFilterValues(newFilters);
                      applyFilters(newFilters);
                    }}
                  />
                </div>

                <div className={styles.filterField}>
                  <label>MEMBER SINCE TO</label>
                  <input
                    type="date"
                    value={filterValues.endDate || ''}
                    onChange={(e) => {
                      const newFilters = { ...filterValues, endDate: e.target.value || null };
                      setFilterValues(newFilters);
                      applyFilters(newFilters);
                    }}
                  />
                </div>

                <div className={styles.filterField}>
                  <label>SKILLS</label>
                  <select
                    value={filterValues.skills || ''}
                    onChange={(e) => {
                      const newFilters = { ...filterValues, skills: e.target.value || null };
                      setFilterValues(newFilters);
                      applyFilters(newFilters);
                    }}
                  >
                    <option value="">All Skills</option>
                    {skillsOptions.map(skill => (
                      <option key={skill} value={skill}>
                        {skill.length > 20 ? `${skill.substring(0, 20)}...` : skill}
                      </option>
                    ))}
                  </select>
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
                    {highestEducationOpts.map(edu => (
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
                    {preferredJobRoleOpts.map(role => (
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
                    {relocationStatusOpts.map(status => (
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
                    {referrerStatusOpts.map(status => (
                      <option key={status} value={status}>
                        {status.length > 20 ? `${status.substring(0, 20)}...` : status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className={styles.clearAllButton}
                  onClick={clearAllFilters}
                  type="button"
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* ── members panel ── */}
        <div className={styles.membersPanel}>
          {/* panel top: tabs + view switch */}
          <div className={styles.membersPanelTop}>
            <div className={styles.memberTabs}>
              {TABS.map(tab => (
                <button key={tab} type="button"
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                  onClick={() => { setActiveTab(tab); setPage(1); }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.viewSwitch}>
              <button className={`${styles.viewBtn} ${view === 'table' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('table')} type="button" title="Table view">
                <List size={16} />
              </button>
              <button className={`${styles.viewBtn} ${view === 'card' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('card')} type="button" title="Card view">
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* ── TABLE VIEW ── */}
          {view === 'table' ? (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.membersTable}>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Joined On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((member) => (
                      <tr key={member._id} className={styles.tableRow}>

                        <td data-label="Member">
                          <div className={styles.memberCell} onClick={() => handleRowClick(member)}>
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
                        <td data-label="Role">
                          <span
                            className={styles.roleBadge}
                            onClick={(e) => { e.stopPropagation(); navigate(getDetailRoute(member)); }}
                            style={{ cursor: 'pointer' }}
                            title={`View ${member.memberType || 'Member'} profile`}
                          >
                            {member.memberType || 'Member'}
                          </span>
                        </td>
                        <td data-label="Email" className={styles.cellMuted}>{member.email || '—'}</td>
                        <td data-label="Phone">
                          <div className={styles.inlineIconText}>
                            <Phone size={13} />
                            <span>{member.mobileNumber || '—'}</span>
                          </div>
                        </td>
                        <td data-label="Location">
                          <div className={styles.inlineIconText}>
                            <MapPin size={13} />
                            <span>{member.district || '—'}</span>
                          </div>
                        </td>
                        <td data-label="Status">
                          <span className={styles.statusBadge}>
                            <span className={styles.statusDot} />
                            {member.symMemberStatus || 'Active'}
                          </span>
                        </td>
                        <td data-label="Joined On" className={styles.cellMuted}>{formatJoinedDate(member.timestamp, member.createdAt)}</td>
                        <td data-label="Actions">
                          <div className={styles.actionButtons}>
                            <button className={styles.actionIconBtn} title="View"
                              onClick={() => navigate(getDetailRoute(member))} type="button">
                              <Eye size={14} />
                            </button>
                            {user?.role === 'Admin' && (
                              <>
                                <button className={styles.actionIconBtn} title="Edit"
                                  onClick={() => handleEdit(member)} type="button">
                                  <Edit size={14} />
                                </button>
                                <button className={`${styles.actionIconBtn} ${styles.actionIconBtnDel}`}
                                  title="Delete" onClick={() => handleDelete(member._id)} type="button">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pageData.length === 0 && (
                      <tr><td colSpan={9}>
                        <div className={styles.emptyState}>No members found for the selected filters.</div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── pagination ── */}
              <div className={styles.tableFooter}>
                <p>Showing {filteredMembers.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filteredMembers.length)} of {filteredMembers.length} members</p>
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                  {getPageNums().map((n, i) =>
                    n === '...'
                      ? <span key={`d${i}`} className={styles.pageDots}>...</span>
                      : <button key={n} className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                        onClick={() => setPage(n)}>{n}</button>
                  )}
                  <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className={styles.perPage}>
                  <span>Show</span>
                  <div className={styles.perPageSelect}>
                    <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                    <ChevronDown size={12} className={styles.selectArrow} />
                  </div>
                  <span>per page</span>
                </div>
              </div>
            </>
          ) : (
            /* ── CARD VIEW ── */
            <>
              <div className={styles.cardsGrid}>
                {pageData.map((member) => (
                  <div key={member._id} className={styles.memberCard}>
                    <div className={styles.memberCardTop}>
                      <div className={styles.memberCardIdentity} onClick={() => navigate(getDetailRoute(member))}>
                        <AvatarCircle
                          name={member.name}
                          photo={member.photoUrl ? getDirectImageUrl(member.photoUrl) : null}
                          size={48}
                        />
                        <div>
                          <h3>{member.name || 'Unnamed Member'}</h3>
                          <p>{member.memberType || 'Member'}</p>
                        </div>
                      </div>
                      {user?.role === 'Admin' && (
                        <div className={styles.cardActions}>
                          <button className={styles.actionIconBtn} onClick={() => handleEdit(member)} type="button" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className={`${styles.actionIconBtn} ${styles.actionIconBtnDel}`} onClick={() => handleDelete(member._id)} type="button" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardDetails} onClick={() => navigate(getDetailRoute(member))}>
                      <div><Mail size={14} /> <span>{member.email || '—'}</span></div>
                      <div><Phone size={14} /> <span>{member.mobileNumber || '—'}</span></div>
                      <div><Calendar size={14} /> <span>{member.age || formatAge(member.dob)}</span></div>
                      <div><MapPin size={14} /> <span>{member.district || '—'}</span></div>
                    </div>
                  </div>
                ))}
                {pageData.length === 0 && (
                  <div className={styles.emptyCardState}>No members found for the selected filters.</div>
                )}
              </div>

              {/* ── card view pagination ── */}
              <div className={styles.tableFooter}>
                <p>Showing {filteredMembers.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filteredMembers.length)} of {filteredMembers.length} members</p>
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                  {getPageNums().map((n, i) =>
                    n === '...'
                      ? <span key={`d${i}`} className={styles.pageDots}>...</span>
                      : <button key={n} className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                        onClick={() => setPage(n)}>{n}</button>
                  )}
                  <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className={styles.perPage}>
                  <span>Show</span>
                  <div className={styles.perPageSelect}>
                    <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                    <ChevronDown size={12} className={styles.selectArrow} />
                  </div>
                  <span>per page</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Members;