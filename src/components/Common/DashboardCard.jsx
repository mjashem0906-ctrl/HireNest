import React from "react";
import styles from "./MasterUI.module.scss";

export default function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  style = {},
  interactive = false,
  onClick,
}) {
  return (
    <div
      className={`${styles.dashboardCard} ${interactive ? styles.interactive : ""} ${className}`}
      style={style}
      onClick={onClick}
    >
      {(title || action) && (
        <div className={styles.cardHead}>
          <div>
            {title && <span className={styles.cardTitle}>{title}</span>}
            {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
