import React, { useEffect, useState } from "react";
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
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import styles from "./Mentors.module.scss";
import AddMentor from "./AddMentor";
import { useAuth } from "../../context/AuthContext";
import FilterStatus from "../../components/Filter/FIlterStatus";

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
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

    // Guard: new users without a completed profile cannot connect
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

  const getConnectionStatus = (mentorId) => connectedMentors.get(String(mentorId)); // "pending" | "accepted" | "rejected" | undefined

  const role = user?.role?.toLowerCase?.() || "";
  const memberType = user?.memberType?.toLowerCase?.() || "";

  const isCandidate =
    memberType === "candidate" ||
    memberType === "member" ||
    role === "candidate" ||
    role === "member";

  const showMentorGuidance = isCandidate;

  // Build unique sorted domain list from all mentors
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

  // Build unique sorted district list from all mentors
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

  // Build unique sorted gender list from all mentors
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
  };

  const filtered = mentors.filter((m) => {
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

  return (
    <div className={styles.mentorsContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleWrap}>
          <h1 className={styles.pageTitle}>Mentors Directory</h1>
        </div>
      </div>

      {showMentorGuidance && (
        <section className={styles.guidanceCard}>
          <div className={styles.guidanceGlow} />
          <div className={styles.guidanceShine} />
          <div className={styles.guidanceNoise} />

          <div className={styles.guidanceInner}>
            <div className={styles.guidanceHeader}>
              <div className={styles.guidanceIconWrap}>
                <TrendingUp size={26} />
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
                  <CheckCircle2 size={18} />
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
                  <CheckCircle2 size={18} />
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
                  <CheckCircle2 size={18} />
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
                    const el = document.getElementById("mentorList");
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

      <div className={styles.topToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by name, expertise or role..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterToggleButton}
        >
          <Filter size={18} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <AddMentor onSuccess={fetchMentors} />
      </div>

      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>
              
              {/* Domain / Expertise */}
              <div className={styles.filterField}>
                <label>Expertise / Domain</label>
                <select
                  value={filterValues.domain || ""}
                  onChange={(e) => handleFilterChange("domain", e.target.value)}
                >
                  <option value="">All Domains</option>
                  {allDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location (District) */}
              <div className={styles.filterField}>
                <label>Location (District)</label>
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

              {/* Experience Level */}
              <div className={styles.filterField}>
                <label>Experience Level</label>
                <select
                  value={filterValues.experience || ""}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                >
                  <option value="">All Experience</option>
                  <option value="<1">&lt; 1 Year</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="3-5">3-5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
              </div>

              {/* Gender */}
              <div className={styles.filterField}>
                <label>Gender</label>
                <select
                  value={filterValues.gender || ""}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                >
                  <option value="">All Genders</option>
                  {allGenders.map((g) => (
                    <option key={g} value={g}>
                      {g}
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
        filterConfig={mentorsFilterConfig}
      />

      {/* Count Info Panel */}
      <div className={styles.countInfo}>
        <span className={styles.countText}>
          Showing <strong>{filtered.length}</strong> of <strong>{mentors.length}</strong> active mentors
        </span>
      </div>

      {loading && <div className={styles.loading}>Loading mentors...</div>}

      {!loading && (
        <div id="mentorList" className={styles.mentorGrid}>
          {filtered.map((m) => (
            <div
              key={m._id}
              className={styles.mentorCard}
              onClick={() => navigate(`/mentors/${m._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/mentors/${m._id}`);
              }}
            >
              <div className={styles.imageContainer}>
                <img
                  src={m.photoUrl || "/members/AnonymousImage.jpg"}
                  alt={m.name}
                  onError={(e) => {
                    e.target.src = "/members/AnonymousImage.jpg";
                  }}
                />
              </div>

              <div className={styles.infoContent}>
                <div className={styles.cardTopRow}>
                  <h3>{m.name}</h3>
                  <div className={styles.statusBadge}>Available</div>
                </div>

                {/* Domain tags (highlighted) */}
                {m.fieldofStudy_Interest ? (
                  <div className={styles.domainTags}>
                    {m.fieldofStudy_Interest.split(",").map((tag, i) => (
                      <span key={i} className={styles.designation}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.designation}>General</span>
                )}

                <div className={styles.details}>
                  <span>
                    <MapPin size={14} /> {m.district || "Remote"}
                  </span>
                  <span>
                    <Mail size={14} /> {m.email || "No email"}
                  </span>
                  <span>
                    <Briefcase size={14} />{" "}
                    {m.workExp ? `${m.workExp} Years Exp.` : "Experience N/A"}
                  </span>
                </div>

                {isCandidate && (() => {
                  const connStatus = getConnectionStatus(m._id);
                  const isSending = connectingId === m._id;

                  let btnClass = styles.connectBtn;
                  let btnLabel;
                  let isDisabled = isSending;

                  if (connStatus === "accepted") {
                    btnClass = `${styles.connectBtn} ${styles.connected}`;
                    btnLabel = <><CheckCircle2 size={16} /> Connected</>;
                    isDisabled = true;
                  } else if (connStatus === "rejected") {
                    btnClass = `${styles.connectBtn} ${styles.rejected}`;
                    btnLabel = <><XCircle size={16} /> Rejected</>;
                    isDisabled = true;
                  } else if (connStatus === "pending") {
                    btnClass = `${styles.connectBtn} ${styles.pending}`;
                    btnLabel = <><Clock size={16} /> Pending</>;
                    isDisabled = true;
                  } else if (isSending) {
                    btnLabel = "Sending...";
                    isDisabled = true;
                  } else {
                    btnLabel = <><UserPlus size={16} /> Connect</>;
                  }

                  return (
                    <div className={styles.cardActions}>
                      <button
                        onClick={(e) => handleConnectClick(e, m)}
                        disabled={isDisabled}
                        className={btnClass}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

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
            <p>Send a message to {selectedMentor.designation || "this mentor"}</p>

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
                    <Send size={16} /> Send Request
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