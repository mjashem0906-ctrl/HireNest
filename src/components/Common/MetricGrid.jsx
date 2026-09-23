import React from "react";
import styles from "./MasterUI.module.scss";
import MetricCard from "./MetricCard";

/**
 * MetricGrid enforces Rule 6 of Master Design System:
 * - Exactly 4 cards: Clean straight 4-column layout ([CARD] [CARD] [CARD] [CARD])
 * - More than 4 cards: Bento Grid (top 2 hero span 2, remaining span 1)
 * - 3 cards: Clean balanced 3-column layout
 */
export default function MetricGrid({ cards = [], columns, layout, className = "" }) {
  if (!cards || cards.length === 0) return null;

  const count = cards.length;

  // 1. Explicit columns override
  if (columns) {
    return (
      <div
        className={`${styles.metricGrid} ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {cards.map((card, idx) => (
          <MetricCard key={idx} {...card} span={1} isHero={false} />
        ))}
      </div>
    );
  }

  // 2. Multiples of 4 (e.g. exactly 4 or 8 cards)
  // Clean straight 4-column layout where every row has 4 cards:
  // - 4 cards: 1 full row of 4 ([CARD] [CARD] [CARD] [CARD])
  // - 8 cards: 2 full rows of 4 ([4 CARDS] / [4 CARDS])
  // -> Zero empty spots, zero ragged ends!
  if (count === 4 || count === 8 || count === 12) {
    return (
      <div className={`${styles.metricGrid} ${styles.straight4Col} ${className}`}>
        {cards.map((card, idx) => (
          <MetricCard
            key={idx}
            {...card}
            span={1}
            isHero={false}
          />
        ))}
      </div>
    );
  }

  // 3. Exactly 6 cards (like the Admin Dashboard):
  // 2 hero cards (span 2 each = 4 cols) + 4 regular cards (span 1 each = 4 cols) = 6 cards, 2 full rows
  if (count === 6 && layout !== "straight") {
    return (
      <div className={`${styles.metricGrid} ${styles.bentoGrid} ${className}`}>
        {cards.map((card, idx) => {
          const isHero = idx < 2;
          return (
            <MetricCard
              key={idx}
              {...card}
              span={isHero ? 2 : 1}
              isHero={isHero}
            />
          );
        })}
      </div>
    );
  }

  // 4. Exactly 6 cards (straight): 2 rows of 3
  if (count === 6 && layout === "straight") {
    return (
      <div
        className={`${styles.metricGrid} ${className}`}
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {cards.map((card, idx) => (
          <MetricCard key={idx} {...card} span={1} isHero={false} />
        ))}
      </div>
    );
  }

  // 5. 3 cards: clean balanced 3-column layout
  if (count === 3) {
    return (
      <div
        className={`${styles.metricGrid} ${className}`}
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {cards.map((card, idx) => (
          <MetricCard key={idx} {...card} span={1} isHero={false} />
        ))}
      </div>
    );
  }

  // 6. 2 cards: clean balanced 2-column layout
  if (count === 2) {
    return (
      <div
        className={`${styles.metricGrid} ${className}`}
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        {cards.map((card, idx) => (
          <MetricCard key={idx} {...card} span={1} isHero={false} />
        ))}
      </div>
    );
  }

  // 7. Dynamic fallback: auto-fit
  return (
    <div
      className={`${styles.metricGrid} ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
      }}
    >
      {cards.map((card, idx) => (
        <MetricCard key={idx} {...card} span={1} isHero={false} />
      ))}
    </div>
  );
}
