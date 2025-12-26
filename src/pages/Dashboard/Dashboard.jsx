import React, { useEffect, useState } from "react";
import { Users, MapPin, BookOpen, Briefcase, UserCheck, User } from "lucide-react";
import CustomCard from "../../components/UI/CustomCard";
import DonutOverviewChart from "../../components/UI/DonutOverviewChart";
import StatusTextView from "../../components/UI/StatusTextView";
import styles from "./Dashboard.module.scss";
import API from "../../axios";
import { useData } from "../../context/DataContext";

function MemberDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const {memberContext,setMemberContext} = useData(); // get all Member data from data context (Initial fetch during login)

  useEffect(() => {
    setMembers(memberContext)
  }, [memberContext]);

  if (loading)
    return (
      <div className={styles.app}>
        <div className={styles.loader}></div>
      </div>
    );

  // === Basic stats ===
  const totalMembers = members.length;
  const seekers = members.filter(
  (m) =>
    m.memberType.trim() === "" ||         // count blank strings
    m.memberType.includes("Job Seeker")   // count actual Job Seekers
  ).length;

  const providers = members.filter((m) => m.memberType?.includes("Oppurtunity Provider")).length;
  const referees = members.filter((m) => m.memberType?.includes("Referee")).length;
  const upskillers = members.filter((m) => m.memberType?.includes("In need of Upskilling")).length;

  const genderStats = countBy(members, "gender");
  const districtStats = countBy(members, "district");
  const educationStats = countBy(members, "highest_education");

  // === Utility function ===
  function countBy(array, key) {
    const counts = {};
    array.forEach((item) => {
      const value = item[key] || "Unknown";
      counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  // === Prepare Donut data ===
  const memberTypeData = [
    { name: "Seeker", value: seekers, color: "#4ECDC4" },
    { name: "Provider", value: providers, color: "#45B7D1" },
    { name: "Referrer", value: referees, color: "#FFA07A" },
    { name: "Upskiller", value: upskillers, color: "#FFD700" },
  ];

  const genderData = genderStats.map((g) => ({
    name: g.name,
    value: g.value,
    color: g.name === "Male" ? "#3daae9ff" : g.name === "Female" ? "#f77272ff" : "#aaa",
  }));

  const topDistricts = districtStats.slice(0, 5);
  const topEducations = educationStats.slice(0, 5);

  // === Stat Cards ===
  const stats = [
    { title: "Total Members", count: totalMembers, icon: Users, color: "#4ECDC4" },
    { title: "Job Seekers", count: seekers, icon: Briefcase, color: "#45B7D1" },
    { title: "Opportunity Providers", count: providers, icon: UserCheck, color: "#FFEAA7" },
    { title: "Referrers", count: referees, icon: User, color: "#DDA0DD" },
    { title: "Upskillers", count: upskillers, icon: BookOpen, color: "#FFA500" },
  ];

  return (
    <div className={styles.dashboard}>
      {/* === Stat Overview === */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <CustomCard key={i} className={styles.statCard} hover>
            <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3>{stat.count}</h3>
              <p>{stat.title}</p>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* === Donut Charts Section === */}
      <div className={styles.statsGrid}>
        <div>
          <DonutOverviewChart title="Member Types" data={memberTypeData} />
          <StatusTextView data={memberTypeData} />
        </div>

        <div>
          <DonutOverviewChart title="Gender Distribution" data={genderData} />
          <StatusTextView data={genderData} />
        </div>
      </div>

      {/* === Top Districts & Education === */}
      <div className={styles.dashboardGrid}>
        <CustomCard>
          <div className={styles.cardHeader}>
            <h3>Top Districts</h3>
          </div>
          <ul className={styles.deadlineList}>
            {topDistricts.map((item, i) => (
              <li key={i} className={styles.deadlineItem}>
                <div className={styles.deadlineInfo}>
                  <h4>{item.name}</h4>
                </div>
                <span className={styles.date}>{item.value} members</span>
              </li>
            ))}
          </ul>
        </CustomCard>

        <CustomCard>
          <div className={styles.cardHeader}>
            <h3>Top Education Levels</h3>
          </div>
          <ul className={styles.deadlineList}>
            {topEducations.map((item, i) => (
              <li key={i} className={styles.deadlineItem}>
                <div className={styles.deadlineInfo}>
                  <h4>{item.name}</h4>
                </div>
                <span className={styles.date}>{item.value} members</span>
              </li>
            ))}
          </ul>
        </CustomCard>
      </div>
    </div>
  );
}

export default MemberDashboard;
