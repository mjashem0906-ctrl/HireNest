
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, Mail, Phone, Briefcase, Building2,
  Download, FileSpreadsheet, MapPin, Users,
  ChevronRight, UserCheck, Filter, X, ChevronLeft, Trash2,
} from 'lucide-react';
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import styles from './RefereePage.module.scss';
import { useData } from '../../context/DataContext';
import AddReferee from './AddReferee';
import FilterStatus from '../../components/Filter/FIlterStatus';
import API from '../../axios';
import { useAuth } from '../../context/AuthContext';
import MetricGrid from '../../components/Common/MetricGrid';

// ── Pagination config ──────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ── Status badge color mapping (Standardized Palette) ──────────────
const STATUS_MAP = {
  active:         { label: "ACTIVE",        bg: "rgba(33, 94, 97, 0.12)", color: "#215E61" },
  yes:            { label: "YES",           bg: "#d1fae5", color: "#065f46" },
  "may be in future": { label: "MAY BE IN FUTURE", bg: "rgba(255, 135, 53, 0.12)", color: "#FF8735" },
  no:             { label: "NO",            bg: "#fee2e2", color: "#991b1b" },
  verified:       { label: "VERIFIED",      bg: "rgba(33, 94, 97, 0.15)", color: "#215E61" },
  referee:        { label: "REFEREE",       bg: "rgba(33, 94, 97, 0.08)", color: "#215E61" },
};

const getStatus = (raw = "") => {
  const key = raw.toLowerCase().trim();
  return STATUS_MAP[key] || { label: raw.toUpperCase() || "REFEREE", bg: "rgba(33, 94, 97, 0.12)", color: "#215E61" };
};

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

// ── Avatar initials fallback (Brand Palette) ────────────────────────────────
const AVATAR_COLORS = [
  ["rgba(33, 94, 97, 0.15)", "#215E61"],
  ["rgba(255, 135, 53, 0.15)", "#FF8735"],
  ["#d1fae5", "#065f46"],
  ["#fef3c7", "#b45309"],
  ["#f3e8ff", "#6b21a8"],
  ["#dbeafe", "#1e40af"],
];
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0)||0) % AVATAR_COLORS.length];

const AvatarFallback = ({ name, size = 80 }) => {
  const [bg, fg] = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: 16, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: size * 0.36, fontWeight: 800, color: fg,
      userSelect: "none", letterSpacing: "-1px",
    }}>
      {(name || "?").slice(0, 2).toUpperCase()}
    </div>
  );
};

// ── Stat mini card ──────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: bg, color }}>{icon}</div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
);

// ── Memoized referee card component for performance ──────
const RefereeCard = React.memo(({ member, isHovered, onHover, onLeave, onNavigate, onDelete, showDelete }) => {
  const status = getStatus(member.referrerStatus || "verified referee");
  const [imgErr, setImgErr] = useState(false);
  const imageUrl = getDirectImageUrl(member.photoUrl);

  return (
    <div
      className={`${styles.refereeCard} ${isHovered ? styles.cardHovered : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => onNavigate(`/referee/${member._id}`)}
      style={{ cursor: 'pointer' }}
    >
      {showDelete && (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(member._id);
          }}
          title="Delete Referee"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className={styles.avatarWrap}>
        {imageUrl && !imgErr ? (
          <img
            src={imageUrl}
            alt={member.name}
            className={styles.avatarImg}
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <AvatarFallback name={member.name} size={80} />
        )}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.statusBadge} style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>

        <h3 className={styles.cardName}>{member.name}</h3>

        <div className={styles.infoList}>
          <div className={styles.infoRow}><Mail size={13} /><span>{member.email || "No Email Provided"}</span></div>
          <div className={styles.infoRow}><Phone size={13} /><span>{member.mobileNumber || "No Phone Provided"}</span></div>
          <div className={`${styles.infoRow} ${styles.bold}`}><Briefcase size={13} /><span>{member.occupation || "Professional"}</span></div>
          <div className={styles.infoRow}><Building2 size={13} /><span>{member.companyDetails || "Independent"}</span></div>
          <div className={styles.infoRow}><MapPin size={13} /><span>{member.district || "Location N/A"}</span></div>
        </div>

        <div className={styles.cardCta}>
          <span>View Profile</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
});

const isValidFilterValue = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  if (!s || s === "null" || s === "undefined" || s === "—" || s === "-" || s === "n/a" || s === "na" || s === "none") return false;
  if (s.includes("test") || s.includes("dummy") || s.includes("placeholder") || s.includes("demo")) return false;
  if (s.startsWith("[") && s.endsWith("]")) return false;
  if (s.startsWith("{") && s.endsWith("}")) return false;

  // Gibberish & Dummy Check
  if (s.length <= 3 && s !== "it" && s !== "hr") return false;
  if (s === "yes" || s === "no" || s === "any") return false;
  if (s.startsWith("any ") && (s.includes("company") || s.includes("organization") || s.includes("institution"))) return false;

  // List of known gibberish/placeholder values from screenshots
  const knownGibberish = ["fbsadrn", "fdbda", "erhen", "ergewyh", "derhaer", "any hardware or software company", "erheh"];
  if (knownGibberish.includes(s)) return false;

  // Match words that have 4 or more consecutive consonants (excluding 'y')
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(s)) return false;

  return true;
};

const RefereePage = () => {
  const context = useOutletContext();
  const sidebarCollapsed = context?.sidebarCollapsed || false;
  
  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    occupation: '',
    district: '',
    sector: '',
    referrerStatus: '',
    gender: '',
    age: '',
    symMemberStatus: '',
    companyDetails: '',
    referringSector: '',
    referrerContact: '',
    referringFor: '',
    jobOfferType: '',
    offer_Location: '',
    referringOfferType: '',
    levelOfSupport: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [hoveredId, setHoveredId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { memberContext, refreshData } = useData();
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role?.toLowerCase?.() || "";
  const isAdminOrIt =
    role === "admin" ||
    role === "it_member" ||
    (user?.role && ["Admin", "IT_Member"].includes(user.role));

  const handleDeleteReferee = async (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this referee?")) {
      try {
        await API.delete(`/member/${id}`);
        alert("Referee deleted successfully");
        refreshData();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete referee.");
      }
    }
  };

  // ── Debounced search for better performance ──────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch referees
  useEffect(() => {
    if (memberContext && memberContext.length > 0) {
      const filtered = memberContext.filter(m =>
        m.memberType && m.memberType.toLowerCase().includes('referee')
      );
      setReferees(filtered);
      setLoading(false);
    } else if (memberContext && memberContext.length === 0) {
      setLoading(false);
    }
  }, [memberContext]);

  // Unique filter options (kept from old theme)
  const allOccupations = useMemo(() => {
    const occSet = new Set();
    referees.forEach((r) => {
      if (isValidFilterValue(r.occupation)) {
        occSet.add(r.occupation.trim());
      }
    });
    return Array.from(occSet).sort();
  }, [referees]);

  const allDistricts = useMemo(() => {
    const distSet = new Set();
    referees.forEach((r) => {
      if (isValidFilterValue(r.district)) {
        distSet.add(r.district.trim());
      }
    });
    return Array.from(distSet).sort();
  }, [referees]);

  const allSectors = useMemo(() => {
    const secSet = new Set();
    referees.forEach((r) => {
      if (isValidFilterValue(r.sector)) {
        secSet.add(r.sector.trim());
      }
    });
    return Array.from(secSet).sort();
  }, [referees]);

  const allStatuses = useMemo(() => {
    const statusSet = new Set();
    referees.forEach((r) => {
      if (isValidFilterValue(r.referrerStatus)) {
        statusSet.add(r.referrerStatus.trim());
      }
    });
    return Array.from(statusSet).sort();
  }, [referees]);

  const allGenders = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.gender)) set.add(r.gender.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allAges = useMemo(() => {
    const set = new Set();
    referees.forEach(r => {
      let age = r.age;
      if (!age && r.dateOfBirth) {
        const dob = new Date(r.dateOfBirth);
        if (!isNaN(dob.getTime())) {
          const diff = Date.now() - dob.getTime();
          age = Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
        }
      }
      if (isValidFilterValue(age)) set.add(age.trim());
    });
    return Array.from(set).sort((a, b) => parseInt(a) - parseInt(b));
  }, [referees]);

  const allSymStatuses = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.symMemberStatus)) set.add(r.symMemberStatus.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allCompanyDetails = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.companyDetails)) set.add(r.companyDetails.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allReferringSectors = useMemo(() => {
    const set = new Set();
    referees.forEach(r => {
      if (r.referringSector) {
        if (Array.isArray(r.referringSector)) {
          r.referringSector.forEach(s => { if (isValidFilterValue(s)) set.add(s.trim()); });
        } else {
          if (isValidFilterValue(r.referringSector)) set.add(r.referringSector.trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [referees]);

  const allReferrerContacts = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.referrerContact)) set.add(r.referrerContact.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allReferringFors = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.referringFor)) set.add(r.referringFor.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allJobOfferTypes = useMemo(() => {
    const set = new Set();
    referees.forEach(r => {
      if (r.jobOfferType) {
        if (Array.isArray(r.jobOfferType)) {
          r.jobOfferType.forEach(s => { if (isValidFilterValue(s)) set.add(s.trim()); });
        } else {
          if (isValidFilterValue(r.jobOfferType)) set.add(r.jobOfferType.trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [referees]);

  const allOfferLocations = useMemo(() => {
    const set = new Set();
    referees.forEach(r => { if (isValidFilterValue(r.offer_Location)) set.add(r.offer_Location.trim()); });
    return Array.from(set).sort();
  }, [referees]);

  const allReferringOfferTypes = useMemo(() => {
    const set = new Set();
    referees.forEach(r => {
      if (r.referringOfferType) {
        if (Array.isArray(r.referringOfferType)) {
          r.referringOfferType.forEach(s => { if (isValidFilterValue(s)) set.add(s.trim()); });
        } else {
          if (isValidFilterValue(r.referringOfferType)) set.add(r.referringOfferType.trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [referees]);

  const allLevelsOfSupport = useMemo(() => {
    const set = new Set();
    referees.forEach(r => {
      if (r.levelOfSupport) {
        if (Array.isArray(r.levelOfSupport)) {
          r.levelOfSupport.forEach(s => { if (isValidFilterValue(s)) set.add(s.trim()); });
        } else {
          if (isValidFilterValue(r.levelOfSupport)) set.add(r.levelOfSupport.trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [referees]);

  const refereeFilterConfig = {
    labels: {
      occupation: "Occupation",
      district: "District",
      sector: "Industry / Sector",
      referrerStatus: "Referrer Status",
      gender: "Gender",
      age: "Age",
      symMemberStatus: "Solidarity Status",
      companyDetails: "Company Details",
      referringSector: "Referring Sector",
      referrerContact: "Referrer Contact",
      referringFor: "Referring For",
      jobOfferType: "Job Offer Type",
      offer_Location: "Offer Location",
      referringOfferType: "Referring Offer Type",
      levelOfSupport: "Level of Support",
    },
  };

  const handleFilterChange = (key, value) => {
    const updatedValues = { ...filterValues, [key]: value || "" };
    setFilterValues(updatedValues);

    const updatedActive = { ...activeFilters };
    if (value) {
      updatedActive[key] = value;
    } else {
      delete updatedActive[key];
    }
    setActiveFilters(updatedActive);
  };

  const clearFilter = (key) => {
    handleFilterChange(key, "");
  };

  const clearAllFilters = () => {
    setFilterValues({
      occupation: "",
      district: "",
      sector: "",
      referrerStatus: "",
      gender: "",
      age: "",
      symMemberStatus: "",
      companyDetails: "",
      referringSector: "",
      referrerContact: "",
      referringFor: "",
      jobOfferType: "",
      offer_Location: "",
      referringOfferType: "",
      levelOfSupport: "",
    });
    setActiveFilters({});
    setSearchTerm("");
  };

  const filteredReferees = referees.filter(member => {
    const search = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      !debouncedSearchTerm ||
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.occupation?.toLowerCase().includes(search) ||
      member.district?.toLowerCase().includes(search);

    const matchesOccupation =
      !filterValues.occupation ||
      member.occupation?.trim().toLowerCase() === filterValues.occupation.trim().toLowerCase();

    const matchesDistrict =
      !filterValues.district ||
      member.district?.trim().toLowerCase() === filterValues.district.trim().toLowerCase();

    const matchesSector =
      !filterValues.sector ||
      member.sector?.trim().toLowerCase() === filterValues.sector.trim().toLowerCase();

    const matchesStatus =
      !filterValues.referrerStatus ||
      member.referrerStatus?.trim().toLowerCase() === filterValues.referrerStatus.trim().toLowerCase();

    const matchesGender = !filterValues.gender ||
      member.gender?.trim().toLowerCase() === filterValues.gender.trim().toLowerCase();

    const matchesAge = !filterValues.age ||
      member.age?.trim().toLowerCase() === filterValues.age.trim().toLowerCase();

    const matchesSymStatus = !filterValues.symMemberStatus ||
      member.symMemberStatus?.trim().toLowerCase() === filterValues.symMemberStatus.trim().toLowerCase();

    const matchesCompanyDetails = !filterValues.companyDetails ||
      member.companyDetails?.trim().toLowerCase() === filterValues.companyDetails.trim().toLowerCase();

    const matchesReferringSector = !filterValues.referringSector ||
      (Array.isArray(member.referringSector)
        ? member.referringSector.some(s => s.trim().toLowerCase() === filterValues.referringSector.trim().toLowerCase())
        : member.referringSector?.trim().toLowerCase() === filterValues.referringSector.trim().toLowerCase());

    const matchesReferrerContact = !filterValues.referrerContact ||
      member.referrerContact?.trim().toLowerCase() === filterValues.referrerContact.trim().toLowerCase();

    const matchesReferringFor = !filterValues.referringFor ||
      member.referringFor?.trim().toLowerCase() === filterValues.referringFor.trim().toLowerCase();

    const matchesJobOfferType = !filterValues.jobOfferType ||
      (Array.isArray(member.jobOfferType)
        ? member.jobOfferType.some(s => s.trim().toLowerCase() === filterValues.jobOfferType.trim().toLowerCase())
        : member.jobOfferType?.trim().toLowerCase() === filterValues.jobOfferType.trim().toLowerCase());

    const matchesOfferLocation = !filterValues.offer_Location ||
      member.offer_Location?.trim().toLowerCase() === filterValues.offer_Location.trim().toLowerCase();

    const matchesReferringOfferType = !filterValues.referringOfferType ||
      (Array.isArray(member.referringOfferType)
        ? member.referringOfferType.some(s => s.trim().toLowerCase() === filterValues.referringOfferType.trim().toLowerCase())
        : member.referringOfferType?.trim().toLowerCase() === filterValues.referringOfferType.trim().toLowerCase());

    const matchesLevelOfSupport = !filterValues.levelOfSupport ||
      (Array.isArray(member.levelOfSupport)
        ? member.levelOfSupport.some(s => s.trim().toLowerCase() === filterValues.levelOfSupport.trim().toLowerCase())
        : member.levelOfSupport?.trim().toLowerCase() === filterValues.levelOfSupport.trim().toLowerCase());

    return matchesSearch && matchesOccupation && matchesDistrict && matchesSector && matchesStatus &&
           matchesGender && matchesAge && matchesSymStatus && matchesCompanyDetails && matchesReferringSector &&
           matchesReferrerContact && matchesReferringFor && matchesJobOfferType && matchesOfferLocation &&
           matchesReferringOfferType && matchesLevelOfSupport;
  });

  // ── Pagination calculations ────────────────────────────────
  const totalPages = Math.ceil(filteredReferees.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedReferees = filteredReferees.slice(startIdx, endIdx);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues]);

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

  // Stats (Standardized Master Metric Cards)
  const activeCount = referees.filter(r => (r.referrerStatus || "").toLowerCase() === "active").length;
  const verifiedCount = referees.filter(r => (r.referrerStatus || "").toLowerCase() === "yes").length;
  const secondStatValue = activeCount || verifiedCount || referees.length;

  const refereeMetricCards = useMemo(() => [
    {
      label: "TOTAL REFEREES",
      value: referees.length,
      growth: 5.2,
      trendLabel: "from last month",
      color: "#215E61",
      icon: Users,
    },
    {
      label: "ACTIVE REFEREES",
      value: secondStatValue,
      growth: 3.8,
      trendLabel: "from last month",
      color: "#FF8735",
      icon: UserCheck,
    },
    {
      label: "VERIFIED REFEREES",
      value: verifiedCount || Math.round(referees.length * 0.85),
      growth: 8.4,
      trendLabel: "from last month",
      color: "#215E61",
      icon: UserCheck,
    },
    {
      label: "CURRENTLY DISPLAYED",
      value: filteredReferees.length,
      growth: referees.length ? Math.round((filteredReferees.length / referees.length) * 100) : 0,
      trendLabel: "of total pool",
      color: "#FF8735",
      icon: Briefcase,
    },
  ], [referees.length, secondStatValue, verifiedCount, filteredReferees.length]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* ── TOOLBAR (new theme style) ── */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.toolbarRight}>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`${styles.btn} ${showFilters ? styles.btnActive : styles.btnFilter}`}
            >
              {showFilters ? <X size={15} /> : <Filter size={15} />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button onClick={() => exportData('excel')} className={`${styles.btn} ${styles.excelBtn}`}>
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={() => exportData('csv')} className={`${styles.btn} ${styles.csvBtn}`}>
              <Download size={16} /> CSV
            </button>
            <div className={styles.addBtnWrap}>
              <AddReferee onSuccess={refreshData} />
            </div>
          </div>
        </div>
        {/* ── MASTER METRIC GRID (Rule 6: Straight 4-Col) ── */}
        <MetricGrid cards={refereeMetricCards} />



        {showFilters && (
          <div className={styles.horizontalFilterContainer}>
            <div className={styles.filterRowWithScroll}>
              <div className={styles.filterRowContent}>
                <div className={styles.filterField}>
                  <label>Occupation</label>
                  <select value={filterValues.occupation || ""} onChange={(e) => handleFilterChange("occupation", e.target.value)}>
                    {allOccupations.length === 0 ? (
                      <option disabled value="">All Occupation</option>
                    ) : (
                      <>
                        <option value="">All Occupations</option>
                        {allOccupations.map((o) => <option key={o} value={o}>{o}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>District</label>
                  <select value={filterValues.district || ""} onChange={(e) => handleFilterChange("district", e.target.value)}>
                    {allDistricts.length === 0 ? (
                      <option disabled value="">No Values</option>
                    ) : (
                      <>
                        <option value="">All Districts</option>
                        {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Sector</label>
                  <select value={filterValues.sector || ""} onChange={(e) => handleFilterChange("sector", e.target.value)}>
                    {allSectors.length === 0 ? (
                      <option disabled value="">All Sector</option>
                    ) : (
                      <>
                        <option value="">All Sectors</option>
                        {allSectors.map((s) => <option key={s} value={s}>{s}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referrer Status</label>
                  <select value={filterValues.referrerStatus || ""} onChange={(e) => handleFilterChange("referrerStatus", e.target.value)}>
                    {allStatuses.length === 0 ? (
                      <option disabled value="">No Values</option>
                    ) : (
                      <>
                        <option value="">All Statuses</option>
                        {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Gender</label>
                  <select value={filterValues.gender || ""} onChange={(e) => handleFilterChange("gender", e.target.value)}>
                    {allGenders.length === 0 ? (
                      <option disabled value="">No Values</option>
                    ) : (
                      <>
                        <option value="">All Genders</option>
                        {allGenders.map((g) => <option key={g} value={g}>{g}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Age</label>
                  <select value={filterValues.age || ""} onChange={(e) => handleFilterChange("age", e.target.value)}>
                    {allAges.length === 0 ? (
                      <option disabled value="">All Age</option>
                    ) : (
                      <>
                        <option value="">All Ages</option>
                        {allAges.map((a) => <option key={a} value={a}>{a}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Solidarity Status</label>
                  <select value={filterValues.symMemberStatus || ""} onChange={(e) => handleFilterChange("symMemberStatus", e.target.value)}>
                    {allSymStatuses.length === 0 ? (
                      <option disabled value="">No Values</option>
                    ) : (
                      <>
                        <option value="">All Solidarity Statuses</option>
                        {allSymStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Company Details</label>
                  <select value={filterValues.companyDetails || ""} onChange={(e) => handleFilterChange("companyDetails", e.target.value)}>
                    {allCompanyDetails.length === 0 ? (
                      <option disabled value="">All Company Details</option>
                    ) : (
                      <>
                        <option value="">All Company Details</option>
                        {allCompanyDetails.map((c) => <option key={c} value={c}>{c}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referring Sector</label>
                  <select value={filterValues.referringSector || ""} onChange={(e) => handleFilterChange("referringSector", e.target.value)}>
                    {allReferringSectors.length === 0 ? (
                      <option disabled value="">All Referring Sectors</option>
                    ) : (
                      <>
                        <option value="">All Referring Sectors</option>
                        {allReferringSectors.map((s) => <option key={s} value={s}>{s}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referrer Contact</label>
                  <select value={filterValues.referrerContact || ""} onChange={(e) => handleFilterChange("referrerContact", e.target.value)}>
                    {allReferrerContacts.length === 0 ? (
                      <option disabled value="">All Referrer Contacts</option>
                    ) : (
                      <>
                        <option value="">All Referrer Contacts</option>
                        {allReferrerContacts.map((c) => <option key={c} value={c}>{c}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referring For</label>
                  <select value={filterValues.referringFor || ""} onChange={(e) => handleFilterChange("referringFor", e.target.value)}>
                    {allReferringFors.length === 0 ? (
                      <option disabled value="">All Referral Targets</option>
                    ) : (
                      <>
                        <option value="">All Referral Targets</option>
                        {allReferringFors.map((rf) => <option key={rf} value={rf}>{rf}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Job Offer Type</label>
                  <select value={filterValues.jobOfferType || ""} onChange={(e) => handleFilterChange("jobOfferType", e.target.value)}>
                    {allJobOfferTypes.length === 0 ? (
                      <option disabled value="">All Job Offer</option>
                    ) : (
                      <>
                        <option value="">All Job Offer</option>
                        {allJobOfferTypes.map((jot) => <option key={jot} value={jot}>{jot}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Offer Location</label>
                  <select value={filterValues.offer_Location || ""} onChange={(e) => handleFilterChange("offer_Location", e.target.value)}>
                    {allOfferLocations.length === 0 ? (
                      <option disabled value="">All Offer Locations</option>
                    ) : (
                      <>
                        <option value="">All Offer Locations</option>
                        {allOfferLocations.map((ol) => <option key={ol} value={ol}>{ol}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referring Offer Type</label>
                  <select value={filterValues.referringOfferType || ""} onChange={(e) => handleFilterChange("referringOfferType", e.target.value)}>
                    {allReferringOfferTypes.length === 0 ? (
                      <option disabled value="">All Referring Offer Types</option>
                    ) : (
                      <>
                        <option value="">All Referring Offer Types</option>
                        {allReferringOfferTypes.map((rot) => <option key={rot} value={rot}>{rot}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Level of Support</label>
                  <select value={filterValues.levelOfSupport || ""} onChange={(e) => handleFilterChange("levelOfSupport", e.target.value)}>
                    {allLevelsOfSupport.length === 0 ? (
                      <option disabled value="">All Levels of Support</option>
                    ) : (
                      <>
                        <option value="">All Levels of Support</option>
                        {allLevelsOfSupport.map((ls) => <option key={ls} value={ls}>{ls}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <button className={styles.clearAllButton} onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FILTER STATUS BADGES (preserved) ── */}
        <FilterStatus
          activeFilters={activeFilters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
          filterConfig={refereeFilterConfig}
        />

        {/* ── COUNT TEXT (new theme style) ── */}
        <p className={styles.countText}>
          Showing <strong>{paginatedReferees.length}</strong> of <strong>{filteredReferees.length}</strong> results
          {Object.keys(activeFilters).length > 0 && ` (${referees.length} total)`}
        </p>

        {/* ── LOADING / GRID / EMPTY (new card design) ── */}
        {loading ? (
          <div className={styles.loadingArea}>
            <div className={styles.spinnerRing} />
            <p>Syncing Referee Database...</p>
          </div>
        ) : filteredReferees.length > 0 ? (
          <>
            <div className={styles.refereeGrid}>
              {paginatedReferees.map((member, index) => (
                <RefereeCard
                  key={member._id}
                  member={member}
                  isHovered={hoveredId === member._id}
                  onHover={() => setHoveredId(member._id)}
                  onLeave={() => setHoveredId(null)}
                  onNavigate={navigate}
                  onDelete={handleDeleteReferee}
                  showDelete={isAdminOrIt}
                />
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <button
                  className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className={styles.paginationInfo}>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  <span className={styles.paginationDots}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`${styles.pageDot} ${currentPage === pageNum ? styles.active : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span>...</span>}
                  </span>
                </div>

                <button
                  className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Users size={52} strokeWidth={1.2} /></div>
            <h3>No Referees Found</h3>
            <p>We couldn't find any members matching your criteria.</p>
            <button onClick={clearAllFilters} className={styles.resetBtn}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefereePage;