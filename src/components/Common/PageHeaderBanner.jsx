import React from "react";
import styles from "./MasterUI.module.scss";

export default function PageHeaderBanner({
  title,
  accentTitle,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className={`${styles.pageHeaderBanner} ${className}`}>
      <div className={styles.bannerTitleArea}>
        <h1 className={styles.bannerHeading}>
          {title}
          {accentTitle && (
            <>
              {" "}
              <span className={styles.bannerAccent}>{accentTitle}</span>
            </>
          )}
        </h1>
        {subtitle && <p className={styles.bannerSubtext}>{subtitle}</p>}
      </div>

      {children && <div className={styles.bannerActions}>{children}</div>}
    </div>
  );
}
