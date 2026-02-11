// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import styles from "./JobDetail.module.scss"; 
// import { useData } from "../../context/DataContext";
// import { useAuth } from '../../context/AuthContext';
// import API from '../../axios'; 
// import { 
//   Briefcase, Award, CheckCircle, Zap, Users, Star, 
//   Calendar, GraduationCap, ArrowLeft, MapPin, 
//   CircleDollarSign, Clock 
// } from 'lucide-react';

// // --- HELPERS ---
// const getDirectImageUrl = (driveUrl) => {
//   if (!driveUrl) return null;
//   let fileId = null;
//   let match = driveUrl.match(/[?&]id=([^&]+)/);
//   if (match) fileId = match[1];
//   if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
//   if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
//   if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) { fileId = driveUrl; }
//   if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}`;
//   if (driveUrl.startsWith("uploads") || driveUrl.includes("\\")) {
//       return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${driveUrl.replace(/\\/g, "/")}`;
//   }
//   return driveUrl;
// };

// const parseExperience = (exp) => {
//   if (!exp) return 0;
//   if (typeof exp === 'number') return exp;
//   const match = exp.match(/(\d+)/);
//   return match ? parseInt(match[0], 10) : 0;
// };

// const tokenize = (str) => {
//   if (!str) return [];
//   return str.toLowerCase().split(/[,/ ]+/).filter(s => s.length > 0);
// };

// const normalizeSkills = (skillData) => {
//     if (!skillData) return [];
//     if (Array.isArray(skillData)) return tokenize(skillData.flat().join(' '));
//     if (typeof skillData === 'string') return tokenize(skillData);
//     return [];
// };

// function JobDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isApplying, setIsApplying] = useState(false);
  
//   const { jobContext, memberContext, setJobContext } = useData(); 
//   const { user } = useAuth();
  
//   const [matches, setMatches] = useState([]);
//   const [applicants, setApplicants] = useState([]);

//   // --- DATA FETCHING ---
//   useEffect(() => {
//     const fetchJob = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         if (jobContext.length > 0) {
//           const foundJob = jobContext.find(j => j._id === id);
//           if (foundJob) { setJob(foundJob); setLoading(false); return; }
//         }
//         const response = await API.get(`/service/${id}`);
//         if (response.data.success) { setJob(response.data.data); } 
//         else { setError("Job not found"); }
//       } catch (err) {
//         setError("Failed to load job details");
//       } finally { setLoading(false); }
//     };
//     fetchJob();
//   }, [id, jobContext]);

//   useEffect(() => {
//     if (job && memberContext && memberContext.length > 0) processData();
//   }, [job, memberContext]);

//   // Check if already applied
//   const hasApplied = job?.appliedMembers?.some(app => {
//     const mId = typeof app.memberId === 'object' ? app.memberId._id : app.memberId;
//     return String(mId) === String(user?._id);
//   });

//   const handleApply = async () => {
//     if (!user) return navigate('/login');
//     if (hasApplied || isApplying) return;

//     try {
//       setIsApplying(true);
//       const response = await API.post(`/service/apply/${job._id}`);
//       if (response.data.success) {
//         const updatedJob = response.data.data;
//         setJobContext(prev => prev.map(j => j._id === job._id ? updatedJob : j));
//         setJob(updatedJob);
//       }
//     } catch (err) {
//       console.error("Apply error:", err);
//     } finally {
//       setIsApplying(false);
//     }
//   };

//   const processData = () => {
//     const jobRoleTokens = tokenize(job.role);
//     const jobSkills = normalizeSkills(job.keySkills);
//     const jobMinExp = parseExperience(job.experience);
//     const appMap = new Map();
    
//     if (job.appliedMembers) {
//         job.appliedMembers.forEach(app => {
//             if (!app.memberId) return; 
//             const mId = typeof app.memberId === 'object' ? app.memberId._id : app.memberId;
//             appMap.set(String(mId), { status: app.status || 'Applied', date: app.appliedAt });
//         });
//     }

//     const scoredList = memberContext.map(member => {
//         let score = 0;
//         let reasons = { role: false, exp: false, skillCount: 0 };
//         const memberProfTokens = tokenize(member.profession);
//         if (jobRoleTokens.some(t => memberProfTokens.includes(t))) { score += 30; reasons.role = true; }
//         const memberExp = parseExperience(member.experience);
//         if (memberExp >= jobMinExp) { score += 20; reasons.exp = true; }
//         const memberSkillTokens = [...normalizeSkills(member.skills), ...normalizeSkills(member.forGrouping)];
//         const matched = jobSkills.filter(js => memberSkillTokens.some(ms => ms.includes(js) || js.includes(ms)));
//         if (jobSkills.length > 0 && matched.length > 0) {
//             const points = Math.round((matched.length / jobSkills.length) * 50);
//             score += Math.min(points, 50);
//             reasons.skillCount = matched.length;
//         }
//         return { ...member, matchScore: Math.min(score, 100), matchReasons: reasons, appData: appMap.get(String(member._id)) };
//     });

//     setMatches(scoredList.filter(m => !m.appData && m.matchScore >= 30).sort((a, b) => b.matchScore - a.matchScore));
//     setApplicants(scoredList.filter(m => m.appData).sort((a, b) => b.matchScore - a.matchScore));
//   };

//   const getScoreColor = (s) => s >= 80 ? '#16a34a' : s >= 50 ? '#2563eb' : '#ca8a04';

//   if (loading) return <div className={styles.loader}>Loading...</div>;
//   if (error || !job) return <div className={styles.error}>{error || "Job not found"}</div>;

//   return (
//     <div className={styles.pageWrapper}>
//       <div className={styles.container}>
        
//         {/* HEADER */}
//         <div className={styles.headerCard}>
//           <button className={styles.backBtn} onClick={() => navigate(-1)}>
//             <ArrowLeft size={20} />
//           </button>
//           <div className={styles.headerTitle}>
//             <h1>{job.title}</h1>
//             <p>Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
//           </div>
//         </div>

//         {/* SKILLS */}
//         <div className={styles.card}>
//           <div className={styles.sectionLabel}>
//             <Zap size={18} className={styles.iconYellow} />
//             <span>Key Skills</span>
//           </div>
//           <div className={styles.skillList}>
//             {normalizeSkills(job.keySkills).map((s, i) => (
//               <span key={i} className={styles.skillBadge}>{s}</span>
//             ))}
//           </div>
//         </div>

//         {/* INFO TILES */}
//         <div className={styles.tileGrid}>
//           <InfoTile icon={<Briefcase color="#10b981" size={20}/>} label="COMPANY" value={job.companyName} />
//           <InfoTile icon={<Briefcase color="#3b82f6" size={20}/>} label="JOB ROLE" value={job.role} />
//           <InfoTile icon={<Clock color="#8b5cf6" size={20}/>} label="EMPLOYMENT TYPE" value={job.employmentType} />
//           <InfoTile icon={<MapPin color="#ef4444" size={20}/>} label="LOCATION" value={job.location} />
//           <InfoTile icon={<CircleDollarSign color="#f59e0b" size={20}/>} label="SALARY" value={job.salary} />
//           <InfoTile icon={<GraduationCap color="#3b82f6" size={20}/>} label="EDUCATION" value={job.education} />
//           <InfoTile icon={<Calendar color="#06b6d4" size={20}/>} label="PASSOUT YEAR" value={job.passoutYear} />
//           <InfoTile icon={<Users color="#ec4899" size={20}/>} label="REFEREE" value={job.refereedBy?.name || "N/A"} />
//           <InfoTile icon={<Award color="#a855f7" size={20}/>} label="EXPERIENCE" value={job.experience} />
//         </div>

//         {/* DESCRIPTION */}
//         <div className={styles.card}>
//           <div className={styles.sectionLabel}><span>Description</span></div>
//           <p className={styles.descText}>{job.description}</p>
//         </div>

//         {/* ACTIONS: Only show Apply button if user is NOT an Admin */}
//         {user?.role !== "Admin" && (
//           <div className={styles.actionContainer}>
//             <button 
//               className={hasApplied ? styles.btnApplied : styles.btnApply} 
//               onClick={handleApply}
//               disabled={hasApplied || isApplying}
//             >
//               {isApplying ? "Processing..." : hasApplied ? "Applied" : "Apply Now"}
//             </button>
//           </div>
//         )}

//         {/* ADMIN SECTION */}
//         {user?.role === "Admin" && (
//           <div className={styles.adminArea}>
//             <div className={styles.divider} />
//             <div className={styles.adminSubSection}>
//                 <h3><Zap size={22} color="#ca8a04" fill="#ca8a04" /> AI Suggested Candidates <span className={styles.badge}>{matches.length}</span></h3>
//                 <div className={styles.hScroll}>
//                     {matches.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} />)}
//                 </div>
//             </div>
//             <div className={styles.adminSubSection}>
//                 <h3><Users size={22} color="#2563eb" /> Applications <span className={styles.badge}>{applicants.length}</span></h3>
//                 <div className={styles.vList}>
//                     {applicants.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} isApplicant={true} />)}
//                 </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// const InfoTile = ({ icon, label, value }) => (
//   <div className={styles.infoTile}>
//     <div className={styles.tileIcon}>{icon}</div>
//     <div className={styles.tileContent}>
//       <label>{label}</label>
//       <span>{value || "Not specified"}</span>
//     </div>
//   </div>
// );

// const CandidateCard = ({ member, navigate, colorFn, isApplicant = false }) => (
//     <div className={`${styles.candCard} ${isApplicant ? styles.wide : ''}`} onClick={() => navigate(`/member/${member._id}`)}>
//         <div className={styles.candTop}>
//             <img 
//                 src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} 
//                 alt="" 
//                 className={styles.avatar} 
//                 onError={(e) => e.target.src="/members/AnonymousImage.jpg"} 
//             />
//             <div className={styles.candMeta}>
//                 <h4>{member.name}</h4>
//                 <p>{member.profession || "N/A"}</p>
//             </div>
//             <div className={styles.score} style={{ borderColor: colorFn(member.matchScore), color: colorFn(member.matchScore) }}>{member.matchScore}%</div>
//         </div>
//         <div className={styles.candBottom}>
//             <div className={styles.reasons}>
//                 {member.matchReasons.role && <span className={styles.rRole}><CheckCircle size={10}/> Role</span>}
//                 {member.matchReasons.exp && <span className={styles.rExp}><Award size={10}/> Exp</span>}
//                 {member.matchReasons.skillCount > 0 && <span className={styles.rSkill}>{member.matchReasons.skillCount} Skills</span>}
//             </div>
//             {isApplicant && <div className={styles.status}>Status: <span>{member.appData.status}</span></div>}
//         </div>
//     </div>
// );

// export default JobDetail;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./JobDetail.module.scss"; 
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';
import API from '../../axios'; 
import axios from "axios";
import { 
  Briefcase, Award, CheckCircle, Zap, Users, Star, 
  Calendar, GraduationCap, ArrowLeft, MapPin, 
  CircleDollarSign, Clock, FileText, Trash2, X
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
      return `http://localhost:5000/${driveUrl.replace(/\\/g, "/")}`;
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

// --- MODERN RESUME MODAL (Matching Image 2) ---
const ResumeUploadModal = ({ isOpen, onClose, onUpload, jobTitle }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
  
    useEffect(() => {
        if (!isOpen) { setResumeFile(null); setIsUploading(false); }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
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
      <div className={styles.resumeModalOverlay}>
        <div className={styles.resumeModal}>
          <div className={styles.resumeModalHeader}>
            <div className={styles.headerInfo}>
              <h3>Upload Resume</h3>
              <p>Applying for: <span className={styles.jobHighlight}>{jobTitle}</span></p>
            </div>
            <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
          </div>

          <div className={styles.resumeModalBody}>
            <form onSubmit={handleSubmit}>
              <input type="file" id="resume-input" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={styles.hiddenInput} />
              
              {!resumeFile ? (
                <label htmlFor="resume-input" className={styles.resumeUploadArea}>
                  <div className={styles.uploadIcon}><FileText size={32} color="#4f46e5" /></div>
                  <span className={styles.uploadText}>Click to upload resume</span>
                  <span className={styles.uploadHint}>PDF, DOC, or DOCX (Max 5MB)</span>
                </label>
              ) : (
                <div className={styles.selectedFile}>
                  <div className={styles.fileInfo}>
                    <FileText size={24} color="#4f46e5" />
                    <div className={styles.fileName}>
                        <span>{resumeFile.name}</span>
                        <small>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                  </div>
                  <button type="button" onClick={() => setResumeFile(null)} className={styles.removeFileBtn}><Trash2 size={18} /></button>
                </div>
              )}

              <button type="submit" className={styles.resumeSubmitButton} disabled={!resumeFile || isUploading}>
                {isUploading ? "Processing..." : "Upload & Apply Now"}
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

  // 1. Sync Job from Context/API
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
    if (job && memberContext?.length > 0) processData();
  }, [job, memberContext]);

  const hasApplied = job?.appliedMembers?.some(app => {
    const mId = app.memberId?._id || app.memberId;
    return String(mId) === String(user?.memberId || user?._id);
  });

  // 2. Application Logic (Cloudinary)
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "jobbridge_preset");
    const res = await axios.post("https://api.cloudinary.com/v1_1/dwelwaavj/auto/upload", data);
    return res.data.secure_url;
  };

  const handleApply = async (resumeFile = null) => {
    if (!user) return navigate('/login');
    if (!resumeFile && !user.resumeLink && user.role !== "Admin") {
        setShowResumeModal(true);
        return;
    }

    try {
      let finalResumeLink = user.resumeLink || null;
      if (resumeFile) finalResumeLink = await uploadToCloudinary(resumeFile);

      const response = await API.post(`/service/${job._id}/apply`, { resumeLink: finalResumeLink });
      
      if (response.data.success || response.status === 200) {
        const updatedJob = response.data.data;
        // Broadcast change to global context so Jobs list reflects "Applied"
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

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!job) return <div className={styles.error}>Job not found</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        <div className={styles.headerCard}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div className={styles.headerTitle}>
            <h1>{job.title}</h1>
            <p>Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.sectionLabel}><Zap size={18} className={styles.iconYellow} /><span>Key Skills</span></div>
          <div className={styles.skillList}>
            {normalizeSkills(job.keySkills).map((s, i) => <span key={i} className={styles.skillBadge}>{s}</span>)}
          </div>
        </div>

        <div className={styles.tileGrid}>
          <InfoTile icon={<Briefcase color="#10b981" size={20}/>} label="COMPANY" value={job.companyName} />
          <InfoTile icon={<Briefcase color="#3b82f6" size={20}/>} label="JOB ROLE" value={job.role} />
          <InfoTile icon={<Clock color="#8b5cf6" size={20}/>} label="EMPLOYMENT TYPE" value={job.employmentType} />
          <InfoTile icon={<MapPin color="#ef4444" size={20}/>} label="LOCATION" value={job.location} />
          <InfoTile icon={<CircleDollarSign color="#f59e0b" size={20}/>} label="SALARY" value={job.salary} />
          <InfoTile icon={<GraduationCap color="#3b82f6" size={20}/>} label="EDUCATION" value={job.education} />
          <InfoTile icon={<Calendar color="#06b6d4" size={20}/>} label="PASSOUT YEAR" value={job.passedOutYear} />
          <InfoTile icon={<Users color="#ec4899" size={20}/>} label="REFEREE" value={job.refereedBy?.name || "N/A"} />
          <InfoTile icon={<Award color="#a855f7" size={20}/>} label="EXPERIENCE" value={job.experience} />
        </div>

        <div className={styles.card}>
          <div className={styles.sectionLabel}><span>Description</span></div>
          <p className={styles.descText}>{job.description}</p>
        </div>

        {user?.role !== "Admin" && (
          <div className={styles.actionContainer}>
            <button 
              className={hasApplied ? styles.btnApplied : styles.btnApply} 
              onClick={() => handleApply()}
              disabled={hasApplied}
            >
              {hasApplied ? "Applied" : "Apply Now"}
            </button>
          </div>
        )}

        {user?.role === "Admin" && (
          <div className={styles.adminArea}>
            <div className={styles.divider} />
            <div className={styles.adminSubSection}>
                <h3><Zap size={22} color="#ca8a04" fill="#ca8a04" /> AI Matches <span className={styles.badge}>{matches.length}</span></h3>
                <div className={styles.hScroll}>
                    {matches.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} />)}
                </div>
            </div>
            <div className={styles.adminSubSection}>
                <h3><Users size={22} color="#2563eb" /> Applicants <span className={styles.badge}>{applicants.length}</span></h3>
                <div className={styles.vList}>
                    {applicants.map(m => <CandidateCard key={m._id} member={m} navigate={navigate} colorFn={getScoreColor} isApplicant={true} />)}
                </div>
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

const InfoTile = ({ icon, label, value }) => (
  <div className={styles.infoTile}>
    <div className={styles.tileIcon}>{icon}</div>
    <div className={styles.tileContent}>
      <label>{label}</label>
      <span>{value || "Not specified"}</span>
    </div>
  </div>
);

const CandidateCard = ({ member, navigate, colorFn, isApplicant = false }) => (
    <div className={`${styles.candCard} ${isApplicant ? styles.wide : ''}`} onClick={() => navigate(`/member/${member._id}`)}>
        <div className={styles.candTop}>
            <img src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} alt="" className={styles.avatar} onError={(e) => e.target.src="/members/AnonymousImage.jpg"} />
            <div className={styles.candMeta}>
                <h4>{member.name}</h4>
                <p>{member.profession || "N/A"}</p>
            </div>
            <div className={styles.score} style={{ borderColor: colorFn(member.matchScore), color: colorFn(member.matchScore) }}>{member.matchScore}%</div>
        </div>
        <div className={styles.candBottom}>
            <div className={styles.reasons}>
                {member.matchReasons.role && <span className={styles.rRole}><CheckCircle size={10}/> Role</span>}
                {member.matchReasons.exp && <span className={styles.rExp}><Award size={10}/> Exp</span>}
                {member.matchReasons.skillCount > 0 && <span className={styles.rSkill}>{member.matchReasons.skillCount} Skills</span>}
            </div>
            {isApplicant && <div className={styles.status}>Status: <span>{member.appData.status}</span></div>}
        </div>
    </div>
);

export default JobDetail;