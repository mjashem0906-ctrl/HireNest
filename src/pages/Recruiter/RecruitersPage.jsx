import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Briefcase, Building2, UserCircle, Trash2, Mail, Phone, Link2, CheckCircle2, Share2, Filter, X
} from 'lucide-react';
import AddRecruiterModal from './AddRecruiterModal';
import styles from './RecruitersPage.module.scss';
import FilterStatus from '../../components/Filter/FIlterStatus';

const RecruitersPage = () => {
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
    registeredVia: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
      setRecruiters(response.data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay for smooth animation transition
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigation to details
    if (window.confirm("Are you sure you want to permanently remove this recruiter?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/recruiters/${id}`);
        fetchRecruiters(); // Refresh list after deletion
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
      // Fallback for older browsers
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

  // Auto-refresh list when the "Add Recruiter" popup window submits successfully
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'recruiter-added') {
        fetchRecruiters();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Unique Departments
  const allDepartments = useMemo(() => {
    const deptSet = new Set();
    recruiters.forEach((r) => {
      if (r.department) {
        const trimmed = r.department.trim();
        if (trimmed) deptSet.add(trimmed);
      }
    });
    return Array.from(deptSet).sort();
  }, [recruiters]);

  // Unique Designations
  const allDesignations = useMemo(() => {
    const desSet = new Set();
    recruiters.forEach((r) => {
      if (r.designation) {
        const trimmed = r.designation.trim();
        if (trimmed) desSet.add(trimmed);
      }
    });
    return Array.from(desSet).sort();
  }, [recruiters]);

  // Unique Locations
  const allLocations = useMemo(() => {
    const locSet = new Set();
    recruiters.forEach((r) => {
      if (r.location) {
        const trimmed = r.location.trim();
        if (trimmed) locSet.add(trimmed);
      }
    });
    return Array.from(locSet).sort();
  }, [recruiters]);

  const recruitersFilterConfig = {
    labels: {
      department: "Department",
      designation: "Role / Designation",
      location: "Hiring Region",
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
  };

  const clearFilter = (key) => {
    handleFilterChange(key, "");
  };

  const clearAllFilters = () => {
    setFilterValues({
      department: "",
      designation: "",
      location: "",
      registeredVia: "",
    });
    setActiveFilters({});
    setSearchTerm("");
  };

  const filteredRecruiters = recruiters.filter(recruiter => {
    // 1. Search term
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      recruiter.fullName?.toLowerCase().includes(term) ||
      recruiter.email?.toLowerCase().includes(term) ||
      recruiter.phone?.toLowerCase().includes(term) ||
      recruiter.companyName?.toLowerCase().includes(term);

    // 2. Department
    const matchesDept =
      !filterValues.department ||
      recruiter.department?.trim().toLowerCase() === filterValues.department.trim().toLowerCase();

    // 3. Designation
    const matchesDesignation =
      !filterValues.designation ||
      recruiter.designation?.trim().toLowerCase() === filterValues.designation.trim().toLowerCase();

    // 4. Location
    const matchesLocation =
      !filterValues.location ||
      recruiter.location?.trim().toLowerCase() === filterValues.location.trim().toLowerCase();

    // 5. Registered source
    let matchesSource = true;
    if (filterValues.registeredVia) {
      if (filterValues.registeredVia === 'form') {
        matchesSource = recruiter.registeredVia && recruiter.registeredVia !== 'admin';
      } else {
        matchesSource = !recruiter.registeredVia || recruiter.registeredVia === 'admin';
      }
    }

    return matchesSearch && matchesDept && matchesDesignation && matchesLocation && matchesSource;
  });

  return (
    <div className={styles.container}>

      {/* ── Link Copied Toast ── */}
      <div className={`${styles.copyToast} ${linkCopied ? styles.copyToastVisible : ''}`}>
        <CheckCircle2 size={18} />
        Shareable link copied to clipboard!
      </div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search recruiters by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggleButton}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? <X size={18} /> : <Filter size={18} />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>

          <button className={styles.btnExcel}><Download size={18} /> Excel</button>
          <button className={styles.btnCsv}><Download size={18} /> CSV</button>

          {/* Shareable Link Button */}
          <button
            className={`${styles.btnShareLink} ${linkCopied ? styles.btnShareLinkCopied : ''}`}
            onClick={handleCopyLink}
            title="Copy shareable registration link for new recruiters"
          >
            {linkCopied ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
            {linkCopied ? 'Copied!' : 'ShareForm Link'}
          </button>

          <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Add Recruiter
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>
              
              {/* Department */}
              <div className={styles.filterField}>
                <label>Department</label>
                <select
                  value={filterValues.department || ""}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                >
                  <option value="">All Departments</option>
                  {allDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div className={styles.filterField}>
                <label>Designation / Role</label>
                <select
                  value={filterValues.designation || ""}
                  onChange={(e) => handleFilterChange("designation", e.target.value)}
                >
                  <option value="">All Roles</option>
                  {allDesignations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hiring Region / Location */}
              <div className={styles.filterField}>
                <label>Hiring Region</label>
                <select
                  value={filterValues.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                >
                  <option value="">All Regions</option>
                  {allLocations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Registration Source */}
              <div className={styles.filterField}>
                <label>Source</label>
                <select
                  value={filterValues.registeredVia || ""}
                  onChange={(e) => handleFilterChange("registeredVia", e.target.value)}
                >
                  <option value="">All Sources</option>
                  <option value="form">Registered via Form Link</option>
                  <option value="admin">Admin Added</option>
                </select>
              </div>

              <button
                className={styles.clearAllButton}
                onClick={clearAllFilters}
              >
                Clear All
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
        filterConfig={recruitersFilterConfig}
      />

      {/* Count Info Panel */}
      <div className={styles.countInfo}>
        <span className={styles.countText}>
          Showing <strong>{filteredRecruiters.length}</strong> of <strong>{recruiters.length}</strong> recruitment professionals
        </span>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Gathering recruitment professionals...</p>
          </div>
        ) : filteredRecruiters.length > 0 ? (
          filteredRecruiters.map((recruiter, index) => (
            <div 
              key={recruiter._id} 
              className={styles.card}
              onClick={() => navigate(`/recruiters/${recruiter._id}`)}
              style={{ animationDelay: `${index * 0.1}s` }} // STAGGERED ANIMATION
            >
              <div className={styles.avatarRing}>
                <UserCircle size={48} strokeWidth={1.5} />
              </div>

              <button 
                className={styles.deleteBtn}
                onClick={(e) => handleDelete(e, recruiter._id)}
                title="Delete Recruiter"
              >
                <Trash2 size={18} />
              </button>
              
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <h3>{recruiter.fullName}</h3>
                  <span className={styles.roleBadge}>Recruiter</span>
                </div>
                
                <div className={styles.contact}>
                  <div className={styles.row}><Mail size={16} /> {recruiter.email}</div>
                  <div className={styles.row}><Phone size={16} /> {recruiter.phone || 'No Phone listed'}</div>
                </div>

                <div className={styles.meta}>
                  <p><strong><Building2 size={14} style={{marginRight: '5px'}}/> Dept:</strong> {recruiter.department || 'General'}</p>
                  <p><strong><Briefcase size={14} style={{marginRight: '5px'}}/> Role:</strong> {recruiter.designation || 'Specialist'}</p>
                  {recruiter.registeredVia && recruiter.registeredVia !== 'admin' && (
                    <p className={styles.sourceText}><Share2 size={12} style={{marginRight: '5px'}}/> Registered via: Form Link</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
             <Search size={48} color="#e2e8f0" />
             <h3>No professionals matched your search</h3>
             <p>Try refining your search terms or adding a new recruiter.</p>
          </div>
        )}
      </div>

      <AddRecruiterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRecruiters}
      />
    </div>
  );
};

export default RecruitersPage;