import React, { useState, useEffect } from "react";
import { X, Send, ChevronDown, Mail, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import API from "../../axios";
import styles from "./SendToRecruiterModal.module.scss";

const SendToRecruiterModal = ({ isOpen, onClose, applicant, job }) => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  const [autoSelected, setAutoSelected] = useState(false);

  // Fetch recruiters on open and auto-select from job.jobPosted
  useEffect(() => {
    if (!isOpen) return;
    setSelectedRecruiter(null);
    setAutoSelected(false);
    setStatus(null);
    setErrorMsg("");

    const fetchRecruiters = async () => {
      setLoadingRecruiters(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
        const list = res.data || [];
        setRecruiters(list);

        // Auto-select recruiter from job.jobPosted
        const jobPostedId =
          job?.jobPosted?._id || job?.jobPosted;
        if (jobPostedId) {
          const match = list.find(
            (r) => r._id === String(jobPostedId)
          );
          if (match) {
            setSelectedRecruiter(match);
            setAutoSelected(true);
          }
        }
      } catch (err) {
        console.error("Failed to load recruiters:", err);
        setRecruiters([]);
      } finally {
        setLoadingRecruiters(false);
      }
    };
    fetchRecruiters();
  }, [isOpen, job]);

  // Extract variables first so we can use them in the hook and UI
  const candidateName = applicant?.memberId?.name || "Candidate";
  const candidateEmail = applicant?.memberId?.email || "N/A";
  const candidatePhone = applicant?.memberId?.mobileNumber || "N/A";
  const qualification = applicant?.memberId?.highest_education || applicant?.memberId?.highestEducationSpecialization || "N/A";
  const experience = applicant?.memberId?.workExp || "Fresher";
  const location = [applicant?.memberId?.district, applicant?.memberId?.address].filter(Boolean).join(", ") || applicant?.memberId?.careerProfile?.location || "N/A";
  const jobTitle = job?.title || "the position";

  // Initialize email text once when modal opens or candidate changes
  const [emailText, setEmailText] = useState("");

  useEffect(() => {
    if (isOpen && applicant && job) {
      setEmailText(`Dear Recruiter,

Greetings from Job Bridge Node.

We are pleased to share the profile of a candidate who has applied for the position of ${jobTitle} at your organization through our Job Bridge Node platform.

Please find the candidate's resume attached for your review.

Candidate Details:
• Name: ${candidateName}
• Position Applied: ${jobTitle}
• Qualification: ${qualification}
• Experience: ${experience}
• Location: ${location}

We believe the candidate's profile aligns with the requirements of the position and request you to kindly review the application and consider them for the further selection process.

Should you require any additional information or assistance, please feel free to contact us.

Thank you for your time and consideration.

Best Regards,

Job Bridge Node Team
Connecting Talent with Opportunities
📧 info.jobbridge@solidaritykarnataka.org
📞 6366234200
🌐 Job Bridge Node`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicant?.memberId?._id, job?._id]);

  if (!isOpen || !applicant || !job) return null;

  const handleSend = async () => {
    if (!selectedRecruiter) {
      setErrorMsg("Please select a recruiter to send the email.");
      return;
    }
    setErrorMsg("");
    setSending(true);
    setStatus(null);

    try {
      await API.post("/api/send-to-recruiter", {
        memberId: applicant.memberId?._id,
        jobId: job._id,
        recruiterId: selectedRecruiter._id,
        customText: emailText,
      });
      setStatus("success");
    } catch (err) {
      console.error("Send email error:", err);
      setStatus("error");
      setErrorMsg(
        err?.response?.data?.message || "Failed to send email. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Mail size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Send to Recruiter</h2>
              <p className={styles.subtitle}>
                Forward <strong>{candidateName}</strong>'s profile via email
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Candidate summary */}
          <div className={styles.candidateCard}>
            <div className={styles.candidateAvatar}>
              {(candidateName || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.candidateInfo}>
              <div className={styles.candidateName}>{candidateName}</div>
              <div className={styles.candidateMeta}>
                <span><User size={12} /> {qualification}</span>
                <span><FileText size={12} /> {experience}</span>
              </div>
              <div className={styles.jobApplied}>
                Applied for: <strong>{jobTitle}</strong>
              </div>
            </div>
          </div>

          {/* Recruiter selector */}
          <div className={styles.field}>
            <label className={styles.label}>
              Select Recruiter <span className={styles.required}>*</span>
              {autoSelected && selectedRecruiter && (
                <span className={styles.autoBadge}>
                  (Auto-selected from job post)
                </span>
              )}
            </label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={selectedRecruiter?._id || ""}
                onChange={(e) => {
                  const found = recruiters.find((r) => r._id === e.target.value);
                  setSelectedRecruiter(found || null);
                  setAutoSelected(false);
                  setErrorMsg("");
                  setStatus(null);
                }}
              >
                <option value="">
                  {loadingRecruiters ? "Loading recruiters..." : "— Choose a recruiter —"}
                </option>
                {recruiters.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fullName} — {r.companyName} ({r.email})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>

            {selectedRecruiter && (
              <div className={styles.recruiterPreview}>
                <span className={styles.recruiterChip}>
                  ✉️ Will send to: <strong>{selectedRecruiter.email}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Email preview / edit */}
          <div className={styles.field}>
            <label className={styles.label}>Email Content (Editable)</label>
            <div className={styles.emailPreview}>
              <textarea
                className={styles.previewTextarea}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={16}
              />
            </div>
            <p className={styles.hint}>
              📎 Resume will be attached automatically if available.
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success message */}
          {status === "success" && (
            <div className={styles.successBanner}>
              <CheckCircle size={16} />
              <span>
                Email sent successfully to{" "}
                <strong>{selectedRecruiter?.fullName}</strong> (
                {selectedRecruiter?.email})!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            {status === "success" ? "Close" : "Cancel"}
          </button>
          {status !== "success" && (
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={sending || !selectedRecruiter}
              type="button"
            >
              {sending ? (
                <>
                  <div className={styles.btnSpinner} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Email
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendToRecruiterModal;
