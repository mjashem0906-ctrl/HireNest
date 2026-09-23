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
  Eye,
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
import RecruiterDashboard from "../RecruiterDashboard/RecruiterDashboard";

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

// ─── sparkline & chart math helpers ──────────────────────────────────────────
const SP = {
  red: [30, 35, 28, 40, 38, 45, 42, 50, 48, 55],
  blue: [20, 25, 22, 28, 30, 27, 35, 32, 38, 40],
  purple: [15, 18, 14, 20, 19, 22, 20, 25, 23, 28],
  yellow: [40, 38, 42, 45, 43, 48, 50, 52, 55, 58],
  cyan: [10, 12, 11, 14, 13, 16, 15, 18, 17, 20],
  pink: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18],
  green: [12, 15, 13, 18, 16, 20, 18, 22, 21, 25],
};

// ─── Pure rendering fluid wave & Cardinal Spline engine ───────────────────────
// Uses a direct Cardinal Spline (Catmull-Rom) through the original data points
// to produce a clean, kink-free line without artificial wiggles.
function buildFluidWave({
  values,
  W = 110,
  H = 28,
  pad = { t: 3, b: 3, l: 2, r: 5 },
  ampRatio = 0.7,
  tension = 0.4,
}) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      linePath: "",
      areaPath: "",
      firstPt: { x: pad.l, y: H / 2 },
      lastPt: { x: W - pad.r, y: H / 2 },
      originalCoords: [],
    };
  }

  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  if (values.length === 1) {
    const y = pad.t + ch / 2;
    const firstPt = { x: pad.l, y };
    const lastPt = { x: W - pad.r, y };
    return {
      linePath: `M ${firstPt.x.toFixed(2)} ${firstPt.y.toFixed(2)} L ${lastPt.x.toFixed(2)} ${lastPt.y.toFixed(2)}`,
      areaPath: `M ${firstPt.x.toFixed(2)} ${firstPt.y.toFixed(2)} L ${lastPt.x.toFixed(2)} ${lastPt.y.toFixed(2)} L ${lastPt.x.toFixed(2)} ${H} L ${firstPt.x.toFixed(2)} ${H} Z`,
      firstPt,
      lastPt,
      originalCoords: [{ x: (firstPt.x + lastPt.x) / 2, y, value: values[0], index: 0 }],
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const amplitude = ch * ampRatio;

  // Generate coordinates directly from the original values
  const pts = values.map((v, i) => {
    const x = pad.l + (i / (values.length - 1)) * cw;
    const normalized = (v - min) / range;
    const y = pad.t + ch - 2 - normalized * amplitude;
    return { x, y, value: v, index: i };
  });

  const originalCoords = pts;

  // Cardinal spline with gentle tension -> C1 continuous Bezier path
  let linePath = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    linePath += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const firstPt = pts[0];
  const lastPt = pts[pts.length - 1];
  const areaPath = `${linePath} L ${lastPt.x.toFixed(2)} ${H} L ${firstPt.x.toFixed(2)} ${H} Z`;

  return { linePath, areaPath, firstPt, lastPt, originalCoords };
}

// ─── Refined Metric Card Sparkline (Apple Health / Linear gentle style) ───────
function Sparkline({ points, color, id, height = 28 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!Array.isArray(points) || points.length === 0) return null;

  const W = 110;
  const H = height;

  const { linePath, areaPath, lastPt, originalCoords } = useMemo(
    () =>
      buildFluidWave({
        values: points,
        W,
        H,
        pad: { t: 3, b: 3, l: 2, r: 5 },
        ampRatio: 0.45,
        tension: 0.35,
        steps: 4,
      }),
    [points, W, H]
  );

  const isDark = typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  const effectiveColor = isDark
    ? (color === "#10b981" || color === "#22c55e" ? "#4ade80" : color === "#ef4444" ? "#f87171" : color === "#FF8735" ? "#FF9A52" : "#3D8B8F")
    : (color === "#10b981" || color === "#22c55e" ? "#16a34a" : color === "#ef4444" ? "#dc2626" : color === "#FF8735" ? "#e88035" : "#215E61");

  const softColor = effectiveColor;
  const strokeW = isDark ? 2.0 : 1.8;

  const gradId =
    id ||
    `spark_grad_${color.replace(/[^a-zA-Z0-9]/g, "")}_${points[0]}_${points[points.length - 1]}`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const pctX = Math.max(0, Math.min(1, relX / rect.width));
    const targetIdx = Math.round(pctX * (points.length - 1));
    setHoverIdx(targetIdx);
    setMousePos({ x: relX, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  const activeCoord = hoverIdx !== null ? originalCoords[hoverIdx] : null;

  return (
    <div
      ref={containerRef}
      className={styles.sparklineContainer}
      style={{ position: "relative", width: "100%", height: `${H}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: `${H}px`, display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            {/* Dramatic lightening: ~8-12% opacity fading to fully transparent */}
            <stop offset="0%" stopColor={softColor} stopOpacity="0.10" />
            <stop offset="100%" stopColor={softColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Faint tint area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Thinner stroke (~1.5px light, 2px dark) with appropriately colored line */}
        <path
          d={linePath}
          fill="none"
          stroke={softColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={isDark ? { filter: `drop-shadow(0 1px 4px ${softColor}60)` } : undefined}
        />

        {/* Smaller, softer endpoint dot (~3.5px diameter) with subtle glow */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="1.8"
          fill={softColor}
          style={{ filter: `drop-shadow(0 1px 2px ${softColor}40)` }}
        />

        {/* Subtle hover micro-interaction */}
        {activeCoord && (
          <g>
            <line
              x1={activeCoord.x}
              y1={3}
              x2={activeCoord.x}
              y2={H}
              stroke={softColor}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
            <circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="2.5"
              fill="#ffffff"
              stroke={softColor}
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.15))" }}
            />
          </g>
        )}
      </svg>

      {/* Compact polished tooltip on hover */}
      {activeCoord && (
        <div
          className={styles.sparkTooltip}
          style={{
            position: "absolute",
            left: `${Math.max(14, Math.min(mousePos.x, (containerRef.current?.clientWidth || 100) - 14))}px`,
            top: "-22px",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {activeCoord.value}
        </div>
      )}
    </div>
  );
}

// ─── interactive donut with cursor-following tooltip ─────────────────────────
function DonutChart({ data, size = 125, thickness = 16, activeIndex = null, onSliceClick, onSliceHover, showTooltip = false }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  const activeIdx = activeIndex !== null ? activeIndex : hovered;

  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const segments = [];
  let offset = 0;
  data.forEach((seg, i) => {
    const pct = (seg.value / total) * circ;
    segments.push({ ...seg, pct, offset, index: i });
    offset += pct;
  });

  const hovSeg = activeIdx !== null ? segments[activeIdx] : null;

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={thickness}
        />
        {segments.map((seg) => {
          const isHov = activeIdx === seg.index;
          const strokeW = isHov ? thickness + 2 : thickness;
          return (
            <circle
              key={seg.index}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${Math.max(seg.pct, 0)} ${circ - Math.max(seg.pct, 0)}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{
                transition: "stroke-width 200ms ease, opacity 200ms ease",
                cursor: "pointer",
                opacity: activeIdx !== null && !isHov ? 0.65 : 1,
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

// ─── Refined Member Growth Chart (Smooth curve, gradient fill, endpoint dot + badge) ────────
function GrowthChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  if (!Array.isArray(data) || data.length === 0) return null;

  const W = 440;
  const H = 145;
  const pad = { t: 26, r: 24, b: 24, l: 20 };
  const iw = W - pad.l - pad.r;

  const values = useMemo(() => data.map((d) => d.value), [data]);

  const { linePath, areaPath, lastPt, originalCoords } = useMemo(
    () =>
      buildFluidWave({
        values,
        W,
        H,
        pad,
        ampRatio: 0.9,
        tension: 0.35,
        steps: 4,
      }),
    [values, W, H]
  );

  const coords = useMemo(
    () =>
      originalCoords.map((pt, i) => ({
        ...pt,
        label: data[i]?.label,
      })),
    [originalCoords, data]
  );

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const pctX = Math.max(0, Math.min(1, (relX - (pad.l / W) * rect.width) / ((iw / W) * rect.width)));
    const targetIdx = Math.round(pctX * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, targetIdx));
    setHoveredIndex(clampedIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activeCoord = hoveredIndex !== null ? coords[hoveredIndex] : null;

  // Read dark mode from DOM — use brightened teal (#3D8B8F) vs. dark teal (#215E61)
  // so the Member Growth line is clearly visible against the dark card background
  const isDark = typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";
  const chartTeal = isDark ? "#3D8B8F" : "#215E61";
  const chartStrokeW = isDark ? 2.5 : 2.2;
  // X-axis label colors
  const labelBaseColor = isDark ? "#A8B2B6" : "#9ca3af";
  const labelActiveColor = isDark ? "#F5F5F5" : "#222222";

  return (
    <div
      ref={containerRef}
      className={styles.growthChartWrap}
      style={{ position: "relative", width: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "145px", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="growth_teal_grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartTeal} stopOpacity={isDark ? 0.30 : 0.18} />
            <stop offset="100%" stopColor={chartTeal} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Soft area fill beneath the curve (~18% opacity fading to transparent) */}
        <path d={areaPath} fill="url(#growth_teal_grad)" />

        {/* Clean, smooth line stroke (2.2px light / 2.5px dark, rounded caps & joins) */}
        <path
          d={linePath}
          fill="none"
          stroke={chartTeal}
          strokeWidth={chartStrokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={isDark ? { filter: `drop-shadow(0 2px 6px ${chartTeal}80)` } : undefined}
        />

        {/* Endpoint emphasis: filled circle with soft glow */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="3"
          fill={chartTeal}
          style={{ filter: `drop-shadow(0 1px 4px ${chartTeal}73)` }}
        />

        {/* Existing value marker / badge (e.g. "425") at final endpoint */}
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={lastPt.x - 15}
            y={lastPt.y - 18}
            width="30"
            height="14"
            rx="4"
            fill="#FF8735"
            style={{ filter: "drop-shadow(0 2px 4px rgba(255, 135, 53, 0.35))" }}
          />
          <text
            x={lastPt.x}
            y={lastPt.y - 8}
            textAnchor="middle"
            fontSize="8.5"
            fill="#ffffff"
            fontWeight="700"
          >
            {lastPt.value}
          </text>
        </g>

        {/* Interactive hover tracking */}
        {activeCoord && activeCoord.index !== coords.length - 1 && (
          <g>
            <line
              x1={activeCoord.x}
              y1={pad.t}
              x2={activeCoord.x}
              y2={pad.t + ih}
              stroke={chartTeal}
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.35"
            />
            <circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="4"
              fill={isDark ? "#1A2628" : "#ffffff"}
              stroke={chartTeal}
              strokeWidth="2"
              style={{ filter: `drop-shadow(0 2px 4px ${chartTeal}40)` }}
            />
          </g>
        )}

        {/* Clean X-axis period labels */}
        {coords.map((c, i) => (
          <text
            key={i}
            x={c.x}
            y={H - 5}
            textAnchor="middle"
            fontSize="9"
            fontWeight={hoveredIndex === i ? "600" : "500"}
            fill={hoveredIndex === i ? labelActiveColor : labelBaseColor}
            style={{ transition: "fill 0.15s, font-weight 0.15s" }}
          >
            {c.label}
          </text>
        ))}
      </svg>

      {/* Floating tooltip on hover when hovering non-endpoint */}
      {activeCoord && activeCoord.index !== coords.length - 1 && (
        <div
          className={styles.growthTooltip}
          style={{
            position: "absolute",
            left: `${(activeCoord.x / W) * 100}%`,
            top: `${(activeCoord.y / H) * 100}%`,
            transform: "translate(-50%, -120%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span className={styles.growthTooltipValue}>{activeCoord.value.toLocaleString()}</span>
          <span className={styles.growthTooltipLabel}>{activeCoord.label}</span>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function MemberDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { memberContext, jobContext } = useData();

  if (user?.role === "Recruiter") {
    return <RecruiterDashboard />;
  }

  const [members, setMembers] = useState([]);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
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
  const [viewStats, setViewStats] = useState({
    totalViews: 0,
    todayViews: 0,
    dailyGrowth: 0,
    totalGrowth: 0,
    dailySpark: SP.pink,
    totalSpark: SP.cyan,
  });

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

  useEffect(() => {
    let isMounted = true;

    const fetchViewStats = async () => {
      try {
        const res = await API.get("/api/portal-views/stats");
        if (isMounted && res.data?.success) {
          setViewStats({
            totalViews: res.data.totalViews || 0,
            todayViews: res.data.todayViews || 0,
            dailyGrowth: res.data.dailyGrowth || 0,
            totalGrowth: res.data.totalGrowth || 0,
            dailySpark: Array.isArray(res.data.dailySpark) && res.data.dailySpark.length > 1 ? res.data.dailySpark : SP.pink,
            totalSpark: Array.isArray(res.data.totalSpark) && res.data.totalSpark.length > 1 ? res.data.totalSpark : SP.cyan,
          });
        }
      } catch (e) {
        console.error("Failed to fetch view stats in dashboard", e);
      }
    };

    fetchViewStats();
    const timer = setInterval(fetchViewStats, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const res = await API.get("/member/active-count");
        if (typeof res.data?.count === "number") {
          setActiveMembersCount(res.data.count);
        }
      } catch (e) {
        console.error("Failed to fetch active members count", e);
      }
    };
    if (authLoading) return;
    if (user && !["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
      fetchActiveCount();
    }
  }, [user, authLoading]);

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
    return m?.solidarityMember === "Yes";
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
      return (members || []).filter(member => {
        const isActive = isMemberActiveYes(member);
        return isActive && getMemberTimeDash(member) <= endOfMonth;
      }).length;
    });
  }, [members, pastMonthsDash]);

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
  const activeMembers = activeMembersCount || (Array.isArray(members) ? members.filter(m => m.solidarityMember === "Yes").length : 0);
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

  // Read dark mode — use brightened donut segment colors for visibility on dark card bgs
  const isDarkMode = typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  // Member type data for donut (preserved structure, dark-mode color variants applied)
  const memberTypeData = [
    { name: "Seeker",    value: seekers,    color: isDarkMode ? "#3D8B8F" : "#215E61", path: "/job-seekers" },
    { name: "Recruiter", value: recruiters, color: isDarkMode ? "#FF9A52" : "#FF8735", path: "/recruiters" },
    { name: "Referee",   value: referees,   color: isDarkMode ? "#4AACB0" : "#2e7a7e", path: "/referees" },
    { name: "Mentor",    value: mentors,    color: isDarkMode ? "#FFB380" : "#ffa366", path: "/mentors" },
  ];

  const donutData = [
    { name: "Job Seekers", value: seekers,    color: isDarkMode ? "#3D8B8F" : "#215E61", nav: () => navigate("/job-seekers") },
    { name: "Recruiters",  value: recruiters, color: isDarkMode ? "#FF9A52" : "#FF8735", nav: () => navigate("/recruiters") },
    { name: "Referees",    value: referees,   color: isDarkMode ? "#4AACB0" : "#2e7a7e", nav: () => navigate("/referees") },
    { name: "Mentors",     value: mentors,    color: isDarkMode ? "#FFB380" : "#ffa366", nav: () => navigate("/mentors") },
    { name: "Upskillers",  value: upskillers, color: isDarkMode ? "#7A8F94" : "#9ca3af", nav: () => navigate("/members", { state: { exactMemberType: "In need of Upskilling" } }) },
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
      { name: "IT & Software", value: itCount, pct: itPct, color: isDarkMode ? "#3D8B8F" : "#215E61" },
      { name: "Marketing", value: marketingCount, pct: marketingPct, color: isDarkMode ? "#FF9A52" : "#FF8735" },
      { name: "Education", value: educationCount, pct: educationPct, color: isDarkMode ? "#4AACB0" : "#2e7a7e" },
      { name: "Design", value: designCount, pct: designPct, color: isDarkMode ? "#FFB380" : "#ffa366" },
      { name: "Other", value: otherCount, pct: otherPct, color: isDarkMode ? "#7A8F94" : "#9ca3af" },
    ];
  };

  const jobCats = getJobCategoryBreakdown(jobs);

  const statCards = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: isDarkMode ? "#3D8B8F" : "#215E61",
      spark: totalMembersTrend,
      growth: totalMembersGrowth,
      onClick: () => navigate("/members"),
    },
    {
      label: "Active Members",
      value: activeMembers,
      icon: Briefcase,
      color: isDarkMode ? "#3D8B8F" : "#215E61",
      spark: SP.green,
      growth: activeGrowthDash,
      onClick: () => navigate("/members", { state: { statusTabsView: true, initialTab: "Active" } }),
    },
    {
      label: "Active Job Openings",
      value: activeJobsCount || totalJobsCount,
      icon: BriefcaseIcon,
      color: isDarkMode ? "#3D8B8F" : "#215E61",
      spark: SP.blue,
      growth: jobsGrowthDash,
      onClick: () => navigate("/jobs"),
    },
    {
      label: "New This Month",
      value: newThisMonth,
      icon: User,
      color: isDarkMode ? "#FF9A52" : "#FF8735",
      spark: SP.yellow,
      growth: newGrowthDash,
      onClick: () => navigate("/members", { state: { newThisMonth: true } }),
    },
    {
      label: "Total View Counts",
      value: viewStats.totalViews,
      icon: Eye,
      color: isDarkMode ? "#3D8B8F" : "#215E61",
      spark: viewStats.totalSpark,
      growth: viewStats.totalGrowth,
      trendLabel: "from last month",
    },
    {
      label: "View Count Per Day",
      value: viewStats.todayViews,
      icon: TrendingUp,
      color: isDarkMode ? "#FF9A52" : "#FF8735",
      spark: viewStats.dailySpark,
      growth: viewStats.dailyGrowth,
      trendLabel: "from yesterday",
    },
  ];



  const quickActions = [
    { icon: UserPlus,      label: "Add Member",     color: isDarkMode ? "#FF9A52" : "#FF8735", bg: isDarkMode ? "rgba(255,154,82,0.18)" : "rgba(255,135,53,0.12)", onClick: () => navigate("/job-seekers", { state: { openAddModal: true } }) },
    { icon: Briefcase,     label: "Post Job",       color: isDarkMode ? "#FF9A52" : "#FF8735", bg: isDarkMode ? "rgba(255,154,82,0.18)" : "rgba(255,135,53,0.12)", onClick: () => navigate("/jobs", { state: { openAddModal: true } }) },
    { icon: Shield,        label: "Create Referee", color: isDarkMode ? "#3D8B8F" : "#215E61", bg: isDarkMode ? "rgba(61,139,143,0.18)"  : "rgba(33,94,97,0.08)",   onClick: () => navigate("/referees", { state: { openAddModal: true } }) },
    { icon: Star,          label: "Add Mentor",     color: isDarkMode ? "#3D8B8F" : "#215E61", bg: isDarkMode ? "rgba(61,139,143,0.18)"  : "rgba(33,94,97,0.08)",   onClick: () => navigate("/mentors", { state: { openAddModal: true } }) },
    { icon: BriefcaseIcon, label: "View Jobs",      color: isDarkMode ? "#3D8B8F" : "#215E61", bg: isDarkMode ? "rgba(61,139,143,0.18)"  : "rgba(33,94,97,0.08)",   onClick: () => navigate("/jobs") },
    { icon: UserPlus,      label: "Add Recruiter",  color: isDarkMode ? "#3D8B8F" : "#215E61", bg: isDarkMode ? "rgba(61,139,143,0.18)"  : "rgba(33,94,97,0.08)",   onClick: () => navigate("/recruiters", { state: { openAddModal: true } }) },
    { icon: Settings,      label: "Settings",       color: isDarkMode ? "#3D8B8F" : "#215E61", bg: isDarkMode ? "rgba(61,139,143,0.18)"  : "rgba(33,94,97,0.08)",   onClick: () => navigate("/settings") },
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
          <p className={styles.welcomeSub}>Here's what's happening with Hirenest today.</p>
        </div>

      </header>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* ── KPI BENTO GRID ── */}
        <div className={styles.kpiBentoGrid}>
          {statCards.map((s, i) => {
            const numG = Number(s.growth);
            const isPos = numG > 0;
            const isNeg = numG < 0;
            const trendClass = isPos ? styles.positiveTrend : isNeg ? styles.negativeTrend : styles.neutralTrend;
            const sparkColor = isPos ? "#10b981" : isNeg ? "#ef4444" : s.color;
            
            const areaClasses = [
              styles.cardHero,
              styles.cardActive,
              styles.cardJobOpen,
              styles.cardNewMonth,
              styles.cardTotalViews,
              styles.cardViewDay,
            ];
            const areaClass = areaClasses[i] || "";

            return (
              <div
                key={i}
                className={`${styles.statCard} ${areaClass} ${trendClass} ${i === 0 ? styles.heroKpi : ''}`}
                onClick={s.onClick}
                title={`View ${s.label}`}
                style={{
                  "--theme-color": s.color,
                  "--glow-color": `${s.color}26`,
                }}
              >
                <div className={styles.cardBgGlow} />

                <div className={styles.statCardTop}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statTopRight}>
                    <span
                      className={`${styles.trendPill} ${
                        isPos
                          ? styles.trendUp
                          : isNeg
                          ? styles.trendDown
                          : styles.trendNeutral
                      }`}
                    >
                      {isPos ? "↑ " : isNeg ? "↓ " : ""}{Math.abs(numG)}%
                    </span>
                    <div className={styles.statIconWrap} style={{ background: `${s.color}14`, color: s.color }}>
                      <s.icon size={15} strokeWidth={2} />
                    </div>
                  </div>
                </div>

                <div className={styles.statCardMain}>
                  <div className={styles.statLeftCol}>
                    <div className={styles.statValue}>{s.value.toLocaleString()}</div>
                    <div className={styles.statSubText}>
                      <span className={isPos ? styles.subTrendUp : isNeg ? styles.subTrendDown : styles.subTrendNeutral}>
                        {isPos ? `+${s.growth}` : s.growth}
                      </span>
                      <span className={styles.subTextLabel}>{s.trendLabel || "from last month"}</span>
                    </div>
                  </div>

                  <div className={styles.statRightCol}>
                    <div className={styles.sparklineWrap}>
                      <Sparkline
                        points={s.spark}
                        color={sparkColor}
                        height={i === 0 ? 70 : 32}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── ANALYTICS BENTO GRID ── */}
        <div className={styles.analyticsBentoGrid}>
          {/* 1. Member Growth (Hero Span 2) */}
          <div className={`${styles.card} ${styles.span2}`}>
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

          {/* 2. Members Overview (Span 1) */}
          <div className={`${styles.card} ${styles.span1}`}>
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

          {/* 3. Quick Actions (Span 1) */}
          <div className={`${styles.card} ${styles.span1}`}>
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

          {/* 4. Jobs Overview (Command Span 2) */}
          <div className={`${styles.card} ${styles.span2}`}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Jobs Overview</span>
              <button className={styles.viewAllLink} onClick={() => navigate("/jobs")}>
                View All
              </button>
            </div>
            <div className={styles.jobsBentoBody}>
              <div className={styles.jobsStatsCol}>
                {[
                  { label: "Total Jobs", val: totalJobsCount, icon: BriefcaseIcon, color: "#215E61", bg: "rgba(33, 94, 97, 0.08)", onClick: () => navigate("/jobs") },
                  { label: "Active Jobs", val: activeJobsCount, icon: TrendingUp, color: "#FF8735", bg: "rgba(255, 135, 53, 0.10)", onClick: () => navigate("/jobs", { state: { status: "active" } }) },
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
              <div className={styles.jobsCategoryCol}>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
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
            </div>
          </div>

          {/* 5. Top Districts (Span 1) */}
          <div className={`${styles.card} ${styles.span1}`}>
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
              onClick={() => navigate("/members")}
            >
              View All Districts <ChevronRight size={13} />
            </button>
          </div>

          {/* 6. Top Skills (Span 1) */}
          <div className={`${styles.card} ${styles.span1}`}>
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
              onClick={() => navigate("/members")}
            >
              View All Skills <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;