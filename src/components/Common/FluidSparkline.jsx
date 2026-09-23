import React, { useState, useRef, useMemo } from "react";
import styles from "./MasterUI.module.scss";

// ─── Pure rendering fluid wave & Cardinal Spline engine ───────────────────────
function buildFluidWave({
  values,
  W = 110,
  H = 28,
  pad = { t: 3, b: 3, l: 2, r: 5 },
  ampRatio = 0.45,
  tension = 0.35,
  steps = 4,
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

  // 1. Synthetic points via smooth cosine interpolation for high-resolution fluid curve
  const dense = [];
  for (let i = 0; i < values.length - 1; i++) {
    dense.push(values[i]);
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const ft = (1 - Math.cos(t * Math.PI)) * 0.5;
      dense.push(values[i] * (1 - ft) + values[i + 1] * ft);
    }
  }
  dense.push(values[values.length - 1]);

  // 2. Light 2-pass smoothing filter preserving exact endpoints
  let smoothed = [...dense];
  for (let pass = 0; pass < 2; pass++) {
    smoothed = smoothed.map((v, i) => {
      if (i === 0 || i === smoothed.length - 1) return v;
      return smoothed[i - 1] * 0.25 + v * 0.5 + smoothed[i + 1] * 0.25;
    });
  }

  const min = Math.min(...smoothed);
  const max = Math.max(...smoothed);
  const range = max - min || 1;
  const amplitude = ch * ampRatio;

  const pts = smoothed.map((v, i) => {
    const x = pad.l + (i / (smoothed.length - 1)) * cw;
    const normalized = (v - min) / range;
    const y = pad.t + ch - 2 - normalized * amplitude;
    return { x, y };
  });

  // Calculate original coordinates mapping to the curve for tooltips/hover
  const originalCoords = values.map((val, i) => {
    const denseIdx = i * steps;
    const pt = pts[denseIdx] || pts[pts.length - 1];
    return { x: pt.x, y: pt.y, value: val, index: i };
  });

  // 3. Cardinal spline with gentle tension -> C1 continuous Bezier path
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

export default function FluidSparkline({ points, color = "#215E61", id, height = 28 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const W = 110;
  const H = height;

  const validPoints = Array.isArray(points) && points.length > 0 ? points : [10, 15, 12, 18, 16, 22];

  const { linePath, areaPath, lastPt, originalCoords } = useMemo(
    () =>
      buildFluidWave({
        values: validPoints,
        W,
        H,
        pad: { t: 3, b: 3, l: 2, r: 5 },
        ampRatio: 0.45,
        tension: 0.35,
        steps: 4,
      }),
    [validPoints, W, H]
  );

  const isDark = typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  const softColor = isDark
    ? (color === "#10b981" || color === "#22c55e" ? "#4ade80" : color === "#ef4444" ? "#f87171" : color === "#FF8735" ? "#FF9A52" : "#3D8B8F")
    : (color === "#10b981" || color === "#22c55e" ? "#16a34a" : color === "#ef4444" ? "#dc2626" : color === "#FF8735" ? "#e88035" : "#215E61");

  const gradId =
    id ||
    `spark_grad_${String(color).replace(/[^a-zA-Z0-9]/g, "")}_${validPoints[0]}_${validPoints[validPoints.length - 1]}`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const pctX = Math.max(0, Math.min(1, relX / rect.width));
    const targetIdx = Math.round(pctX * (validPoints.length - 1));
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
            <stop offset="0%" stopColor={softColor} stopOpacity="0.10" />
            <stop offset="100%" stopColor={softColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Faint tint area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Thinner stroke (~1.5px) with soft desaturated color */}
        <path
          d={linePath}
          fill="none"
          stroke={softColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
