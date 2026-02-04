import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Users, FileText, ChevronRight, Clock, MapPin, Building, GraduationCap } from "lucide-react";
import styles from "./CandidateDashboard.module.scss";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentApplications: [],
    newMentors: [],
    recentJobs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch All data in parallel
        const [jobsRes, membersRes] = await Promise.all([
          API.get("/service"),
          API.get("/member")
        ]);

        const allJobs = jobsRes.data.data || [];
        const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

        // 1. Recent Applications (Jobs this user applied to)
        const myApps = allJobs.filter(job =>
          job.appliedMembers?.some(app =>
            String(app.memberId?._id || app.memberId) === String(user?.memberId)
          )
        ).map(job => {
          const myApp = job.appliedMembers.find(app =>
            String(app.memberId?._id || app.memberId) === String(user?.memberId)
          );
          return {
            ...job,
            applicationStatus: myApp?.status || 'Applied',
            appliedAt: myApp?.appliedAt
          };
        }).slice(0, 5);

        // 2. New Mentors (Latest joined mentors)
        const mentors = allMembers
          .filter(m => m.memberType?.toLowerCase() === 'mentor')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // 3. Recent Job Posts
        const latestJobs = allJobs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setData({
          recentApplications: myApps,
          newMentors: mentors,
          recentJobs: latestJobs
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.memberId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Welcome back, {user?.username?.split('@')[0]}!</h1>
          <p>Track your progress and discover new opportunities.</p>
        </div>
        {user?.profileCompleted < 100 && (
          <div className={styles.profileAlert} onClick={() => navigate('/member/me')}>
            <div className={styles.progressCircle} style={{ '--progress': `${user?.profileCompleted}%` }}>
              <span>{user?.profileCompleted}%</span>
            </div>
            <div className={styles.alertText}>
              <h3>Complete Your Profile</h3>
              <p>Boost your chances of getting noticed by mentors.</p>
            </div>
            <ChevronRight size={20} />
          </div>
        )}
      </header>

      <div className={styles.grid}>
        {/* 1. Recent Applications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleIcon}><Clock size={20} /></div>
            <h2>Your Applications</h2>
            <button onClick={() => navigate('/jobs')}>View All</button>
          </div>
          <div className={styles.cardList}>
            {data.recentApplications.length > 0 ? data.recentApplications.map(job => (
              <div key={job._id} className={styles.miniCard} onClick={() => navigate(`/jobs/${job._id}`)}>
                <div className={styles.cardInfo}>
                  <h4>{job.title}</h4>
                  <p>{job.companyName}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[job.applicationStatus?.toLowerCase()]}`}>
                  {job.applicationStatus}
                </span>
              </div>
            )) : (
              <div className={styles.empty}>
                <Briefcase size={40} />
                <p>No applications yet</p>
                <button onClick={() => navigate('/jobs')}>Browse Jobs</button>
              </div>
            )}
          </div>
        </section>

        {/* 2. New Mentors */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleIcon}><Users size={20} /></div>
            <h2>Recommended Mentors</h2>
            <button onClick={() => navigate('/mentors')}>View All</button>
          </div>
          <div className={styles.mentorGrid}>
            {data.newMentors.length > 0 ? data.newMentors.map(mentor => (
              <div key={mentor._id} className={styles.mentorMiniCard} onClick={() => navigate(`/member/${mentor._id}`)}>
                <img src={mentor.photoUrl || "/default-avatar.png"} alt={mentor.name} onError={(e) => e.target.src = "/members/AnonymousImage.jpg"} />
                <h4>{mentor.name}</h4>
                <p>{mentor.designation || 'Mentor'}</p>
              </div>
            )) : (
              <div className={styles.empty}>
                <Users size={40} />
                <p>Stay tuned for new mentors</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Recent Job Posts */}
        <section className={`${styles.section} ${styles.fullWidth}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleIcon}><FileText size={20} /></div>
            <h2>Latest Job Opportunities</h2>
            <button onClick={() => navigate('/jobs')}>View All Jobs</button>
          </div>
          <div className={styles.jobTable}>
            {data.recentJobs.length > 0 ? data.recentJobs.map(job => (
              <div key={job._id} className={styles.jobRow} onClick={() => navigate(`/jobs/${job._id}`)}>
                <div className={styles.jobMain}>
                  <div className={styles.jobIcon}><Building size={16} /></div>
                  <div className={styles.jobInfo}>
                    <h4>{job.title}</h4>
                    <p>{job.companyName} • {job.location}</p>
                  </div>
                </div>
                <div className={styles.jobMeta}>
                  <span><GraduationCap size={14} /> {job.education}</span>
                  <span><MapPin size={14} /> {job.employmentType}</span>
                </div>
                <ChevronRight size={18} className={styles.arrow} />
              </div>
            )) : (
              <p className={styles.emptyText}>No jobs posted recently.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CandidateDashboard;
