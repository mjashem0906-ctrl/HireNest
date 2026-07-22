import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./JobDetail.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import {
  Briefcase, Award, CheckCircle, XCircle, Zap, Users, Star,
  Calendar, GraduationCap, ArrowLeft,
  MapPin, IndianRupee, Clock, FileText, Trash2, X,
  Building, TrendingUp, Sparkles, BookOpen, Target,
  ExternalLink, Shield
} from 'lucide-react';

// --- HELPERS ---
const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  let fileId = null;
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];
  if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
  if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) { fileId = driveUrl; }
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}`;
  if (driveUrl.startsWith("uploads") || driveUrl.includes("\\")) {
    const backendUrl =
      import.meta.env.VITE_API_URL ||
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://jobbridgenode.com");
    return `${backendUrl}/${driveUrl.replace(/\\/g, "/")}`;
  }
  return driveUrl;
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
  if (Array.isArray(skillData)) return tokenize(skillData.flat().join(' '));
  if (typeof skillData === 'string') return tokenize(skillData);
  return [];
};

// --- PREMIUM RESUME MODAL ---
const ResumeUploadModal = ({ isOpen, onClose, onUpload, jobTitle }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) { setResumeFile(null); setIsUploading(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setIsUploading(true);
    await onUpload(resumeFile);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className={styles.resumeModalOverlay} onClick={onClose}>
      <div className={styles.resumeModal} onClick={e => e.stopPropagation()}>
        <div className={styles.resumeModalHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.modalIconWrap}>
              <FileText size={22} />
            </div>
            <div>
              <h3>Upload Your Resume</h3>
              <p>Applying for: <span className={styles.jobHighlight}>{jobTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.resumeModalBody}>
          <form onSubmit={handleSubmit}>
            <input type="file" id="resume-input" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={styles.hiddenInput} />

            {!resumeFile ? (
              <label
                htmlFor="resume-input"
                className={`${styles.resumeUploadArea} ${isDragging ? styles.dragging : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className={styles.uploadIconWrap}>
                  <FileText size={36} />
                </div>
                <span className={styles.uploadText}>Drop your resume here or click to browse</span>
                <span className={styles.uploadHint}>PDF, DOC, or DOCX · Max 5MB</span>
                <span className={styles.uploadCta}>Choose File</span>
              </label>
            ) : (
              <div className={styles.selectedFile}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileIconWrap}><FileText size={22} /></div>
                  <div className={styles.fileName}>
                    <span>{resumeFile.name}</span>
                    <small>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                </div>
                <button type="button" onClick={() => setResumeFile(null)} className={styles.removeFileBtn}><Trash2 size={16} /></button>
              </div>
            )}

            <button type="submit" className={styles.resumeSubmitButton} disabled={!resumeFile || isUploading}>
              {isUploading ? (
                <><span className={styles.btnSpinner} /> Processing...</>
              ) : (
                <><Zap size={18} /> Upload & Apply Now</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobContext, memberContext, setJobContext } = useData();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [matches, setMatches] = useState([]);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const fetchJob = async () => {
      const foundInContext = jobContext.find(j => j._id === id);
      if (foundInContext) {
        setJob(foundInContext);
        setLoading(false);
      } else {
        try {
          const res = await API.get(`/service/${id}`);
          if (res.data.success) setJob(res.data.data);
        } catch (err) { console.error(err); }
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, jobContext]);

  useEffect(() => {
    if (job) {
      console.log("Job detail loaded:", {
        title: job.title,
        applicationEndDate: job.applicationEndDate,
        isClosed: job.isActive === false || (job.applicationEndDate ? (new Date() >= new Date(job.applicationEndDate)) : false)
      });
    }
    if (job && memberContext?.length > 0) processData();
  }, [job, memberContext]);

  const hasApplied = job?.appliedMembers?.some(app => {
    const mId = app.memberId?._id || app.memberId;
    return String(mId) === String(user?.memberId || user?._id);
  });

  const uploadToServer = async (file) => {
    const data = new FormData();
    data.append("file", file);
    const res = await API.post("/api/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleApply = async (resumeFile = null) => {
    if (!user) return navigate('/login');

    const isClosed = (() => {
      if (job?.isActive === false) return true;
      if (!job?.applicationEndDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(job.applicationEndDate);
      endDate.setHours(0, 0, 0, 0);
      return today >= endDate;
    })();
    if (isClosed) {
      alert("Application Closed");
      return;
    }

    if (!resumeFile && !user.resumeLink && user.role !== "Admin") {
      setShowResumeModal(true);
      return;
    }
    try {
      let finalResumeLink = user.resumeLink || null;
      if (resumeFile) finalResumeLink = await uploadToServer(resumeFile);
      const response = await API.post(`/service/${job._id}/apply`, { resumeLink: finalResumeLink });
      if (response.data.success || response.status === 200) {
        const updatedJob = response.data.data;
        setJobContext(prev => prev.map(j => j._id === id ? updatedJob : j));
        alert("Applied Successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
  };

  const processData = () => {
    const jobRoleTokens = tokenize(job.role);
    const jobSkills = normalizeSkills(job.keySkills);
    const jobMinExp = parseExperience(job.experience);
    const appMap = new Map();

    job.appliedMembers?.forEach(app => {
      if (!app.memberId) return;
      const mId = app.memberId?._id || app.memberId;
      appMap.set(String(mId), { status: app.status || 'Applied', date: app.appliedAt });
    });

    const scoredList = memberContext.map(member => {
      let score = 0;
      let reasons = { role: false, exp: false, skillCount: 0 };
      const memberProfTokens = tokenize(member.profession);
      if (jobRoleTokens.some(t => memberProfTokens.includes(t))) { score += 30; reasons.role = true; }
      const memberExp = parseExperience(member.experience);
      if (memberExp >= jobMinExp) { score += 20; reasons.exp = true; }
      const memberSkillTokens = [...normalizeSkills(member.skills), ...normalizeSkills(member.forGrouping)];
      const matched = jobSkills.filter(js => memberSkillTokens.some(ms => ms.includes(js) || js.includes(ms)));
      if (jobSkills.length > 0 && matched.length > 0) {
        const points = Math.round((matched.length / jobSkills.length) * 50);
        score += Math.min(points, 50);
        reasons.skillCount = matched.length;
      }
      return { ...member, matchScore: Math.min(score, 100), matchReasons: reasons, appData: appMap.get(String(member._id)) };
    });
    setMatches(scoredList.filter(m => !m.appData && m.matchScore >= 30).sort((a, b) => b.matchScore - a.matchScore));
    setApplicants(scoredList.filter(m => m.appData).sort((a, b) => b.matchScore - a.matchScore));
  };

  const getScoreColor = (s) => s >= 80 ? '#16a34a' : s >= 50 ? '#2563eb' : '#ca8a04';

  if (loading) return (
    <div className={styles.loaderScreen}>
      <div className={styles.loaderSpinner} />
      <p>Loading job details...</p>
    </div>
  );
  if (!job) return (
    <div className={styles.loaderScreen}>
      <div className={styles.errorIcon}>⚠️</div>
      <p>Job not found</p>
    </div>
  );

  const skills = normalizeSkills(job.keySkills);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>

        {/* ---- PREMIUM HERO HEADER ---- */}
        <div className={styles.heroCard}>
          {/* Mesh gradient overlay */}
          <div className={styles.heroMesh} />

          <div className={styles.heroTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Back
            </button>
            {job.jobId && (
              <span className={styles.jobIdBadge}>
                <Shield size={12} /> ID: {job.jobId}
              </span>
            )}
          </div>

          <div className={styles.heroBody}>
            {job.companyLogo ? (
              <img
                src={getDirectImageUrl(job.companyLogo)}
                alt="Company Logo"
                className={styles.companyLogo}
                onError={e => e.target.style.display = 'none'}
              />
            ) : (
              <div className={styles.companyAvatar}>
                {(job.companyName || job.title || 'J').slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className={styles.heroInfo}>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.heroBadges}>
                {job.companyName && (
                  <span className={styles.companyBadge}>
                    <Building size={14} /> {job.companyName}
                    <span className={styles.verifiedMark}>✓</span>
                  </span>
                )}
                {job.location && (
                  <span className={styles.locationBadge}>
                    <MapPin size={13} /> {job.location}
                  </span>
                )}
                {job.employmentType && (
                  <span className={styles.typeBadge}>
                    <Clock size={13} /> {job.employmentType}
                  </span>
                )}
              </div>
              <div className={styles.heroMeta}>
                <span><Calendar size={13} /> Posted {new Date(job.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                {job.jobPosted && (
                  <span className={styles.recruiterTag}>
                    <Star size={13} /> Recruited by <strong>{job.jobPosted.fullName}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key stat chips */}
          <div className={styles.heroStats}>
            {job.salary && (
              <div className={styles.heroStat}>
                <IndianRupee size={15} />
                <div>
                  <span className={styles.heroStatLabel}>Salary</span>
                  <span className={styles.heroStatValue}>{job.salary}</span>
                </div>
              </div>
            )}
            {job.experience && (
              <div className={styles.heroStat}>
                <TrendingUp size={15} />
                <div>
                  <span className={styles.heroStatLabel}>Experience</span>
                  <span className={styles.heroStatValue}>{job.experience}</span>
                </div>
              </div>
            )}
            {job.education && (
              <div className={styles.heroStat}>
                <GraduationCap size={15} />
                <div>
                  <span className={styles.heroStatLabel}>Education</span>
                  <span className={styles.heroStatValue}>{job.education}</span>
                </div>
              </div>
            )}
            {job.appliedMembers?.length >= 0 && (
              <div className={styles.heroStat}>
                <Users size={15} />
                <div>
                  <span className={styles.heroStatLabel}>Applicants</span>
                  <span className={styles.heroStatValue}>{job.appliedMembers?.length || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- SKILLS SECTION ---- */}
        {skills.length > 0 && (
          <div className={styles.card}>
            <div className={styles.sectionLabel}>
              <span className={styles.sectionIcon}><Zap size={16} /></span>
              <span>Key Skills Required</span>
              <span className={styles.skillCount}>{skills.length}</span>
            </div>
            <div className={styles.skillList}>
              {skills.map((s, i) => (
                <span key={i} className={styles.skillBadge} data-index={i % 4}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---- INFO TILES GRID ---- */}
        <div className={styles.tileGrid}>
          <InfoTile icon={<FileText size={20} />} label="JOB ID" value={job.jobId} color="blue" />
          <InfoTile icon={<Briefcase size={20} />} label="COMPANY" value={job.companyName} color="rose" />
          <InfoTile icon={<Building size={20} />} label="INDUSTRY" value={job.industry} color="violet" />
          <InfoTile icon={<Target size={20} />} label="JOB ROLE" value={job.role} color="amber" />
          <InfoTile icon={<Clock size={20} />} label="EMPLOYMENT TYPE" value={job.employmentType} color="teal" />
          <InfoTile icon={<MapPin size={20} />} label="LOCATION" value={job.location} color="sky" />
          <InfoTile icon={<IndianRupee size={20} />} label="SALARY" value={job.salary} color="emerald" />
          <InfoTile icon={<GraduationCap size={20} />} label="EDUCATION" value={job.education} color="indigo" />
          <InfoTile icon={<Calendar size={20} />} label="PASSOUT YEAR" value={job.passedOutYear} color="orange" />
          <InfoTile icon={<Users size={20} />} label="REFEREE" value={job.refereedBy?.name || "N/A"} color="pink" />
          <InfoTile icon={<Award size={20} />} label="EXPERIENCE" value={job.experience} color="rose" />
        </div>

        {/* ---- DESCRIPTION ---- */}
        {job.description && (
          <div className={styles.card}>
            <div className={styles.sectionLabel}>
              <span className={styles.sectionIcon}><BookOpen size={16} /></span>
              <span>Job Description</span>
            </div>
            <p className={styles.descText}>{job.description}</p>
          </div>
        )}

        {/* ---- APPLY CTA ---- */}
        {user?.role !== "Admin" && (() => {
          const isClosed = (() => {
            if (job?.isActive === false) return true;
            if (!job?.applicationEndDate) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = new Date(job.applicationEndDate);
            endDate.setHours(0, 0, 0, 0);
            return today >= endDate;
          })();

          return (
            <div className={styles.ctaCard}>
              <div className={styles.ctaLeft}>
                <div className={styles.ctaIconWrap}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h4>{isClosed ? "Application Closed" : "Ready to apply?"}</h4>
                  <p>
                    {isClosed
                      ? "Applications are no longer being accepted for this position."
                      : hasApplied
                      ? "You've already applied for this position."
                      : "Submit your application and take the next step."}
                  </p>
                </div>
              </div>
              {isClosed ? (
                <button
                  className={styles.btnApplied}
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                >
                  <XCircle size={18} /> Application Closed
                </button>
              ) : (
                <button
                  className={hasApplied ? styles.btnApplied : styles.btnApply}
                  onClick={() => handleApply()}
                  disabled={hasApplied}
                >
                  {hasApplied ? (
                    <><CheckCircle size={18} /> Applied</>
                  ) : (
                    <><Zap size={18} /> Apply Now</>
                  )}
                </button>
              )}
            </div>
          );
        })()}

        {/* ---- ADMIN AREA ---- */}
        {user?.role === "Admin" && (
          <div className={styles.adminArea}>
            <div className={styles.adminDivider}>
              <span className={styles.adminDividerLabel}>
                <Shield size={14} /> Admin Panel
              </span>
            </div>

            {/* AI Matches */}
            <div className={styles.adminSubSection}>
              <div className={styles.adminSectionHeader}>
                <div className={styles.adminSectionTitle}>
                  <span className={styles.aiIcon}><Zap size={18} /></span>
                  AI Candidate Matches
                  <span className={styles.countBadge}>{matches.length}</span>
                </div>
              </div>
              {matches.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎯</div>
                  <p>No strong matches found yet.</p>
                </div>
              ) : (
                <div className={styles.hScroll}>
                  {matches.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} />)}
                </div>
              )}
            </div>

            {/* Applicants */}
            <div className={styles.adminSubSection}>
              <div className={styles.adminSectionHeader}>
                <div className={styles.adminSectionTitle}>
                  <span className={styles.usersIcon}><Users size={18} /></span>
                  Applicants
                  <span className={styles.countBadge}>{applicants.length}</span>
                </div>
              </div>
              {applicants.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📭</div>
                  <p>No applicants yet. Share this job!</p>
                </div>
              ) : (
                <div className={styles.vList}>
                  {applicants.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} isApplicant={true} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ResumeUploadModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onUpload={handleApply}
        jobTitle={job.title}
      />
    </div>
  );
}

// ---- INFO TILE ----
const COLOR_MAP = {
  rose:    { bg: '#fff1f2', border: '#fecdd3', icon: '#e11d48', text: '#9f1239' },
  blue:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e40af' },
  violet:  { bg: '#f5f3ff', border: '#ddd6fe', icon: '#7c3aed', text: '#5b21b6' },
  amber:   { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#92400e' },
  teal:    { bg: '#f0fdfa', border: '#99f6e4', icon: '#0d9488', text: '#134e4a' },
  sky:     { bg: '#f0f9ff', border: '#bae6fd', icon: '#0284c7', text: '#075985' },
  emerald: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669', text: '#064e3b' },
  indigo:  { bg: '#eef2ff', border: '#c7d2fe', icon: '#4f46e5', text: '#312e81' },
  orange:  { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', text: '#7c2d12' },
  pink:    { bg: '#fdf2f8', border: '#f9a8d4', icon: '#db2777', text: '#831843' },
};

const InfoTile = ({ icon, label, value, color = 'rose' }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.rose;
  return (
    <div className={styles.infoTile} style={{ '--tile-bg': c.bg, '--tile-border': c.border, '--tile-icon': c.icon, '--tile-text': c.text }}>
      <div className={styles.tileIcon}>{icon}</div>
      <div className={styles.tileContent}>
        <label>{label}</label>
        <span>{value || "Not specified"}</span>
      </div>
    </div>
  );
};

// ---- CANDIDATE CARD ----
const CandidateCard = ({ member, navigate, colorFn, isApplicant = false }) => {
  const score = member.matchScore;
  const scoreColor = colorFn(score);

  return (
    <div
      className={`${styles.candCard} ${isApplicant ? styles.wide : ''}`}
      onClick={() => navigate(`/member/${member._id}`)}
    >
      <div className={styles.candTop}>
        <div className={styles.avatarWrap}>
          <img
            src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
            alt=""
            className={styles.avatar}
            onError={e => e.target.src = "/members/AnonymousImage.jpg"}
          />
          <div className={styles.scoreRing} style={{ '--score-color': scoreColor }}>
            {score}%
          </div>
        </div>
        <div className={styles.candMeta}>
          <h4>{member.name}</h4>
          <p>{member.profession || "N/A"}</p>
          <div className={styles.reasons}>
            {member.matchReasons.role && <span className={styles.rRole}><CheckCircle size={9} /> Role</span>}
            {member.matchReasons.exp && <span className={styles.rExp}><Award size={9} /> Exp</span>}
            {member.matchReasons.skillCount > 0 && <span className={styles.rSkill}><Star size={9} /> {member.matchReasons.skillCount} Skills</span>}
          </div>
        </div>
        {isApplicant && member.appData && (
          <div className={styles.statusChip} data-status={member.appData.status?.toLowerCase()}>
            {member.appData.status}
          </div>
        )}
        <ExternalLink size={14} className={styles.candArrow} />
      </div>
    </div>
  );
};

export default JobDetail;