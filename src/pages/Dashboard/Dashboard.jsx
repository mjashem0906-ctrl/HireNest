// //--------------------------------31/01-------------------4.01-------------------------------

// import { useNavigate } from 'react-router-dom';
// import React, { useEffect, useState } from "react";
// import { Users, MapPin, BookOpen, Briefcase, UserCheck, User, Building2 } from "lucide-react";
// import CustomCard from "../../components/UI/CustomCard";
// import DonutOverviewChart from "../../components/UI/DonutOverviewChart";
// import StatusTextView from "../../components/UI/StatusTextView";
// import styles from "./Dashboard.module.scss";
// import { useData } from "../../context/DataContext";
// import { useAuth } from "../../context/AuthContext";
// import CandidateDashboard from '../CandidateDashboard/CandidateDashboard';

// function MemberDashboard() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { memberContext } = useData();

//   useEffect(() => {
//     if (memberContext) {
//       setMembers(memberContext);
//     }
//   }, [memberContext]);

//   if (["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
//     return <CandidateDashboard />;
//   }

//   if (loading)
//     return (
//       <div className={styles.app}>
//         <div className={styles.loader}></div>
//       </div>
//     );

//   // === Basic stats ===
//   const totalMembers = members.length;

//   const seekers = members.filter((m) => {
//     const type = m.memberType || "";
//     return type.trim() === "" || type.includes("Job Seeker");
//   }).length;

//   const providers = members.filter((m) => m.memberType?.includes("Oppurtunity Provider")).length;
//   const referees = members.filter((m) => m.memberType?.includes("Referee")).length;
//   const upskillers = members.filter((m) => m.memberType?.includes("In need of Upskilling")).length;
//   const mentors = members.filter((m) => m.memberType?.includes("Mentor")).length;
  
//   // ✅ FIX: Enhanced Counting Logic
//   // This converts the memberType to lowercase first. 
//   // It ensures that "Recruiter", "recruiter", and "Job Recruiter" are ALL counted.
//   const recruiters = members.filter((m) => {
//     const type = (m.memberType || "").toLowerCase();
//     return type.includes("recruiter"); 
//   }).length;

//   const genderStats = countBy(members, "gender");
//   const districtStats = countBy(members, "district");
//   const educationStats = countBy(members, "highest_education");

//   function countBy(array, key) {
//     const counts = {};
//     array.forEach((item) => {
//       const value = item[key] || "Unknown";
//       counts[value] = (counts[value] || 0) + 1;
//     });
//     return Object.entries(counts)
//       .map(([name, value]) => ({ name, value }))
//       .sort((a, b) => b.value - a.value);
//   }

//   // === Prepare Donut data ===
//   const memberTypeData = [
//     { name: "Seeker", value: seekers, color: "#4ECDC4" },
//     { name: "Provider", value: providers, color: "#45B7D1" },
//     { name: "Referrer", value: referees, color: "#FFA07A" },
//     { name: "Upskiller", value: upskillers, color: "#FFD700" },
//     { name: "Mentor", value: mentors, color: "#DDA0DD" },
//   ];

//   const genderData = genderStats.map((g) => ({
//     name: g.name,
//     value: g.value,
//     color: g.name === "Male" ? "#3daae9ff" : g.name === "Female" ? "#f77272ff" : "#aaa",
//   }));

//   const topDistricts = districtStats.slice(0, 5);
//   const topEducations = educationStats.slice(0, 5);

//   const stats = [
//     { title: "Total Members", count: totalMembers, icon: Users, color: "#4ECDC4", path: "/members" },
//     { title: "Job Seekers", count: seekers, icon: Briefcase, color: "#45B7D1", path: "/members" },
//     { title: "Opportunity Providers", count: providers, icon: UserCheck, color: "#FFEAA7", path: "/members" },
    
//     // ✅ FIX: Updated path to redirect to the correct module
//     { title: "Job Recruiters", count: recruiters, icon: Building2, color: "#6366f1", path: "/recruiters" },
    
//     { title: "Job Referee", count: referees, icon: User, color: "#DDA0DD", path: "/referees" },
//     { title: "Upskillers", count: upskillers, icon: BookOpen, color: "#FFA500", path: "/members" },
//     { title: "Mentors", count: mentors, icon: MapPin, color: "#FF6B6B", path: "/mentors" },
//   ];

//   return (
//     <div className={styles.dashboard}>
//       <div className={styles.statsGrid}>
//         {stats.map((stat, i) => (
//           <CustomCard
//             key={i}
//             className={styles.statCard}
//             hover
//             onClick={() => navigate(stat.path)}
//             style={{ cursor: "pointer" }}
//           >
//             <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
//               <stat.icon size={24} />
//             </div>
//             <div className={styles.statInfo}>
//               <h3>{stat.count}</h3>
//               <p>{stat.title}</p>
//             </div>
//           </CustomCard>
//         ))}
//       </div>

//       <div className={styles.statsGrid}>
//         <div>
//           <DonutOverviewChart title="Member Types" data={memberTypeData} />
//           <StatusTextView data={memberTypeData} />
//         </div>
//         <div>
//           <DonutOverviewChart title="Gender Distribution" data={genderData} />
//           <StatusTextView data={genderData} />
//         </div>
//       </div>

//       <div className={styles.dashboardGrid}>
//         <CustomCard>
//           <div className={styles.cardHeader}><h3>Top Districts</h3></div>
//           <ul className={styles.deadlineList}>
//             {topDistricts.map((item, i) => (
//               <li key={i} className={styles.deadlineItem}>
//                 <div className={styles.deadlineInfo}><h4>{item.name}</h4></div>
//                 <span className={styles.date}>{item.value} members</span>
//               </li>
//             ))}
//           </ul>
//         </CustomCard>

//         <CustomCard>
//           <div className={styles.cardHeader}><h3>Top Education Levels</h3></div>
//           <ul className={styles.deadlineList}>
//             {topEducations.map((item, i) => (
//               <li key={i} className={styles.deadlineItem}>
//                 <div className={styles.deadlineInfo}><h4>{item.name}</h4></div>
//                 <span className={styles.date}>{item.value} members</span>
//               </li>
//             ))}
//           </ul>
//         </CustomCard>
//       </div>
//     </div>
//   );
// }

// export default MemberDashboard;

//--------------------------------6/2--------------------------11.21----------------------

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, BookOpen, Briefcase, 
  UserCheck, User, Building2, TrendingUp 
} from "lucide-react";
import CustomCard from "../../components/UI/CustomCard";
import DonutOverviewChart from "../../components/UI/DonutOverviewChart";
import StatusTextView from "../../components/UI/StatusTextView";
import styles from "./Dashboard.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import CandidateDashboard from '../CandidateDashboard/CandidateDashboard';

function MemberDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memberContext } = useData();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (memberContext) setMembers(memberContext);
  }, [memberContext]);

  if (["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
    return <CandidateDashboard />;
  }

  if (!members.length) return (
    <div className={styles.app}><div className={styles.loader}></div></div>
  );

  // Helper for counting
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

  // Data Calculations
  const totalMembers = members.length;
  const seekers = members.filter(m => (m.memberType || "").includes("Job Seeker") || m.memberType === "").length;
  const providers = members.filter(m => m.memberType?.includes("Oppurtunity Provider")).length;
  const recruiters = members.filter(m => (m.memberType || "").toLowerCase().includes("recruiter")).length;
  const referees = members.filter(m => m.memberType?.includes("Referee")).length;
  const upskillers = members.filter(m => m.memberType?.includes("In need of Upskilling")).length;
  const mentors = members.filter(m => m.memberType?.includes("Mentor")).length;

  const topDistricts = countBy(members, "district").slice(0, 5);
  const topEducations = countBy(members, "highest_education").slice(0, 5);

  const stats = [
    { title: "Total Members", count: totalMembers, icon: Users, color: "#6366f1", path: "/members" },
    { title: "Job Seekers", count: seekers, icon: Briefcase, color: "#10b981", path: "/members" },
    { title: "Providers", count: providers, icon: UserCheck, color: "#f59e0b", path: "/members" },
    { title: "Recruiters", count: recruiters, icon: Building2, color: "#8b5cf6", path: "/recruiters" },
    { title: "Job Referee", count: referees, icon: User, color: "#ec4899", path: "/referees" },
    { title: "Upskillers", count: upskillers, icon: BookOpen, color: "#f97316", path: "/members" },
  ];

  const memberTypeData = [
    { name: "Seeker", value: seekers, color: "#10b981" },
    { name: "Provider", value: providers, color: "#f59e0b" },
    { name: "Recruiter", value: recruiters, color: "#8b5cf6" },
    { name: "Referee", value: referees, color: "#ec4899" },
    { name: "Mentor", value: mentors, color: "#6366f1" },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.headerSection}>
        <h1>Community Overview</h1>
        <p>Real-time insights and member distribution</p>
      </header>

      {/* Top Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard} onClick={() => navigate(stat.path)}>
            <div 
              className={styles.statIconContainer} 
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3>{stat.count.toLocaleString()}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainContentGrid}>
        {/* Charts Column */}
        <div className={styles.chartSection}>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}><h3>Member Types</h3></div>
            <DonutOverviewChart data={memberTypeData} />
            <StatusTextView data={memberTypeData} />
          </div>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}><h3>Top Districts</h3></div>
            <div className={styles.rankingList}>
              {topDistricts.map((item, i) => (
                <div key={i} className={styles.rankingItem}>
                  <span className={styles.rankInfo}>{item.name}</span>
                  <span className={styles.rankBadge}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className={styles.glassCard}>
          <div className={styles.cardHeader}>
            <h3>Education Breakdown</h3>
          </div>
          <div className={styles.rankingList}>
            {topEducations.map((item, i) => (
              <div key={i} className={styles.rankingItem}>
                <div className={styles.rankInfo}>
                   <div style={{fontSize: '0.8rem', color: '#64748b'}}>Level {i+1}</div>
                   {item.name}
                </div>
                <span className={styles.rankBadge}>{item.value} Users</span>
              </div>
            ))}
          </div>
          <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center'}}>
             <TrendingUp size={20} color="#0369a1" />
             <span style={{fontSize: '0.85rem', color: '#0369a1', fontWeight: 600}}>Data updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;