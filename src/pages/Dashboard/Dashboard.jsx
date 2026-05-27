import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios"; 
import {
  Users,
  BookOpen,
  Briefcase,
  UserCheck,
  User,
  Building2,
  TrendingUp,
  GraduationCap,   
  Star 
} from "lucide-react";

import DonutOverviewChart from "../../components/UI/DonutOverviewChart";
import StatusTextView from "../../components/UI/StatusTextView";
import styles from "./Dashboard.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import CandidateDashboard from "../CandidateDashboard/CandidateDashboard";

function MemberDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { memberContext } = useData();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [recruitersCount, setRecruitersCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Helper for strings
  function countBy(array, key) {
    const counts = {};
    (array || []).forEach((item) => {
      const raw = item?.[key];
      const value =
        raw === null || raw === undefined || String(raw).trim() === ""
          ? "Unknown"
          : String(raw).trim();
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  // ✅ Helper specifically for arrays/comma-separated strings (Skills)
  function getTopSkills(membersList) {
    const counts = {};
    membersList.forEach(m => {
      let userSkills = m.skills || []; 
      
      if (typeof userSkills === 'string') {
        userSkills = userSkills.split(',').map(s => s.trim());
      }
      
      if (Array.isArray(userSkills)) {
        userSkills.forEach(skill => {
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

  // ✅ Handle Member Type card clicks
  const handleMemberTypeClick = (type) => {
    switch(type) {
      case 'Seeker':
        navigate('/job-seekers');
        break;
      case 'Provider':
        navigate('/members', { state: { exactMemberType: 'Oppurtunity Provider' } });
        break;
      case 'Recruiter':
        navigate('/recruiters');
        break;
      case 'Referee':
        navigate('/referees');
        break;
      case 'Mentor':
        navigate('/mentors');
        break;
      default:
        break;
    }
  };

  // ✅ Load Members
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
        setErrorMsg(
          e?.response?.data?.message ||
            "Failed to load members. Please check your connection."
        );
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
        } else if (res.data && typeof res.data.total === 'number') {
          setRecruitersCount(res.data.total);
        }
      } catch (e) {
        console.error("Failed to fetch recruiters", e);
        setRecruitersCount(0);
      }
    };

    if (authLoading) return;

    if (user && !["Candidate", "Member", "Mentor", "Job"].includes(user?.role)) {
      fetchRecruitersCount();
    }
  }, [user, authLoading]);

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
          <p style={{ color: "#64748b", maxWidth: 520, textAlign: "center" }}>
            {errorMsg}
          </p>
        </div>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <p style={{ color: "#ef4444", fontWeight: 700 }}>
            No members data found.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Calculations
  const totalMembers = members.length;
  const seekers = members.filter(
    (m) => (m.memberType || "").includes("Job Seeker") || (m.memberType || "") === ""
  ).length;
  const providers = members.filter((m) =>
    (m.memberType || "").includes("Oppurtunity Provider")
  ).length;
  const recruiters = recruitersCount;
  const referees = members.filter((m) =>
    (m.memberType || "").includes("Referee")
  ).length;
  const upskillers = members.filter((m) =>
    (m.memberType || "").includes("In need of Upskilling")
  ).length;
  const mentors = members.filter((m) =>
    (m.memberType || "").includes("Mentor")
  ).length;

  // Calculate Freshers vs Experienced
  const freshersCount = members.filter((m) => {
    const exp = String(m.workExp || "").toLowerCase().trim();
    return exp === "0" || exp === "fresher" || exp === "0 years";
  }).length;

  const experiencedCount = members.filter((m) => {
    const exp = String(m.workExp || "").toLowerCase().trim();
    return exp !== "" && exp !== "0" && exp !== "fresher" && exp !== "0 years" && exp !== "unknown";
  }).length;

  const topDistricts = countBy(members, "district").slice(0, 5);
  const topEducations = countBy(members, "highest_education").slice(0, 5);
  const topExperiences = countBy(members, "workExp").slice(0, 5);
  const topSkills = getTopSkills(members);

  const stats = [
    { title: "Total Members", count: totalMembers, icon: Users, color: "#6366f1", path: "/members" },
    { title: "Job Seekers", count: seekers, icon: Briefcase, color: "#10b981", path: "/job-seekers" },
    { title: "Freshers", count: freshersCount, icon: GraduationCap, color: "#06b6d4", path: "/job-seekers", state: { expFilter: "fresher" } },
    { title: "Experienced", count: experiencedCount, icon: Star, color: "#eab308", path: "/job-seekers", state: { expFilter: "experienced" } },
    { title: "Recruiters", count: recruiters, icon: Building2, color: "#8b5cf6", path: "/recruiters" },
    { title: "Job Referee", count: referees, icon: User, color: "#ec4899", path: "/referees" },
    { title: "Upskillers", count: upskillers, icon: BookOpen, color: "#f97316", path: "/members", state: { exactMemberType: "In need of Upskilling" } },
  ];

  const memberTypeData = [
    { name: "Seeker", value: seekers, color: "#10b981" },
    { name: "Provider", value: providers, color: "#f59e0b" },
    { name: "Recruiter", value: recruiters, color: "#8b5cf6" },
    { name: "Referee", value: referees, color: "#ec4899" },
    { name: "Mentor", value: mentors, color: "#6366f1" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <header className={styles.headerSection}>
          <h1>Community Overview</h1>
          <p>Real-time insights and member distribution</p>
        </header>

        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={styles.statCard} 
              onClick={() => navigate(stat.path, { state: stat.state || {} })}
            >
              <div className={styles.statIconContainer} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className={styles.statInfo}>
                <h3>{Number(stat.count || 0).toLocaleString()}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mainContentGrid}>
          <div className={styles.chartSection}>
            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <h3>Member Types</h3>
              </div>
              <DonutOverviewChart 
                data={memberTypeData} 
                onSliceClick={handleMemberTypeClick}
              />
              <StatusTextView 
                data={memberTypeData} 
                onClick={handleMemberTypeClick}
              />
            </div>

            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <h3>Top Districts</h3>
              </div>
              <div className={styles.rankingList}>
                {topDistricts.map((item, i) => (
                  <div
                    key={i}
                    className={styles.rankingItem}
                    style={{ cursor: "pointer", transition: "background 0.2s", borderRadius: "8px" }}
                    onClick={() => navigate("/members", { state: { exactDistrict: item.name } })}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--soft-bg, #f8fafc)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span className={styles.rankInfo}>{item.name}</span>
                    <span className={styles.rankBadge}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <h3>Experience Breakdown</h3>
              </div>
              <div className={styles.rankingList}>
                {topExperiences.map((item, i) => (
                  <div 
                    key={i} 
                    className={styles.rankingItem}
                    style={{ cursor: "pointer", transition: "background 0.2s", borderRadius: "8px" }}
                    onClick={() => navigate("/members", { state: { exactExp: item.name } })}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--soft-bg, #f8fafc)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <div className={styles.rankInfo}>
                      <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>Level {i + 1}</div>
                      {item.name}
                    </div>
                    <span className={styles.rankBadge}>{item.value} Users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>Education Breakdown</h3>
            </div>
            <div className={styles.rankingList}>
              {topEducations.map((item, i) => (
                <div 
                  key={i} 
                  className={styles.rankingItem}
                  style={{ cursor: "pointer", transition: "background 0.2s", borderRadius: "8px" }}
                  onClick={() => navigate("/members", { state: { exactEdu: item.name } })}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--soft-bg, #f8fafc)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className={styles.rankInfo}>
                    <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>Level {i + 1}</div>
                    {item.name}
                  </div>
                  <span className={styles.rankBadge}>{item.value} Users</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <h3>Top Skills Breakdown</h3>
            </div>
            <div className={styles.rankingList}>
              {topSkills.map((item, i) => (
                <div 
                  key={i} 
                  className={styles.rankingItem}
                  style={{ cursor: "pointer", transition: "background 0.2s", borderRadius: "8px" }}
                  onClick={() => navigate("/members", { state: { exactSkill: item.name } })}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--soft-bg, #f8fafc)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className={styles.rankInfo}>
                    <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>Rank {i + 1}</div>
                    {item.name}
                  </div>
                  <span className={styles.rankBadge}>{item.value} Users</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", borderRadius: "12px", display: "flex", gap: "10px", alignItems: "center", background: "var(--soft-bg)", border: "1px solid var(--border)" }}>
              <TrendingUp size={20} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Data updated just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;