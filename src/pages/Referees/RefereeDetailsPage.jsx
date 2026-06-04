import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building2, User, 
  FileText, Target, Award, Edit, Save, X, MapPin, Star, Users, Layers, ExternalLink, Clock, Shield
} from 'lucide-react';
import { useData } from "../../context/DataContext";
import API from "../../axios";
import styles from './RefereeDetails.module.scss';

// ── Skeleton Loader Component ──────────────────────────────
const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <div className={`${styles.skeleton} ${className}`} style={{ width, height }} />
);

// ── Profile Hero Skeleton ──────────────────────────────────
const ProfileHeroSkeleton = () => (
  <div className={`${styles.mainProfileCard} ${styles.skeletonCard}`}>
    <div className={styles.profileHero}>
      <SkeletonLoader width="80px" height="80px" className={styles.avatarSkeleton} />
      <div className={styles.heroText}>
        <SkeletonLoader width="200px" height="28px" />
        <SkeletonLoader width="150px" height="18px" style={{ marginTop: '8px' }} />
        <SkeletonLoader width="180px" height="16px" style={{ marginTop: '12px' }} />
      </div>
    </div>
  </div>
);

// ── Info Card Skeleton ────────────────────────────────────
const InfoCardSkeleton = () => (
  <section className={`${styles.infoCard} ${styles.skeletonCard}`}>
    <div className={styles.cardHeader}>
      <SkeletonLoader width="40px" height="40px" />
      <SkeletonLoader width="150px" height="24px" />
    </div>
    <div className={styles.detailsGrid}>
      {Array(4).fill(0).map((_, i) => (
        <div key={i}>
          <SkeletonLoader width="100px" height="12px" />
          <SkeletonLoader width="100%" height="18px" style={{ marginTop: '8px' }} />
        </div>
      ))}
    </div>
  </section>
);

const RefereeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberContext, refreshData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [referredJobs, setReferredJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [changesPending, setChangesPending] = useState(false);
  const debounceTimerRef = useRef(null);

  // ── 3D tilt refs & handlers ─────────────────────────────
  const mainCardRef = useRef(null);
  const personalCardRef = useRef(null);
  const professionalCardRef = useRef(null);
  const supportCardRef = useRef(null);
  const jobsCardRef = useRef(null);
  const rafRef = useRef({});

  const handleCardMouseMove = (e, ref, cardId) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    rafRef.current[cardId] = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const max = 7; // subtle premium tilt
      
      el.style.setProperty("--rx", `${(-(py - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    });
  };

  const handleCardMouseLeave = (ref, cardId) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  const referee = memberContext?.find(m => m._id === id);

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      if (referee) {
        setFormData({ ...referee });
        setLoading(false);
        fetchReferredJobs();
      } else if (id) {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [referee, id]);

  const fetchReferredJobs = async () => {
    if (!id) return;
    setLoadingJobs(true);
    try {
      console.log("Fetching referred jobs for referee ID:", id);
      const response = await API.get(`/referee/${id}/referred-jobs`);
      console.log("Referred jobs response:", response.data);
      if (response.data.success) {
        setReferredJobs(response.data.data);
        console.log("Set referred jobs:", response.data.data);
      } else {
        console.warn("Response not successful:", response.data);
      }
    } catch (error) {
      console.error("Error fetching referred jobs:", error);
      setReferredJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSave = async () => {
    if (!referee || !changesPending) return;
    
    setSaving(true);
    setError(null);
    try {
      const response = await API.put(`/member/${referee._id}`, formData);
      if (response.status === 200) {
        if (refreshData) refreshData();
        setIsEditing(false);
        setChangesPending(false);
        // Show success message (optional toast notification)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update referee');
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...referee });
    setChangesPending(false);
    setError(null);
  };

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setChangesPending(true);

    // Clear error when user starts editing
    if (error) setError(null);
  }, [error]);

  if (!referee) {
    if (loading) {
      return (
        <div className={styles.pageContainer}>
          <div className={styles.banner}>
            <div className={styles.bannerGlow}></div>
            <div className={styles.bannerGlowTwo}></div>
          </div>
          <div className={styles.topActions}>
            <SkeletonLoader width="150px" height="40px" />
          </div>
          <ProfileHeroSkeleton />
          <div className={styles.contentGrid}>
            <InfoCardSkeleton />
            <InfoCardSkeleton />
            <InfoCardSkeleton />
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.pageContainer}>
        <div className={styles.topActions}>
          <button onClick={() => navigate('/referees')} className={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Directory
          </button>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Referee Not Found</h2>
          <p>We couldn't find the referee you're looking for.</p>
          <button onClick={() => navigate('/referees')} className={styles.resetBtn}>
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* BANNER */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow}></div>
        <div className={styles.bannerGlowTwo}></div>
      </div>

      {/* TOP ACTIONS */}
      <div className={styles.topActions}>
        <button onClick={() => navigate('/referees')} className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>

      {/* MAIN PROFILE CARD */}
      <div 
        ref={mainCardRef}
        onMouseMove={(e) => handleCardMouseMove(e, mainCardRef, "main")}
        onMouseLeave={() => handleCardMouseLeave(mainCardRef, "main")}
        className={`${styles.mainProfileCard} ${styles.animateIn}`}
      >
        <div className={styles.cardGlow} />
        <div className={styles.cardShine} />

        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            <img 
              src={referee.photoUrl || "/members/AnonymousImage.jpg"} 
              alt={formData.name || referee.name} 
              className={styles.avatar}
              onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }} 
            />
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              {formData.solidarityMemberStatus?.toUpperCase() || 'ACTIVE'}
            </div>
          </div>

          <div className={styles.heroText}>
            <h1>{formData.name || referee.name}</h1>
            <p className={styles.designation}>{formData.occupation || referee.occupation || 'Job Referee'}</p>
            <div className={styles.quickMeta}>
              <span><MapPin size={16}/> {formData.district || 'Remote'}</span>
              <span><Star size={16}/> {formData.referrerStatus || 'Verified'}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardBtns}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCancel} className={styles.cancelBtn} disabled={saving}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} className={styles.saveBtn} disabled={saving || !changesPending}>
                {saving ? <span className={styles.spinner}></span> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <Edit size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className={styles.contentGrid}>
        
        {/* PERSONAL DETAILS CARD */}
        <section 
          ref={personalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, personalCardRef, "personal")}
          onMouseLeave={() => handleCardMouseLeave(personalCardRef, "personal")}
          className={styles.infoCard}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />
          
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <User size={20} />
            </div>
            <h2>Personal Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Full Name</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.name || ''} 
                  onChange={e => handleFieldChange('name', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.name || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Gender</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.gender || ''} 
                  onChange={e => handleFieldChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.gender || 'Not Specified'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Email Address</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.email || ''} 
                  onChange={e => handleFieldChange('email', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.email || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Mobile Number</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.mobileNumber || ''} 
                  onChange={e => handleFieldChange('mobileNumber', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.mobileNumber || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Age</label>
              {isEditing ? (
                <input 
                  type="number"
                  className={styles.editInput} 
                  value={formData.age || ''} 
                  onChange={e => handleFieldChange('age', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.age ? `${formData.age} Years` : '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Solidarity Status</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.solidarityMemberStatus || 'Active'} 
                  onChange={e => handleFieldChange('solidarityMemberStatus', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="May be in Future">May be in Future</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.solidarityMemberStatus || 'Active'}</div>
              )}
            </div>
          </div>
        </section>

        {/* PROFESSIONAL INFO CARD */}
        <section 
          ref={professionalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, professionalCardRef, "professional")}
          onMouseLeave={() => handleCardMouseLeave(professionalCardRef, "professional")}
          className={styles.infoCard}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Briefcase size={20} />
            </div>
            <h2>Professional Info</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Occupation</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.occupation || ''} 
                  onChange={e => handleFieldChange('occupation', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.occupation || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Company Details</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.companyDetails || ''} 
                  onChange={e => handleFieldChange('companyDetails', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.companyDetails || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Sector</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.sector || ''} 
                  onChange={e => handleFieldChange('sector', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.sector || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referring Sector</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringSector || ''} 
                  onChange={e => handleFieldChange('referringSector', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringSector || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referrer Status</label>
              {isEditing ? (
                <select 
                  className={styles.editSelect} 
                  value={formData.referrerStatus || 'Verified'} 
                  onChange={e => handleFieldChange('referrerStatus', e.target.value)}
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className={styles.value}>{formData.referrerStatus || 'Verified'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referrer Contact</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referrerContact || ''} 
                  onChange={e => handleFieldChange('referrerContact', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referrerContact || '—'}</div>
              )}
            </div>
          </div>
        </section>

        {/* SUPPORT & OFFER DETAILS CARD */}
        <section 
          ref={supportCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, supportCardRef, "support")}
          onMouseLeave={() => handleCardMouseLeave(supportCardRef, "support")}
          className={`${styles.infoCard} ${styles.fullWidth}`}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Target size={20} />
            </div>
            <h2>Support & Offer Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.item}>
              <label>Referring For</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringFor || ''} 
                  onChange={e => handleFieldChange('referringFor', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringFor || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Offer Location</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.offer_Location || ''} 
                  onChange={e => handleFieldChange('offer_Location', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.offer_Location || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Job Offer Type</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.jobOfferType || ''} 
                  onChange={e => handleFieldChange('jobOfferType', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.jobOfferType || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Referring Offer Type</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.referringOfferType || ''} 
                  onChange={e => handleFieldChange('referringOfferType', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.referringOfferType || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>Level of Support</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.levelOfSupport || ''} 
                  onChange={e => handleFieldChange('levelOfSupport', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.levelOfSupport || '—'}</div>
              )}
            </div>

            <div className={styles.item}>
              <label>District / Area</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.district || ''} 
                  onChange={e => handleFieldChange('district', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.district || '—'}</div>
              )}
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Full Address</label>
              {isEditing ? (
                <input 
                  className={styles.editInput} 
                  value={formData.address || ''} 
                  onChange={e => handleFieldChange('address', e.target.value)}
                />
              ) : (
                <div className={styles.value}>{formData.address || '—'}</div>
              )}
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Opportunity Description</label>
              {isEditing ? (
                <textarea 
                  className={styles.editTextarea} 
                  value={formData.opportunityDescription || ''} 
                  onChange={e => handleFieldChange('opportunityDescription', e.target.value)}
                />
              ) : (
                <div className={styles.value} style={{ whiteSpace: 'pre-wrap' }}>{formData.opportunityDescription || '—'}</div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* REFERRED JOBS SECTION */}
      <div 
        ref={jobsCardRef}
        onMouseMove={(e) => handleCardMouseMove(e, jobsCardRef, "jobs")}
        onMouseLeave={() => handleCardMouseLeave(jobsCardRef, "jobs")}
        style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0' }}
      >
        <section className={styles.infoCard}>
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <Briefcase size={20}/>
            </div>
            <h2>Referred Jobs</h2>
          </div>
          
          {loadingJobs ? (
            <div className={styles.jobEmptyState}>
              <div className={styles.spinner}></div>
              <p>Loading referred jobs...</p>
            </div>
          ) : referredJobs.length === 0 ? (
            <div className={styles.jobEmptyState}>
              <Users size={40} style={{ opacity: 0.3 }} />
              <p>No jobs referred by this referee yet</p>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {referredJobs.map((job) => (
                <div key={job._id} className={styles.jobCard}>
                  <div className={styles.jobCardTop}>
                    <h3 className={styles.jobCardTitle}>{job.title}</h3>
                    <span className={styles.jobTypeBadge}>
                      {job.employmentType || 'Full-time'}
                    </span>
                  </div>

                  <p className={styles.jobDescription}>
                    {job.description?.substring(0, 100)}...
                  </p>

                  <div className={styles.jobMeta}>
                    {job.jobId && (
                      <div>
                        <label className={styles.jobMetaLabel}>Job ID</label>
                        <div className={styles.jobMetaValue}>{job.jobId}</div>
                      </div>
                    )}
                    {job.companyName && (
                      <div>
                        <label className={styles.jobMetaLabel}>Company</label>
                        <div className={styles.jobMetaValue}>{job.companyName}</div>
                      </div>
                    )}
                    {job.location && (
                      <div>
                        <label className={styles.jobMetaLabel}>Location</label>
                        <div className={styles.jobMetaValue}>
                          <MapPin size={14} /> {job.location}
                        </div>
                      </div>
                    )}
                    {job.salary && (
                      <div>
                        <label className={styles.jobMetaLabel}>Salary</label>
                        <div className={styles.jobMetaValueGreen}>{job.salary}</div>
                      </div>
                    )}
                    {job.experience && (
                      <div>
                        <label className={styles.jobMetaLabel}>Experience</label>
                        <div className={styles.jobMetaValue}>{job.experience}</div>
                      </div>
                    )}
                    {job.createdAt && (
                      <div>
                        <label className={styles.jobMetaLabel}>Posted</label>
                        <div className={styles.jobMetaValue}>
                          <Clock size={14} />
                          {new Date(job.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View Details <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RefereeDetailsPage;