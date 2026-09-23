import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Building,
  Calendar,
  Eye,
  Star,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  MoreHorizontal,
  FileText,
  UserCheck,
  User,
  Settings,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { ProvidedForm } from "../Jobs/Jobs";
import styles from "./RecruiterDashboard.module.scss";

// ─── Sparklines ───────────────────────────────────────────────────────────────
const SP = {
  teal: [20, 25, 22, 28, 30, 27, 35, 32, 38, 40],
  orange: [15, 18, 14, 20, 19, 22, 20, 25, 23, 28],
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
  const id = `rec_sp_${color.replace("#", "").replace(/[^a-zA-Z0-9]/g, "")}`;
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

// ─── Interactive Donut Chart ───────────────────────────────────────────────────
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

// ─── Interactive Growth Chart ─────────────────────────────────────────────────
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
        <linearGradient id="rec_growth_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#215E61" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#215E61" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={pad.l}
          y1={pad.t + ih * t}
          x2={pad.l + iw}
          y2={pad.t + ih * t}
          stroke="var(--border, #e5e7eb)"
          strokeWidth="1"
          strokeDasharray={i === 0 ? "none" : "3 3"}
        />
      ))}
      {[0, 0.5, 1].map((t, i) => (
        <text key={i} x={pad.l - 4} y={pad.t + ih * (1 - t) + 3} fontSize="8" textAnchor="end" fill="var(--text-muted, #9ca3af)">
          {Math.round(max * t)}
        </text>
      ))}
      <path d={area} fill="url(#rec_growth_grad)" />
      <path d={line} fill="none" stroke="#215E61" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
              fill={isHov || isLast ? "#215E61" : "#fff"}
              stroke="#215E61"
              strokeWidth="1.5"
              style={{ transition: "r 0.15s", pointerEvents: "none" }}
            />
            {isLast && !isHov && (
              <>
                <rect x={xs[i] - 14} y={ys[i] - 17} width="28" height="13" rx="4" fill="#215E61" />
                <text x={xs[i]} y={ys[i] - 7} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">
                  {d.value}
                </text>
              </>
            )}
            {isHov && (
              <>
                <line x1={xs[i]} y1={pad.t} x2={xs[i]} y2={pad.t + ih} stroke="#215E61" strokeWidth="1" strokeDasharray="3 2" />
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
        <text key={i} x={xs[i]} y={H - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted, #9ca3af)">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Main Recruiter Dashboard Component ───────────────────────────────────────
const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { jobContext } = useData();
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [growthPeriod, setGrowthPeriod] = useState("year"); // "year" | "month" | "week"
  const [showGrowthDropdown, setShowGrowthDropdown] = useState(false);
  const growthDropdownRef = useRef(null);

  // Post / Edit Job Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Close growth dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (growthDropdownRef.current && !growthDropdownRef.current.contains(e.target)) {
        setShowGrowthDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isRecruiterJob = useCallback(
    (job) => {
      if (!user) return false;
      if (user?.role === "Admin") return true;
      const currentRecruiterId = String(
        user?.recruiterId || user?.memberId || user?.userId || user?._id || user?.id || ""
      ).trim();
      if (!currentRecruiterId) return false;

      const postedId = job?.jobPosted?._id
        ? String(job.jobPosted._id).trim()
        : String(job?.jobPosted || "").trim();
      const memberId = job?.memberId?._id
        ? String(job.memberId._id).trim()
        : String(job?.memberId || "").trim();

      return Boolean(postedId === currentRecruiterId || memberId === currentRecruiterId);
    },
    [user]
  );

  // Fetch jobs posted by or associated with this recruiter
  const fetchRecruiterData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/jobs");
      const allJobs = Array.isArray(res.data?.data) ? res.data.data : [];
      const recruiterJobs = allJobs.filter(isRecruiterJob);
      setJobs(recruiterJobs);
    } catch (err) {
      console.error("Error fetching recruiter jobs:", err);
      if (jobContext?.length) {
        const recruiterJobs = jobContext.filter(isRecruiterJob);
        setJobs(recruiterJobs);
      }
    } finally {
      setLoading(false);
    }
  }, [isRecruiterJob, jobContext]);

  useEffect(() => {
    fetchRecruiterData();
  }, [fetchRecruiterData]);

  // Sync if jobContext updates and jobs is currently empty
  useEffect(() => {
    if (jobContext?.length && jobs.length === 0) {
      const recruiterJobs = jobContext.filter(isRecruiterJob);
      if (recruiterJobs.length > 0) {
        setJobs(recruiterJobs);
      }
    }
  }, [jobContext, isRecruiterJob, jobs.length]);

  // Aggregate all applications across recruiter's jobs
  const allApplications = useMemo(() => {
    const list = [];
    jobs.forEach((j) => {
      if (Array.isArray(j.appliedMembers)) {
        j.appliedMembers.forEach((app) => {
          list.push({
            ...app,
            jobId: j._id,
            jobTitle: j.title,
            jobCompany: j.companyName,
            jobLocation: j.location,
            candidate: app.memberId || {},
            appliedAt: app.appliedAt || app.createdAt || j.createdAt,
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
  }, [jobs]);

  // KPI Metrics
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => {
      const isClosed = (() => {
        if (!j.applicationEndDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateLimit = new Date(j.applicationEndDate);
        endDateLimit.setHours(0, 0, 0, 0);
        return today >= endDateLimit;
      })();
      return !isClosed && (j.isActive !== false);
    }).length;
    const closedJobs = totalJobs - activeJobs;
    const totalApps = allApplications.length;
    const pendingApps = allApplications.filter((a) => !a.status || a.status === "Applied" || a.status === "Review").length;
    const shortlistedOrAccepted = allApplications.filter((a) =>
      ["Shortlisted", "Accepted", "Offer"].includes(a.status)
    ).length;

    return { totalJobs, activeJobs, closedJobs, totalApps, pendingApps, shortlistedOrAccepted };
  }, [jobs, allApplications]);

  // ── Growth chart data builders for applications ─────────────────────────────
  const getYearData = useCallback((appsList) => {
    if (!Array.isArray(appsList) || appsList.length === 0)
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((l) => ({ label: l, value: 0 }));
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ name: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), monthIndex: d.getMonth() });
    }
    return months.map((m) => {
      const last = new Date(m.year, m.monthIndex + 1, 0, 23, 59, 59, 999);
      const count = appsList.filter((app) => !app.appliedAt || new Date(app.appliedAt) <= last).length;
      return { label: m.name, value: count };
    });
  }, []);

  const getMonthData = useCallback((appsList) => {
    if (!Array.isArray(appsList) || appsList.length === 0)
      return Array.from({ length: 4 }, (_, i) => ({ label: `Wk ${i + 1}`, value: 0 }));
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(year, month, i * 7 + 1);
      const weekEnd = new Date(year, month, i * 7 + 7, 23, 59, 59, 999);
      const count = appsList.filter((app) => {
        if (!app.appliedAt) return i === 0;
        const d = new Date(app.appliedAt);
        return d >= weekStart && d <= weekEnd;
      }).length;
      return { label: `Wk ${i + 1}`, value: count };
    });
  }, []);

  const getWeekData = useCallback((appsList) => {
    if (!Array.isArray(appsList) || appsList.length === 0)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((l) => ({ label: l, value: 0 }));
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
      const count = appsList.filter((app) => {
        if (!app.appliedAt) return false;
        const d = new Date(app.appliedAt);
        return d >= dayStart && d <= dayEnd;
      }).length;
      return { label, value: count };
    });
  }, []);

  const growthData = useMemo(() => {
    if (growthPeriod === "month") return getMonthData(allApplications);
    if (growthPeriod === "week") return getWeekData(allApplications);
    return getYearData(allApplications);
  }, [growthPeriod, allApplications, getYearData, getMonthData, getWeekData]);

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
  const selectedGrowthLabel = GROWTH_OPTIONS.find((o) => o.key === growthPeriod)?.label ?? "This Year";

  // ── Stat cards array (Top 3 Cards) ──────────────────────────────────────────
  const statCards = [
    {
      label: "Total Jobs Posted",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "#215E61",
      spark: SP.teal,
      growth: stats.totalJobs > 0 ? 100 : 0,
      trendLabel: "from last month",
      onClick: () => navigate("/jobs"),
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: CheckCircle2,
      color: "#FF8735",
      spark: SP.orange,
      growth: stats.activeJobs > 0 ? 100 : 0,
      trendLabel: "currently active",
      onClick: () => navigate("/jobs", { state: { status: "active" } }),
    },
    {
      label: "Applications Received",
      value: stats.totalApps,
      icon: Users,
      color: "#215E61",
      spark: SP.teal,
      growth: stats.totalApps > 0 ? 100 : 0,
      trendLabel: "from candidates",
      onClick: () => navigate("/jobs", { state: { view: "myPost" } }),
    },
  ];

  // ── Application Pipeline Donut Data ─────────────────────────────────────────
  const pipelineDonutData = useMemo(() => {
    const counts = {
      Applied: 0,
      Review: 0,
      Shortlisted: 0,
      Offer: 0,
      Accepted: 0,
      Rejected: 0,
    };

    allApplications.forEach((app) => {
      const s = app.status || "Applied";
      counts[s] = (counts[s] || 0) + 1;
    });

    return [
      { name: "Applied", value: counts.Applied || 0, color: "#215E61", nav: () => navigate("/jobs", { state: { view: "myPost" } }) },
      { name: "Under Review", value: counts.Review || 0, color: "#FF8735", nav: () => navigate("/jobs", { state: { view: "myPost" } }) },
      { name: "Shortlisted", value: counts.Shortlisted || 0, color: "#1A4B4D", nav: () => navigate("/jobs", { state: { view: "myPost" } }) },
      { name: "Hired / Offers", value: (counts.Offer || 0) + (counts.Accepted || 0), color: "#FF9E59", nav: () => navigate("/jobs", { state: { view: "myPost" } }) },
      { name: "Rejected", value: counts.Rejected || 0, color: "#767676", nav: () => navigate("/jobs", { state: { view: "myPost" } }) },
    ];
  }, [allApplications, navigate]);

  // ── Top Job Postings by Applicants ──────────────────────────────────────────
  const topJobs = useMemo(() => {
    const sorted = [...jobs].sort((a, b) => (b.appliedMembers?.length || 0) - (a.appliedMembers?.length || 0));
    return sorted.slice(0, 5);
  }, [jobs]);
  const maxJobApplicants = topJobs[0]?.appliedMembers?.length || 1;

  // ── Top Skills in Demand ────────────────────────────────────────────────────
  const topSkills = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => {
      if (j.keySkills) {
        j.keySkills.split(",").forEach((s) => {
          const clean = s.trim();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [jobs]);
  const maxSkillCount = topSkills[0]?.value || 1;

  // ── Jobs by Employment Type Breakdown ───────────────────────────────────────
  const employmentTypeBreakdown = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => {
      const type = j.employmentType?.trim() || "Full-time";
      counts[type] = (counts[type] || 0) + 1;
    });

    const colors = {
      "Full-time": "#215E61",
      "Part-time": "#FF8735",
      Contract: "#1A4B4D",
      Internship: "#FF9E59",
      Remote: "#338E93",
      Freelance: "#FFB47D",
      Temporary: "#767676",
      Other: "#222222",
    };

    const total = jobs.length || 1;
    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        pct: ((value / total) * 100).toFixed(1) + "%",
        color: colors[name] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  // ── Quick Actions ───────────────────────────────────────────────────────────
  const quickActions = [
    {
      icon: Plus,
      label: "Post Job",
      color: "#215E61",
      bg: "rgba(33, 94, 97, 0.1)",
      onClick: () => {
        setEditingJob(null);
        setIsModalOpen(true);
      },
    },
    {
      icon: Briefcase,
      label: "View Jobs",
      color: "#FF8735",
      bg: "rgba(255, 135, 53, 0.1)",
      onClick: () => navigate("/jobs"),
    },
    {
      icon: Users,
      label: "Applicants",
      color: "#215E61",
      bg: "rgba(33, 94, 97, 0.1)",
      onClick: () => navigate("/jobs", { state: { view: "myPost" } }),
    },
    {
      icon: CheckCircle2,
      label: "Active Jobs",
      color: "#FF8735",
      bg: "rgba(255, 135, 53, 0.1)",
      onClick: () => navigate("/jobs", { state: { status: "active" } }),
    },
    {
      icon: Building,
      label: "Profile",
      color: "#215E61",
      bg: "rgba(33, 94, 97, 0.1)",
      onClick: () => navigate(user?.recruiterId ? `/recruiters/${user.recruiterId}` : "/recruiters"),
    },
    {
      icon: RefreshCw,
      label: "Refresh",
      color: "#767676",
      bg: "rgba(118, 118, 118, 0.1)",
      onClick: () => fetchRecruiterData(),
    },
  ];

  // ── Recent Applicant Activities ─────────────────────────────────────────────
  const recentApplicants = useMemo(() => {
    return allApplications.slice(0, 3);
  }, [allApplications]);

  // Handle Form Submit for Post / Edit Job
  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        jobPosted: formData.jobPosted || user?.recruiterId || user?.memberId || user?.userId || null,
      };

      if (editingJob && editingJob._id) {
        let res;
        try {
          res = await API.patch(`/jobs/${editingJob._id}`, payload);
        } catch (e) {
          res = await API.patch(`/api/jobs/${editingJob._id}`, payload);
        }
        if (res.data?.success !== false) {
          alert("Job updated successfully!");
          setIsModalOpen(false);
          setEditingJob(null);
          fetchRecruiterData();
        }
      } else {
        let res;
        try {
          res = await API.post("/jobs", payload);
        } catch (e) {
          res = await API.post("/api/jobs", payload);
        }
        if (res.data?.success !== false) {
          alert("Job posted successfully!");
          setIsModalOpen(false);
          fetchRecruiterData();
        }
      }
    } catch (err) {
      console.error("Job submit error:", err);
      const errMsg =
        err.response?.data?.errors?.[0] || err.response?.data?.message || "Failed to save job post.";
      alert(errMsg);
    }
  };

  const donutCenter = hoveredSlice
    ? { label: hoveredSlice.name, value: hoveredSlice.value, color: hoveredSlice.color }
    : { label: "Total Apps", value: allApplications.length, color: "var(--text-main, #1e293b)" };

  return (
    <div className={styles.mainArea}>
      {/* ── TOPBAR ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <p className={styles.welcomeText}>
            Welcome back, <span className={styles.welcomeAccent}>{user?.name || user?.username || "Recruiter"}</span> 👋
          </p>
          <p className={styles.welcomeSub}>
            Recruiter Workspace
            {user?.companyName && (
              <span className={styles.companyBadge}>
                <Building size={11} /> {user.companyName}
              </span>
            )}
          </p>
        </div>

        <div className={styles.topbarRight}>
          <button
            className={styles.iconBtn}
            onClick={fetchRecruiterData}
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? styles.spin : ""} />
          </button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className={styles.content}>
        <div className={styles.bentoGrid}>
          {/* ── STAT CARDS ── */}
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
              <div
                className={styles.statTrend}
                style={{ color: Number(s.growth) > 0 ? "#16a34a" : "var(--text-muted, #64748b)" }}
              >
                {Number(s.growth) > 0 ? (
                  <ArrowUpRight size={11} style={{ display: "inline", marginRight: 2 }} />
                ) : null}
                {s.growth}% {s.trendLabel}
              </div>
              <div className={styles.sparklineWrap}>
                <Sparkline points={s.spark} color={s.color} />
              </div>
            </div>
          ))}
          {/* Card: Applications Pipeline (Donut Chart) */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Application Pipeline</span>
              <button className={styles.menuIconBtn} onClick={() => navigate("/jobs", { state: { view: "myPost" } })}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ position: "relative", flexShrink: 0, width: 120, height: 120 }}>
                <DonutChart
                  data={pipelineDonutData}
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
                      color: "var(--text-muted, #64748b)",
                      marginTop: 2,
                      maxWidth: 60,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {donutCenter.label}
                  </span>
                </div>
              </div>
              <div className={styles.donutLegend}>
                {pipelineDonutData.map((d, i) => (
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
                      {d.value} ({allApplications.length > 0 ? Math.round((d.value / allApplications.length) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigate("/jobs", { state: { view: "myPost" } })}>
              Manage Applications <ChevronRight size={13} />
            </button>
          </div>

          {/* Card: Top Job Postings */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Top Job Postings</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/jobs")}>
                View All
              </button>
            </div>
            <div className={styles.districtList}>
              {topJobs.length > 0 ? (
                topJobs.map((j, i) => {
                  const appsCount = j.appliedMembers?.length || 0;
                  return (
                    <div key={j._id || i} className={styles.districtRow} onClick={() => navigate(`/jobs/${j._id}`)}>
                      <div className={styles.districtMeta}>
                        <span className={styles.districtName} title={j.title}>
                          {j.title}
                        </span>
                        <span className={styles.districtCount}>{appsCount} apps</span>
                      </div>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${Math.max((appsCount / maxJobApplicants) * 100, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "var(--text-muted, #64748b)", fontSize: "0.78rem", padding: "12px 0", textAlign: "center" }}>
                  No jobs posted yet
                </div>
              )}
            </div>
            <button
              className={`${styles.viewAllBtn} ${styles.viewAllBtnMuted}`}
              onClick={() => navigate("/jobs")}
            >
              View All Jobs <ChevronRight size={13} />
            </button>
          </div>

          {/* Card: Top Skills in Demand */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Skills in Demand</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/jobs")}>
                View All
              </button>
            </div>
            <div className={styles.districtList}>
              {topSkills.length > 0 ? (
                topSkills.map((s, i) => (
                  <div key={i} className={styles.districtRow} onClick={() => navigate("/jobs")}>
                    <div className={styles.districtMeta}>
                      <span className={styles.districtName}>{s.name}</span>
                      <span className={styles.districtCount}>{s.value} jobs</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFillSkill}
                        style={{ width: `${Math.max((s.value / maxSkillCount) * 100, 10)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-muted, #64748b)", fontSize: "0.78rem", padding: "12px 0", textAlign: "center" }}>
                  No skill tags recorded
                </div>
              )}
            </div>
            <button
              className={`${styles.viewAllBtn} ${styles.viewAllBtnMuted}`}
              onClick={() => navigate("/jobs")}
            >
              View All in Jobs <ChevronRight size={13} />
            </button>
          </div>
          {/* Group: Jobs Overview & Quick Actions */}
          {/* Card: Jobs Overview */}
          <div className={styles.card}>
              <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Jobs & Hiring Overview</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/jobs")}>
                View All
              </button>
            </div>
            <div className={styles.jobStatsRow}>
              {[
                {
                  label: "Total Jobs",
                  val: stats.totalJobs,
                  icon: Briefcase,
                  color: "#2563eb",
                  bg: "var(--soft-bg, #f8fafc)",
                  onClick: () => navigate("/jobs"),
                },
                {
                  label: "Active Openings",
                  val: stats.activeJobs,
                  icon: TrendingUp,
                  color: "#16a34a",
                  bg: "var(--soft-bg, #f8fafc)",
                  onClick: () => navigate("/jobs", { state: { status: "active" } }),
                },
              ].map((j, i) => (
                <div key={i} className={styles.jobStatBox} onClick={j.onClick}>
                  <div className={styles.jobStatLabel}>{j.label}</div>
                  <div className={styles.jobStatVal} style={{ color: j.color }}>
                    {j.val} <j.icon size={14} />
                  </div>
                </div>
              ))}
            </div>

            {/* Employment Type Breakdown */}
            <div className={styles.jobCategoryWrap}>
              <div className={styles.jobCategoryLabel}>Jobs by Employment Type</div>
              <div className={styles.jobCategoryRow}>
                <div style={{ position: "relative", flexShrink: 0, width: 75, height: 75 }}>
                  <DonutChart
                    data={
                      employmentTypeBreakdown.length > 0
                        ? employmentTypeBreakdown
                        : [{ name: "None", value: 1, color: "#64748b" }]
                    }
                    size={75}
                    thickness={17}
                    showTooltip={true}
                    onSliceClick={() => navigate("/jobs")}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  {employmentTypeBreakdown.length > 0 ? (
                    employmentTypeBreakdown.slice(0, 4).map((c, i) => (
                      <div
                        key={i}
                        className={styles.catRow}
                        style={{ cursor: "pointer", borderRadius: 4, padding: "1px 3px" }}
                        onClick={() => navigate("/jobs")}
                      >
                        <span className={styles.catDot} style={{ background: c.color }} />
                        <span className={styles.catName}>{c.name}</span>
                        <span className={styles.catPct}>
                          {c.value} ({c.pct})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)" }}>No jobs posted yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Card: Quick Actions & Recent Activity */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Quick Actions</span>
            </div>
            <div className={styles.quickGrid}>
              {quickActions.map((qa, i) => (
                <button key={i} className={styles.quickItem} onClick={qa.onClick} title={qa.label}>
                  <div className={styles.quickIcon} style={{ background: qa.bg, color: qa.color }}>
                    <qa.icon size={16} />
                  </div>
                  <span className={styles.quickLabel}>{qa.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Applicants Sub-feed */}
            {recentApplicants.length > 0 && (
              <div className={styles.activityList}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted, #64748b)", textTransform: "uppercase" }}>
                  Recent Applicants
                </div>
                {recentApplicants.map((app, idx) => {
                  const cand = app.candidate || {};
                  return (
                    <div key={idx} className={styles.activityItem}>
                      <div
                        className={styles.activityIcon}
                        style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb" }}
                      >
                        <User size={14} />
                      </div>
                      <div className={styles.activityBody}>
                        <div className={styles.activityTitle}>{cand.name || "Candidate"}</div>
                        <div className={styles.activitySub}>
                          Applied for <strong style={{ color: "var(--text-main)" }}>{app.jobTitle}</strong>
                        </div>
                      </div>
                      <div className={styles.activityTime}>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Card: Applications Growth Trend */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Application Growth</span>
            {/* Period dropdown */}
            <div ref={growthDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowGrowthDropdown((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "var(--soft-bg, #f8fafc)",
                  border: "1px solid var(--border, #e8edf5)",
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: "4px 10px",
                  color: "var(--text-muted, #64748b)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                {selectedGrowthLabel} <ChevronDown size={12} />
              </button>
              {showGrowthDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "var(--card-bg, #0f172a)",
                    border: "1px solid var(--border, rgba(148, 163, 184, 0.2))",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    zIndex: 100,
                    overflow: "hidden",
                    minWidth: 120,
                  }}
                >
                  {GROWTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setGrowthPeriod(opt.key);
                        setShowGrowthDropdown(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        border: "none",
                        background: growthPeriod === opt.key ? "var(--primary, #c0392b)" : "transparent",
                        color: growthPeriod === opt.key ? "#fff" : "var(--text-main, #e5e7eb)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
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
      </div>
    </div>

      {/* ── POST / EDIT JOB MODAL ── */}
      <ProvidedForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingJob}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default RecruiterDashboard;
