import React from "react";
import styles from "./MasterUI.module.scss";
import FluidSparkline from "./FluidSparkline";

export default function MetricCard({
  label,
  title,
  value,
  icon,
  color,
  accentColor,
  spark = [20, 25, 22, 28, 30, 27, 35, 32, 38, 40],
  growth,
  trend,
  trendLabel = "from last month",
  onClick,
  isHero = false,
  span = 1,
  className = "",
}) {
  const displayLabel = label || title || "";
  const displayColor = color || accentColor || "#215E61";

  // Parse growth or trend
  const rawTrend = growth !== undefined ? growth : trend;
  let numericGrowth = null;
  let trendText = trendLabel;

  if (typeof rawTrend === "number") {
    numericGrowth = rawTrend;
  } else if (typeof rawTrend === "string") {
    const match = rawTrend.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (match) {
      numericGrowth = parseFloat(match[0]);
    }
    if (rawTrend.includes("%") || rawTrend.includes("from")) {
      trendText = rawTrend;
    }
  }

  const hasGrowth = numericGrowth !== null && !isNaN(numericGrowth);
  const isPositive = hasGrowth && numericGrowth > 0;
  const isNegative = hasGrowth && numericGrowth < 0;

  const spanClass = span === 2 ? styles.span2 : styles.span1;
  const heroClass = isHero ? styles.heroKpi : "";

  // Render icon safely whether passed as <Icon /> element, forwardRef object, or component function
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        size: icon.props.size || 15,
        strokeWidth: icon.props.strokeWidth || 2.2,
      });
    }
    try {
      const IconComponent = icon;
      return <IconComponent size={15} strokeWidth={2.2} />;
    } catch (e) {
      console.error("MetricCard icon render error:", e);
      return null;
    }
  };

  const trendClass = isPositive
    ? styles.positiveTrend
    : isNegative
    ? styles.negativeTrend
    : styles.neutralTrend;

  const sparklineColor = displayColor;

  return (
    <div
      className={`${styles.metricCard} ${spanClass} ${heroClass} ${trendClass} ${className}`}
      onClick={onClick}
      title={onClick ? `View ${displayLabel}` : displayLabel}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div className={styles.cardBgGlow} />

      <div className={styles.metricCardTop}>
        <div className={styles.metricLabel}>{displayLabel}</div>
        <div className={styles.metricTopRight}>
          {hasGrowth && (
            <span
              className={`${styles.trendPill} ${
                isPositive
                  ? styles.trendUp
                  : isNegative
                  ? styles.trendDown
                  : styles.trendNeutral
              }`}
            >
              {isPositive ? "↑ " : isNegative ? "↓ " : ""}
              {Math.abs(numericGrowth)}%
            </span>
          )}
          {icon && (
            <div
              className={styles.metricIconWrap}
              style={{
                background: `${displayColor}14`,
                color: displayColor,
              }}
            >
              {renderIcon()}
            </div>
          )}
        </div>
      </div>

      <div className={styles.metricCardMain}>
        <div className={styles.metricLeftCol}>
          <div className={styles.metricValue}>
            {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
          </div>
          <div className={styles.metricSubText}>
            {hasGrowth && (
              <span className={isPositive ? styles.subTrendUp : isNegative ? styles.subTrendDown : styles.subTrendNeutral}>
                {isPositive ? `+${numericGrowth}` : numericGrowth}
              </span>
            )}
            <span className={styles.subTextLabel}>{trendText}</span>
          </div>
        </div>

        <div className={styles.metricRightCol}>
          <div className={styles.sparklineWrap}>
            <FluidSparkline
              points={spark}
              color={sparklineColor}
              height={isHero ? 36 : 30}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
