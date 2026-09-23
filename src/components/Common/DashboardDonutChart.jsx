import React, { useState, useRef } from "react";
import styles from "./MasterUI.module.scss";

/**
 * DashboardDonutChart adheres to Rule 11 & 12:
 * - Pure SVG circles: strictly circular (1:1 aspect ratio), zero distortion
 * - No scaling or layout shift on hover
 * - Center label: total value & text
 * - Clean aligned legend on the right with dots, counts, and percentages
 */
export default function DashboardDonutChart({
  data = [],
  size = 130,
  thickness = 22,
  centerLabel = "Total",
  centerValue,
  onSliceClick,
  showLegend = true,
  showTooltip = true,
  className = "",
}) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  const displayTotal = centerValue !== undefined ? centerValue : total;

  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const gap = 0; // Removed gap for seamless flat joins

  const segments = [];
  let offset = 0;
  data.forEach((seg, i) => {
    const val = Number(seg.value) || 0;
    const pct = (val / total) * (circ - data.length * gap);
    segments.push({ ...seg, value: val, pct: Math.max(pct, 0), offset, index: i });
    offset += pct + gap;
  });

  const hovSeg = hovered !== null ? segments[hovered] : null;

  const handleMouseMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className={`${styles.donutChartWrapper} ${className}`}>
      {/* SVG DONUT CHART */}
      <div
        ref={wrapRef}
        className={styles.donutSvgArea}
        style={{ width: size, height: size }}
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
            const isHov = hovered === seg.index;
            const rHov = isHov ? r + 2.5 : r;
            const circHov = 2 * Math.PI * rHov;
            const pctHov = (seg.value / total) * (circHov - data.length * gap);

            return (
              <circle
                key={seg.index}
                cx={size / 2}
                cy={size / 2}
                r={rHov}
                fill="none"
                stroke={seg.color || "#215E61"}
                strokeWidth={isHov ? thickness + 3 : thickness}
                strokeDasharray={`${Math.max(pctHov, 0)} ${circHov}`}
                strokeDashoffset={-seg.offset * (circHov / circ)}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: "r 0.18s ease, stroke-width 0.18s ease",
                  cursor: "pointer",
                  filter: isHov ? `drop-shadow(0 0 6px ${seg.color || "#215E61"}80)` : "none",
                }}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSliceClick?.(seg)}
              />
            );
          })}
        </svg>

        {/* CENTER CONTENT */}
        <div className={styles.donutCenterLabel}>
          <span className={styles.donutCenterValue}>
            {hovSeg ? hovSeg.value.toLocaleString() : displayTotal.toLocaleString()}
          </span>
          <span className={styles.donutCenterText}>
            {hovSeg ? hovSeg.name : centerLabel}
          </span>
        </div>

        {/* HOVER TOOLTIP */}
        {showTooltip && hovSeg && (
          <div
            style={{
              position: "absolute",
              left: Math.max(10, Math.min(mousePos.x + 10, size - 20)),
              top: mousePos.y - 38,
              background: "#1e293b",
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: "0.7rem",
              fontWeight: 700,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 99,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              borderLeft: `3px solid ${hovSeg.color || "#215E61"}`,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: hovSeg.color }}>{hovSeg.name}</span>
            <br />
            {hovSeg.value} ({Math.round((hovSeg.value / total) * 100)}%)
          </div>
        )}
      </div>

      {/* RIGHT-SIDE CLEAN LEGEND */}
      {showLegend && (
        <div className={styles.donutLegend}>
          {data.map((item, idx) => {
            const isHov = hovered === idx;
            const pct = Math.round(((Number(item.value) || 0) / total) * 100);

            return (
              <div
                key={idx}
                className={styles.donutLegendItem}
                style={{
                  cursor: "pointer",
                  opacity: hovered !== null && !isHov ? 0.45 : 1,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSliceClick?.(item)}
              >
                <div className={styles.donutLegendLeft}>
                  <span
                    className={styles.donutLegendDot}
                    style={{ background: item.color || "#215E61" }}
                  />
                  <span className={styles.donutLegendName}>{item.name}</span>
                </div>
                <span className={styles.donutLegendValue}>
                  {item.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
