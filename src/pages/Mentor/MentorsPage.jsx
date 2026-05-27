import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Send,
  Eye,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Minus,
  Filter,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import styles from "./Mentors.module.scss";
import AddMentor from "./AddMentor";
import { useAuth } from "../../context/AuthContext";
import FilterStatus from "../../components/Filter/FIlterStatus";

/* ==========================================================================
   SPARKLINE CHART COMPONENT (Inline SVG Gradients)
   ========================================================================== */
const Sparkline = ({ color }) => {
  let pathData = "M 0 32 Q 30 18 60 28 T 120 14 T 180 22 T 240 10";
  if (color === "#ef4444") {
    pathData = "M 0 32 Q 30 18 60 28 T 120 14 T 180 22 T 240 10";
  } else if (color === "#10b981") {
    pathData = "M 0 28 Q 30 12 60 24 T 120 8 T 180 18 T 240 6";
  } else if (color === "#8b5cf6") {
    pathData = "M 0 34 Q 30 20 60 30 T 120 16 T 180 24 T 240 12";
  } else if (color === "#f97316") {
    pathData = "M 0 30 Q 30 15 60 26 T 120 10 T 180 22 T 240 8";
  }

  const gradId = React.useId().replace(/:/g, "");

  return (
    <div className={styles.sparklineWrapper}>
      <svg className={styles.sparkline} viewBox="0 0 240 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sparkline-grad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`${pathData} L 240 40 L 0 40 Z`}
          fill={`url(#sparkline-grad-${gradId})`}
        />
      </svg>
    </div>
  );
};

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [viewType, setViewType] = useState("list"); // 'list' or 'card'
  const [filterValues, setFilterValues] = useState({
    domain: "",
    district: "",
    experience: "",
    gender: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [connectedMentors, setConnectedMentors] = useState(new Map()); // mentorId → status
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Custom Dropdown menu state
  const [openDropdown, setOpenDropdown] = useState(null); // null | "domain" | "district" | "experience" | "gender"

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    setOpenDropdown(prev => prev === name ? null : name);
  };

  useEffect(() => {
    const closeAllDropdowns = () => setOpenDropdown(null);
    document.addEventListener("click", closeAllDropdowns);
    return () => document.removeEventListener("click", closeAllDropdowns);
  }, []);

  // ── 3D tilt tracking ──────────────────────────────────
  const rafRef = useRef({});

  const handleCardMouseMoveDirect = (e) => {
    const el = e.currentTarget;
    const cardId = el.getAttribute("data-card-id") || "direct";
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    rafRef.current[cardId] = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const max = 7; // subtle premium tilt
      
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

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchUserConnections();
    }
  }, [user?.userId]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/member");
      setMentors(
        (res.data || []).filter(
          (m) => m.memberType?.toLowerCase() === "mentor"
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConnections = async () => {
    try {
      const res = await API.get("/api/mentor-connections/user/my-connections");

      const statusMap = new Map();
      (res.data || []).forEach((conn) => {
        statusMap.set(String(conn.mentorId), conn.status);
      });

      setConnectedMentors(statusMap);
    } catch (e) {
      console.error("Error fetching connections:", e);
    }
  };

  const handleConnectClick = (e, mentor) => {
    e.stopPropagation();

    if (!user?.memberId) {
      alert("Please complete your profile first before connecting with a mentor.");
      navigate("/profile-setup");
      return;
    }

    setSelectedMentor(mentor);
    setConnectMessage("");
    setShowConnectModal(true);
  };

  const handleSendConnection = async () => {
    if (!selectedMentor) return;

    try {
      setConnectingId(selectedMentor._id);

      const response = await API.post("/api/mentor-connections", {
        mentorId: selectedMentor._id,
        message: connectMessage,
      });

      if (response.status === 201) {
        setConnectedMentors((prev) => new Map([...prev, [String(selectedMentor._id), "pending"]]));
        setShowConnectModal(false);
        setConnectMessage("");
        alert("Connection request sent successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to send request";
      alert(errorMsg);
    } finally {
      setConnectingId(null);
    }
  };

  const getConnectionStatus = (mentorId) => connectedMentors.get(String(mentorId));

  const role = user?.role?.toLowerCase?.() || "";
  const memberType = user?.memberType?.toLowerCase?.() || "";

  // Show candidate guidance for all roles except Admin and IT_Member
  // This mirrors the sidebar logic: "Member", "Mentor", "Job", "Candidate" all get candidate view
  const isCandidate =
    role === "candidate" ||
    role === "member" ||
    role === "mentor" ||
    role === "job" ||
    memberType === "candidate" ||
    memberType === "member" ||
    (user?.role && !["Admin", "IT_Member"].includes(user.role));

  // Dynamic filter lists
  const allDomains = React.useMemo(() => {
    const domainSet = new Set();
    mentors.forEach((m) => {
      if (m.fieldofStudy_Interest) {
        m.fieldofStudy_Interest.split(",").forEach((d) => {
          const trimmed = d.trim();
          if (trimmed) domainSet.add(trimmed);
        });
      }
    });
    return Array.from(domainSet).sort();
  }, [mentors]);

  const allDistricts = React.useMemo(() => {
    const districtSet = new Set();
    mentors.forEach((m) => {
      if (m.district) {
        const trimmed = m.district.trim();
        if (trimmed) districtSet.add(trimmed);
      }
    });
    return Array.from(districtSet).sort();
  }, [mentors]);

  const allGenders = React.useMemo(() => {
    const genderSet = new Set();
    mentors.forEach((m) => {
      if (m.gender) {
        const trimmed = m.gender.trim();
        if (trimmed) genderSet.add(trimmed);
      }
    });
    return Array.from(genderSet).sort();
  }, [mentors]);

  const mentorsFilterConfig = {
    labels: {
      domain: "Domain",
      district: "District",
      experience: "Experience Level",
      gender: "Gender",
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
    setCurrentPage(1); // Reset to page 1
  };

  const clearFilter = (key) => {
    handleFilterChange(key, "");
  };

  const clearAllFilters = () => {
    setFilterValues({
      domain: "",
      district: "",
      experience: "",
      gender: "",
    });
    setActiveFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1
  };

  // Filter logic
  const filtered = React.useMemo(() => {
    return mentors.filter((m) => {
      // 1. Search term check
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        m.name?.toLowerCase().includes(term) ||
        m.designation?.toLowerCase().includes(term) ||
        m.district?.toLowerCase().includes(term) ||
        m.fieldofStudy_Interest?.toLowerCase().includes(term);

      // 2. Domain filter check
      const matchesDomain =
        !filterValues.domain ||
        m.fieldofStudy_Interest
          ?.split(",")
          .map((d) => d.trim().toLowerCase())
          .includes(filterValues.domain.toLowerCase());

      // 3. District filter check
      const matchesDistrict =
        !filterValues.district ||
        m.district?.trim().toLowerCase() === filterValues.district.trim().toLowerCase();

      // 4. Gender filter check
      const matchesGender =
        !filterValues.gender ||
        m.gender?.trim().toLowerCase() === filterValues.gender.trim().toLowerCase();

      // 5. Experience filter check
      let matchesExperience = true;
      if (filterValues.experience) {
        const expVal = parseInt(m.workExp, 10);
        const isExpValid = !isNaN(expVal);
        
        switch (filterValues.experience) {
          case "<1":
            matchesExperience = isExpValid && expVal < 1;
            break;
          case "1-3":
            matchesExperience = isExpValid && expVal >= 1 && expVal <= 3;
            break;
          case "3-5":
            matchesExperience = isExpValid && expVal >= 3 && expVal <= 5;
            break;
          case "5+":
            matchesExperience = isExpValid && expVal > 5;
            break;
          default:
            matchesExperience = true;
        }
      }

      return matchesSearch && matchesDomain && matchesDistrict && matchesGender && matchesExperience;
    });
  }, [mentors, searchTerm, filterValues]);

  // ==========================================================================
  // DYNAMIC METRICS CALCULATIONS
  // ==========================================================================
  const totalMentors = mentors.length;
  const activeMentors = mentors.length;
  
  const newMentors = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return mentors.filter((m) => {
      if (!m.createdAt) return false;
      return new Date(m.createdAt) >= thirtyDaysAgo;
    }).length;
  }, [mentors]);

  const avgExperience = React.useMemo(() => {
    if (mentors.length === 0) return "0.0";
    const validExpList = mentors
      .map((m) => parseFloat(m.workExp))
      .filter((val) => !isNaN(val));
    if (validExpList.length === 0) return "0.0";
    const sum = validExpList.reduce((acc, curr) => acc + curr, 0);
    return (sum / validExpList.length).toFixed(1);
  }, [mentors]);

  // ==========================================================================
  // PAGINATION AND SLICING LOGIC
  // ==========================================================================
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentMentors = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const recordStart = filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const recordEnd = Math.min(currentPage * itemsPerPage, filtered.length);

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.active : ""}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const getInitials = (name) => {
    if (!name) return "M";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className={styles.mentorsContainer}>
      {/* ==========================================================================
         TOP CONTROLS / TOOLBAR
         ========================================================================== */}
      <div className={styles.topToolbar}>
        <div className={styles.searchAndFilterArea}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              value={searchTerm}
              placeholder="Search by name, expertise or role..."
              onChange={handleSearchChange}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggleButton}
          >
            <Filter size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <AddMentor onSuccess={fetchMentors} />
      </div>

      {/* ==========================================================================
         EXPANDABLE PREMIUM FILTERS PANEL
         ========================================================================== */}
      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>
              
              {/* Domain / Expertise */}
              <div className={styles.filterField}>
                <label>Expertise / Domain</label>
                <div className={styles.customDropdownWrapper}>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, "domain")}
                    className={styles.dropdownTrigger}
                  >
                    <span>{filterValues.domain || "All Domains"}</span>
                    <ChevronDown size={14} />
                  </button>
                  {openDropdown === "domain" && (
                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => { handleFilterChange("domain", ""); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${!filterValues.domain ? styles.activeOption : ""}`}
                      >
                        All Domains
                      </div>
                      {allDomains.map((d) => (
                        <div
                          key={d}
                          onClick={() => { handleFilterChange("domain", d); setOpenDropdown(null); }}
                          className={`${styles.dropdownOption} ${filterValues.domain === d ? styles.activeOption : ""}`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location (District) */}
              <div className={styles.filterField}>
                <label>Location (District)</label>
                <div className={styles.customDropdownWrapper}>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, "district")}
                    className={styles.dropdownTrigger}
                  >
                    <span>{filterValues.district || "All Districts"}</span>
                    <ChevronDown size={14} />
                  </button>
                  {openDropdown === "district" && (
                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => { handleFilterChange("district", ""); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${!filterValues.district ? styles.activeOption : ""}`}
                      >
                        All Districts
                      </div>
                      {allDistricts.map((d) => (
                        <div
                          key={d}
                          onClick={() => { handleFilterChange("district", d); setOpenDropdown(null); }}
                          className={`${styles.dropdownOption} ${filterValues.district === d ? styles.activeOption : ""}`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Level */}
              <div className={styles.filterField}>
                <label>Experience Level</label>
                <div className={styles.customDropdownWrapper}>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, "experience")}
                    className={styles.dropdownTrigger}
                  >
                    <span>
                      {filterValues.experience === "<1" ? "< 1 Year" :
                       filterValues.experience === "1-3" ? "1-3 Years" :
                       filterValues.experience === "3-5" ? "3-5 Years" :
                       filterValues.experience === "5+" ? "5+ Years" :
                       "All Experience"}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  {openDropdown === "experience" && (
                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => { handleFilterChange("experience", ""); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${!filterValues.experience ? styles.activeOption : ""}`}
                      >
                        All Experience
                      </div>
                      <div
                        onClick={() => { handleFilterChange("experience", "<1"); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${filterValues.experience === "<1" ? styles.activeOption : ""}`}
                      >
                        &lt; 1 Year
                      </div>
                      <div
                        onClick={() => { handleFilterChange("experience", "1-3"); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${filterValues.experience === "1-3" ? styles.activeOption : ""}`}
                      >
                        1-3 Years
                      </div>
                      <div
                        onClick={() => { handleFilterChange("experience", "3-5"); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${filterValues.experience === "3-5" ? styles.activeOption : ""}`}
                      >
                        3-5 Years
                      </div>
                      <div
                        onClick={() => { handleFilterChange("experience", "5+"); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${filterValues.experience === "5+" ? styles.activeOption : ""}`}
                      >
                        5+ Years
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className={styles.filterField}>
                <label>Gender</label>
                <div className={styles.customDropdownWrapper}>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown(e, "gender")}
                    className={styles.dropdownTrigger}
                  >
                    <span>{filterValues.gender || "All Genders"}</span>
                    <ChevronDown size={14} />
                  </button>
                  {openDropdown === "gender" && (
                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => { handleFilterChange("gender", ""); setOpenDropdown(null); }}
                        className={`${styles.dropdownOption} ${!filterValues.gender ? styles.activeOption : ""}`}
                      >
                        All Genders
                      </div>
                      {allGenders.map((g) => (
                        <div
                          key={g}
                          onClick={() => { handleFilterChange("gender", g); setOpenDropdown(null); }}
                          className={`${styles.dropdownOption} ${filterValues.gender === g ? styles.activeOption : ""}`}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* ==========================================================================
         FILTER STATUS BADGE BAR
         ========================================================================== */}
      <FilterStatus
        activeFilters={activeFilters}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
        filterConfig={mentorsFilterConfig}
      />

      {/* ==========================================================================
         CANDIDATE MENTOR GUIDANCE CARD (only shown for candidate/member users)
         ========================================================================== */}
      {isCandidate && (
        <section 
          data-card-id="guidance"
          onMouseMove={handleCardMouseMoveDirect}
          onMouseLeave={handleCardMouseLeaveDirect}
          className={styles.guidanceCard}
        >
          <div className={styles.guidanceGlow} />
          <div className={styles.cardShine} />

          <div className={styles.guidanceInner}>
            <div className={styles.guidanceHeader}>
              <div className={styles.guidanceIconWrap}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className={styles.guidanceTitle}>Mentor Guidance</h2>
                <p className={styles.guidanceSub}>
                  Match with the right mentor and grow faster with real support.
                </p>
              </div>
            </div>

            <div className={styles.guidanceList}>
              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4>Career Development</h4>
                  <p>
                    Receive expert guidance to plan your career path and achieve
                    your professional goals.
                  </p>
                </div>
              </div>

              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4>Technical Skill Development</h4>
                  <p>
                    Learn industry-relevant technical skills and practical
                    knowledge from experienced mentors.
                  </p>
                </div>
              </div>

              <div className={styles.guidanceItem}>
                <div className={styles.guidanceBullet}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4>Professional Growth</h4>
                  <p>
                    Improve employability skills, understand industry
                    expectations, and prepare for job opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.guidanceFooter}>
              <div className={styles.guidanceTip}>
                ✅ Select any mentor to match your profile and start your
                mentorship journey.
              </div>

              <div className={styles.guidanceActions}>
                <button
                  type="button"
                  className={styles.guidancePrimaryBtn}
                  onClick={() => {
                    const el = document.getElementById("mentorTable");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  View Mentors <span>→</span>
                </button>

                <button
                  type="button"
                  className={styles.guidanceSecondaryBtn}
                  onClick={() => navigate("/member/me")}
                >
                  Update Profile <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================================
         ANALYTICS METRIC CARDS PANEL
         ========================================================================== */}

      <div className={styles.metricsGrid}>
        {/* Card 1: Total Mentors */}
        <div 
          data-card-id="metric-total"
          onMouseMove={handleCardMouseMoveDirect}
          onMouseLeave={handleCardMouseLeaveDirect}
          className={styles.metricCard}
        >
          <div className={styles.cardShine} />
          <div className={styles.cardHeaderInfo}>
            <div className={styles.metricMeta}>
              <span className={styles.metricLabel}>Total Mentors</span>
              <span className={styles.metricValue}>{totalMentors}</span>
            </div>
            <div className={`${styles.iconContainer} ${styles.redTheme}`}>
              <Shield size={20} />
            </div>
          </div>
          <div className={`${styles.trendIndicator} ${styles.up}`}>
            <TrendingUp size={12} /> 12% from last month
          </div>
          <Sparkline color="#ef4444" />
        </div>

        {/* Card 2: Active Mentors */}
        <div 
          data-card-id="metric-active"
          onMouseMove={handleCardMouseMoveDirect}
          onMouseLeave={handleCardMouseLeaveDirect}
          className={styles.metricCard}
        >
          <div className={styles.cardShine} />
          <div className={styles.cardHeaderInfo}>
            <div className={styles.metricMeta}>
              <span className={styles.metricLabel}>Active Mentors</span>
              <span className={styles.metricValue}>{activeMentors}</span>
            </div>
            <div className={`${styles.iconContainer} ${styles.greenTheme}`}>
              <Shield size={20} />
            </div>
          </div>
          <div className={`${styles.trendIndicator} ${styles.up}`}>
            <TrendingUp size={12} /> 18% from last month
          </div>
          <Sparkline color="#10b981" />
        </div>

        {/* Card 3: New Mentors */}
        <div 
          data-card-id="metric-new"
          onMouseMove={handleCardMouseMoveDirect}
          onMouseLeave={handleCardMouseLeaveDirect}
          className={styles.metricCard}
        >
          <div className={styles.cardShine} />
          <div className={styles.cardHeaderInfo}>
            <div className={styles.metricMeta}>
              <span className={styles.metricLabel}>New Mentors</span>
              <span className={styles.metricValue}>{newMentors}</span>
            </div>
            <div className={`${styles.iconContainer} ${styles.purpleTheme}`}>
              <UserPlus size={20} />
            </div>
          </div>
          <div className={`${styles.trendIndicator} ${styles.up}`}>
            <TrendingUp size={12} /> 8% from last month
          </div>
          <Sparkline color="#8b5cf6" />
        </div>

        {/* Card 4: Average Experience */}
        <div 
          data-card-id="metric-avg"
          onMouseMove={handleCardMouseMoveDirect}
          onMouseLeave={handleCardMouseLeaveDirect}
          className={styles.metricCard}
        >
          <div className={styles.cardShine} />
          <div className={styles.cardHeaderInfo}>
            <div className={styles.metricMeta}>
              <span className={styles.metricLabel}>Avg. Experience</span>
              <span className={styles.metricValue}>{avgExperience} Yrs</span>
            </div>
            <div className={`${styles.iconContainer} ${styles.orangeTheme}`}>
              <Star size={20} />
            </div>
          </div>
          <div className={`${styles.trendIndicator} ${styles.up}`}>
            <TrendingUp size={12} /> 5% from last month
          </div>
          <Sparkline color="#f97316" />
        </div>
      </div>

      {/* ==========================================================================
         MENTORS DATA CONTENT (LIST TABLE OR CARD GRID VIEW)
         ========================================================================== */}
      {/* ==========================================================================
         DIRECTORY SECTION HEADER (WITH VIEW TOGGLE)
         ========================================================================== */}
      <div className={styles.directoryHeaderRow}>
        <div className={styles.directoryTitleGroup}>
          <h2>Mentors Directory</h2>
          <span className={styles.directorySub}>
            Showing <strong>{filtered.length}</strong> of <strong>{mentors.length}</strong> active job mentors
          </span>
        </div>

        <div className={styles.toggleGroupContainer}>
          <button
            onClick={() => setViewType("list")}
            className={`${styles.toggleBtn} ${viewType === "list" ? styles.activeToggle : ""}`}
            title="List View"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewType("card")}
            className={`${styles.toggleBtn} ${viewType === "card" ? styles.activeToggle : ""}`}
            title="Card View"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      <div id="mentorTable" className={viewType === "list" ? styles.tableContainerCard : styles.cardsViewWrapper}>
        {loading ? (
          <div className={styles.loading}>
            <Clock size={16} /> Loading mentors directory...
          </div>
        ) : (
          <>
            {viewType === "list" ? (
              <div className={styles.responsiveTableWrap}>
                <table className={styles.mentorsTable}>
                  <thead>
                    <tr>
                      <th>Mentor</th>
                      <th>Expertise / Role</th>
                      <th>Domain</th>
                      <th>Experience</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMentors.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.emptyStateMessage}>
                          No mentors found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      currentMentors.map((m) => (
                        <tr key={m._id}>
                          {/* Column 1: Profile & Email */}
                          <td>
                            <div className={styles.mentorProfileCell}>
                              <div className={styles.avatarInitialCircle}>
                                {getInitials(m.name)}
                              </div>
                              <div className={styles.mentorMetaDetails}>
                                <span className={styles.mentorNameText}>{m.name}</span>
                                <span className={styles.mentorEmailText}>{m.email || "No email"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Expertise / Designation */}
                          <td>
                            {m.designation ? (
                              <span className={styles.roleText}>{m.designation}</span>
                            ) : (
                              <div className={styles.dashCircleIcon}>
                                <Minus size={10} strokeWidth={3} />
                              </div>
                            )}
                          </td>

                          {/* Column 3: Domain */}
                          <td>
                            <span className={styles.domainCell}>
                              {m.fieldofStudy_Interest ? m.fieldofStudy_Interest.split(",")[0].trim() : "General"}
                            </span>
                          </td>

                          {/* Column 4: Experience */}
                          <td>
                            <span className={styles.experienceCell}>
                              {m.workExp ? `${m.workExp} Years` : "Experience N/A"}
                            </span>
                          </td>

                          {/* Column 5: Location */}
                          <td>
                            <div className={styles.locationCell}>
                              <MapPin size={13} />
                              <span>{m.district || "Remote"}</span>
                            </div>
                          </td>

                          {/* Column 6: Status Pill */}
                          <td>
                            <span className={`${styles.statusBadge} ${styles.available}`}>
                              Available
                            </span>
                          </td>

                          {/* Column 7: Actions */}
                          <td>
                            <div className={styles.actionsCell}>
                              {/* View details eye button */}
                              <button
                                onClick={() => navigate(`/mentors/${m._id}`)}
                                className={`${styles.actionCircleBtn} ${styles.viewDetails}`}
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Candidate connect button */}
                              {isCandidate && (() => {
                                const connStatus = getConnectionStatus(m._id);
                                const isSending = connectingId === m._id;

                                let btnClass = styles.actionCircleBtn;
                                let btnTitle = "Connect with Mentor";
                                let btnIcon = <UserPlus size={14} />;
                                let isDisabled = isSending;

                                if (connStatus === "accepted") {
                                  btnClass = `${styles.actionCircleBtn} ${styles.connected}`;
                                  btnIcon = <CheckCircle2 size={14} />;
                                  btnTitle = "Connected";
                                  isDisabled = true;
                                } else if (connStatus === "rejected") {
                                  btnClass = `${styles.actionCircleBtn} ${styles.rejected}`;
                                  btnIcon = <XCircle size={14} />;
                                  btnTitle = "Rejected";
                                  isDisabled = true;
                                } else if (connStatus === "pending") {
                                  btnClass = `${styles.actionCircleBtn} ${styles.pending}`;
                                  btnIcon = <Clock size={14} />;
                                  btnTitle = "Pending Connection";
                                  isDisabled = true;
                                }

                                return (
                                  <button
                                    onClick={(e) => handleConnectClick(e, m)}
                                    disabled={isDisabled}
                                    className={btnClass}
                                    title={btnTitle}
                                  >
                                    {isSending ? "..." : btnIcon}
                                  </button>
                                );
                              })()}

                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.mentorCardGrid}>
                {currentMentors.length === 0 ? (
                  <div className={styles.emptyStateCardMessage}>
                    No mentors found matching the filters.
                  </div>
                ) : (
                  currentMentors.map((m) => {
                    const connStatus = getConnectionStatus(m._id);
                    const isSending = connectingId === m._id;
                    return (
                      <div
                        key={m._id}
                        data-card-id={`mentor-${m._id}`}
                        onMouseMove={handleCardMouseMoveDirect}
                        onMouseLeave={handleCardMouseLeaveDirect}
                        className={styles.premiumMentorCard}
                        onClick={() => navigate(`/mentors/${m._id}`)}
                      >
                        <div className={styles.cardGlow} />
                        <div className={styles.cardShine} />
                        
                        <div className={styles.cardHeaderRow}>
                          <div className={styles.cardAvatarWrap}>
                            <div className={styles.cardAvatarCircle}>
                              {getInitials(m.name)}
                            </div>
                            <span className={styles.cardOnlineDot} />
                          </div>
                          
                          <div className={styles.cardHeaderInfo}>
                            <h3 className={styles.cardNameText}>{m.name}</h3>
                            <span className={styles.cardEmailText}>{m.email || "No email"}</span>
                          </div>
                        </div>

                        <div className={styles.cardDomainBadgeRow}>
                          <span className={styles.cardDomainBadge}>
                            {m.fieldofStudy_Interest ? m.fieldofStudy_Interest.split(",")[0].trim() : "General"}
                          </span>
                          <span className={`${styles.statusBadge} ${styles.available}`}>
                            Available
                          </span>
                        </div>

                        <div className={styles.cardContentList}>
                          {m.designation && (
                            <div className={styles.cardContentItem}>
                              <Briefcase size={13} />
                              <span>{m.designation}</span>
                            </div>
                          )}
                          <div className={styles.cardContentItem}>
                            <Clock size={13} />
                            <span>{m.workExp ? `${m.workExp} Years Exp.` : "Experience N/A"}</span>
                          </div>
                          <div className={styles.cardContentItem}>
                            <MapPin size={13} />
                            <span>{m.district || "Remote"}</span>
                          </div>
                        </div>

                        <div className={styles.cardActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/mentors/${m._id}`);
                            }}
                            className={styles.cardViewDetailsBtn}
                            title="View Details"
                          >
                            <Eye size={14} /> Details
                          </button>

                          {isCandidate && (() => {
                            let btnClass = styles.cardConnectBtn;
                            let btnLabel = "Connect";
                            let btnIcon = <UserPlus size={14} />;
                            let isDisabled = isSending;

                            if (connStatus === "accepted") {
                              btnClass = `${styles.cardConnectBtn} ${styles.cardConnected}`;
                              btnLabel = "Connected";
                              btnIcon = <CheckCircle2 size={14} />;
                              isDisabled = true;
                            } else if (connStatus === "rejected") {
                              btnClass = `${styles.cardConnectBtn} ${styles.cardRejected}`;
                              btnLabel = "Rejected";
                              btnIcon = <XCircle size={14} />;
                              isDisabled = true;
                            } else if (connStatus === "pending") {
                              btnClass = `${styles.cardConnectBtn} ${styles.cardPending}`;
                              btnLabel = "Pending";
                              btnIcon = <Clock size={14} />;
                              isDisabled = true;
                            } else if (isSending) {
                              btnLabel = "...";
                              isDisabled = true;
                            }

                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnectClick(e, m);
                                }}
                                disabled={isDisabled}
                                className={btnClass}
                              >
                                {btnIcon} {btnLabel}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ==========================================================================
               PAGINATION FOOTER CONTROLS
               ========================================================================== */}
            <div className={styles.paginationFooter}>
              <div className={styles.paginationStats}>
                Showing <strong>{recordStart}</strong> to <strong>{recordEnd}</strong> of <strong>{filtered.length}</strong> mentors
              </div>

              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationBtn}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationBtn}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.pageSizeSelector}>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={8}>8 / page</option>
                  <option value={16}>16 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={48}>48 / page</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==========================================================================
         CANDIDATE CONNECTION MODAL OVERLAY
         ========================================================================== */}
      {showConnectModal && selectedMentor && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowConnectModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Connect with {selectedMentor.name}</h2>
            <p>Send a message to {selectedMentor.designation || "this mentor"} to introduce yourself.</p>

            <textarea
              placeholder="Tell them why you'd like to connect... (optional)"
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              className={styles.messageInput}
              rows={4}
            />

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowConnectModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                disabled={connectingId === selectedMentor._id}
                className={styles.sendBtn}
              >
                {connectingId === selectedMentor._id ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={14} /> Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;