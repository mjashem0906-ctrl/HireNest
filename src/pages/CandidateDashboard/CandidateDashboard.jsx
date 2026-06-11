// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import API from "../../axios";
// import { useAuth } from "../../context/AuthContext";
// import {
//   Briefcase,
//   Users,
//   Clock,
//   MapPin,
//   Building,
//   TrendingUp,
//   CheckCircle2,
// } from "lucide-react";
// import styles from "./CandidateDashboard.module.scss";

// const CandidateDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [loading, setLoading] = useState(true);
//   const [memberName, setMemberName] = useState("");
//   const [ownMember, setOwnMember] = useState(null);
//   const [data, setData] = useState({
//     recentApplications: [],
//     newMentors: [],
//     recentJobs: [],
//   });

//   // ── Local profile completion from actual member fields ────────────
//   const calcCompletion = (m) => {
//     if (!m) return 0;
//     const has = (v) => {
//       if (Array.isArray(v)) return v.length > 0;
//       return v !== undefined && v !== null && String(v).trim().length > 0;
//     };
//     const checks = [
//       // Basic
//       has(m.name), has(m.mobileNumber), has(m.gender), has(m.dateOfBirth), has(m.photoUrl), has(m.district),
//       // Career
//       has(m.designation), has(m.workExp), has(m.careerProfile?.role), has(m.careerProfile?.industry), has(m.skills),
//       // Education / Docs
//       has(m.resumeLink), has(m.highest_education), has(m.branch), has(m.passOutYear),
//       // Personal
//       has(m.fatherName), has(m.address || m.hometown), has(m.languages), has(m.maritalStatus), has(m.mobileNumber),
//     ];
//     return Math.round((checks.filter(Boolean).length / checks.length) * 100);
//   };

//   const profileCompletion = calcCompletion(ownMember);

//   // ✅ 3D tilt refs (ONLY for About card)
//   const aboutCardRef = useRef(null);
//   const rafRef = useRef(null);

//   const handleAboutMouseMove = (e) => {
//     const el = aboutCardRef.current;
//     if (!el) return;

//     if (rafRef.current) cancelAnimationFrame(rafRef.current);

//     rafRef.current = requestAnimationFrame(() => {
//       const rect = el.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;

//       const px = x / rect.width;
//       const py = y / rect.height;

//       // stronger premium tilt
//       const max = 10;
//       const ry = (px - 0.5) * (max * 2);
//       const rx = -(py - 0.5) * (max * 2);

//       el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
//       el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
//       el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
//       el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);

//       // ✅ parallax for inner layers (-12..12)
//       const dx = (px - 0.5) * 24;
//       const dy = (py - 0.5) * 24;
//       el.style.setProperty("--px", `${dx.toFixed(2)}px`);
//       el.style.setProperty("--py", `${dy.toFixed(2)}px`);
//     });
//   };

//   const handleAboutMouseLeave = () => {
//     const el = aboutCardRef.current;
//     if (!el) return;

//     el.style.setProperty("--rx", `0deg`);
//     el.style.setProperty("--ry", `0deg`);
//     el.style.setProperty("--mx", `50%`);
//     el.style.setProperty("--my", `50%`);
//     el.style.setProperty("--px", `0px`);
//     el.style.setProperty("--py", `0px`);
//   };

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);

//         const [jobsRes, membersRes] = await Promise.all([
//           API.get("/service"),
//           API.get("/member"),
//         ]);

//         const allJobs = jobsRes.data.data || [];
//         const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

//         const myApps = allJobs
//           .filter((job) =>
//             job.appliedMembers?.some(
//               (app) =>
//                 String(app.memberId?._id || app.memberId) ===
//                 String(user?.memberId)
//             )
//           )
//           .map((job) => {
//             const myApp = job.appliedMembers.find(
//               (app) =>
//                 String(app.memberId?._id || app.memberId) ===
//                 String(user?.memberId)
//             );
//             return {
//               ...job,
//               applicationStatus: myApp?.status || "Applied",
//               appliedAt: myApp?.appliedAt,
//             };
//           })
//           .slice(0, 5);

//         // Find own member profile name
//         const ownMember = allMembers.find(
//           (m) => String(m._id) === String(user?.memberId)
//         );
//         if (ownMember?.name) setMemberName(ownMember.name);
//         setOwnMember(ownMember || null);

//         const mentors = allMembers
//           .filter((m) => m.memberType?.toLowerCase() === "mentor")
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .slice(0, 5);

//         const latestJobs = allJobs
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .slice(0, 5);

//         setData({
//           recentApplications: myApps,
//           newMentors: mentors,
//           recentJobs: latestJobs,
//         });
//       } catch (err) {
//         console.error("Failed to fetch dashboard data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.memberId) fetchDashboardData();
//     else setLoading(false);
//   }, [user]);

//   if (loading) {
//     return (
//       <div className={styles.loading}>
//         <div className="loader"></div>
//         <p>Loading your dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.page}>
//       <div className={styles.dashboard}>
//       {/* Welcome Header */}
//       <div className={styles.welcomeSection}>
//         <div>
//           {/* Show member profile name if available, else fall back to email prefix */}
//           {(() => {
//             const name = memberName || user?.username?.split("@")[0] || "there";
//             const isNew = location.state?.isNew || (!user?.memberId || user?.profileCompleted === 0);
//             return (
//               <h1>{isNew ? "Welcome" : "Welcome back"}, {name}</h1>
//             );
//           })()}
//           <p>Track your progress and discover new opportunities.</p>
//         </div>
//       </div>

//       {/* ✅ About Job Bridge (Premium 3D Tilt + Float + Parallax) */}
//       <section
//         ref={aboutCardRef}
//         className={styles.aboutCard3D}
//         onMouseMove={handleAboutMouseMove}
//         onMouseLeave={handleAboutMouseLeave}
//       >
//         <div className={styles.aboutGlow} />
//         <div className={styles.aboutShine} />
//         <div className={styles.aboutNoise} />

//         <div className={styles.aboutInner}>
//           <div className={styles.aboutHeaderRow}>
//             <div className={styles.aboutHeaderLeft}>
//               <div className={styles.aboutBadgeIcon3D}>
//                 <TrendingUp size={28} />
//               </div>

//               <div className={styles.aboutHeaderText}>
//                 <h3 className={styles.aboutTitle}>About Job Bridge</h3>
//                 <p className={styles.aboutSub}>
//                   Verified opportunities • mentor-led career support.
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               className={styles.aboutLinkBtn3D}
//               onClick={() => navigate("/jobs")}
//             >
//               Explore <span>→</span>
//             </button>
//           </div>

//           <div className={styles.aboutDescBox3D}>
//             <p className={styles.aboutDesc}>
//               Job Bridge Initiative by Solidarity Youth Movement connects job
//               seekers with{" "}
//               <span className={styles.verifiedText}>verified job providers</span>{" "}
//               through a trusted database. The platform also enables referrals and
//               recommendations to improve access to opportunities.
//             </p>
//           </div>

//           <div className={styles.aboutHighlights3D}>
//             <div className={styles.highlightCardPurple3D}>
//               <div className={styles.highlightIconPurple}>
//                 <CheckCircle2 size={18} />
//               </div>
//               <p className={styles.highlightText}>
//                 Mentor-led guidance: resume improvement, visibility building, and
//                 technical support where needed.
//               </p>
//             </div>

//             <div className={styles.highlightCardBlue3D}>
//               <div className={styles.highlightIconBlue}>
//                 <CheckCircle2 size={18} />
//               </div>
//               <p className={styles.highlightText}>
//                 In specific cases, participants receive upskilling in
//                 employability skills and domain-specific competencies.
//               </p>
//             </div>
//           </div>

//           <div className={styles.aboutActions}>
//             <button
//               type="button"
//               className={styles.aboutPrimaryBtn3D}
//               onClick={() => navigate("/jobs")}
//             >
//               View Jobs <span>→</span>
//             </button>

//             <button
//               type="button"
//               className={styles.aboutSecondaryBtn3D}
//               onClick={() => navigate("/mentors")}
//             >
//               Find Mentors <span>→</span>
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ✅ Profile Completion — driven by actual Detailed Profile fields */}
//       {profileCompletion < 100 && (
//         <section className={`${styles.profileCompletionSection} ${styles.enhancedProfileSection}`}>
//           <div className={styles.premiumGlow} />
//           <div className={styles.premiumShine} />
//           <div className={styles.premiumNoise} />

//           <div className={styles.sectionInnerPad}>
//             <div className={styles.profileHeaderEnhanced}>
//               <div className={styles.profileHeaderLeftEnhanced}>
//                 <div className={styles.checkIconEnhanced}>
//                   <CheckCircle2 strokeWidth={2.5} size={24} />
//                 </div>
//                 <div>
//                   <h3>Complete Your Profile</h3>
//                   <p>Boost your chances of getting noticed by mentors.</p>
//                 </div>
//               </div>
//               <div className={styles.profileHeaderRightEnhanced}>
//                 <span className={styles.percentageDisplayEnhanced}>
//                   {profileCompletion}%
//                 </span>
//               </div>
//             </div>

//             <div className={styles.progressContainerEnhanced}>
//               <div className={styles.progressBarEnhanced}>
//                 <div
//                   className={styles.progressFillEnhanced}
//                   style={{ width: `${profileCompletion}%` }}
//                 />
//               </div>
//             </div>

//             <div className={styles.badgesContainerEnhanced}>
//               {[
//                 { label: 'Photo',        done: !!(ownMember?.photoUrl) },
//                 { label: 'Mobile',       done: !!(ownMember?.mobileNumber) },
//                 { label: 'District',     done: !!(ownMember?.district) },
//                 { label: 'Designation',  done: !!(ownMember?.designation) },
//                 { label: 'Degree',       done: !!(ownMember?.highest_education) },
//                 { label: 'Branch',       done: !!(ownMember?.branch) },
//                 { label: 'Pass-out Yr', done: !!(ownMember?.passOutYear) },
//                 { label: 'Resume',       done: !!(ownMember?.resumeLink) },
//                 { label: 'Desired Role', done: !!(ownMember?.careerProfile?.role) },
//                 { label: 'Industry',     done: !!(ownMember?.careerProfile?.industry) },
//                 { label: 'Skills',       done: (ownMember?.skills?.length > 0) },
//                 { label: 'Experience',   done: !!(ownMember?.workExp) },
//                 { label: 'Father Name',  done: !!(ownMember?.fatherName) },
//                 { label: 'Address',      done: !!(ownMember?.address || ownMember?.hometown) },
//                 { label: 'Languages',    done: (ownMember?.languages?.length > 0) },
//               ].map(({ label, done }) => (
//                 <span
//                   key={label}
//                   className={done ? styles.badgeDoneEnhanced : styles.badgePendingEnhanced}
//                 >
//                   {done ? <CheckCircle2 size={12} strokeWidth={3} /> : <div className={styles.dotPending} />} 
//                   {label}
//                 </span>
//               ))}
//             </div>

//             <div className={styles.actionRowEnhanced}>
//               <button
//                 className={styles.completeButtonEnhanced}
//                 onClick={() => navigate("/member/me")}
//               >
//                 Complete Now <span>→</span>
//               </button>
//             </div>
//           </div>
//         </section>
//       )}

//       <div className={styles.mainGrid}>
//         {/* ✅ Latest Job Opportunities (NOW SAME PREMIUM CARD STYLE) */}
//         <section className={styles.jobSection}>
//           <div className={styles.premiumGlow} />
//           <div className={styles.premiumShine} />
//           <div className={styles.premiumNoise} />

//           <div className={styles.sectionInnerPad}>
//             <div className={styles.sectionHeader}>
//               <div className={styles.headerIcon}>
//                 <Briefcase size={22} />
//               </div>
//               <h2>Latest Job Opportunities</h2>
//               <button
//                 className={styles.viewAllBtn}
//                 onClick={() => navigate("/jobs")}
//               >
//                 View All <span>→</span>
//               </button>
//             </div>

//             <div className={styles.jobsList}>
//               {data.recentJobs.length > 0 ? (
//                 data.recentJobs.map((job) => {
//                   const initials = (
//                     job.title
//                       ?.split(" ")
//                       .slice(0, 2)
//                       .map((w) => w[0])
//                       .join("") || "J"
//                   ).toUpperCase();

//                   const goToDetails = () => navigate(`/jobs/${job._id}`);
//                   const onKey = (e) => {
//                     if (e.key === "Enter" || e.key === " ") {
//                       e.preventDefault();
//                       goToDetails();
//                     }
//                   };

//                   return (
//                     <div
//                       key={job._id}
//                       className={styles.jobCardLarge}
//                       role="button"
//                       tabIndex={0}
//                       onClick={goToDetails}
//                       onKeyDown={onKey}
//                       aria-label={`Open job details for ${job.title || "job"}`}
//                     >
//                       <div className={styles.jobCardHeader}>
//                         <div className={styles.jobCompanyIcon}>{initials}</div>

//                         <div className={styles.jobHeaderInfo}>
//                           <h4>{job.title}</h4>
//                           <p>
//                             <Building size={14} /> {job.companyName}
//                           </p>
//                         </div>

//                         <span className={styles.employmentBadge}>Full-time</span>
//                       </div>

//                       <div className={styles.jobCardMeta}>
//                         <span className={styles.metaItem}>
//                           <MapPin size={14} /> {job.location || "Location TBA"}
//                         </span>
//                         <span className={styles.metaItem}>
//                           <Clock size={14} /> 2 days ago
//                         </span>
//                         <span className={styles.salaryRange}>
//                           {job.salary || "₹10-15 LPA"}
//                         </span>
//                       </div>

//                       <div className={styles.skillsTags}>
//                         {["Java", "Spring Boot", "MySQL"].map((skill, idx) => (
//                           <span key={idx} className={styles.skillTag}>
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className={styles.emptyState}>
//                   <Briefcase size={40} />
//                   <p>No jobs posted recently.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ✅ Recommended Mentors (NOW SAME PREMIUM CARD STYLE) */}
//         <section className={styles.mentorSection}>
//           <div className={styles.premiumGlow} />
//           <div className={styles.premiumShine} />
//           <div className={styles.premiumNoise} />

//           <div className={styles.sectionInnerPad}>
//             <div className={styles.sectionHeader}>
//               <div className={styles.headerIcon}>
//                 <Users size={22} />
//               </div>
//               <h2>Recommended Mentors</h2>
//               <button
//                 className={styles.viewAllBtn}
//                 onClick={() => navigate("/mentors")}
//               >
//                 View All <span>→</span>
//               </button>
//             </div>

//             <div className={styles.mentorsList}>
//               {data.newMentors.length > 0 ? (
//                 data.newMentors.map((mentor) => (
//                   <div 
//                     key={mentor._id} 
//                     className={styles.mentorCardLarge}
//                     onClick={() => navigate(`/mentors/${mentor._id}`)} // Updated to go to premium details
//                     style={{ cursor: 'pointer' }}
//                   >
//                     <div className={styles.mentorAvatarContainer}>
//                       <img
//                         src={mentor.photoUrl || "/default-avatar.png"}
//                         alt={mentor.name}
//                         onError={(e) =>
//                           (e.currentTarget.src = "/members/AnonymousImage.jpg")
//                         }
//                         className={styles.mentorAvatar}
//                       />
//                       <div className={styles.onlineIndicator}></div>
//                     </div>

//                     <div className={styles.mentorInfo}>
//                       <h4>{mentor.name}</h4>
//                       <p>{mentor.designation || "Mentor"}</p>
//                     </div>

//                     <button
//                       className={styles.connectBtn}
//                       onClick={(e) => {
//                         e.stopPropagation(); // Prevents card navigation from firing twice
//                         navigate(`/mentors/${mentor._id}`); // Updated to navigate to mentor-specific route
//                       }}
//                     >
//                       Connect
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <div className={styles.emptyState}>
//                   <Users size={40} />
//                   <p>No mentors available yet</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       </div>
//       </div>
//     </div>
//   );
// };

// export default CandidateDashboard;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase, Users, Clock, MapPin, Building,
  TrendingUp, CheckCircle2, ShieldCheck, GraduationCap,
  ChevronRight, Star, Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import styles from "./CandidateDashboard.module.scss";

// ─── Profile completion calculator ──────────────────────────
const calcCompletion = (m) => {
  if (!m) return 0;
  const has = (v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim().length > 0;
  };
  const checks = [
    has(m.name), has(m.mobileNumber), has(m.gender), has(m.dateOfBirth),
    has(m.photoUrl), has(m.district), has(m.designation), has(m.workExp),
    has(m.careerProfile?.role), has(m.careerProfile?.industry), has(m.skills),
    has(m.resumeLink), has(m.highest_education), has(m.branch), has(m.passOutYear),
    has(m.fatherName), has(m.address || m.hometown), has(m.languages),
    has(m.maritalStatus), has(m.mobileNumber),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

// ─── Mentor carousel dots ───────────────────────────────────
const MentorCarousel = ({ mentors, onNavigate }) => {
  const [idx, setIdx] = useState(0);
  const mentor = mentors[idx] || null;

  return (
    <div className={styles.mentorCarouselWrap}>
      {mentor ? (
        <div
          className={styles.mentorRow}
          onClick={() => onNavigate(`/mentors/${mentor._id}`)}
        >
          <div className={styles.mentorAvatarWrap}>
            <img
              src={mentor.photoUrl || "/members/AnonymousImage.jpg"}
              alt={mentor.name}
              className={styles.mentorAvatar}
              onError={e => (e.currentTarget.src = "/members/AnonymousImage.jpg")}
            />
            <span className={styles.onlineDot} />
          </div>
          <div className={styles.mentorInfo}>
            <h4>{mentor.name}</h4>
            <p>{mentor.designation || "Career Mentor"}</p>
          </div>
          <button
            className={styles.connectBtn}
            onClick={e => { e.stopPropagation(); onNavigate(`/mentors/${mentor._id}`); }}
          >
            Connect
          </button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users size={36} strokeWidth={1.2} />
          <p>No mentors available yet</p>
        </div>
      )}

      {/* Dots */}
      {mentors.length > 1 && (
        <div className={styles.carouselDots}>
          {mentors.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading]     = useState(true);
  const [memberName, setMemberName] = useState("");
  const [ownMember, setOwnMember] = useState(null);
  const [data, setData]           = useState({
    recentApplications: [],
    newMentors: [],
    recentJobs: [],
  });

  const profileCompletion = calcCompletion(ownMember);

  // ── Unified 3D card tilt handler ─────────────────────────
  const rafRef = useRef(null);
  
  const cardRefs = {
    about: useRef(null),
    profile: useRef(null),
    applied: useRef(null),
    completion: useRef(null),
    mentorsMetric: useRef(null),
    jobsMetric: useRef(null),
    jobsList: useRef(null),
    mentorsList: useRef(null),
  };

  const handleCardMouseMove = (e, cardKey) => {
    const el = cardRefs[cardKey]?.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const max = 6; // gentle, premium tilt
      el.style.setProperty("--rx", `${(-(py - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
      el.style.setProperty("--px", `${((px - 0.5) * 16).toFixed(2)}px`);
      el.style.setProperty("--py", `${((py - 0.5) * 16).toFixed(2)}px`);
    });
  };

  const handleCardMouseLeave = (cardKey) => {
    const el = cardRefs[cardKey]?.current;
    if (!el) return;
    ["--rx","--ry"].forEach(k => el.style.setProperty(k, "0deg"));
    ["--mx","--my"].forEach(k => el.style.setProperty(k, "50%"));
    ["--px","--py"].forEach(k => el.style.setProperty(k, "0px"));
  };

  // ── Data fetch ───────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [jobsRes, membersRes] = await Promise.all([
          API.get("/service"),
          API.get("/member"),
        ]);
        const allJobs    = jobsRes.data.data || [];
        const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

        const myApps = allJobs
          .filter(job => job.appliedMembers?.some(
            app => String(app.memberId?._id || app.memberId) === String(user?.memberId)
          ))
          .map(job => {
            const myApp = job.appliedMembers.find(
              app => String(app.memberId?._id || app.memberId) === String(user?.memberId)
            );
            return { ...job, applicationStatus: myApp?.status || "Applied", appliedAt: myApp?.appliedAt };
          })
          .slice(0, 5);

        const own = allMembers.find(m => String(m._id) === String(user?.memberId));
        if (own?.name) setMemberName(own.name);
        setOwnMember(own || null);

        const mentors = allMembers
          .filter(m => m.memberType?.toLowerCase() === "mentor")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const latestJobs = allJobs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setData({ recentApplications: myApps, newMentors: mentors, recentJobs: latestJobs });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.memberId) fetchDashboardData();
    else setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinnerRing} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const name  = memberName || user?.username?.split("@")[0] || "there";
  const isNew = location.state?.isNew || (!user?.memberId || user?.profileCompleted === 0);

  // Profile badge fields
  const badgeFields = [
    { label: "Photo",        done: !!(ownMember?.photoUrl) },
    { label: "Mobile",       done: !!(ownMember?.mobileNumber) },
    { label: "District",     done: !!(ownMember?.district) },
    { label: "Designation",  done: !!(ownMember?.designation) },
    { label: "Degree",       done: !!(ownMember?.highest_education) },
    { label: "Branch",       done: !!(ownMember?.branch) },
    { label: "Pass-out Yr",  done: !!(ownMember?.passOutYear) },
    { label: "Resume",       done: !!(ownMember?.resumeLink) },
    { label: "Preferred Job Role", done: !!(ownMember?.careerProfile?.role) },
    { label: "Industry",     done: !!(ownMember?.careerProfile?.industry) },
    { label: "Skills",       done: (ownMember?.skills?.length > 0) },
    { label: "Experience",   done: !!(ownMember?.workExp) },
    { label: "Father Name",  done: !!(ownMember?.fatherName) },
    { label: "Address",      done: !!(ownMember?.address || ownMember?.hometown) },
    { label: "Languages",    done: (ownMember?.languages?.length > 0) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>

        {/* ── WELCOME BANNER ─────────────────────────────── */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerGlow1} />
          <div className={styles.bannerGlow2} />
          
          <div className={styles.welcomeText}>
            <h1>
              {isNew ? "Welcome" : "Welcome back"}, {name} <span>👋</span>
            </h1>
            <p>Track your progress and discover new opportunities.</p>
          </div>

          
          <div className={styles.welcomeIllustration} aria-hidden="true">
            <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.illustSvg}>
              {/* chart bars */}
              <rect x="60" y="90" width="18" height="50" rx="4" fill="#fecdd3" opacity="0.7"/>
              <rect x="84" y="70" width="18" height="70" rx="4" fill="#f43f5e" opacity="0.6"/>
              <rect x="108" y="50" width="18" height="90" rx="4" fill="#e11d48" opacity="0.8"/>
              <rect x="132" y="75" width="18" height="65" rx="4" fill="#fca5a5" opacity="0.6"/>
              {/* screen frame */}
              <rect x="40" y="30" width="140" height="110" rx="10" stroke="#fca5a5" strokeWidth="2" fill="none" opacity="0.4"/>
              {/* person silhouette */}
              <circle cx="32" cy="100" r="14" fill="#fecdd3" opacity="0.7"/>
              <rect x="24" y="114" width="16" height="26" rx="6" fill="#fecdd3" opacity="0.5"/>
              {/* dots decoration */}
              <circle cx="170" cy="40" r="4" fill="#fca5a5" opacity="0.5"/>
              <circle cx="185" cy="55" r="3" fill="#f43f5e" opacity="0.4"/>
              <circle cx="50" cy="155" r="5" fill="#fecdd3" opacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* ── METRICS GRID ROW ───────────────────────────── */}
        <div className={styles.metricsGrid}>
          {/* Card 1: Applied Jobs */}
          <div
            ref={cardRefs.applied}
            className={`${styles.metricCard} ${styles.themeRose}`}
            onMouseMove={(e) => handleCardMouseMove(e, "applied")}
            onMouseLeave={() => handleCardMouseLeave("applied")}
            onClick={() => navigate("/jobs")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />
            <div className={styles.cardInner}>
              <div className={styles.metricTopRow}>
                <div className={styles.metricInfo}>
                  <span>Applied Jobs</span>
                  <h3>{data.recentApplications.length}</h3>
                </div>
                <div className={styles.metricIconCircle}>
                  <Briefcase size={18} />
                </div>
              </div>
              <div className={styles.metricFooter}>
                <span>View your submissions</span> <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2: Profile Completion */}
          <div
            ref={cardRefs.completion}
            className={`${styles.metricCard} ${styles.themeEmerald}`}
            onMouseMove={(e) => handleCardMouseMove(e, "completion")}
            onMouseLeave={() => handleCardMouseLeave("completion")}
            onClick={() => navigate("/member/me")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />
            <div className={styles.cardInner}>
              <div className={styles.metricTopRow}>
                <div className={styles.metricInfo}>
                  <span>Profile Completion</span>
                  <h3>{profileCompletion}%</h3>
                </div>
                <div className={styles.metricIconCircle}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className={styles.metricFooter}>
                <span>Boost your score</span> <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3: Connected Mentors */}
          <div
            ref={cardRefs.mentorsMetric}
            className={`${styles.metricCard} ${styles.themeIndigo}`}
            onMouseMove={(e) => handleCardMouseMove(e, "mentorsMetric")}
            onMouseLeave={() => handleCardMouseLeave("mentorsMetric")}
            onClick={() => navigate("/mentors")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />
            <div className={styles.cardInner}>
              <div className={styles.metricTopRow}>
                <div className={styles.metricInfo}>
                  <span>Available Mentors</span>
                  <h3>{data.newMentors.length}</h3>
                </div>
                <div className={styles.metricIconCircle}>
                  <Users size={18} />
                </div>
              </div>
              <div className={styles.metricFooter}>
                <span>Get career support</span> <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 4: Latest Opportunities */}
          <div
            ref={cardRefs.jobsMetric}
            className={`${styles.metricCard} ${styles.themeAmber}`}
            onMouseMove={(e) => handleCardMouseMove(e, "jobsMetric")}
            onMouseLeave={() => handleCardMouseLeave("jobsMetric")}
            onClick={() => navigate("/jobs")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />
            <div className={styles.cardInner}>
              <div className={styles.metricTopRow}>
                <div className={styles.metricInfo}>
                  <span>Latest Jobs</span>
                  <h3>{data.recentJobs.length}</h3>
                </div>
                <div className={styles.metricIconCircle}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className={styles.metricFooter}>
                <span>Explore new postings</span> <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* ── TOP GRID: About + Profile ──────────────────── */}
        <div className={styles.topGrid}>

          {/* About Job Bridge */}
          <section
            ref={cardRefs.about}
            className={styles.aboutCard}
            onMouseMove={(e) => handleCardMouseMove(e, "about")}
            onMouseLeave={() => handleCardMouseLeave("about")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />

            <div className={styles.cardInner}>
              <div className={styles.aboutTopRow}>
                <div className={styles.aboutTitleGroup}>
                  <div className={styles.aboutIconBox}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h2 className={styles.aboutTitle}>About Job Bridge Node</h2>
                    <p className={styles.aboutSub}>Verified opportunities • Mentor-led career support.</p>
                  </div>
                </div>
                <button className={styles.exploreBtn} onClick={() => navigate("/jobs")}>
                  Explore More →
                </button>
              </div>

              {/* Info rows */}
              <div className={styles.aboutInfoList}>
                <div className={styles.aboutInfoRow}>
                  <div className={styles.aboutInfoIcon} style={{ background: "rgba(225, 29, 72, 0.08)", color: "#e11d48" }}>
                    <ShieldCheck size={16} />
                  </div>
                  <p>
                    Job Bridge Initiative by Solidarity Youth Movement connects job seekers with{" "}
                    <span className={styles.redBold}>verified job providers</span>{" "}
                    through a trusted database. The platform also enables referrals and recommendations
                    to improve access to opportunities.
                  </p>
                </div>
                <div className={styles.aboutInfoRow}>
                  <div className={styles.aboutInfoIcon} style={{ background: "rgba(249, 115, 22, 0.08)", color: "#f97316" }}>
                    <Users size={16} />
                  </div>
                  <p>
                    Mentor-led guidance: resume improvement, visibility building, and technical support
                    where needed.
                  </p>
                </div>
                <div className={styles.aboutInfoRow}>
                  <div className={styles.aboutInfoIcon} style={{ background: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6" }}>
                    <GraduationCap size={16} />
                  </div>
                  <p>
                    In specific cases, participants receive upskilling in employability skills and
                    domain-specific competencies.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className={styles.aboutActions}>
                <button className={styles.primaryBtn} onClick={() => navigate("/jobs")}>
                  <Briefcase size={15} /> View Jobs →
                </button>
                <button className={styles.secondaryBtn} onClick={() => navigate("/mentors")}>
                  <Users size={15} /> Find Mentors →
                </button>
              </div>
            </div>
          </section>

          {/* Profile Completion */}
          <section
            ref={cardRefs.profile}
            className={styles.profileCard}
            onMouseMove={(e) => handleCardMouseMove(e, "profile")}
            onMouseLeave={() => handleCardMouseLeave("profile")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />

            <div className={styles.cardInner}>
              <div className={styles.profileTopRow}>
                <div className={styles.profileTitleGroup}>
                  <div className={styles.profileIconBox}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h2 className={styles.profileTitle}>Complete Your Profile</h2>
                    <p className={styles.profileSub}>Boost your chances of getting noticed by mentors.</p>
                  </div>
                </div>
                <span className={styles.percentDisplay}>{profileCompletion}%</span>
              </div>

              {/* Progress bar */}
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              {/* Badge chips */}
              <div className={styles.badgeGrid}>
                {badgeFields.map(({ label, done }) => (
                  <span
                    key={label}
                    className={done ? styles.badgeDone : styles.badgePending}
                  >
                    {done
                      ? <CheckCircle2 size={11} strokeWidth={3} />
                      : <span className={styles.dotCircle} />
                    }
                    {label}
                  </span>
                ))}
              </div>

              <button
                className={styles.completeNowBtn}
                onClick={() => navigate("/member/me")}
              >
                Complete Now →
              </button>
            </div>
          </section>
        </div>

        {/* ── BOTTOM GRID: Jobs + Mentors ────────────────── */}
        <div className={styles.bottomGrid}>

          {/* Latest Job Opportunities */}
          <section
            ref={cardRefs.jobsList}
            className={styles.jobsCard}
            onMouseMove={(e) => handleCardMouseMove(e, "jobsList")}
            onMouseLeave={() => handleCardMouseLeave("jobsList")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />

            <div className={styles.cardInner}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox} style={{ background: "rgba(225, 29, 72, 0.08)", color: "#e11d48" }}>
                  <Briefcase size={18} />
                </div>
                <h2 className={styles.sectionTitle}>Latest Job Opportunities</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate("/jobs")}>
                  View All →
                </button>
              </div>

              <div className={styles.jobList}>
                {data.recentJobs.length > 0 ? (
                  data.recentJobs.map(job => {
                    const initials = (
                      job.title?.split(" ").slice(0, 2).map(w => w[0]).join("") || "J"
                    ).toUpperCase();
                    return (
                      <div
                        key={job._id}
                        className={styles.jobRow}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && navigate(`/jobs/${job._id}`)}
                      >
                        <div className={styles.jobAvatar}>{initials}</div>
                        <div className={styles.jobInfo}>
                          <h4>{job.title}</h4>
                          <p><Building size={12}/> {job.companyName}</p>
                        </div>
                        <div className={styles.jobMeta}>
                          {job.location && <span><MapPin size={12}/> {job.location}</span>}
                          {job.salary && <span className={styles.salary}>{job.salary}</span>}
                          {job.createdAt && !isNaN(new Date(job.createdAt)) && (
                            <span>
                              <Clock size={12} />
                              {new Date(job.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          )}
                        </div>
                        <span className={styles.jobTypeBadge}>
                          {job.employmentType || "Full-time"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrap}>
                      <Briefcase size={38} strokeWidth={1.2}/>
                    </div>
                    <p className={styles.emptyTitle}>No jobs posted recently.</p>
                    <p className={styles.emptySub}>Check back later for new opportunities!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recommended Mentors */}
          <section
            ref={cardRefs.mentorsList}
            className={styles.mentorsCard}
            onMouseMove={(e) => handleCardMouseMove(e, "mentorsList")}
            onMouseLeave={() => handleCardMouseLeave("mentorsList")}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />
            <div className={styles.premiumNoise} />

            <div className={styles.cardInner}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconBox} style={{ background: "rgba(225, 29, 72, 0.08)", color: "#e11d48" }}>
                  <Users size={18} />
                </div>
                <h2 className={styles.sectionTitle}>Recommended Mentors</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate("/mentors")}>
                  View All →
                </button>
              </div>

              <MentorCarousel mentors={data.newMentors} onNavigate={navigate} />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default CandidateDashboard;