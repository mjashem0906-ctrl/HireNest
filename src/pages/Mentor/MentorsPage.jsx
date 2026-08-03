import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Mail,
  MapPin,
  Briefcase,
  BriefcaseBusiness,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Send,
  Eye,
  EyeOff,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Minus,
  Filter,
  X,
  Grid,
  List,
  ChevronDown,
  Trash2,
  FileText,
  Users,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import styles from "./Mentors.module.scss";
import AddMentor from "./AddMentor";
import { useAuth } from "../../context/AuthContext";
import FilterStatus from "../../components/Filter/FIlterStatus";
import MentorConnectionsAdmin from "./MentorConnectionsAdmin";

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

const isValidFilterValue = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  if (!s || s === "null" || s === "undefined" || s === "—" || s === "-" || s === "n/a" || s === "na" || s === "none") return false;
  if (s.includes("test") || s.includes("dummy") || s.includes("placeholder") || s.includes("demo")) return false;
  if (s.startsWith("[") && s.endsWith("]")) return false;
  if (s.startsWith("{") && s.endsWith("}")) return false;

  // Gibberish & Dummy Check
  if (s.length <= 3 && s !== "it" && s !== "hr" && !/\d/.test(s)) return false;
  if (s === "yes" || s === "no" || s === "any") return false;
  if (s.startsWith("any ") && (s.includes("company") || s.includes("organization") || s.includes("institution"))) return false;

  // List of known gibberish/placeholder values from screenshots
  const knownGibberish = ["fbsadrn", "fdbda", "erhen", "ergewyh", "derhaer", "any hardware or software company", "erheh"];
  if (knownGibberish.includes(s)) return false;

  // Match words that have 4 or more consecutive consonants (excluding 'y')
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(s)) return false;

  return true;
};

const SkillsCell = ({ skills }) => {
  const [expanded, setExpanded] = useState(false);
  const skillsArray = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!skillsArray || skillsArray.length === 0) {
    return <span style={{ color: "var(--m-text-muted)", fontSize: "13px" }}>—</span>;
  }

  const displayedSkills = expanded ? skillsArray : skillsArray.slice(0, 6);
  const hasMore = skillsArray.length > 6;

  return (
    <div className={styles.skillsListCell}>
      {displayedSkills.map((skill, index) => (
        <span key={index} className={styles.skillBadgeMini}>
          {skill}
        </span>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className={styles.seeAllSkillsBtn}
        >
          {expanded ? "See less" : `See all (+${skillsArray.length - 6})`}
        </button>
      )}
    </div>
  );
};

const MentorsPage = () => {
  const [view, setView] = useState("mentors"); // 'mentors' | 'applicants'
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState("list"); // 'list' or 'card'
  const [filterValues, setFilterValues] = useState({
    domain: "",
    district: "",
    experience: "",
    gender: "",
    role: "",
    skills: "",
    status: "",
    currentInstitution: "",
    designation: "",
    age: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [connectedMentors, setConnectedMentors] = useState(new Map()); // mentorId → status
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Mentor connections states (for applicants view)
  const [mentorConnections, setMentorConnections] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Custom Dropdown menu state
  const [openDropdown, setOpenDropdown] = useState(null); // null | "domain" | "district" | "experience" | "gender"

  // Meeting Schedule states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConnectionId, setScheduleConnectionId] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingMessage, setMeetingMessage] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [showMeetingDetailsModal, setShowMeetingDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [showMsgModal, setShowMsgModal] = useState(false);
  const [selectedMsgConnection, setSelectedMsgConnection] = useState(null);
  const [editingStatusId, setEditingStatusId] = useState(null);

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
      const py = (e.clientY - rect.top) / rect.height;
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

  const isAdminOrIt =
    role === "admin" ||
    role === "it_member" ||
    (user?.role && ["Admin", "IT_Member"].includes(user.role));

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchUserConnections();
    }
  }, [user?.userId]);

  useEffect(() => {
    if (view === "applicants") {
      if (isAdminOrIt) {
        fetchMentorConnections();
      } else {
        fetchUserConnections();
      }
    }
  }, [view, isAdminOrIt]);

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
      setConnectionsLoading(true);
      const res = await API.get("/api/mentor-connections/user/my-connections");
      setMyConnections(res.data || []);

      const statusMap = new Map();
      (res.data || []).forEach((conn) => {
        statusMap.set(String(conn.mentorId), conn.status);
      });

      setConnectedMentors(statusMap);
    } catch (e) {
      console.error("Error fetching connections:", e);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const fetchMentorConnections = async () => {
    try {
      setConnectionsLoading(true);
      const res = await API.get("/api/mentor-connections/admin/all");
      setMentorConnections(res.data || []);
    } catch (error) {
      console.error("Error fetching mentor connections:", error);
      setMentorConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleMentorConnectionStatusChange = async (connectionId, newStatus, meetingDetails = null) => {
    try {
      const payload = { status: newStatus };
      if (meetingDetails) {
        payload.meetingDate = meetingDetails.meetingDate;
        payload.meetingTime = meetingDetails.meetingTime;
        payload.meetingMessage = meetingDetails.meetingMessage;
        payload.meetingLink = meetingDetails.meetingLink;
      }
      await API.put(`/api/mentor-connections/${connectionId}`, payload);
      alert(`Status updated to ${newStatus}`);
      fetchMentorConnections();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleScheduleSubmit = async () => {
    if (!meetingDate || !meetingTime || !meetingMessage || !meetingLink) {
      alert("All fields are required. Please fill in all fields before submitting.");
      return;
    }
    await handleMentorConnectionStatusChange(scheduleConnectionId, "meeting_schedule", {
      meetingDate,
      meetingTime,
      meetingMessage,
      meetingLink,
    });
    setShowScheduleModal(false);
    setScheduleConnectionId(null);
    setMeetingDate("");
    setMeetingTime("");
    setMeetingMessage("");
    setMeetingLink("");
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

    const hasDomains = !!selectedMentor?.fieldofStudy_Interest?.trim();
    const hasSkills = !!(selectedMentor?.skills && selectedMentor.skills.length > 0);

    if ((hasDomains && !selectedDomain) || (hasSkills && !selectedSkill)) {
      alert("Please select a Domain and a Skill to connect with this mentor.");
      return;
    }

    try {
      setConnectingId(selectedMentor._id);

      const response = await API.post("/api/mentor-connections", {
        mentorId: selectedMentor._id,
        message: connectMessage,
        domain: selectedDomain,
        skill: selectedSkill,
      });

      if (response.status === 201) {
        setConnectedMentors((prev) => new Map([...prev, [String(selectedMentor._id), "pending"]]));
        setShowConnectModal(false);
        setConnectMessage("");
        setSelectedDomain("");
        setSelectedSkill("");
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

  const handleDeleteMentor = async (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this mentor?")) {
      try {
        await API.delete(`/member/${id}`);
        alert("Mentor deleted successfully");
        setMentors((prev) => prev.filter((m) => m._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete mentor.");
      }
    }
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      pending: { icon: "⏳", text: "Pending", key: "pending" },
      accepted: { icon: "✅", text: "Accepted", key: "accepted" },
      rejected: { icon: "❌", text: "Rejected", key: "rejected" },
      meeting_schedule: { icon: "📅", text: "Meeting Scheduled", key: "meeting_schedule" },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <div className={styles.statusBadge} data-status={s.key}>
        <span>{s.icon}</span> <span>{s.text}</span>
      </div>
    );
  };

  // Dynamic filter lists
  const allRoles = React.useMemo(() => {
    const rolesSet = new Set();
    mentors.forEach((m) => {
      if (isValidFilterValue(m.designation)) rolesSet.add(m.designation.trim());
      if (m.careerProfile?.role) {
        if (Array.isArray(m.careerProfile.role)) {
          m.careerProfile.role.forEach(r => { if (isValidFilterValue(r)) rolesSet.add(r.trim()); });
        } else {
          if (isValidFilterValue(m.careerProfile.role)) rolesSet.add(m.careerProfile.role.trim());
        }
      }
      if (m.preferredJobRole_Sector) {
        if (Array.isArray(m.preferredJobRole_Sector)) {
          m.preferredJobRole_Sector.forEach(r => { if (isValidFilterValue(r)) rolesSet.add(r.trim()); });
        } else {
          if (isValidFilterValue(m.preferredJobRole_Sector)) rolesSet.add(m.preferredJobRole_Sector.trim());
        }
      }
    });
    return Array.from(rolesSet).sort();
  }, [mentors]);

  const allDomains = React.useMemo(() => {
    const domainSet = new Set();
    mentors.forEach((m) => {
      if (m.fieldofStudy_Interest) {
        m.fieldofStudy_Interest.split(",").forEach((d) => {
          const trimmed = d.trim();
          if (isValidFilterValue(trimmed)) domainSet.add(trimmed);
        });
      }
    });
    return Array.from(domainSet).sort();
  }, [mentors]);

  const allSkills = React.useMemo(() => {
    const skillSet = new Set();
    mentors.forEach((m) => {
      if (m.skills) {
        if (Array.isArray(m.skills)) {
          m.skills.forEach(s => { if (isValidFilterValue(s)) skillSet.add(s.trim()); });
        } else if (typeof m.skills === 'string') {
          m.skills.split(",").forEach(s => { if (isValidFilterValue(s)) skillSet.add(s.trim()); });
        }
      }
    });
    return Array.from(skillSet).sort();
  }, [mentors]);

  const allExperiences = React.useMemo(() => {
    const expSet = new Set();
    mentors.forEach((m) => {
      const expVal = m.workExp || m.experience || m.experienceYears || m.totalExperience;
      if (isValidFilterValue(expVal)) {
        expSet.add(String(expVal).trim());
      }
    });
    return Array.from(expSet).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [mentors]);

  const allStatuses = React.useMemo(() => {
    const statusSet = new Set();
    mentors.forEach((m) => {
      const status = m.symMemberStatus || m.status || "Available";
      if (isValidFilterValue(status)) {
        statusSet.add(status.trim());
      }
    });
    return Array.from(statusSet).sort();
  }, [mentors]);

  const allInstitutions = React.useMemo(() => {
    const instSet = new Set();
    mentors.forEach((m) => {
      if (isValidFilterValue(m.currentInstitutionOrCompany)) {
        instSet.add(m.currentInstitutionOrCompany.trim());
      }
    });
    return Array.from(instSet).sort();
  }, [mentors]);

  const allDesignations = React.useMemo(() => {
    const desSet = new Set();
    mentors.forEach((m) => {
      if (isValidFilterValue(m.designation)) {
        desSet.add(m.designation.trim());
      }
    });
    return Array.from(desSet).sort();
  }, [mentors]);

  const allAges = React.useMemo(() => {
    const ageSet = new Set();
    mentors.forEach((m) => {
      let age = m.age;
      if (!age && m.dateOfBirth) {
        const dob = new Date(m.dateOfBirth);
        if (!isNaN(dob.getTime())) {
          const diff = Date.now() - dob.getTime();
          age = Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
        }
      }
      if (isValidFilterValue(age)) ageSet.add(age.trim());
    });
    return Array.from(ageSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [mentors]);

  const allDistricts = React.useMemo(() => {
    const districtSet = new Set();
    mentors.forEach((m) => {
      if (isValidFilterValue(m.district)) {
        districtSet.add(m.district.trim());
      }
    });
    return Array.from(districtSet).sort();
  }, [mentors]);

  const allGenders = React.useMemo(() => {
    const genderSet = new Set();
    mentors.forEach((m) => {
      if (isValidFilterValue(m.gender)) {
        genderSet.add(m.gender.trim());
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
      role: "Expertise / Role",
      skills: "Skills",
      status: "Status",
      currentInstitution: "Current Institution",
      designation: "Designation",
      age: "Age",
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
      role: "",
      skills: "",
      status: "",
      currentInstitution: "",
      designation: "",
      age: "",
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
        const rawExp = String(m.workExp || m.experience || m.experienceYears || m.totalExperience || "").trim();
        const expVal = parseFloat(rawExp);
        const isExpValid = !isNaN(expVal);
        const selectedExp = filterValues.experience.trim();
        if (selectedExp === "<1") {
          matchesExperience = isExpValid && expVal < 1;
        } else if (selectedExp === "1-3") {
          matchesExperience = isExpValid && expVal >= 1 && expVal <= 3;
        } else if (selectedExp === "3-5") {
          matchesExperience = isExpValid && expVal >= 3 && expVal <= 5;
        } else if (selectedExp === "5+") {
          matchesExperience = isExpValid && expVal > 5;
        } else {
          matchesExperience = rawExp.toLowerCase() === selectedExp.toLowerCase();
        }
      }

      // 6. Expertise / Role check
      let matchesRole = true;
      if (filterValues.role) {
        const targetRole = filterValues.role.toLowerCase();
        const mRole = m.careerProfile?.role;
        const mPreferred = m.preferredJobRole_Sector;
        const hasRole = (Array.isArray(mRole) ? mRole : [mRole]).some(r => String(r || "").toLowerCase().trim() === targetRole) ||
                        (Array.isArray(mPreferred) ? mPreferred : [mPreferred]).some(r => String(r || "").toLowerCase().trim() === targetRole) ||
                        String(m.designation || "").toLowerCase().trim() === targetRole;
        matchesRole = hasRole;
      }

      // 7. Skills check
      let matchesSkills = true;
      if (filterValues.skills) {
        const targetSkill = filterValues.skills.toLowerCase();
        const mSkills = m.skills;
        const hasSkill = Array.isArray(mSkills)
          ? mSkills.some(s => String(s || "").toLowerCase().trim() === targetSkill)
          : String(mSkills || "").toLowerCase().split(",").map(s => s.trim()).includes(targetSkill);
        matchesSkills = hasSkill;
      }

      // 8. Status check
      let matchesStatus = true;
      if (filterValues.status) {
        const currentStatus = m.symMemberStatus || m.status || "Available";
        matchesStatus = currentStatus.trim().toLowerCase() === filterValues.status.trim().toLowerCase();
      }

      // 9. Current Institution check
      let matchesInstitution = true;
      if (filterValues.currentInstitution) {
        matchesInstitution = String(m.currentInstitutionOrCompany || "").trim().toLowerCase() === filterValues.currentInstitution.trim().toLowerCase();
      }

      // 10. Designation check
      let matchesDesignation = true;
      if (filterValues.designation) {
        matchesDesignation = String(m.designation || "").trim().toLowerCase() === filterValues.designation.trim().toLowerCase();
      }

      // 11. Age check
      let matchesAge = true;
      if (filterValues.age) {
        let age = m.age;
        if (!age && m.dateOfBirth) {
          const dob = new Date(m.dateOfBirth);
          if (!isNaN(dob.getTime())) {
            const diff = Date.now() - dob.getTime();
            age = Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
          }
        }
        matchesAge = String(age || "").trim() === filterValues.age.trim();
      }

      return matchesSearch && matchesDomain && matchesDistrict && matchesGender && matchesExperience &&
             matchesRole && matchesSkills && matchesStatus && matchesInstitution && matchesDesignation && matchesAge;
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
         SINGLE-ROW HEADER — matches Jobs page layout exactly
         ========================================================================== */}
      <div className={styles.mentorHeaderWrapper}>
        <div className={styles.mentorHeaderInner}>
          <div className={styles.mentorTopBar}>

            {/* Search */}
            <div className={styles.mentorCardSearch}>
              <div className={styles.mentorSearchIcon}><Search size={20} /></div>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search by name, expertise or role..."
                onChange={handleSearchChange}
              />
            </div>

            {/* Tabs: Mentors | Applicants */}
            <div className={styles.mentorTabsContainer}>
              <div
                className={`${styles.mentorTab} ${view === "mentors" ? styles.mentorTabActive : ""}`}
                onClick={() => setView("mentors")}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setView("mentors"); }}
              >
                <div className={styles.mentorTabIcon}><Shield size={22} /></div>
                <button type="button" className={styles.mentorTabLabel}>Mentors</button>
              </div>

              <div
                className={`${styles.mentorTab} ${view === "applicants" ? styles.mentorTabActive : ""}`}
                onClick={() => setView("applicants")}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setView("applicants"); }}
              >
                <div className={styles.mentorTabIcon}><BriefcaseBusiness size={22} /></div>
                <button type="button" className={styles.mentorTabLabel}>Applicants</button>
              </div>
            </div>

            {/* Show Filters + Add Mentor */}
            <div className={styles.mentorExportButtons}>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`${styles.mentorFilterToggleBtn} ${showFilters ? styles.mentorFilterToggleBtnActive : ""}`}
              >
                {showFilters
                  ? <><EyeOff size={15} /> Hide Filters</>
                  : <><Filter size={15} /> Show Filters</>}
              </button>
              <AddMentor onSuccess={fetchMentors} />
            </div>

          </div>
        </div>
      </div>

      {/* ==========================================================================
         EXPANDABLE PREMIUM FILTERS PANEL
         ========================================================================== */}
      {showFilters && (
        <div className={styles.horizontalFilterContainer}>
          <div className={styles.filterRowWithScroll}>
            <div className={styles.filterRowContent}>

              {/* Expertise / Role */}
              <div className={styles.filterField}>
                <label>EXPERTISE / ROLE</label>
                <select
                  value={filterValues.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  {allRoles.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Roles</option>
                      {allRoles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Domain */}
              <div className={styles.filterField}>
                <label>DOMAIN</label>
                <select
                  value={filterValues.domain}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                >
                  {allDomains.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Domains</option>
                      {allDomains.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Skills */}
              <div className={styles.filterField}>
                <label>SKILLS</label>
                <select
                  value={filterValues.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                >
                  {allSkills.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Skills</option>
                      {allSkills.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Experience */}
              <div className={styles.filterField}>
                <label>EXPERIENCE</label>
                <select
                  value={filterValues.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                >
                  {allExperiences.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Experience</option>
                      {allExperiences.map((ex) => (
                        <option key={ex} value={ex}>
                          {/year/i.test(ex) ? ex : `${ex} Years`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Status */}
              <div className={styles.filterField}>
                <label>STATUS</label>
                <select
                  value={filterValues.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {allStatuses.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Statuses</option>
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Current Institution */}
              <div className={styles.filterField}>
                <label>CURRENT INSTITUTION</label>
                <select
                  value={filterValues.currentInstitution}
                  onChange={(e) => handleFilterChange('currentInstitution', e.target.value)}
                >
                  {allInstitutions.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Institutions</option>
                      {allInstitutions.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Designation */}
              <div className={styles.filterField}>
                <label>DESIGNATION</label>
                <select
                  value={filterValues.designation}
                  onChange={(e) => handleFilterChange('designation', e.target.value)}
                >
                  {allDesignations.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Designations</option>
                      {allDesignations.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Age */}
              <div className={styles.filterField}>
                <label>AGE</label>
                <select
                  value={filterValues.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                >
                  {allAges.length === 0 ? (
                    <option disabled value="">All Ages</option>
                  ) : (
                    <>
                      <option value="">All Ages</option>
                      {allAges.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Location (District) */}
              <div className={styles.filterField}>
                <label>LOCATION (DISTRICT)</label>
                <select
                  value={filterValues.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                >
                  {allDistricts.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Districts</option>
                      {allDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Gender */}
              <div className={styles.filterField}>
                <label>GENDER</label>
                <select
                  value={filterValues.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  {allGenders.length === 0 ? (
                    <option disabled value="">No Values</option>
                  ) : (
                    <>
                      <option value="">All Genders</option>
                      {allGenders.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </>
                  )}
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
       DIRECTORY SECTION HEADER (WITH VIEW TOGGLE)
       ========================================================================== */}
      <div className={styles.directoryHeaderRow}>
        <div className={styles.directoryTitleGroup}>
          <h2>{view === "mentors" ? "Mentors Directory" : "Manage Applications"}</h2>
          <span className={styles.directorySub}>
            {view === "mentors" ? (
              <>Showing <strong>{filtered.length}</strong> of <strong>{mentors.length}</strong> active job mentors</>
            ) : isAdminOrIt ? (
              <>Showing <strong>{filtered.length}</strong> of <strong>{mentors.length}</strong> active mentor applications</>
            ) : (
              <>Showing <strong>{myConnections.length}</strong> active mentor {myConnections.length === 1 ? "application" : "applications"}</>
            )}
          </span>
        </div>

        {view === "mentors" && (
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
        )}
      </div>

      <div id="mentorTable" className={view === "mentors" ? (viewType === "list" ? styles.tableContainerCard : styles.cardsViewWrapper) : styles.applicantsViewContainer}>
        {view === "mentors" ? (
          loading ? (
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
                        <th>Skills</th>
                        <th>Experience</th>
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
                          <tr key={m._id} onClick={() => navigate(`/mentors/${m._id}`)}>
                            {/* Column 1: Profile & Email */}
                            <td data-label="Mentor">
                              <div className={styles.mentorProfileCell}>
                                <div className={styles.avatarInitialCircle}>
                                  {getInitials(m.name)}
                                </div>
                                <div className={styles.mentorMetaDetails}>
                                  <span className={styles.mentorNameText}>{m.name}</span>
                                  {!isCandidate && <span className={styles.mentorEmailText}>{m.email || "No email"}</span>}
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Expertise / Designation */}
                            <td data-label="Expertise">
                              {m.designation ? (
                                <span className={styles.roleText}>{m.designation}</span>
                              ) : (
                                <div className={styles.dashCircleIcon}>
                                  <Minus size={10} strokeWidth={3} />
                                </div>
                              )}
                            </td>

                            {/* Column 3: Domain */}
                            <td data-label="Domain">
                              <span className={styles.domainCell}>
                                {m.fieldofStudy_Interest ? m.fieldofStudy_Interest.split(",")[0].trim() : "General"}
                              </span>
                            </td>

                            {/* Column 4: Skills */}
                            <td data-label="Skills">
                              <SkillsCell skills={m.skills} />
                            </td>

                            {/* Column 5: Experience */}
                            <td data-label="Experience">
                              <span className={styles.experienceCell}>
                                {m.workExp ? `${m.workExp} Years` : "Experience N/A"}
                              </span>
                            </td>

                            {/* Column 6: Status Pill */}
                            <td data-label="Status">
                              <span className={`${styles.statusBadge} ${styles.available}`}>
                                Available
                              </span>
                            </td>

                            {/* Column 7: Actions */}
                            <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
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

                                {/* Admin/IT Delete button */}
                                {isAdminOrIt && (
                                  <button
                                    onClick={() => handleDeleteMentor(m._id)}
                                    className={`${styles.actionCircleBtn} ${styles.deleteBtn}`}
                                    title="Delete Mentor"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}

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
                              {!isCandidate && <span className={styles.cardEmailText}>{m.email || "No email"}</span>}
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

                            {/* Admin/IT Delete button */}
                            {isAdminOrIt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMentor(m._id);
                                }}
                                className={styles.cardDeleteBtn}
                                title="Delete Mentor"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Pagination Footer */}
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
          )
        ) : (
          connectionsLoading ? (
            <div className={styles.loading}>
              <Clock size={16} /> Loading mentor applicants...
            </div>
          ) : !isAdminOrIt ? (
            myConnections && myConnections.length > 0 ? (
              <div className={styles.mentorsApplicantsGrid}>
                {myConnections.map((app) => (
                  <div key={app._id} className={styles.mentorApplicantCard}>
                    {/* Mentor Header */}
                    <div className={styles.mentorApplicantHeader}>
                      <div className={styles.mentorInfo}>
                        <div className={styles.mentorAvatar}>
                          {getInitials(app.mentorDetails?.name || "")}
                        </div>
                        <div className={styles.mentorDetails}>
                          <h3 className={styles.mentorName}>{app.mentorDetails?.name || "Unknown Mentor"}</h3>
                          {!isCandidate && <p className={styles.mentorEmail}>{app.mentorDetails?.email || "No email"}</p>}
                          {app.mentorDetails?.designation && (
                            <p className={styles.mentorDesignation}>{app.mentorDetails.designation}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Applicants Section */}
                    <div className={styles.applicantsSection}>
                      <div className={styles.applicantsHeader}>
                        <h4>
                          <Users size={16} /> Application status (1)
                        </h4>
                        <span className={styles.applicantsCount}>
                          1 total
                        </span>
                      </div>

                      <div className={`${styles.applicantsTable} ${styles.candidateCardTable}`}>
                        <table>
                          <thead>
                            <tr>
                              <th>Request Sent Date</th>
                              <th>Skill</th>
                              <th>Domain</th>
                              <th>Status</th>
                              {app.status === "meeting_schedule" && <th>View</th>}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className={styles.applicantDate}>
                                {app.createdAt && !isNaN(new Date(app.createdAt))
                                  ? new Date(app.createdAt).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })
                                  : "—"}
                              </td>
                              <td className={styles.applicantSkill}>
                                {app.createdAt && new Date(app.createdAt) < new Date("2026-07-14T00:00:00Z")
                                  ? "-"
                                  : (app.skill || "-")}
                              </td>
                              <td className={styles.applicantDomain}>
                                {app.createdAt && new Date(app.createdAt) < new Date("2026-07-14T00:00:00Z")
                                  ? "-"
                                  : (app.domain || "-")}
                              </td>
                              <td className={styles.applicantStatus}>
                                {renderStatusBadge(app.status || "pending")}
                              </td>
                              {app.status === "meeting_schedule" && (
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    onClick={() => {
                                      setSelectedMeeting(app);
                                      setShowMeetingDetailsModal(true);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--m-primary)",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center"
                                    }}
                                    title="View Meeting Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>📋</div>
                <h3>You haven't sent any mentor requests yet</h3>
                <p>Browse mentors and send a request to get started.</p>
              </div>
            )
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className={styles.emptyStateMessage}>
                  No mentors found matching the filters.
                </div>
              ) : (
                <div className={styles.mentorsApplicantsGrid}>
                  {currentMentors.map((mentor) => {
                    // Get all connections for this mentor
                    const mentorApplicants = mentorConnections.filter(
                      (conn) => String(conn.mentorId) === String(mentor._id)
                    );

                    return (
                      <div key={mentor._id} className={styles.mentorApplicantCard}>
                        {/* Mentor Header */}
                        <div className={styles.mentorApplicantHeader}>
                          <div className={styles.mentorInfo}>
                            <div className={styles.mentorAvatar}>
                              {getInitials(mentor.name)}
                            </div>
                            <div className={styles.mentorDetails}>
                              <h3 className={styles.mentorName}>{mentor.name}</h3>
                              <p className={styles.mentorEmail}>{mentor.email || "No email"}</p>
                              {mentor.designation && (
                                <p className={styles.mentorDesignation}>{mentor.designation}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Applicants Section */}
                        <div className={styles.applicantsSection}>
                          <div className={styles.applicantsHeader}>
                            <h4>
                              <Users size={16} /> <span>Applicants ({mentorApplicants?.length || 0})</span>
                            </h4>
                            <span className={styles.applicantsCount}>
                              {mentorApplicants?.length || 0} total
                            </span>
                          </div>

                          {mentorApplicants?.length > 0 ? (
                            <div className={styles.applicantsTable}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Request Sent Date</th>
                                    <th>Name</th>
                                    {/* <th>Email</th> */}
                                    <th>Status</th>
                                    <th>Domain</th>
                                    <th>Skill</th>
                                    <th style={{ textAlign: "center" }}>View</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {mentorApplicants.map((app, idx) => (
                                    <tr key={idx}>
                                      <td className={styles.applicantDate}>
                                        {app.createdAt && !isNaN(new Date(app.createdAt))
                                          ? new Date(app.createdAt).toLocaleString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          : "—"}
                                      </td>
                                      <td className={styles.applicantName}>
                                        {app.userDetails?.name || "Unknown Applicant"}
                                      </td>
                                      {/* <td className={styles.applicantEmail}>
                                        {app.userDetails?.email || "N/A"}
                                      </td> */}
                                      <td className={styles.applicantStatus}>
                                        {editingStatusId === app._id ? (
                                          <select
                                            className={styles.statusSelect}
                                            value={app.status || "pending"}
                                            autoFocus
                                            onBlur={() => setEditingStatusId(null)}
                                            onChange={(e) => {
                                              if (e.target.value === "meeting_schedule") {
                                                setScheduleConnectionId(app._id);
                                                setShowScheduleModal(true);
                                              } else {
                                                handleMentorConnectionStatusChange(
                                                  app._id,
                                                  e.target.value
                                                );
                                              }
                                              setEditingStatusId(null);
                                            }}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="meeting_schedule">Meeting Scheduled</option>
                                          </select>
                                        ) : (
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {renderStatusBadge(app.status || "pending")}
                                            <button
                                              onClick={() => setEditingStatusId(app._id)}
                                              style={{
                                                background: "none",
                                                border: "none",
                                                color: "var(--m-primary)",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: 0
                                              }}
                                              title="Edit Status"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                      <td className={styles.applicantDomain}>
                                        {app.createdAt && new Date(app.createdAt) < new Date("2026-07-14T00:00:00Z")
                                          ? "-"
                                          : (app.domain || "-")}
                                      </td>
                                      <td className={styles.applicantSkill}>
                                        {app.createdAt && new Date(app.createdAt) < new Date("2026-07-14T00:00:00Z")
                                          ? "-"
                                          : (app.skill || "-")}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <button
                                          onClick={() => {
                                            setSelectedMsgConnection(app);
                                            setShowMsgModal(true);
                                          }}
                                          style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--m-primary)",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center"
                                          }}
                                          title="View Details"
                                        >
                                          <Eye size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className={styles.noApplicants}>
                              <Users size={24} />
                              <p>No applicants yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Footer */}
              <div className={styles.paginationFooter}>
                <div className={styles.paginationStats}>
                  Showing <strong>{recordStart}</strong> to <strong>{recordEnd}</strong> of{" "}
                  <strong>{filtered.length}</strong> mentors
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
          )
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

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className={styles.selectInput}
              style={{ marginBottom: "10px" }}
            >
              <option value="" disabled hidden style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>Domains</option>
              {selectedMentor?.fieldofStudy_Interest?.split(",").map((domain, idx) => (
                <option key={`domain-${idx}`} value={domain.trim()} style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>
                  {domain.trim()}
                </option>
              ))}
            </select>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className={styles.selectInput}
              style={{ marginBottom: "10px" }}
            >
              <option value="" disabled hidden style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>Skills</option>
              {selectedMentor?.skills?.map((skill, idx) => (
                <option key={`skill-${idx}`} value={skill} style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>
                  {skill}
                </option>
              ))}
            </select>

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

      {/* ==========================================================================
         SCHEDULE MEETING MODAL OVERLAY (ADMIN SIDE)
         ========================================================================== */}
      {showScheduleModal && scheduleConnectionId && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setShowScheduleModal(false);
            setScheduleConnectionId(null);
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <h2>Schedule Meeting</h2>
            <p>Enter the meeting details to schedule a connection meeting with the candidate.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--m-primary)", textTransform: "uppercase", marginBottom: "4px" }}>Date</label>
                <input 
                  type="date" 
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={styles.selectInput}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--m-primary)", textTransform: "uppercase", marginBottom: "4px" }}>Time</label>
                <input 
                  type="time" 
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className={styles.selectInput}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--m-primary)", textTransform: "uppercase", marginBottom: "4px" }}>Message</label>
                <textarea 
                  placeholder="Enter message for the candidate..."
                  value={meetingMessage}
                  onChange={(e) => setMeetingMessage(e.target.value)}
                  className={styles.messageInput}
                  rows={3}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--m-primary)", textTransform: "uppercase", marginBottom: "4px" }}>Meeting Link</label>
                <input 
                  type="text" 
                  placeholder="https://zoom.us/j/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className={styles.selectInput}
                  required
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleConnectionId(null);
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className={styles.sendBtn}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MEETING DETAILS MODAL OVERLAY (JOB SEEKER SIDE)
         ========================================================================== */}
      {showMeetingDetailsModal && selectedMeeting && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowMeetingDetailsModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <h2>Meeting Details</h2>
            <p>Here are the scheduled meeting details with your mentor <strong>{selectedMeeting.mentorDetails?.name}</strong>:</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Meeting Date</strong>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{selectedMeeting.meetingDate}</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Meeting Time</strong>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{selectedMeeting.meetingTime}</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Domain</strong>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  {selectedMeeting.createdAt && new Date(selectedMeeting.createdAt) < new Date("2026-07-14T00:00:00Z")
                    ? "-"
                    : (selectedMeeting.domain || "-")}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Skill</strong>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  {selectedMeeting.createdAt && new Date(selectedMeeting.createdAt) < new Date("2026-07-14T00:00:00Z")
                    ? "-"
                    : (selectedMeeting.skill || "-")}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Message</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", whiteSpace: "pre-wrap", color: "var(--m-text-muted)" }}>{selectedMeeting.meetingMessage}</p>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--m-primary)", textTransform: "uppercase" }}>Meeting Link</strong>
                <a 
                  href={selectedMeeting.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: "14px", color: "var(--m-primary)", textDecoration: "underline", wordBreak: "break-all", fontWeight: "600" }}
                >
                  {selectedMeeting.meetingLink}
                </a>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowMeetingDetailsModal(false)}
                className={styles.cancelBtn}
                style={{ width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMsgModal && selectedMsgConnection && (() => {
        const formattedDate = selectedMsgConnection.createdAt && !isNaN(new Date(selectedMsgConnection.createdAt))
          ? new Date(selectedMsgConnection.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
          : "—";

        const domainVal = selectedMsgConnection.createdAt && new Date(selectedMsgConnection.createdAt) < new Date("2026-07-14T00:00:00Z")
          ? "-"
          : (selectedMsgConnection.domain || "-");

        const skillVal = selectedMsgConnection.createdAt && new Date(selectedMsgConnection.createdAt) < new Date("2026-07-14T00:00:00Z")
          ? "-"
          : (selectedMsgConnection.skill || "-");

        return (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setShowMsgModal(false);
              setSelectedMsgConnection(null);
            }}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px" }}
            >
              <h2>Applicant Details</h2>
              <p>Full application details for <strong>{selectedMsgConnection.userDetails?.name || "the candidate"}</strong>:</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "20px 0" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Request Sent Date</strong>
                  <span style={{ fontSize: "14px", color: "var(--m-text-muted)" }}>{formattedDate}</span>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Name</strong>
                  <span style={{ fontSize: "14px", color: "var(--m-text-muted)" }}>{selectedMsgConnection.userDetails?.name || "N/A"}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Email</strong>
                  <span style={{ fontSize: "14px", color: "var(--m-text-muted)", wordBreak: "break-all" }}>{selectedMsgConnection.userDetails?.email || "N/A"}</span>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Status</strong>
                  <div style={{ marginTop: "4px" }}>
                    {renderStatusBadge(selectedMsgConnection.status || "pending")}
                  </div>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Domain</strong>
                  <span style={{ fontSize: "14px", color: "var(--m-text-muted)" }}>{domainVal}</span>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Skill</strong>
                  <span style={{ fontSize: "14px", color: "var(--m-text-muted)" }}>{skillVal}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "14px" }}>
                <strong style={{ display: "block", fontSize: "11px", color: "var(--m-primary)", textTransform: "uppercase" }}>Message</strong>
                <p style={{ margin: "6px 0 0 0", fontSize: "14px", whiteSpace: "pre-wrap", color: "var(--m-text-muted)" }}>
                  {selectedMsgConnection.message || "No message provided."}
                </p>
              </div>

              <div className={styles.modalActions} style={{ marginTop: "24px" }}>
                <button
                  onClick={() => {
                    setShowMsgModal(false);
                    setSelectedMsgConnection(null);
                  }}
                  className={styles.cancelBtn}
                  style={{ width: "100%" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MentorsPage;