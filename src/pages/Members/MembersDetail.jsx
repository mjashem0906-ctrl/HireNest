import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MembersDetail.module.scss";
import API from "../../axios";
import { useData } from "../../context/DataContext";
import { parseDOB } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase,
  Target,
  Languages,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
  GraduationCap,
  Building,
  Award as CertificateIcon,
  BookOpen,
  FileText,
  CheckCircle,
  Star,
  Phone,
  ClipboardList,
  Wrench,
  Linkedin,
} from "lucide-react";
import AddMember from "../../components/Models/AddMember";

function MembersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memberContext, setMemberContext } = useData();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [age, setAge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://jobbridgenode.com");

  useEffect(() => {
    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberContext, id]);

  const fetchMember = async () => {
    try {
      setLoading(true);

      // ✅ FIX 1: If they are viewing "me" but don't have a memberId yet, redirect to setup
      if (id === "me" && (!user?.memberId || user?.memberId === "undefined")) {
        navigate("/profile-setup"); // Change this route if needed!
        return;
      }

      let filtered = null;

      if (memberContext && memberContext.length > 0) {
        filtered = memberContext.find((m) => String(m._id) === String(id));
      }

      if (!filtered) {
        const targetId = id === "me" ? user?.memberId : id;
        if (targetId && targetId !== "undefined") {
          const response = await API.get(`/member/${targetId}`);
          filtered = response.data;
        }
      }

      setMember(filtered);
      if (filtered?.dateOfBirth) setAge(calculateAge(filtered.dateOfBirth));
    } catch (err) {
      console.error("Error fetching profile:", err);

      // ✅ FIX 2: If the backend says 404 Not Found for their own profile, redirect to setup
      if (err.response?.status === 404 && (id === "me" || String(id) === String(user?.memberId))) {
        navigate("/profile-setup"); // Change this route if needed!
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = parseDOB(dob);
    if (!birthDate) return null;
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const getProfileImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("uploads")) return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
    return url;
  };

  const getInitials = (name) =>
  (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "??"
  );

  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const expList =
    member?.experienceDetails ||
    member?.experience ||
    member?.experiences ||
    member?.workExperience ||
    member?.employmentHistory ||
    [];

  const educationList =
    member?.education ||
    member?.educations ||
    member?.educationHistory ||
    [];

  const skillsList =
    normalizeList(member?.skills) ||
    normalizeList(member?.skillSet) ||
    normalizeList(member?.technicalSkills);

  const passOutYear =
    member?.passOutYear || member?.highestEducationPassedOutYear || "N/A";

  const certifications = Array.isArray(member?.certifications)
    ? member.certifications
    : [];

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading Profile...</p>
      </div>
    );

  if (!member)
    return (
      <div className={styles.loadingContainer}>
        <h2>Profile Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.banner}></div>

      <div className={styles.headerCard}>
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            {member.photoUrl || member.photo ? (
              <img
                src={getProfileImageUrl(member.photoUrl || member.photo)}
                alt={member.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatar}>{getInitials(member.name)}</div>
            )}
            {member.symMemberStatus === "Active" && (
              <div className={styles.statusBadge}></div>
            )}
          </div>

          <div className={styles.mainInfo}>
            <div className={styles.nameRow}>
              <h1>{member.name}</h1>
              <span className={`${styles.badge} ${styles.typeBadge}`}>
                {member.memberType}
              </span>
              {member.symMemberStatus === "Active" && (
                <span className={`${styles.badge} ${styles.activeBadge}`}>
                  <CheckCircle size={14} /> Active
                </span>
              )}
            </div>

            <p className={styles.designation}>
              {member.designation || member.profession || "Professional"}
            </p>

            <div className={styles.quickStats}>
              <div className={styles.statItem}>
                <MapPin size={16} /> {member.district || "Location N/A"}
              </div>
              <div className={styles.statItem}>
                <Calendar size={16} /> Member since{" "}
                {member.createdAt ? new Date(member.createdAt).getFullYear() : "N/A"}
              </div>
              <div className={styles.statItem}>
                <Star size={16} /> {member.workExp || 0} Years Experience
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionButtons}>
          {(user?.role === "Admin" ||
            String(user?.memberId) === String(member._id) ||
            id === "me") && (
              <button
                className={styles.editBtn}
                onClick={() => {
                  setEditingMember(member);
                  setShowModal(true);
                }}
              >
                <ExternalLink size={18} /> Edit Profile
              </button>
            )}
        </div>
      </div>

      <div className={styles.tabNavigation}>
        {["overview", "experience", "education", "certificates", "skills"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Target size={22} className={styles.icon} /> Career Profile
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.item}>
                  <label>Preferred Job Role</label>
                  <div className={styles.value}>
                    {(() => {
                      const raw = member.careerProfile?.role || member.preferredJobRole_Sector;
                      const roles = Array.isArray(raw)
                        ? raw.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean))
                        : raw
                        ? String(raw).split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
                      return roles.length > 0 ? roles.join(", ") : "Not specified";
                    })()}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Industry</label>
                  <div className={styles.value}>
                    {member.careerProfile?.industry || "Not specified"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Location Preference</label>
                  <div className={styles.value}>
                    {member.careerProfile?.location ||
                      member.preferredJobLocation ||
                      "Not specified"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Expected Salary</label>
                  <div className={styles.value}>
                    {member.careerProfile?.expectedSalary ||
                      member.expectedSalary ||
                      "Negotiable"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Employment Type</label>
                  <div className={styles.value}>
                    {member.employmentType ||
                      member.careerProfile?.employmentType ||
                      "Not specified"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Notice Period</label>
                  <div className={styles.value}>
                    {member.careerProfile?.noticePeriod ||
                      member.noticePeriod ||
                      "Not specified"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>LinkedIn Profile URL</label>
                  <div className={styles.value}>
                    {member.linkedinUrl ? (
                      <a
                        href={member.linkedinUrl.startsWith("http") ? member.linkedinUrl : `https://${member.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0a66c2", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        View LinkedIn <ExternalLink size={14} />
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <GraduationCap size={22} className={styles.icon} /> Education
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div style={{ paddingLeft: 5 }}>
                  <h4
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: 18,
                      color: "var(--p-text)",
                    }}
                  >
                    {member.highest_education || "Not provided"}
                  </h4>

                  {member.branch && (
                    <p
                      style={{
                        color: "var(--p-muted)",
                        margin: "5px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <BookOpen size={16} />
                      {member.branch}
                    </p>
                  )}

                  <div
                    className={`${styles.badge} ${styles.typeBadge}`}
                    style={{ display: "inline-block" }}
                  >
                    Class of {passOutYear}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Phone size={22} className={styles.icon} /> Contact Info
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 15 }}>
                  <Smartphone size={20} />
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        color: "var(--p-muted2)",
                        fontWeight: 700,
                      }}
                    >
                      MOBILE
                    </label>
                    <div style={{ fontWeight: 600, color: "var(--p-text2)" }}>
                      {member.mobileNumber || "N/A"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 15 }}>
                  <Mail size={20} />
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        color: "var(--p-muted2)",
                        fontWeight: 700,
                      }}
                    >
                      EMAIL
                    </label>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--p-text2)",
                        wordBreak: "break-all",
                      }}
                    >
                      {member.email || "N/A"}
                    </div>
                  </div>
                </div>

                {member.linkedinUrl && (
                  <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                    <Linkedin size={20} />
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          color: "var(--p-muted2)",
                          fontWeight: 700,
                        }}
                      >
                        LINKEDIN
                      </label>
                      <div>
                        <a
                          href={member.linkedinUrl.startsWith("http") ? member.linkedinUrl : `https://${member.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 600,
                            color: "#0a66c2",
                            textDecoration: "none",
                            wordBreak: "break-all",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          View Profile <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Languages size={22} className={styles.icon} /> Languages
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {member.languages?.length > 0 ? (
                  member.languages.map((lang) => (
                    <span
                      key={lang}
                      style={{
                        background: "rgba(148,163,184,0.10)",
                        border: "1px solid var(--p-border-soft)",
                        color: "var(--p-text2)",
                        padding: "8px 16px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "var(--p-muted)", fontSize: 14 }}>
                    No languages listed
                  </p>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <CertificateIcon size={22} className={styles.icon} /> Certificates
              </div>

              {certifications.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {certifications.slice(0, 3).map((c, idx) => {
                    const name = c?.name || c?.title || "Certificate";
                    const desc = c?.description || c?.organization || "";
                    const date = c?.certifiedDate || c?.year || "";

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          border: "1px solid var(--p-border-soft)",
                          background: "rgba(148,163,184,0.06)",
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                          {name}
                        </div>

                        {desc && (
                          <div
                            style={{
                              color: "var(--p-muted)",
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {desc}
                          </div>
                        )}

                        {date && (
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 13,
                              color: "var(--p-muted2)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Calendar size={14} /> {date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)", fontSize: 14 }}>
                  No certificates added
                </p>
              )}
            </section>

            {(member.resume || member.resumeLink) && (
              <section
                className={styles.card}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "var(--p-text)",
                    marginBottom: 20,
                  }}
                >
                  <FileText size={22} className={styles.icon} />
                  <h3 style={{ margin: 0, fontSize: 18 }}>Resume</h3>
                </div>

                <a
                  href={member.resumeLink || `${BACKEND_URL}/${member.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #e11d48, #be123c)",
                    color: "white",
                    padding: 12,
                    borderRadius: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(225, 29, 72, 0.2)",
                  }}
                >
                  View CV
                </a>
              </section>
            )}
          </div>
        </div>
      )}

      {activeTab === "experience" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Briefcase size={22} className={styles.icon} /> Experience
              </div>

              {Array.isArray(expList) && expList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {expList.map((exp, idx) => (
                    <div
                      key={exp?._id || idx}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: "1px solid var(--p-border-soft)",
                        background: "rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                        {exp?.role || exp?.title || exp?.designation || "Role not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted)", marginTop: 6 }}>
                        {exp?.company ||
                          exp?.organization ||
                          exp?.companyName ||
                          "Company not specified"}
                      </div>
                      <div style={{ color: "var(--p-muted2)", fontSize: 13, marginTop: 8 }}>
                        {exp?.startDate || exp?.from || "Start"} {" - "}
                        {exp?.currentlyWorking ? "Present" : (exp?.endDate || exp?.to || "Present")}
                      </div>
                      {exp?.description && (
                        <div style={{ marginTop: 10, color: "var(--p-text2)", lineHeight: 1.6 }}>
                          {exp.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)" }}>No experience details added.</p>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <ClipboardList size={22} className={styles.icon} /> Summary
              </div>
              <div style={{ color: "var(--p-text2)", lineHeight: 1.7 }}>
                <div>
                  <span style={{ color: "var(--p-muted2)", fontWeight: 700 }}>
                    Total Experience:
                  </span>{" "}
                  {member.workExp || 0} Years
                </div>
                {member.designation && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: "var(--p-muted2)", fontWeight: 700 }}>
                      Current Role:
                    </span>{" "}
                    {member.designation}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "education" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <GraduationCap size={22} className={styles.icon} /> Education Details
              </div>

              {Array.isArray(educationList) && educationList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {educationList.map((edu, idx) => (
                    <div
                      key={edu?._id || idx}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: "1px solid var(--p-border-soft)",
                        background: "rgba(148,163,184,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                        {edu?.degree || edu?.qualification || edu?.course || "Degree not specified"}
                      </div>

                      {edu?.branch && (
                        <div
                          style={{
                            color: "var(--p-muted)",
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <BookOpen size={14} /> {edu.branch}
                        </div>
                      )}

                      <div style={{ color: "var(--p-muted)", marginTop: 6 }}>
                        <Building size={16} style={{ marginRight: 6 }} />
                        {edu?.institution || edu?.college || edu?.school || "Institution not specified"}
                      </div>

                      <div style={{ color: "var(--p-muted2)", fontSize: 13, marginTop: 8 }}>
                        {edu?.year || edu?.passedOutYear || edu?.fromYear || "Year not specified"}
                      </div>

                      {edu?.description && (
                        <div style={{ marginTop: 10, color: "var(--p-text2)", lineHeight: 1.6 }}>
                          {edu.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ color: "var(--p-text)", fontWeight: 800 }}>
                    {member.highest_education || "Not provided"}
                  </div>

                  {member.branch && (
                    <div
                      style={{
                        color: "var(--p-muted)",
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <BookOpen size={14} /> Branch: {member.branch}
                    </div>
                  )}

                  <div style={{ color: "var(--p-muted2)", marginTop: 6 }}>
                    Class of {passOutYear}
                  </div>
                </>
              )}
            </section>
          </div>


        </div>
      )}

      {activeTab === "certificates" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <CertificateIcon size={22} className={styles.icon} /> Certificates
              </div>

              {certifications.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {certifications.map((c, idx) => {
                    const name = c?.name || c?.title || "Certificate";
                    const desc = c?.description || c?.organization || "";
                    const date = c?.certifiedDate || c?.year || "";

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          border: "1px solid var(--p-border-soft)",
                          background: "rgba(148,163,184,0.06)",
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "var(--p-text)" }}>
                          {name}
                        </div>

                        {desc && (
                          <div style={{ color: "var(--p-muted)", marginTop: 6, lineHeight: 1.6 }}>
                            {desc}
                          </div>
                        )}

                        {date && (
                          <div
                            style={{
                              color: "var(--p-muted2)",
                              fontSize: 13,
                              marginTop: 10,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Calendar size={14} /> {date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)" }}>No certificates added.</p>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <ClipboardList size={22} className={styles.icon} /> Tips
              </div>
              <p style={{ color: "var(--p-muted)" }}>
                Add certificates in your profile to show them here.
              </p>
            </section>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className={styles.profileContent}>
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Wrench size={22} className={styles.icon} /> Skills
              </div>

              {skillsList.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {skillsList.map((s, idx) => (
                    <span
                      key={`${s}-${idx}`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(59,130,246,0.35)",
                        background: "rgba(59,130,246,0.12)",
                        color: "var(--p-text)",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--p-muted)" }}>No skills added.</p>
              )}
            </section>
          </div>

          {/* <div className={styles.sideColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <CertificateIcon size={22} className={styles.icon} /> Certifications
              </div>
              <p style={{ color: "var(--p-muted)" }}>
                Your certificates are available in the Certificates tab.
              </p>
            </section>
          </div> */}
        </div>
      )}

      <AddMember
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editMember={editingMember}
        onSuccess={(updated) => {
          setMember(updated);
          if (setMemberContext) {
            setMemberContext((prev) =>
              prev.map((m) => (m._id === updated._id ? updated : m))
            );
          }
          setShowModal(false);
        }}
      />
    </div>
  );
}


export default MembersDetail;