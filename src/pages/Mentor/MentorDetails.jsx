import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  User,
  Edit,
  MapPin,
  Star,
  UserCheck,
  UserPlus,
  UserX,
  Trash2,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  Clock3,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import AddMentor from "./AddMentor";
import styles from "./MentorDetails.module.scss";

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  // Connect button state
  const [connectStatus, setConnectStatus] = useState(null); // null | "pending" | "accepted" | "rejected"
  const [connectingId, setConnectingId] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // ── 3D tilt refs & handlers ─────────────────────────────
  const mainCardRef = useRef(null);
  const personalCardRef = useRef(null);
  const professionalCardRef = useRef(null);
  const requestsCardRef = useRef(null);
  const rafRef = useRef({});

  const handleCardMouseMove = (e, ref, cardId) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current[cardId]) cancelAnimationFrame(rafRef.current[cardId]);
    rafRef.current[cardId] = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
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

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const role = user?.role?.toLowerCase?.() || "";
  const memberType = user?.memberType?.toLowerCase?.() || "";
  const isCandidate =
    memberType === "candidate" ||
    memberType === "member" ||
    role === "candidate" ||
    role === "member";

  // Contact details are visible only to admins or when connection is accepted
  const canSeeContact = isAdmin || connectStatus === "accepted";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/member/${id}`);
        setMentor(res.data);
      } catch (err) {
        console.error("Error fetching mentor details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Fetch this user's connection status with this mentor
  useEffect(() => {
    if (!user?.userId || !id) return;
    const fetchMyStatus = async () => {
      try {
        const res = await API.get("/api/mentor-connections/user/my-connections");
        const conn = (res.data || []).find(
          (c) => String(c.mentorId) === String(id)
        );
        setConnectStatus(conn?.status || null);
      } catch (_) { }
    };
    fetchMyStatus();
  }, [user?.userId, id]);

  useEffect(() => {
    if (!isAdmin || !id) return;

    const fetchConnectionRequests = async () => {
      try {
        setLoadingRequests(true);
        const res = await API.get(`/api/mentor-connections/mentor/${id}`);
        setConnectionRequests(res.data || []);
      } catch (err) {
        console.error("Error fetching connection requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchConnectionRequests();
  }, [id, isAdmin]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleUpdateRequest = async (requestId, newStatus) => {
    try {
      setUpdatingRequestId(requestId);

      await API.put(`/api/mentor-connections/${requestId}`, {
        status: newStatus,
      });

      setConnectionRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );

      alert(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this connection request?"
    );
    if (!confirmed) return;

    try {
      setUpdatingRequestId(requestId);
      await API.delete(`/api/mentor-connections/${requestId}`);

      setConnectionRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );

      alert("Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          className: styles.accepted,
          icon: <CheckCircle2 size={14} />,
        };
      case "rejected":
        return {
          label: "Rejected",
          className: styles.rejected,
          icon: <XCircle size={14} />,
        };
      default:
        return {
          label: "Pending",
          className: styles.pending,
          icon: <Clock3 size={14} />,
        };
    }
  };

  const handleConnectClick = () => {
    setConnectMessage("");
    setShowConnectModal(true);
  };

  const handleSendConnection = async () => {
    try {
      setConnectingId(id);
      const response = await API.post("/api/mentor-connections", {
        mentorId: id,
        message: connectMessage,
      });
      if (response.status === 201) {
        setConnectStatus("pending");
        setShowConnectModal(false);
        setConnectMessage("");
        alert("Connection request sent successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to send request";
      alert(errorMsg);
    } finally {
      setConnectingId(null);
    }
  };

  const handleBack = () => {
    navigate("/mentors");
  };

  const handleExportExcel = async () => {
    if (!mentor) return;

    // ── Sheet 1: Mentor Profile ──────────────────────────────────────
    const profileData = [
      ["Field", "Value"],
      ["Name", mentor.name || ""],
      ["Email", mentor.email || ""],
      ["Phone", mentor.mobileNumber || ""],
      ["Gender", mentor.gender || ""],
      ["Date of Birth", mentor.dateOfBirth || ""],
      ["District", mentor.district || ""],
      ["Current Institution", mentor.currentInstitutionOrCompany || ""],
      ["Designation", mentor.designation || ""],
      ["Domain / Expertise", mentor.fieldofStudy_Interest || ""],
      ["Experience (Years)", mentor.workExp || ""],
      ["Member Type", mentor.memberType || ""],
      ["Member Reference No.", mentor.memberReferenceNumber || ""],
      ["Joined", mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : ""],
    ];

    const profileSheet = XLSX.utils.aoa_to_sheet(profileData);
    profileSheet["!cols"] = [{ wch: 26 }, { wch: 40 }];

    // ── Sheet 2: Connection Activity ─────────────────────────────────
    let activityRows = [["#", "Requester Name", "Email", "Phone", "Role", "Status", "Message", "Date Sent"]];
    try {
      const res = await API.get(`/api/mentor-connections/mentor/${id}`);
      const connections = res.data || [];
      connections.forEach((conn, i) => {
        activityRows.push([
          i + 1,
          conn.userDetails?.name || "",
          conn.userDetails?.email || "",
          conn.userDetails?.phone || "",
          conn.userDetails?.memberType || conn.userDetails?.role || "",
          (conn.status || "").charAt(0).toUpperCase() + (conn.status || "").slice(1),
          conn.message || "",
          conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : "",
        ]);
      });
    } catch (_) {
      activityRows.push(["-", "No activity data available", "", "", "", "", "", ""]);
    }

    const activitySheet = XLSX.utils.aoa_to_sheet(activityRows);
    activitySheet["!cols"] = [
      { wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 16 },
      { wch: 14 }, { wch: 12 }, { wch: 40 }, { wch: 14 },
    ];

    // ── Build & save workbook ────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, profileSheet, "Profile");
    XLSX.utils.book_append_sheet(wb, activitySheet, "Connections");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mentor_${(mentor.name || "export").replace(/\s+/g, "_")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingWrap}>
          <div className={styles.loader}></div>
          <p>Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.banner}>
        <div className={styles.bannerGlow}></div>
        <div className={styles.bannerGlowTwo}></div>
      </div>

      <div className={styles.topActions}>
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back to Directory
        </button>
      </div>

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
              src={mentor?.photoUrl || "/members/AnonymousImage.jpg"}
              className={styles.avatar}
              alt={mentor?.name}
              onError={(e) => {
                e.target.src = "/members/AnonymousImage.jpg";
              }}
            />
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              AVAILABLE
            </div>
          </div>

          <div className={styles.heroText}>
            <h1>{mentor?.name || "Mentor"}</h1>
            <p className={styles.designation}>
              {mentor?.designation || "Expert Mentor"}
            </p>

            <div className={styles.quickMeta}>
              <span>
                <MapPin size={16} />
                {mentor?.district || "Remote"}
              </span>
              <span>
                <Star size={16} />
                {mentor?.workExp ? `${mentor.workExp} Years Experience` : "Experience N/A"}
              </span>
              <span>
                <Calendar size={16} />
                Joined{" "}
                {mentor?.createdAt
                  ? new Date(mentor.createdAt).getFullYear()
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.cardBtns}>
          {isAdmin && (
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <Edit size={18} />
              Edit Profile
            </button>
          )}
          {isAdmin && (
            <button onClick={handleExportExcel} className={styles.exportBtn}>
              <Download size={18} />
              Export Excel
            </button>
          )}
        </div>

        {isCandidate && (() => {
          let btnClass = styles.connectBtn;
          let btnLabel;
          const isSending = connectingId === id;

          if (connectStatus === "accepted") {
            btnClass = `${styles.connectBtn} ${styles.connectConnected}`;
            btnLabel = <><CheckCircle2 size={17} /> Connected</>;
          } else if (connectStatus === "rejected") {
            btnClass = `${styles.connectBtn} ${styles.connectRejected}`;
            btnLabel = <><XCircle size={17} /> Rejected</>;
          } else if (connectStatus === "pending") {
            btnClass = `${styles.connectBtn} ${styles.connectPending}`;
            btnLabel = <><Clock size={17} /> Pending</>;
          } else {
            btnLabel = isSending
              ? "Sending..."
              : <><UserPlus size={17} /> Connect</>;
          }

          return (
            <button
              onClick={handleConnectClick}
              disabled={!!connectStatus || isSending}
              className={btnClass}
            >
              {btnLabel}
            </button>
          );
        })()}
      </div>

      <div
        className={`${styles.contentGrid} ${styles.animateIn}`}
        style={{ animationDelay: "0.12s" }}
      >
        <section
          ref={personalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, personalCardRef, "personal")}
          onMouseLeave={() => handleCardMouseLeave(personalCardRef, "personal")}
          className={styles.infoCard}
          style={{ order: !isAdmin ? 2 : 1 }}
        >
          <div className={styles.cardGlow} />
          <div className={styles.cardShine} />

          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <User size={20} />
            </div>
            <h2>{isAdmin ? "Personal Details" : "Contact Details"}</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={`${styles.item} ${!isAdmin ? styles.fullWidth : ''}`}>
              <label>Full Name</label>
              <div className={styles.value}>{mentor?.name || "—"}</div>
            </div>

            {isAdmin && (
              <div className={styles.item}>
                <label>Gender</label>
                <div className={styles.value}>{mentor?.gender || "Not Specified"}</div>
              </div>
            )}

            <div className={`${styles.item} ${!canSeeContact ? styles.hiddenContactItem : ''}`}>
              <label>Email Address</label>
              {canSeeContact ? (
                <div className={styles.value}>{mentor?.email || "—"}</div>
              ) : (
                <div className={styles.hiddenContact}>
                  <Lock size={14} />
                  <span>Connect to view</span>
                </div>
              )}
            </div>



            {isAdmin && (
              <>
                <div className={styles.item}>
                  <label>Age</label>
                  <div className={styles.value}>
                    {mentor?.dateOfBirth
                      ? `${calculateAge(mentor.dateOfBirth)} Years`
                      : "—"}
                  </div>
                </div>

                <div className={styles.item}>
                  <label>Location</label>
                  <div className={styles.value}>{mentor?.district || "Remote"}</div>
                </div>
              </>
            )}
          </div>
        </section>

        <section
          ref={professionalCardRef}
          onMouseMove={(e) => handleCardMouseMove(e, professionalCardRef, "professional")}
          onMouseLeave={() => handleCardMouseLeave(professionalCardRef, "professional")}
          className={styles.infoCard}
          style={{ order: !isAdmin ? 1 : 2 }}
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
              <label>Current Institution</label>
              <div className={styles.value}>
                {mentor?.currentInstitutionOrCompany || "N/A"}
              </div>
            </div>

            <div className={styles.item}>
              <label>Designation</label>
              <div className={styles.value}>{mentor?.designation || "—"}</div>
            </div>

            <div className={styles.item}>
              <label>Experience</label>
              <div className={styles.value}>
                {mentor?.workExp ? `${mentor.workExp} Years` : "N/A"}
              </div>
            </div>

            <div className={styles.item}>
              <label>Member Type</label>
              <div className={styles.value}>{mentor?.memberType || "Mentor"}</div>
            </div>

            <div className={`${styles.item} ${styles.fullWidth}`}>
              <label>Domain</label>
              <div className={styles.expertiseTags}>
                {mentor?.fieldofStudy_Interest ? (
                  mentor.fieldofStudy_Interest.split(",").map((tag, index) => (
                    <span key={`${tag}-${index}`} className={styles.tag}>
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className={styles.tag}>Mentorship</span>
                )}
              </div>
            </div>

            {mentor?.skills && mentor.skills.length > 0 && (
              <div className={`${styles.item} ${styles.fullWidth}`}>
                <label>Skills</label>
                <div className={styles.expertiseTags}>
                  {mentor.skills.map((skill, index) => (
                    <span key={`skill-${index}`} className={styles.tag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Connect Modal */}
      {showConnectModal && mentor && (
        <div className={styles.modalOverlay} onClick={() => setShowConnectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Connect with {mentor.name}</h2>
            <p>Send a message to {mentor.designation || "this mentor"} (optional)</p>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className={styles.selectInput}
              style={{ marginBottom: "10px" }}
            >
              <option value="" disabled hidden style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>Domains</option>
              {mentor?.fieldofStudy_Interest?.split(",").map((domain, idx) => (
                <option key={`domain-${idx}`} value={domain.trim()} style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>
                  {domain.trim()}
                </option>
              ))}
            </select>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className={styles.selectInput}
              style={{ marginBottom: "10px" }}
            >
              <option value="" disabled hidden style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>Skills</option>
              {mentor?.skills?.map((skill, idx) => (
                <option key={`skill-${idx}`} value={skill} style={{ backgroundColor: "var(--md-card-solid)", color: "var(--md-text)" }}>
                  {skill}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Tell them why you'd like to connect..."
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              className={styles.messageInput}
              rows={4}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowConnectModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                disabled={!!connectingId}
                className={styles.sendBtn}
              >
                {connectingId ? "Sending..." : <><Send size={16} /> Send Request</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <AddMentor
          editData={mentor}
          isEditing={true}
          onSuccess={(updated) => {
            setMentor(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isAdmin && (
        <div
          className={`${styles.requestsSectionWrap} ${styles.animateIn}`}
          style={{ animationDelay: "0.22s" }}
        >
          <section
            ref={requestsCardRef}
            onMouseMove={(e) => handleCardMouseMove(e, requestsCardRef, "requests")}
            onMouseLeave={() => handleCardMouseLeave(requestsCardRef, "requests")}
            className={styles.requestsCard}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardShine} />

            <div className={styles.requestsHeader}>
              <div>
                <h2>
                  <div className={styles.iconBox}>
                    <UserCheck size={20} />
                  </div>
                  Connection Requests
                </h2>
                <p>Manage mentor requests and view candidate profiles</p>
              </div>

              <div className={styles.requestsCount}>
                {connectionRequests.length} Request
                {connectionRequests.length !== 1 ? "s" : ""}
              </div>
            </div>

            {loadingRequests ? (
              <div className={styles.emptyState}>Loading connection requests...</div>
            ) : connectionRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <AlertCircle size={18} />
                No connection requests yet
              </div>
            ) : (
              <div className={styles.requestsList}>
                {connectionRequests.map((request) => {
                  const status = getStatusConfig(request.status);

                  return (
                    <div key={request._id} className={styles.requestItem}>
                      <div className={styles.requestTop}>
                        <div className={styles.requestUserBlock}>
                          <div className={styles.userAvatar}>
                            {request.userDetails?.photoUrl ? (
                              <img
                                src={request.userDetails.photoUrl}
                                alt={request.userDetails?.name}
                                onError={(e) => {
                                  e.target.src = "/members/AnonymousImage.jpg";
                                }}
                              />
                            ) : (
                              <span>
                                {request.userDetails?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>

                          <div className={styles.userInfo}>
                            <div className={styles.userLabel}>User Information</div>
                            <h3>{request.userDetails?.name || "Unknown User"}</h3>

                            <div className={styles.inlineMeta}>
                              <span>
                                <Mail size={14} />
                                {request.userDetails?.email || "No email"}
                              </span>
                              <span>
                                <Phone size={14} />
                                {request.userDetails?.phone || "No phone"}
                              </span>
                            </div>

                            <div className={styles.roleLine}>
                              Role:{" "}
                              {request.userDetails?.memberType ||
                                request.userDetails?.role ||
                                "User"}
                            </div>
                          </div>
                        </div>

                        <div className={`${styles.statusPill} ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>

                      <div className={styles.requestBody}>
                        <div className={styles.metaCard}>
                          <label>
                            <Calendar size={14} />
                            Request Date
                          </label>
                          <p>
                            {request.createdAt
                              ? new Date(request.createdAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>

                        <div className={styles.metaCard}>
                          <label>
                            <Clock3 size={14} />
                            Last Updated
                          </label>
                          <p>
                            {request.updatedAt
                              ? new Date(request.updatedAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className={styles.messageSection}>
                          <label>
                            <MessageSquare size={14} />
                            User Message
                          </label>
                          <div className={styles.messageBox}>
                            {request.message}
                          </div>
                        </div>
                      )}

                      <div className={styles.requestActions}>
                        {request.userMemberId && (
                          <button
                            type="button"
                            className={styles.viewProfileBtn}
                            onClick={() =>
                              navigate(`/member/${request.userMemberId}`)
                            }
                          >
                            <Eye size={16} />
                            View Profile
                          </button>
                        )}

                        {request.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateRequest(request._id, "accepted")
                              }
                              disabled={updatingRequestId === request._id}
                              className={styles.acceptBtn}
                            >
                              <UserCheck size={15} />
                              {updatingRequestId === request._id
                                ? "Updating..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateRequest(request._id, "rejected")
                              }
                              disabled={updatingRequestId === request._id}
                              className={styles.rejectBtn}
                            >
                              <UserX size={15} />
                              {updatingRequestId === request._id
                                ? "Updating..."
                                : "Reject"}
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(request._id)}
                          disabled={updatingRequestId === request._id}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MentorDetails;