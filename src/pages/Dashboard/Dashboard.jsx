// export default MemberDashboard;

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import { calculateTotalMembersMetrics } from "../../utils/memberMetrics";
import {
  Users,
  Briefcase,
  UserCheck,
  User,
  Building2,
  TrendingUp,
  GraduationCap,
  Star,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  MoreHorizontal,
  LayoutDashboard,
  UserPlus,
  Settings,
  HelpCircle,
  Briefcase as BriefcaseIcon,
  Shield,
  ArrowUpRight,
  ChevronDown,
  BarChart2,
  BookOpen,
} from "lucide-react";
import styles from "./Dashboard.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import CandidateDashboard from "../CandidateDashboard/CandidateDashboard";

// ─── helpers ──────────────────────────────────────────────────────────────────
function countBy(array, key) {
  const counts = {};
  (array || []).forEach((item) => {
    const raw = item?.[key];
    const value = raw === null || raw === undefined || String(raw).trim() === "" ? "Unknown" : String(raw).trim();
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Helper specifically for arrays/comma-separated strings (Skills)
function getTopSkills(membersList) {
  const counts = {};
  membersList.forEach((m) => {
    let userSkills = m.skills || [];
    if (typeof userSkills === "string") {
      userSkills = userSkills.split(",").map((s) => s.trim());
    }
    if (Array.isArray(userSkills)) {
      userSkills.forEach((skill) => {
        const cleanSkill = skill?.trim();
        if (cleanSkill) {
          counts[cleanSkill] = (counts[cleanSkill] || 0) + 1;
        }
      });
    } else if (!userSkills || userSkills.length === 0) {
      counts["Unknown"] = (counts["Unknown"] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function getGrowthRate(list) {
  if (!Array.isArray(list) || list.length === 0) return "0";
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newItems = list.filter((item) => {
    if (!item.createdAt) return false;
    return new Date(item.createdAt) >= thirtyDaysAgo;
  }).length;

  const baseItems = list.length - newItems;
  if (baseItems <= 0) return "100";

  const rate = (newItems / baseItems) * 100;
  return rate.toFixed(0);
}

// ─── sparkline ────────────────────────────────────────────────────────────────
const SP = {
  red: [30, 35, 28, 40, 38, 45, 42, 50, 48, 55],
  blue: [20, 25, 22, 28, 30, 27, 35, 32, 38, 40],
  purple: [15, 18, 14, 20, 19, 22, 20, 25, 23, 28],
  yellow: [40, 38, 42, 45, 43, 48, 50, 52, 55, 58],
  cyan: [10, 12, 11, 14, 13, 16, 15, 18, 17, 20],
  pink: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18],
  green: [12, 15, 13, 18, 16, 20, 18, 22, 21, 25],
};

function Sparkline({ points, color }) {
  const W = 100,
    H = 28;
  const min = Math.min(...points),
    max = Math.max(...points),
    range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map((v) => H - ((v - min) / range) * H);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const fill = line + ` L${W},${H} L0,${H} Z`;
  const id = `sg${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "28px" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── interactive donut with cursor-following tooltip ─────────────────────────
function DonutChart({ data, size = 120, thickness = 22, onSliceClick, onSliceHover, showTooltip = false }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const gap = 2;

  const segments = [];
  let offset = 0;
  data.forEach((seg, i) => {
    const pct = (seg.value / total) * (circ - data.length * gap);
    segments.push({ ...seg, pct, offset, index: i });
    offset += pct + gap;
  });

  const hovSeg = hovered !== null ? segments[hovered] : null;

  const handleMouseMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
      onMouseMove={handleMouseMove}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block", overflow: "visible", cursor: "pointer" }}
      >
        {segments.map((seg) => {
          const isHov = hovered === seg.index;
          const rHov = isHov ? r + 3 : r;
          const circHov = 2 * Math.PI * rHov;
          const pctHov = (seg.value / total) * (circHov - data.length * gap);
          return (
            <circle
              key={seg.index}
              cx={size / 2}
              cy={size / 2}
              r={rHov}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHov ? thickness + 3 : thickness}
              strokeDasharray={`${Math.max(pctHov, 0)} ${circHov}`}
              strokeDashoffset={-seg.offset * (circHov / circ)}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{
                transition: "r 0.18s ease, stroke-width 0.18s ease",
                cursor: "pointer",
                filter: isHov ? `drop-shadow(0 0 6px ${seg.color}99)` : "none",
              }}
              onMouseEnter={() => {
                setHovered(seg.index);
                onSliceHover?.(seg);
              }}
              onMouseLeave={() => {
                setHovered(null);
                onSliceHover?.(null);
              }}
              onClick={() => onSliceClick?.(seg)}
            />
          );
        })}
      </svg>

      {showTooltip && hovSeg && (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 12,
            top: mousePos.y - 36,
            background: "#1e293b",
            color: "#fff",
            padding: "5px 9px",
            borderRadius: 7,
            fontSize: "0.7rem",
            fontWeight: 700,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 99,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            borderLeft: `3px solid ${hovSeg.color}`,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: hovSeg.color }}>{hovSeg.name}</span>
          <br />
          {hovSeg.value} ({Math.round((hovSeg.value / total) * 100)}%)
        </div>
      )}
    </div>
  );
}

// ─── growth chart with hover tooltip ─────────────────────────────────────────
function GrowthChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const W = 400,
    H = 130;
  const pad = { t: 8, r: 8, b: 22, l: 28 };
  const iw = W - pad.l - pad.r,
    ih = H - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * iw);
  const ys = data.map((d) => pad.t + ih - (d.value / max) * ih);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = line + ` L${xs[xs.length - 1]},${pad.t + ih} L${xs[0]},${pad.t + ih} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "130px", overflow: "visible" }}>
      <defs>
        <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={pad.l}
          y1={pad.t + ih * t}
          x2={pad.l + iw}
          y2={pad.t + ih * t}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray={i === 0 ? "none" : "3 3"}
        />
      ))}
      {[0, 0.5, 1].map((t, i) => (
        <text key={i} x={pad.l - 4} y={pad.t + ih * (1 - t) + 3} fontSize="8" textAnchor="end" fill="#9ca3af">
          {Math.round(max * t)}
        </text>
      ))}
      <path d={area} fill="url(#gg)" />
      <path d={line} fill="none" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const isHov = tooltip?.i === i;
        return (
          <g key={i}>
            <rect
              x={xs[i] - 12}
              y={pad.t}
              width={24}
              height={ih}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ i, x: xs[i], y: ys[i], ...d })}
              onMouseLeave={() => setTooltip(null)}
            />
            <circle
              cx={xs[i]}
              cy={ys[i]}
              r={isHov ? 5 : isLast ? 4 : 2.5}
              fill={isHov || isLast ? "#c0392b" : "#fff"}
              stroke="#c0392b"
              strokeWidth="1.5"
              style={{ transition: "r 0.15s", pointerEvents: "none" }}
            />
            {isLast && !isHov && (
              <>
                <rect x={xs[i] - 14} y={ys[i] - 17} width="28" height="13" rx="4" fill="#c0392b" />
                <text x={xs[i]} y={ys[i] - 7} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">
                  {d.value}
                </text>
              </>
            )}
            {isHov && (
              <>
                <line x1={xs[i]} y1={pad.t} x2={xs[i]} y2={pad.t + ih} stroke="#c0392b" strokeWidth="1" strokeDasharray="3 2" />
                <rect x={xs[i] - 18} y={ys[i] - 22} width="36" height="17" rx="4" fill="#1e293b" />
                <text x={xs[i]} y={ys[i] - 11} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">
                  {d.value}
                </text>
                <text x={xs[i]} y={ys[i] - 3} textAnchor="middle" fontSize="7" fill="#94a3b8">
                  {d.label}
                </text>
              </>
            )}
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 5} textAnchor="middle" fontSize="8" fill="#9ca3af">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function MemberDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { memberContext, jobContext } = useData();

  const [members, setMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [recruitersCount, setRecruitersCount] = useState(0);
  const [recruitersList, setRecruitersList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [growthPeriod, setGrowthPeriod] = useState("year"); // "year" | "month" | "week"
  const [showGrowthDropdown, setShowGrowthDropdown] = useState(false);
  const growthDropdownRef = React.useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (growthDropdownRef.current && !growthDropdownRef.current.contains(e.target)) {
        setShowGrowthDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Growth chart data builders ──────────────────────────────────────────────
  const getYearData = useCallback((membersList) => {
    if (!Array.isArray(membersList) || membersList.length === 0)
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(l => ({ label: l, value: 0 }));
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ name: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), monthIndex: d.getMonth() });
    }
    return months.map((m) => {
      const last = new Date(m.year, m.monthIndex + 1, 0, 23, 59, 59, 999);
      const count = membersList.filter(mb => !mb.createdAt || new Date(mb.createdAt) <= last).length;
      return { label: m.name, value: count };
    });
  }, []);

  const getMonthData = useCallback((membersList) => {
    if (!Array.isArray(membersList) || membersList.length === 0)
      return Array.from({ length: 4 }, (_, i) => ({ label: `Wk ${i + 1}`, value: 0 }));
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(year, month, i * 7 + 1);
      const weekEnd = new Date(year, month, i * 7 + 7, 23, 59, 59, 999);
      const count = membersList.filter(mb => {
        if (!mb.createdAt) return i === 0;
        const d = new Date(mb.createdAt);
        return d >= weekStart && d <= weekEnd;
      }).length;
      return { label: `Wk ${i + 1}`, value: count };
    });
  }, []);

  const getWeekData = useCallback((membersList) => {
    if (!Array.isArray(membersList) || membersList.length === 0)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(l => ({ label: l, value: 0 }));
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((label, i) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const count = membersList.filter(mb => {
        if (!mb.createdAt) return false;
        const d = new Date(mb.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length;
      return { label, value: count };
    });
  }, []);

  const growthData = useMemo(() => {
    if (growthPeriod === "month") return getMonthData(members);
    if (growthPeriod === "week") return getWeekData(members);
    return getYearData(members);
  }, [growthPeriod, members, getYearData, getMonthData, getWeekData]);

  const dynamicGrowthPct = useMemo(() => {
    if (growthData.length < 2) return "0";
    const firstVal = growthData[0].value;
    const lastVal = growthData[growthData.length - 1].value;
    if (firstVal <= 0) return lastVal > 0 ? "100" : "0";
    return (((lastVal - firstVal) / firstVal) * 100).toFixed(0);
  }, [growthData]);

  const GROWTH_OPTIONS = [
    { key: "year", label: "This Year" },
    { key: "month", label: "This Month" },
    { key: "week", label: "This Week" },
  ];
  const selectedGrowthLabel = GROWTH_OPTIONS.find(o => o.key === growthPeriod)?.label ?? "This Year";

  // ── dark mode toggle ──
  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // init from existing attribute
  useEffect(() => {
    const existing = document.documentElement.getAttribute("data-theme");
    if (existing === "dark") setDarkMode(true);
  }, []);

  // ── data loading (preserved original logic) ──
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setErrorMsg("");
        setLoadingMembers(true);
        if (Array.isArray(memberContext) && memberContext.length > 0) {
          setMembers(memberContext);
          return;
        }
        const res = await API.get("/member");
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load members", e);
        setMembers([]);
        setErrorMsg(e?.response?.data?.message || "Failed to load members. Please check your connection.");
      } finally {
        setLoadingMembers(false);
      }
    };
    if (authLoading) return;
    if (user && !["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
      loadMembers();
    } else if (!user) {
      setLoadingMembers(false);
      setErrorMsg("Authentication required. Please log in.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberContext, user, authLoading]);

  useEffect(() => {
    const fetchRecruitersCount = async () => {
      try {
        const res = await API.get("/api/recruiters");
        if (res.data && Array.isArray(res.data)) {
          setRecruitersCount(res.data.length);
          setRecruitersList(res.data);
        } else if (res.data && typeof res.data.total === "number") {
          setRecruitersCount(res.data.total);
          setRecruitersList(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (e) {
        console.error("Failed to fetch recruiters", e);
        setRecruitersCount(0);
        setRecruitersList([]);
      }
    };
    if (authLoading) return;
    if (user && !["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
      fetchRecruitersCount();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        if (Array.isArray(jobContext) && jobContext.length > 0) {
          setJobs(jobContext);
          return;
        }
        const res = await API.get("/jobs");
        setJobs(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (e) {
        console.error("Failed to load jobs in dashboard", e);
      }
    };
    if (authLoading) return;
    if (user && !["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
      loadJobs();
    }
  }, [jobContext, user, authLoading]);

  const pastMonthsDash = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    return months;
  }, []);

  const getMemberTimeDash = (member) => {
    const d = member?.timestamp || member?.createdAt;
    if (!d) return 0;
    const time = new Date(d).getTime();
    return isNaN(time) ? 0 : time;
  };

  const isMemberActiveYes = (m) => {
    const raw = m?.solidarityMember || m?.symMemberStatus;
    return String(raw || "").trim().toLowerCase() === "yes";
  };

  const combinedAllMembers = useMemo(() => {
    const normRecruiters = (recruitersList || []).map(r => ({
      ...r,
      solidarityMember: r.solidarityMember || r.symMemberStatus || "Yes",
      symMemberStatus: r.symMemberStatus || r.solidarityMember || "Yes",
    }));
    return [...(members || []), ...normRecruiters];
  }, [members, recruitersList]);

  const activeTrendDash = useMemo(() => {
    return pastMonthsDash.map(m => {
      const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      return combinedAllMembers.filter(member => {
        const isActive = isMemberActiveYes(member);
        return isActive && getMemberTimeDash(member) <= endOfMonth;
      }).length;
    });
  }, [combinedAllMembers, pastMonthsDash]);

  const activeGrowthDash = useMemo(() => {
    const len = activeTrendDash.length;
    if (len < 2) return 0;
    const current = activeTrendDash[len - 1];
    const previous = activeTrendDash[len - 2] || 1;
    return Math.round(((current - previous) / previous) * 100);
  }, [activeTrendDash]);

  const newTrendDash = useMemo(() => {
    return pastMonthsDash.map(m => {
      const startOfMonth = new Date(m.getFullYear(), m.getMonth(), 1, 0, 0, 0, 0).getTime();
      const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      return (members || []).filter(member => {
        const t = getMemberTimeDash(member);
        return t >= startOfMonth && t <= endOfMonth;
      }).length;
    });
  }, [members, pastMonthsDash]);

  const newGrowthDash = useMemo(() => {
    const len = newTrendDash.length;
    if (len < 2) return 0;
    const current = newTrendDash[len - 1];
    const previous = newTrendDash[len - 2];
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [newTrendDash]);

  const jobsTrendDash = useMemo(() => {
    return pastMonthsDash.map(m => {
      const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      return (jobs || []).filter(j => {
        const d = j?.createdAt || j?.timestamp;
        const t = d ? new Date(d).getTime() : 0;
        return t <= endOfMonth;
      }).length || (jobs || []).length;
    });
  }, [jobs, pastMonthsDash]);

  const jobsGrowthDash = useMemo(() => {
    const len = jobsTrendDash.length;
    if (len < 2) return 0;
    const current = jobsTrendDash[len - 1];
    const previous = jobsTrendDash[len - 2] || 1;
    return Math.round(((current - previous) / previous) * 100);
  }, [jobsTrendDash]);

  // ── loading / error / role guards (preserved) ──
  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>Verifying authentication...</div>
        </div>
      </div>
    );
  }

  if (["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
    return <CandidateDashboard />;
  }

  if (loadingMembers) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <p style={{ color: "#ef4444", fontWeight: 800 }}>Dashboard Error</p>
          <p style={{ color: "#64748b", maxWidth: 520, textAlign: "center" }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <p style={{ color: "#ef4444", fontWeight: 700 }}>No members data found.</p>
        </div>
      </div>
    );
  }

  // ── calculations (preserved all original calculations) ──
  const totalGrowth = getGrowthRate(members);

  const providers = members.filter((m) => (m.memberType || "").includes("Oppurtunity Provider")).length;
  const recruiters = recruitersCount;

  const refereesList = members.filter((m) => (m.memberType || "").includes("Referee"));
  const referees = refereesList.length;
  const refereesGrowth = getGrowthRate(refereesList);

  const upskillersList = members.filter((m) => (m.memberType || "").includes("In need of Upskilling"));
  const upskillers = upskillersList.length;
  const upskillersGrowth = getGrowthRate(upskillersList);

  const mentorsList = members.filter((m) => (m.memberType || "").includes("Mentor"));
  const mentors = mentorsList.length;
  const mentorsGrowth = getGrowthRate(mentorsList);

  const seekersList = members.filter((m) => (m.memberType || "").toLowerCase().includes("job seeker"));
  const seekers = seekersList.length;

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

  const freshersList = seekersList.filter((m) => isFresher(m));
  const freshersCount = freshersList.length;
  const freshersGrowth = getGrowthRate(freshersList);

  const experiencedList = seekersList.filter((m) => !isFresher(m));
  const experiencedCount = experiencedList.length;
  const experiencedGrowth = getGrowthRate(experiencedList);
  const seekersGrowth = getGrowthRate(seekersList);

  const {
    totalMembers,
    totalTrend: totalMembersTrend,
    totalGrowth: totalMembersGrowth,
  } = calculateTotalMembersMetrics(members, recruitersList);
  const activeMembers = combinedAllMembers.filter(isMemberActiveYes).length;
  const newThisMonth = members.filter(m => {
    const raw = m.createdAt || m.timestamp;
    if (!raw) return false;
    const d = new Date(raw), now = new Date();
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const topDistricts = countBy(members, "district").slice(0, 5);
  const topEducations = countBy(members, "highest_education").slice(0, 5);
  const topExperiences = countBy(members, "workExp").slice(0, 5);
  const topSkills = getTopSkills(members);
  const maxDist = topDistricts[0]?.value || 1;

  // Handle Member Type card clicks (preserved original handler)
  const handleMemberTypeClick = (type) => {
    switch (type) {
      case "Seeker":
        navigate("/job-seekers");
        break;
      case "Provider":
        navigate("/members", { state: { exactMemberType: "Oppurtunity Provider" } });
        break;
      case "Recruiter":
        navigate("/recruiters");
        break;
      case "Referee":
        navigate("/referees");
        break;
      case "Mentor":
        navigate("/mentors");
        break;
      default:
        break;
    }
  };

  // Stats for grid (preserved original stats with correct navigation)
  const stats = [
    { title: "Total Members", count: totalMembers, icon: Users, color: "#c0392b", path: "/members" },
    { title: "Job Seekers", count: seekers, icon: Briefcase, color: "#2563eb", path: "/job-seekers" },
    { title: "Freshers", count: freshersCount, icon: GraduationCap, color: "#7c3aed", path: "/job-seekers", state: { expFilter: "fresher" } },
    { title: "Experienced", count: experiencedCount, icon: Star, color: "#d97706", path: "/job-seekers", state: { expFilter: "experienced" } },
    { title: "Recruiters", count: recruiters, icon: Building2, color: "#8b5cf6", path: "/recruiters" },
    { title: "Job Referee", count: referees, icon: User, color: "#ec4899", path: "/referees" },
    { title: "Upskillers", count: upskillers, icon: BookOpen, color: "#16a34a", path: "/members", state: { exactMemberType: "In need of Upskilling" } },
  ];

  // Member type data for donut (preserved)
  const memberTypeData = [
    { name: "Seeker", value: seekers, color: "#10b981", path: "/job-seekers" },
    { name: "Recruiter", value: recruiters, color: "#8b5cf6", path: "/recruiters" },
    { name: "Referee", value: referees, color: "#ec4899", path: "/referees" },
    { name: "Mentor", value: mentors, color: "#6366f1", path: "/mentors" },
  ];

  const donutData = [
    { name: "Job Seekers", value: seekers, color: "#c0392b", nav: () => navigate("/job-seekers") },
    { name: "Recruiters", value: recruiters, color: "#7c3aed", nav: () => navigate("/recruiters") },
    { name: "Referees", value: referees, color: "#d97706", nav: () => navigate("/referees") },
    { name: "Mentors", value: mentors, color: "#0891b2", nav: () => navigate("/mentors") },
    { name: "Upskillers", value: upskillers, color: "#16a34a", nav: () => navigate("/members", { state: { exactMemberType: "In need of Upskilling" } }) },
  ];



  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter(j => j.isActive !== false).length;

  const getJobCategoryBreakdown = (jobsList) => {
    let itCount = 0;
    let marketingCount = 0;
    let educationCount = 0;
    let designCount = 0;
    let otherCount = 0;

    jobsList.forEach((job) => {
      const ind = String(job.industry || "").toLowerCase();
      const tit = String(job.title || "").toLowerCase();
      const rol = String(job.role || "").toLowerCase();

      if (
        ind.includes("information technology") ||
        ind.includes("it") ||
        ind.includes("software") ||
        tit.includes("developer") ||
        tit.includes("software") ||
        tit.includes("tech") ||
        tit.includes("frontend") ||
        tit.includes("backend") ||
        tit.includes("full stack") ||
        tit.includes("mern") ||
        tit.includes("java") ||
        tit.includes("python") ||
        tit.includes("data") ||
        tit.includes("devops") ||
        tit.includes("qa") ||
        tit.includes("tester") ||
        tit.includes("system administrator") ||
        tit.includes("network") ||
        tit.includes("mobile") ||
        rol.includes("developer") ||
        rol.includes("software") ||
        rol.includes("tech")
      ) {
        itCount++;
      } else if (
        ind.includes("marketing") ||
        ind.includes("sales") ||
        tit.includes("marketing") ||
        tit.includes("sales") ||
        tit.includes("seo") ||
        rol.includes("marketing") ||
        rol.includes("sales")
      ) {
        marketingCount++;
      } else if (
        ind.includes("education") ||
        tit.includes("teacher") ||
        tit.includes("education") ||
        tit.includes("professor") ||
        tit.includes("trainer") ||
        rol.includes("teacher") ||
        rol.includes("education")
      ) {
        educationCount++;
      } else if (
        ind.includes("design") ||
        tit.includes("designer") ||
        tit.includes("ui/ux") ||
        tit.includes("graphic") ||
        tit.includes("creative") ||
        rol.includes("designer") ||
        rol.includes("ui/ux")
      ) {
        designCount++;
      } else {
        otherCount++;
      }
    });

    const total = jobsList.length || 1;
    const itPct = ((itCount / total) * 100).toFixed(1) + "%";
    const marketingPct = ((marketingCount / total) * 100).toFixed(1) + "%";
    const educationPct = ((educationCount / total) * 100).toFixed(1) + "%";
    const designPct = ((designCount / total) * 100).toFixed(1) + "%";
    const otherPct = ((otherCount / total) * 100).toFixed(1) + "%";

    return [
      { name: "IT & Software", value: itCount, pct: itPct, color: "#c0392b" },
      { name: "Marketing", value: marketingCount, pct: marketingPct, color: "#2563eb" },
      { name: "Education", value: educationCount, pct: educationPct, color: "#7c3aed" },
      { name: "Design", value: designCount, pct: designPct, color: "#d97706" },
      { name: "Other", value: otherCount, pct: otherPct, color: "#9ca3af" },
    ];
  };

  const jobCats = getJobCategoryBreakdown(jobs);

  const statCards = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "#2563eb",
      spark: totalMembersTrend,
      growth: totalMembersGrowth,
      onClick: () => navigate("/members"),
    },
    {
      label: "Active Members",
      value: activeMembers,
      icon: Briefcase,
      color: "#16a34a",
      spark: SP.green,
      growth: activeGrowthDash,
      onClick: () => navigate("/members", { state: { exactStatus: "Yes" } }),
    },
    {
      label: "New This Month",
      value: newThisMonth,
      icon: User,
      color: "#7c3aed",
      spark: SP.purple,
      growth: newGrowthDash,
      onClick: () => navigate("/members", { state: { newThisMonth: true } }),
    },
    {
      label: "Active Job Openings",
      value: activeJobsCount || totalJobsCount,
      icon: BriefcaseIcon,
      color: "#d97706",
      spark: SP.yellow,
      growth: jobsGrowthDash,
      onClick: () => navigate("/jobs"),
    },
  ];



  const quickActions = [
    { icon: UserPlus, label: "Add Member", color: "#c0392b", bg: "#fef2f2", onClick: () => navigate("/job-seekers", { state: { openAddModal: true } }) },
    { icon: Briefcase, label: "Post Job", color: "#2563eb", bg: "#eff6ff", onClick: () => navigate("/jobs", { state: { openAddModal: true } }) },
    { icon: Shield, label: "Create Referee", color: "#16a34a", bg: "#f0fdf4", onClick: () => navigate("/referees", { state: { openAddModal: true } }) },
    { icon: Star, label: "Add Mentor", color: "#d97706", bg: "#fffbeb", onClick: () => navigate("/mentors", { state: { openAddModal: true } }) },
    { icon: BriefcaseIcon, label: "View Jobs", color: "#d97706", bg: "#fffbeb", onClick: () => navigate("/jobs") },
    { icon: UserPlus, label: "Add Recruiter", color: "#8b5cf6", bg: "#f5f3ff", onClick: () => navigate("/recruiters", { state: { openAddModal: true } }) },
    { icon: Settings, label: "Settings", color: "#e11d48", bg: "rgba(225, 29, 72, 0.08)", onClick: () => navigate("/settings") },
  ];

  const donutCenter = hoveredSlice
    ? { label: hoveredSlice.name, value: hoveredSlice.value, color: hoveredSlice.color }
    : { label: "Total", value: totalMembers, color: "var(--text-main)" };

  return (
    <div className={styles.mainArea}>
      {/* TOPBAR */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <p className={styles.welcomeText}>
            Welcome back, <span className={styles.welcomeAccent}>Admin</span> 👋
          </p>
          <p className={styles.welcomeSub}>Here's what's happening with Job Bridge today.</p>
        </div>

      </header>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* ── STAT CARDS ── */}
        <div className={styles.statRow}>
          {statCards.map((s, i) => (
            <div
              key={i}
              className={styles.statCard}
              onClick={s.onClick}
              title={`View ${s.label}`}
              style={{
                "--theme-color": s.color,
                "--glow-color": `${s.color}26`,
              }}
            >
              <div className={styles.statCardTop}>
                <div className={styles.statNumbers}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statValue}>{s.value.toLocaleString()}</div>
                </div>
                <div className={styles.statIconWrap} style={{ background: `${s.color}18`, color: s.color }}>
                  <s.icon size={17} />
                </div>
              </div>
              <div className={styles.statTrend} style={{ color: Number(s.growth) > 0 ? "#16a34a" : "var(--text-muted, #64748b)" }}>
                {Number(s.growth) > 0 ? (
                  <ArrowUpRight size={11} style={{ display: "inline", marginRight: 2 }} />
                ) : null}
                {s.growth}% from last month
              </div>
              <div className={styles.sparklineWrap}>
                <Sparkline points={s.spark} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* ── MID ROW ── */}
        <div className={styles.midRow}>
          {/* Members Overview donut */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Members Overview</span>
              <button className={styles.menuIconBtn}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ position: "relative", flexShrink: 0, width: 120, height: 120 }}>
                <DonutChart
                  data={donutData}
                  size={120}
                  thickness={22}
                  showTooltip={true}
                  onSliceClick={(seg) => seg.nav?.()}
                  onSliceHover={(seg) => setHoveredSlice(seg)}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: hoveredSlice ? "0.95rem" : "1.2rem",
                      fontWeight: 800,
                      color: donutCenter.color,
                      lineHeight: 1,
                      transition: "all 0.2s",
                    }}
                  >
                    {donutCenter.value}
                  </span>
                  <span
                    style={{
                      fontSize: "0.58rem",
                      color: "var(--text-muted)",
                      marginTop: 2,
                      maxWidth: 56,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {donutCenter.label}
                  </span>
                </div>
              </div>
              <div className={styles.donutLegend}>
                {donutData.map((d, i) => (
                  <div
                    key={i}
                    className={styles.legendRow}
                    style={{ cursor: "pointer", padding: "2px 4px", borderRadius: 5, transition: "background 0.15s" }}
                    onClick={() => d.nav?.()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${d.color}14`;
                      setHoveredSlice({ ...d, index: i });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      setHoveredSlice(null);
                    }}
                  >
                    <span className={styles.legendDot} style={{ background: d.color }} />
                    <span className={styles.legendName}>{d.name}</span>
                    <span className={styles.legendVal}>
                      {d.value} ({Math.round((d.value / totalMembers) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigate("/members")}>
              View All Members <ChevronRight size={13} />
            </button>
          </div>

          {/* Top Districts */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Top Districts</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/members")}>
                View All
              </button>
            </div>
            <div className={styles.districtList}>
              {topDistricts.map((d, i) => (
                <div
                  key={i}
                  className={styles.districtRow}
                  onClick={() => navigate("/members", { state: { exactDistrict: d.name } })}
                >
                  <div className={styles.districtMeta}>
                    <span className={styles.districtName}>{d.name}</span>
                    <span className={styles.districtCount}>{d.value}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${(d.value / maxDist) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              className={styles.viewAllBtn}
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              onClick={() => navigate("/members")}
            >
              View All Districts <ChevronRight size={13} />
            </button>
          </div>

          {/* Top Skills */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Top Skills</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/members")}>
                View All
              </button>
            </div>
            <div className={styles.districtList}>
              {topSkills.map((s, i) => (
                <div
                  key={i}
                  className={styles.districtRow}
                  onClick={() => navigate("/members", { state: { exactSkill: s.name } })}
                >
                  <div className={styles.districtMeta}>
                    <span className={styles.districtName}>{s.name}</span>
                    <span className={styles.districtCount}>{s.value}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFillSkill} style={{ width: `${(s.value / (topSkills[0]?.value || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              className={styles.viewAllBtn}
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              onClick={() => navigate("/members")}
            >
              View All Skills <ChevronRight size={13} />
            </button>
          </div>

        </div>

        {/* ── BOTTOM ROW ── */}
        <div className={styles.bottomRow}>
          {/* Jobs Overview */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Jobs Overview</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/jobs")}>
                View All
              </button>
            </div>
            <div className={styles.jobStatsRow}>
              {[
                { label: "Total Jobs", val: totalJobsCount, icon: BriefcaseIcon, color: "#6b7280", bg: "#f3f4f6", onClick: () => navigate("/jobs") },
                { label: "Active Jobs", val: activeJobsCount, icon: TrendingUp, color: "#16a34a", bg: "#f0fdf4", onClick: () => navigate("/jobs", { state: { status: "active" } }) },
              ].map((j, i) => (
                <div
                  key={i}
                  className={styles.jobStatBox}
                  style={{
                    background: j.bg,
                    borderColor: "transparent",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onClick={j.onClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div className={styles.jobStatLabel}>{j.label}</div>
                  <div className={styles.jobStatVal} style={{ color: j.color, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    {j.val} <j.icon size={13} />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.jobCategoryWrap}>
              <div className={styles.jobCategoryLabel}>Jobs by Category</div>
              <div className={styles.jobCategoryRow}>
                <div style={{ position: "relative", flexShrink: 0, width: 75, height: 75 }}>
                  <DonutChart
                    data={jobCats}
                    size={75}
                    thickness={17}
                    showTooltip={true}
                    onSliceClick={(seg) => navigate("/jobs", { state: { category: seg.name } })}
                  />
                </div>
                <div>
                  {jobCats.map((c, i) => (
                    <div
                      key={i}
                      className={styles.catRow}
                      style={{ cursor: "pointer", borderRadius: 4, padding: "1px 3px", transition: "background 0.15s" }}
                      onClick={() => navigate("/jobs", { state: { category: c.name } })}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${c.color}14`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span className={styles.catDot} style={{ background: c.color }} />
                      <span className={styles.catName}>{c.name}</span>
                      <span className={styles.catPct}>
                        {c.value} ({c.pct})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Member Growth */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Member Growth</span>
              {/* Period picker dropdown */}
              <div ref={growthDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowGrowthDropdown(p => !p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "var(--soft-bg)", border: "1px solid var(--border)",
                    borderRadius: 8, cursor: "pointer", padding: "4px 10px",
                    color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700,
                    transition: "border-color 0.15s",
                  }}
                >
                  {selectedGrowthLabel} <ChevronDown size={12} />
                </button>
                {showGrowthDropdown && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    background: "var(--card-bg)", border: "1px solid var(--border)",
                    borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 100, overflow: "hidden", minWidth: 130,
                  }}>
                    {GROWTH_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setGrowthPeriod(opt.key); setShowGrowthDropdown(false); }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 14px", border: "none", background: growthPeriod === opt.key ? "var(--primary)" : "transparent",
                          color: growthPeriod === opt.key ? "#fff" : "var(--text-main)",
                          fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                          transition: "background 0.12s",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={e => { if (growthPeriod !== opt.key) e.currentTarget.style.background = "var(--soft-bg)"; }}
                        onMouseLeave={e => { if (growthPeriod !== opt.key) e.currentTarget.style.background = "transparent"; }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <GrowthChart data={growthData} />
            <div className={styles.growthFooter}>
              <span className={styles.growthBadge}>
                <TrendingUp size={13} /> {dynamicGrowthPct}% growth this period
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>Quick Actions</span>
              </div>
              <div className={styles.quickGrid}>
                {quickActions.map((qa, i) => (
                  <button key={i} className={styles.quickItem} onClick={qa.onClick} title={qa.label}>
                    <div className={styles.quickIcon} style={{ background: qa.bg, color: qa.color }}>
                      <qa.icon size={17} />
                    </div>
                    <span className={styles.quickLabel}>{qa.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;