import React from "react";
import styles from "./MasterUI.module.scss";

export default function ProgressBarList({ items = [], maxVal, className = "" }) {
  if (!items || items.length === 0) {
    return <div style={{ color: "var(--text-muted, #767676)", fontSize: "0.8rem" }}>No data available</div>;
  }

  const computedMax = maxVal || Math.max(...items.map((i) => Number(i.value) || 0), 1);

  return (
    <div className={`${styles.rankList} ${className}`}>
      {items.map((item, idx) => {
        const val = Number(item.value) || 0;
        const pct = Math.min(100, Math.max(0, (val / computedMax) * 100));

        return (
          <div key={idx} className={styles.rankItem}>
            <div className={styles.rankInfo}>
              <span>{item.name || item.label}</span>
              <span className={styles.rankValue}>{val.toLocaleString()}</span>
            </div>
            <div className={styles.rankTrack}>
              <div
                className={styles.rankBar}
                style={{
                  width: `${pct}%`,
                  background: item.color || "#215E61",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
