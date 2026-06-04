
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

// ── Pagination config ──────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ── Status badge color mapping (RED THEME) ──────────────
const STATUS_MAP = {
  active:         { label: "ACTIVE",        bg: "#e11d48", color: "#fff" },
  yes:            { label: "YES",           bg: "#d1fae5", color: "#065f46" },
  "may be in future": { label: "MAY BE IN FUTURE", bg: "#f3e8ff", color: "#6b21a8" },
  no:             { label: "NO",            bg: "#fee2e2", color: "#991b1b" },
  verified:       { label: "VERIFIED",      bg: "#fecdd3", color: "#be123c" },
  referee:        { label: "REFEREE",       bg: "#fce7f3", color: "#be185d" },
};

const getStatus = (raw = "") => {
  const key = raw.toLowerCase().trim();
  return STATUS_MAP[key] || { label: raw.toUpperCase() || "REFEREE", bg: "#fecdd3", color: "#be123c" };
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

// ── Avatar initials fallback (RED THEME) ────────────────────────────────
const AVATAR_COLORS = [
  ["#fecdd3","#be123c"],  // Red
  ["#fce7f3","#be185d"],  // Pink
  ["#d1fae5","#065f46"],  // Green
  ["#fef3c7","#b45309"],  // Orange
  ["#f3e8ff","#6b21a8"],  // Purple
  ["#dbeafe","#1e40af"],  // Blue
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

const RefereePage = () => {
  const context = useOutletContext();
  const sidebarCollapsed = context?.sidebarCollapsed || false;
  
  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filterValues, setFilterValues] = useState({
    occupation: '',
    district: '',
    sector: '',
    referrerStatus: '',
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
      if (r.occupation) {
        const trimmed = r.occupation.trim();
        if (trimmed) occSet.add(trimmed);
      }
    });
    return Array.from(occSet).sort();
  }, [referees]);

  const allDistricts = useMemo(() => {
    const distSet = new Set();
    referees.forEach((r) => {
      if (r.district) {
        const trimmed = r.district.trim();
        if (trimmed) distSet.add(trimmed);
      }
    });
    return Array.from(distSet).sort();
  }, [referees]);

  const allSectors = useMemo(() => {
    const secSet = new Set();
    referees.forEach((r) => {
      if (r.sector) {
        const trimmed = r.sector.trim();
        if (trimmed) secSet.add(trimmed);
      }
    });
    return Array.from(secSet).sort();
  }, [referees]);

  const allStatuses = useMemo(() => {
    const statusSet = new Set();
    referees.forEach((r) => {
      if (r.referrerStatus) {
        const trimmed = r.referrerStatus.trim();
        if (trimmed) statusSet.add(trimmed);
      }
    });
    return Array.from(statusSet).sort();
  }, [referees]);

  const refereeFilterConfig = {
    labels: {
      occupation: "Occupation",
      district: "District",
      sector: "Industry / Sector",
      referrerStatus: "Referrer Status",
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

    return matchesSearch && matchesOccupation && matchesDistrict && matchesSector && matchesStatus;
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

  // Stats (from new theme)
  const activeCount = referees.filter(r => (r.referrerStatus || "").toLowerCase() === "active").length;
  const verifiedCount = referees.filter(r => (r.referrerStatus || "").toLowerCase() === "yes").length;
  const secondStatValue = activeCount || verifiedCount || referees.length;

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

        {/* ── STATS ROW (RED THEME) ── */}
        <div className={styles.statsRow}>
          <StatCard
            icon={<Users size={18} />}
            label="Total Referees"
            value={referees.length}
            color="#fff"
            bg="#e11d48"
          />
          <StatCard
            icon={<UserCheck size={18} />}
            label="Active"
            value={secondStatValue}
            color="#065f46"
            bg="#d1fae5"
          />
          <StatCard
            icon={<Briefcase size={18} />}
            label="Showing Now"
            value={filteredReferees.length}
            color="#be123c"
            bg="#fecdd3"
          />
        </div>

        {/* ── FILTER TOGGLE & PANEL (fully preserved) ── */}
        <div className={styles.filterSection}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggleButton}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? <X size={18} /> : <Filter size={18} />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {showFilters && (
          <div className={styles.horizontalFilterContainer}>
            <div className={styles.filterRowWithScroll}>
              <div className={styles.filterRowContent}>
                <div className={styles.filterField}>
                  <label>Occupation</label>
                  <select
                    value={filterValues.occupation || ""}
                    onChange={(e) => handleFilterChange("occupation", e.target.value)}
                  >
                    <option value="">All Occupations</option>
                    {allOccupations.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>District</label>
                  <select
                    value={filterValues.district || ""}
                    onChange={(e) => handleFilterChange("district", e.target.value)}
                  >
                    <option value="">All Districts</option>
                    {allDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Industry / Sector</label>
                  <select
                    value={filterValues.sector || ""}
                    onChange={(e) => handleFilterChange("sector", e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    {allSectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Referrer Status</label>
                  <select
                    value={filterValues.referrerStatus || ""}
                    onChange={(e) => handleFilterChange("referrerStatus", e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
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