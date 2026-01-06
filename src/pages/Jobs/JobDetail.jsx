import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./JobDetail.module.scss"; 
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Briefcase, Award, CheckCircle, UserCheck, Filter, Star, Zap, Users, FileText } from 'lucide-react';

// --- HELPERS ---
const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  let fileId = null;
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];
  if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
  if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) { fileId = driveUrl; }
  if (!fileId) return driveUrl;
  return `https://drive.google.com/thumbnail?id=${fileId}`;
};

const parseExperience = (expString) => {
  if (!expString) return 0;
  if (typeof expString === 'number') return expString;
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
};

const tokenize = (str) => {
  if (!str) return [];
  return str.toLowerCase().split(/[,/ ]+/).filter(s => s.length > 0);
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Context Data
  const { jobContext, memberContext } = useData(); 
  const { user } = useAuth();
  
  // Tabs State: 'matches' or 'applicants'
  const [activeTab, setActiveTab] = useState('matches'); 
  
  // Data States
  const [scoredCandidates, setScoredCandidates] = useState([]);
  const [applicantCandidates, setApplicantCandidates] = useState([]);
  const [filterType, setFilterType] = useState('best'); // 'all', 'good', 'best'

  // 1. Fetch Job
  useEffect(() => {
    if (jobContext.length > 0) {
      const foundJob = jobContext.find(j => j._id === id);
      setJob(foundJob || null);
      setLoading(false);
    }
  }, [jobContext, id]);

  // 2. Process Data (Matches & Applicants)
  useEffect(() => {
    if (job && memberContext && memberContext.length > 0) {
      processCandidates();
    }
  }, [job, memberContext]);

  const processCandidates = () => {
    if (!job) return;

    // --- A. PREPARE JOB DATA ---
    const jobRoleTokens = tokenize(job.role);
    const jobSkills = job.keySkills ? job.keySkills.split(',').map(s => s.trim().toLowerCase()) : [];
    const jobMinExp = parseExperience(job.experience);

    // --- B. PREPARE APPLICANT MAP (for fast lookup) ---
    // Create a Map: MemberID -> Application Details (status, date)
    const applicantMap = new Map();
    if (job.appliedMembers) {
      job.appliedMembers.forEach(app => {
        const mId = typeof app.memberId === 'object' ? app.memberId._id : app.memberId;
        applicantMap.set(String(mId), {
            status: app.status || 'Applied',
            date: app.appliedAt,
            appId: app._id
        });
      });
    }

    // --- C. SCORE EVERY MEMBER ---
    const allProcessedMembers = memberContext.map(member => {
      let totalScore = 0;
      const appData = applicantMap.get(String(member._id));
      const isApplied = !!appData;
      
      let breakdown = { role: false, exp: false, skillCount: 0 };

      // 1. Role Match
      const memberProfTokens = tokenize(member.profession);
      const hasRoleMatch = jobRoleTokens.some(jt => memberProfTokens.includes(jt));
      if (hasRoleMatch) { totalScore += 30; breakdown.role = true; }

      // 2. Exp Match
      const memberExp = parseExperience(member.experience);
      if (memberExp >= jobMinExp) { totalScore += 20; breakdown.exp = true; }
      else if (jobMinExp > 0 && memberExp >= (jobMinExp - 1)) { totalScore += 10; }

      // 3. Skills Match
      let memberSkillString = "";
      if (Array.isArray(member.forGrouping)) memberSkillString = member.forGrouping.join(' ');
      else if (Array.isArray(member.skills)) memberSkillString = member.skills.join(' ');
      else if (typeof member.skills === 'string') memberSkillString = member.skills;

      const candidateSkillTokens = tokenize(memberSkillString);
      const matchedSkills = jobSkills.filter(js => candidateSkillTokens.some(cs => cs.includes(js) || js.includes(cs)));
      
      if (jobSkills.length > 0) {
        const skillPoints = Math.round((matchedSkills.length / jobSkills.length) * 50); 
        totalScore += skillPoints;
        breakdown.skillCount = matchedSkills.length;
      }

      return {
        ...member,
        matchScore: Math.min(totalScore, 100),
        matchedSkills,
        matchBreakdown: breakdown,
        isApplied,
        applicationData: appData // Attach application details if exist
      };
    });

    // --- D. SEPARATE LISTS ---
    
    // List 1: AI Matches (Sorted by Score)
    const matches = [...allProcessedMembers].sort((a, b) => b.matchScore - a.matchScore);
    setScoredCandidates(matches);

    // List 2: Applicants (Filtered by isApplied, Sorted by Date/Status)
    const applicants = allProcessedMembers.filter(m => m.isApplied);
    // Sort applicants: Newest first? Or highest score? Let's do Score for now.
    applicants.sort((a, b) => b.matchScore - a.matchScore);
    setApplicantCandidates(applicants);
  };

  // --- FILTER DISPLAY LOGIC ---
  const displayCandidates = useMemo(() => {
    if (activeTab === 'applicants') {
        return applicantCandidates; // Show all applicants regardless of score
    } else {
        // Matches Tab Filtering
        return scoredCandidates.filter(c => {
            if (filterType === 'best') return c.matchScore >= 60;
            if (filterType === 'good') return c.matchScore >= 40;
            return c.matchScore > 0;
        });
    }
  }, [scoredCandidates, applicantCandidates, activeTab, filterType]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a'; 
    if (score >= 60) return '#2563eb'; 
    if (score >= 40) return '#ca8a04'; 
    return '#dc2626'; 
  };

  const getStatusColor = (status) => {
     switch(status) {
         case 'Shortlisted': return '#ca8a04';
         case 'Accepted': return '#16a34a';
         case 'Rejected': return '#dc2626';
         default: return '#2563eb';
     }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading...</div>;
  if (!job) return <div className={styles.container}>Job not found</div>;

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>{job?.title}</h1>
        <p className={styles.date}>Posted on {job?.createdAt ? new Date(job.createdAt).toDateString() : 'N/A'}</p>
      </div>

      <div className={styles.jobCard}>
          <div className={styles.gridInfo}>
            <div className={styles.field}><strong>Company:</strong> {job.companyName}</div>
            <div className={styles.field}><strong>Location:</strong> {job.location}</div>
            <div className={styles.field}><strong>Role:</strong> {job.role}</div>
            <div className={styles.field}><strong>Experience:</strong> {job.experience}</div>
            <div className={styles.field}><strong>Salary:</strong> {job.salary}</div>
          </div>
          {job?.keySkills && (
            <div className={styles.skillsWrapper}>
              <span className={styles.label}>Required Skills:</span>
              {job.keySkills.split(',').map((skill, i) => (
                 <span key={i} className={styles.skillBadge}>{skill.trim()}</span>
              ))}
            </div>
          )}
          <div className={styles.description}>{job.description}</div>
      </div>

      {/* --- ADMIN SECTION: TABS --- */}
      {user?.role === "Admin" && (
        <div>
           {/* TAB NAVIGATION */}
           <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'matches' ? styles.active : ''}`}
                onClick={() => setActiveTab('matches')}
              >
                <Zap size={18} />
                AI Matches
                <span className={styles.countBadge}>{scoredCandidates.filter(c => c.matchScore > 0).length}</span>
              </button>
              
              <button 
                className={`${styles.tabButton} ${activeTab === 'applicants' ? styles.active : ''}`}
                onClick={() => setActiveTab('applicants')}
              >
                <Users size={18} />
                Applicants
                <span className={styles.countBadge}>{applicantCandidates.length}</span>
              </button>
           </div>

           {/* FILTER BAR (Only for Matches Tab) */}
           {activeTab === 'matches' && (
             <div className={styles.filterBar}>
                <div style={{color:'#64748b', fontSize:'0.9rem'}}>
                    Showing candidates based on profile compatibility.
                </div>
                <div className={styles.filterGroup}>
                   <button onClick={() => setFilterType('best')} className={filterType === 'best' ? styles.activeFilter : ''}>
                     <Star size={14} /> Best (60%+)
                   </button>
                   <button onClick={() => setFilterType('good')} className={filterType === 'good' ? styles.activeFilter : ''}>
                     Good (40%+)
                   </button>
                   <button onClick={() => setFilterType('all')} className={filterType === 'all' ? styles.activeFilter : ''}>
                     All
                   </button>
                </div>
             </div>
           )}

           {/* GRID DISPLAY */}
           <div className={styles.candidateGrid}>
              {displayCandidates.map((member) => (
                <div 
                  key={member._id} 
                  className={styles.candidateCard} 
                  onClick={() => navigate(`/member/${member._id}`)}
                >
                  {/* Applied Badge (Visible in Matches tab if they applied) */}
                  {member.isApplied && activeTab === 'matches' && (
                     <div className={styles.appliedFlag}>APPLIED</div>
                  )}

                  {/* Header */}
                  <div className={styles.cardHeader}>
                     <img 
                       src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} 
                       alt={member.name}
                       className={styles.avatar}
                       onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                     />
                     <div className={styles.info}>
                        <h3>{member.name}</h3>
                        <p><Briefcase size={12} /> {member.profession || "N/A"}</p>
                     </div>
                     
                     {/* Score Ring */}
                     <div className={styles.scoreRing} style={{ borderColor: getScoreColor(member.matchScore), color: getScoreColor(member.matchScore) }}>
                        {member.matchScore}%
                     </div>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                     {/* Match Reasons */}
                     <div className={styles.matchReasons}>
                        {member.matchBreakdown.role && <span className={styles.roleMatch}><CheckCircle size={10}/> Role</span>}
                        {member.matchBreakdown.exp && <span className={styles.expMatch}><Award size={10}/> Exp</span>}
                        {member.matchedSkills.length > 0 && <span className={styles.skillMatch}>{member.matchedSkills.length} Skills</span>}
                     </div>

                     {/* Skills List */}
                     <div className={styles.skillsList}>
                        {member.matchedSkills.slice(0, 4).map((skill, i) => (
                           <span key={i} className={styles.highlight}>{skill}</span>
                        ))}
                        {member.matchedSkills.length > 4 && <span>+{member.matchedSkills.length - 4}</span>}
                     </div>

                     {/* APPLICANT SPECIFIC DATA (Only in Applicants Tab) */}
                     {activeTab === 'applicants' && member.applicationData && (
                        <div className={styles.applicantStatus}>
                           <div className={styles.statusRow}>
                              <span style={{color: getStatusColor(member.applicationData.status)}}>
                                 {member.applicationData.status}
                              </span>
                              <FileText size={14} color="#94a3b8"/>
                           </div>
                           <div className={styles.date}>
                              Applied: {new Date(member.applicationData.date).toLocaleDateString()}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                     <a href={`mailto:${member.email}`} onClick={(e)=>e.stopPropagation()}><Mail size={16}/> Email</a>
                     <a href={`tel:${member.mobileNumber}`} onClick={(e)=>e.stopPropagation()}><Phone size={16}/> Call</a>
                  </div>
                </div>
              ))}
           </div>
           
           {displayCandidates.length === 0 && (
             <div className={styles.emptyState}>
                <p>No candidates found in this section.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default JobDetail;