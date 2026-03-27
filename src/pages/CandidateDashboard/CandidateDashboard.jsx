import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase,
  Users,
  Clock,
  MapPin,
  Building,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import styles from "./CandidateDashboard.module.scss";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState("");
  const [data, setData] = useState({
    recentApplications: [],
    newMentors: [],
    recentJobs: [],
  });

  // ✅ 3D tilt refs (ONLY for About card)
  const aboutCardRef = useRef(null);
  const rafRef = useRef(null);

  const handleAboutMouseMove = (e) => {
    const el = aboutCardRef.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = x / rect.width;
      const py = y / rect.height;

      // stronger premium tilt
      const max = 10;
      const ry = (px - 0.5) * (max * 2);
      const rx = -(py - 0.5) * (max * 2);

      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);

      // ✅ parallax for inner layers (-12..12)
      const dx = (px - 0.5) * 24;
      const dy = (py - 0.5) * 24;
      el.style.setProperty("--px", `${dx.toFixed(2)}px`);
      el.style.setProperty("--py", `${dy.toFixed(2)}px`);
    });
  };

  const handleAboutMouseLeave = () => {
    const el = aboutCardRef.current;
    if (!el) return;

    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `50%`);
    el.style.setProperty("--px", `0px`);
    el.style.setProperty("--py", `0px`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [jobsRes, membersRes] = await Promise.all([
          API.get("/service"),
          API.get("/member"),
        ]);

        const allJobs = jobsRes.data.data || [];
        const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

        const myApps = allJobs
          .filter((job) =>
            job.appliedMembers?.some(
              (app) =>
                String(app.memberId?._id || app.memberId) ===
                String(user?.memberId)
            )
          )
          .map((job) => {
            const myApp = job.appliedMembers.find(
              (app) =>
                String(app.memberId?._id || app.memberId) ===
                String(user?.memberId)
            );
            return {
              ...job,
              applicationStatus: myApp?.status || "Applied",
              appliedAt: myApp?.appliedAt,
            };
          })
          .slice(0, 5);

        // Find own member profile name
        const ownMember = allMembers.find(
          (m) => String(m._id) === String(user?.memberId)
        );
        if (ownMember?.name) setMemberName(ownMember.name);

        const mentors = allMembers
          .filter((m) => m.memberType?.toLowerCase() === "mentor")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const latestJobs = allJobs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setData({
          recentApplications: myApps,
          newMentors: mentors,
          recentJobs: latestJobs,
        });
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
      <div className={styles.loading}>
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div>
          {/* Show member profile name if available, else fall back to email prefix */}
          {(() => {
            const name = memberName || user?.username?.split("@")[0] || "there";
            const isNew = location.state?.isNew || (!user?.memberId || user?.profileCompleted === 0);
            return (
              <h1>{isNew ? "Welcome" : "Welcome back"}, {name}</h1>
            );
          })()}
          <p>Track your progress and discover new opportunities.</p>
        </div>
      </div>

      {/* ✅ About Job Bridge (Premium 3D Tilt + Float + Parallax) */}
      <section
        ref={aboutCardRef}
        className={styles.aboutCard3D}
        onMouseMove={handleAboutMouseMove}
        onMouseLeave={handleAboutMouseLeave}
      >
        <div className={styles.aboutGlow} />
        <div className={styles.aboutShine} />
        <div className={styles.aboutNoise} />

        <div className={styles.aboutInner}>
          <div className={styles.aboutHeaderRow}>
            <div className={styles.aboutHeaderLeft}>
              <div className={styles.aboutBadgeIcon3D}>
                <TrendingUp size={28} />
              </div>

              <div className={styles.aboutHeaderText}>
                <h3 className={styles.aboutTitle}>About Job Bridge</h3>
                <p className={styles.aboutSub}>
                  Verified opportunities • mentor-led career support.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.aboutLinkBtn3D}
              onClick={() => navigate("/jobs")}
            >
              Explore <span>→</span>
            </button>
          </div>

          <div className={styles.aboutDescBox3D}>
            <p className={styles.aboutDesc}>
              Job Bridge Initiative by Solidarity Youth Movement connects job
              seekers with{" "}
              <span className={styles.verifiedText}>verified job providers</span>{" "}
              through a trusted database. The platform also enables referrals and
              recommendations to improve access to opportunities.
            </p>
          </div>

          <div className={styles.aboutHighlights3D}>
            <div className={styles.highlightCardPurple3D}>
              <div className={styles.highlightIconPurple}>
                <CheckCircle2 size={18} />
              </div>
              <p className={styles.highlightText}>
                Mentor-led guidance: resume improvement, visibility building, and
                technical support where needed.
              </p>
            </div>

            <div className={styles.highlightCardBlue3D}>
              <div className={styles.highlightIconBlue}>
                <CheckCircle2 size={18} />
              </div>
              <p className={styles.highlightText}>
                In specific cases, participants receive upskilling in
                employability skills and domain-specific competencies.
              </p>
            </div>
          </div>

          <div className={styles.aboutActions}>
            <button
              type="button"
              className={styles.aboutPrimaryBtn3D}
              onClick={() => navigate("/jobs")}
            >
              View Jobs <span>→</span>
            </button>

            <button
              type="button"
              className={styles.aboutSecondaryBtn3D}
              onClick={() => navigate("/mentors")}
            >
              Find Mentors <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ✅ Profile Completion (NOW SAME PREMIUM CARD STYLE) */}
      {user?.profileCompleted < 100 && (
        <section className={styles.profileCompletionSection}>
          <div className={styles.premiumGlow} />
          <div className={styles.premiumShine} />
          <div className={styles.premiumNoise} />

          <div className={styles.sectionInnerPad}>
            <div className={styles.profileHeader}>
              <div className={styles.profileHeaderLeft}>
                <div className={styles.checkIcon}>✓</div>
                <div>
                  <h3>Complete Your Profile</h3>
                  <p>Boost your chances of getting noticed by mentors.</p>
                </div>
              </div>

              <div className={styles.percentageDisplay}>
                {user?.profileCompleted}%
              </div>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${user?.profileCompleted}%` }}
              />
            </div>

            <button
              className={styles.completeButton}
              onClick={() => navigate("/member/me")}
            >
              Complete Now <span>→</span>
            </button>
          </div>
        </section>
      )}

      <div className={styles.mainGrid}>
        {/* ✅ Latest Job Opportunities (NOW SAME PREMIUM CARD STYLE) */}
        <section className={styles.jobSection}>
          <div className={styles.premiumGlow} />
          <div className={styles.premiumShine} />
          <div className={styles.premiumNoise} />

          <div className={styles.sectionInnerPad}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerIcon}>
                <Briefcase size={22} />
              </div>
              <h2>Latest Job Opportunities</h2>
              <button
                className={styles.viewAllBtn}
                onClick={() => navigate("/jobs")}
              >
                View All <span>→</span>
              </button>
            </div>

            <div className={styles.jobsList}>
              {data.recentJobs.length > 0 ? (
                data.recentJobs.map((job) => {
                  const initials = (
                    job.title
                      ?.split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("") || "J"
                  ).toUpperCase();

                  const goToDetails = () => navigate(`/jobs/${job._id}`);
                  const onKey = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToDetails();
                    }
                  };

                  return (
                    <div
                      key={job._id}
                      className={styles.jobCardLarge}
                      role="button"
                      tabIndex={0}
                      onClick={goToDetails}
                      onKeyDown={onKey}
                      aria-label={`Open job details for ${job.title || "job"}`}
                    >
                      <div className={styles.jobCardHeader}>
                        <div className={styles.jobCompanyIcon}>{initials}</div>

                        <div className={styles.jobHeaderInfo}>
                          <h4>{job.title}</h4>
                          <p>
                            <Building size={14} /> {job.companyName}
                          </p>
                        </div>

                        <span className={styles.employmentBadge}>Full-time</span>
                      </div>

                      <div className={styles.jobCardMeta}>
                        <span className={styles.metaItem}>
                          <MapPin size={14} /> {job.location || "Location TBA"}
                        </span>
                        <span className={styles.metaItem}>
                          <Clock size={14} /> 2 days ago
                        </span>
                        <span className={styles.salaryRange}>
                          {job.salary || "₹10-15 LPA"}
                        </span>
                      </div>

                      <div className={styles.skillsTags}>
                        {["Java", "Spring Boot", "MySQL"].map((skill, idx) => (
                          <span key={idx} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <Briefcase size={40} />
                  <p>No jobs posted recently.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ✅ Recommended Mentors (NOW SAME PREMIUM CARD STYLE) */}
        <section className={styles.mentorSection}>
          <div className={styles.premiumGlow} />
          <div className={styles.premiumShine} />
          <div className={styles.premiumNoise} />

          <div className={styles.sectionInnerPad}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerIcon}>
                <Users size={22} />
              </div>
              <h2>Recommended Mentors</h2>
              <button
                className={styles.viewAllBtn}
                onClick={() => navigate("/mentors")}
              >
                View All <span>→</span>
              </button>
            </div>

            <div className={styles.mentorsList}>
              {data.newMentors.length > 0 ? (
                data.newMentors.map((mentor) => (
                  <div 
                    key={mentor._id} 
                    className={styles.mentorCardLarge}
                    onClick={() => navigate(`/mentors/${mentor._id}`)} // Updated to go to premium details
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.mentorAvatarContainer}>
                      <img
                        src={mentor.photoUrl || "/default-avatar.png"}
                        alt={mentor.name}
                        onError={(e) =>
                          (e.currentTarget.src = "/members/AnonymousImage.jpg")
                        }
                        className={styles.mentorAvatar}
                      />
                      <div className={styles.onlineIndicator}></div>
                    </div>

                    <div className={styles.mentorInfo}>
                      <h4>{mentor.name}</h4>
                      <p>{mentor.designation || "Mentor"}</p>
                    </div>

                    <button
                      className={styles.connectBtn}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents card navigation from firing twice
                        navigate(`/mentors/${mentor._id}`); // Updated to navigate to mentor-specific route
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <Users size={40} />
                  <p>No mentors available yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;