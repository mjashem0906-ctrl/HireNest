import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./JobDetail.module.scss"; 
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Briefcase, Award, CheckCircle, Zap, Users, Star } from 'lucide-react';

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

const parseExperience = (exp) => {
  if (!exp) return 0;
  if (typeof exp === 'number') return exp;
  const match = exp.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
};

const tokenize = (str) => {
  if (!str) return [];
  return str.toLowerCase().split(/[,/ ]+/).filter(s => s.length > 0);
};

const normalizeSkills = (skillData) => {
    if (!skillData) return [];
    if (Array.isArray(skillData)) {
        return tokenize(skillData.flat().join(' '));
    }
    if (typeof skillData === 'string') return tokenize(skillData);
    return [];
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { jobContext, memberContext } = useData(); 
  const { user } = useAuth();
  
  // Lists
  const [matches, setMatches] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // 1. Fetch Job
  useEffect(() => {
    if (jobContext.length > 0) {
      const foundJob = jobContext.find(j => j._id === id);
      setJob(foundJob || null);
      setLoading(false);
    }
  }, [jobContext, id]);

  // 2. Process Candidates
  useEffect(() => {
    if (job && memberContext && memberContext.length > 0) {
      processData();
    }
  }, [job, memberContext]);

  const processData = () => {
    // --- A. Job Requirements ---
    const jobRoleTokens = tokenize(job.role);
    const jobSkills = normalizeSkills(job.keySkills);
    const jobMinExp = parseExperience(job.experience);

    // --- B. Applicant Map ---
    const appMap = new Map();
    if (job.appliedMembers) {
        job.appliedMembers.forEach(app => {
            const mId = typeof app.memberId === 'object' ? app.memberId._id : app.memberId;
            appMap.set(String(mId), { 
                status: app.status || 'Applied', 
                date: app.appliedAt 
            });
        });
    }

    // --- C. Score Logic ---
    const scoredList = memberContext.map(member => {
        let score = 0;
        let reasons = { role: false, exp: false, skillCount: 0 };

        // 1. Role Match (30%)
        const memberProfTokens = tokenize(member.profession);
        if (jobRoleTokens.some(t => memberProfTokens.includes(t))) {
            score += 30;
            reasons.role = true;
        }

        // 2. Experience Match (20%)
        const memberExp = parseExperience(member.experience);
        if (memberExp >= jobMinExp) {
            score += 20;
            reasons.exp = true;
        }

        // 3. Skill Match (50%)
        const memberSkillTokens = [
            ...normalizeSkills(member.skills), 
            ...normalizeSkills(member.forGrouping)
        ];
        
        const matched = jobSkills.filter(js => 
            memberSkillTokens.some(ms => ms.includes(js) || js.includes(ms))
        );

        if (jobSkills.length > 0 && matched.length > 0) {
            const points = Math.round((matched.length / jobSkills.length) * 50);
            score += Math.min(points, 50);
            reasons.skillCount = matched.length;
        }

        return {
            ...member,
            matchScore: Math.min(score, 100),
            matchReasons: reasons,
            appData: appMap.get(String(member._id))
        };
    });

    // --- D. Split Lists ---
    
    // 1. AI Matches: Show potential candidates who haven't applied yet
    const suggested = scoredList
        .filter(m => !m.appData && m.matchScore >= 30) 
        .sort((a, b) => b.matchScore - a.matchScore);
    
    // 2. Applicants: Anyone in the appMap
    const appliedList = scoredList
        .filter(m => m.appData)
        .sort((a, b) => b.matchScore - a.matchScore);

    setMatches(suggested);
    setApplicants(appliedList);
  };

  const getScoreColor = (s) => s >= 80 ? '#16a34a' : s >= 50 ? '#2563eb' : '#ca8a04';

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading...</div>;
  if (!job) return <div className={styles.container}>Job not found</div>;

  return (
    <div className={styles.container}>
      
      {/* JOB CARD */}
      <div className={styles.jobCard}>
        <div className={styles.header}>
            <h1>{job.title}</h1>
            <span className={styles.meta}>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className={styles.skills}>
            {normalizeSkills(job.keySkills).map((s, i) => (
                <span key={i} className={styles.tag}>{s}</span>
            ))}
        </div>

        <div className={styles.gridInfo}>
            <div className={styles.infoItem}><label>Company</label><span>{job.companyName}</span></div>
            <div className={styles.infoItem}><label>Location</label><span>{job.location}</span></div>
            <div className={styles.infoItem}><label>Experience</label><span>{job.experience}</span></div>
            <div className={styles.infoItem}><label>Salary</label><span>{job.salary}</span></div>
            
            {/* 👇 FIXED: Display Name or N/A safely */}
            <div className={styles.infoItem}>
                <label>Referee</label>
                <span>{job.refereedBy?.name || "N/A"}</span>
            </div>
        </div>

        <div className={styles.description}>{job.description}</div>
      </div>

      {/* ADMIN VIEW */}
      {user?.role === "Admin" && (
        <>
            {/* 1. AI MATCHES SECTION (Horizontal Scroll) */}
            <div className={styles.matchesContainer}>
                <div className={styles.sectionTitle}>
                    <Zap size={24} color="#ca8a04" fill="#ca8a04" /> 
                    AI Suggested Candidates
                    <span className={styles.badge}>{matches.length}</span>
                </div>
                
                {matches.length > 0 ? (
                    <div className={styles.scrollWrapper}>
                        {matches.map(m => (
                            <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyBox}>No suggested matches found based on profile data.</div>
                )}
            </div>

            {/* 2. APPLICANTS SECTION (Vertical List) */}
            <div>
                <div className={styles.sectionTitle}>
                    <Users size={24} color="#2563eb" /> 
                    Applications
                    <span className={styles.badge}>{applicants.length}</span>
                </div>

                <div className={styles.applicantsGrid}>
                    {applicants.length > 0 ? (
                        applicants.map(m => (
                            <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} isApplicant={true} />
                        ))
                    ) : (
                        <div className={styles.emptyBox}>No applications received yet.</div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: Candidate Card ---
const CandidateCard = ({ member, navigate, colorFn, isApplicant = false }) => {
    return (
        <div 
            className={`${styles.candidateCard} ${isApplicant ? styles.applicant : ''}`} 
            onClick={() => navigate(`/member/${member._id}`)}
        >
            <div className={styles.cardHeader}>
                <img 
                    src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} 
                    alt={member.name}
                    className={styles.avatar}
                    onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                />
                <div className={styles.info}>
                    <h4>{member.name}</h4>
                    <p>{member.profession || "N/A"}</p>
                </div>
                <div className={styles.scoreRing} style={{ borderColor: colorFn(member.matchScore), color: colorFn(member.matchScore) }}>
                    {member.matchScore}%
                </div>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.reasons}>
                    {member.matchReasons.role && <span className={styles.role}><CheckCircle size={10}/> Role</span>}
                    {member.matchReasons.exp && <span className={styles.exp}><Award size={10}/> Exp</span>}
                    {member.matchReasons.skillCount > 0 && <span className={styles.skill}>{member.matchReasons.skillCount} Skills</span>}
                </div>
                {isApplicant && (
                    <div className={styles.status}>
                        Status: <span style={{color: '#2563eb', fontWeight:'bold'}}>{member.appData.status}</span>
                    </div>
                )}
            </div>

            {/* <div className={styles.cardFooter}>
                <a href={`mailto:${member.email}`} onClick={(e)=>e.stopPropagation()}><Mail size={14}/> Email</a>
                <a href={`tel:${member.mobileNumber}`} onClick={(e)=>e.stopPropagation()}><Phone size={14}/> Call</a>
            </div> */}
        </div>
    );
};

export default JobDetail;