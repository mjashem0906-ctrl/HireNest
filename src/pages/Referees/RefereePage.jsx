
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Mail, Phone, Briefcase, Building2, Download, FileSpreadsheet, MapPin, UserPlus, Users, Filter, X } from 'lucide-react'; 
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import styles from './RefereePage.module.scss';
import { useData } from '../../context/DataContext';
import AddReferee from './AddReferee'; 
import FilterStatus from '../../components/Filter/FIlterStatus';

const RefereePage = () => {
  // Use sidebar context if needed
  const context = useOutletContext();
  const sidebarCollapsed = context?.sidebarCollapsed || false;
  
  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const [showFilters, setShowFilters] = useState(true);
  const [filterValues, setFilterValues] = useState({
    occupation: '',
    district: '',
    sector: '',
    referrerStatus: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
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

  // Unique Occupations dynamically extracted
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

  // Unique Districts dynamically extracted
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

  // Unique Sectors dynamically extracted
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

  // Unique Referrer Statuses dynamically extracted
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
    // 1. Search term
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.occupation?.toLowerCase().includes(search) ||
      member.district?.toLowerCase().includes(search);

    // 2. Occupation
    const matchesOccupation =
      !filterValues.occupation ||
      member.occupation?.trim().toLowerCase() === filterValues.occupation.trim().toLowerCase();

    // 3. District
    const matchesDistrict =
      !filterValues.district ||
      member.district?.trim().toLowerCase() === filterValues.district.trim().toLowerCase();

    // 4. Sector
    const matchesSector =
      !filterValues.sector ||
      member.sector?.trim().toLowerCase() === filterValues.sector.trim().toLowerCase();

    // 5. Referrer Status
    const matchesStatus =
      !filterValues.referrerStatus ||
      member.referrerStatus?.trim().toLowerCase() === filterValues.referrerStatus.trim().toLowerCase();

    return matchesSearch && matchesOccupation && matchesDistrict && matchesSector && matchesStatus;
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
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggleButton}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            {showFilters ? <X size={18} /> : <Filter size={18} />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>

          <button onClick={() => exportData('excel')} className={`${styles.btn} ${styles.excel}`}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={() => exportData('csv')} className={`${styles.btn} ${styles.csv}`}>
            <Download size={18} /> CSV
          </button>
          <AddReferee onSuccess={refreshData} />
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>
              
              {/* Occupation */}
              <div className={styles.filterField}>
                <label>Occupation</label>
                <select
                  value={filterValues.occupation || ""}
                  onChange={(e) => handleFilterChange("occupation", e.target.value)}
                >
                  <option value="">All Occupations</option>
                  {allOccupations.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className={styles.filterField}>
                <label>District</label>
                <select
                  value={filterValues.district || ""}
                  onChange={(e) => handleFilterChange("district", e.target.value)}
                >
                  <option value="">All Districts</option>
                  {allDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Industry/Sector */}
              <div className={styles.filterField}>
                <label>Industry / Sector</label>
                <select
                  value={filterValues.sector || ""}
                  onChange={(e) => handleFilterChange("sector", e.target.value)}
                >
                  <option value="">All Sectors</option>
                  {allSectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referrer Status */}
              <div className={styles.filterField}>
                <label>Referrer Status</label>
                <select
                  value={filterValues.referrerStatus || ""}
                  onChange={(e) => handleFilterChange("referrerStatus", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
        filterConfig={refereeFilterConfig}
      />

      {/* Count Info Panel */}
      <div className={styles.countInfo}>
        <span className={styles.countText}>
          Showing <strong>{filteredReferees.length}</strong> of <strong>{referees.length}</strong> active job referees
        </span>
      </div>

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
          <p>We couldn't find any members matching your criteria.</p>
          <button onClick={clearAllFilters} className={styles.resetBtn}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default RefereePage;