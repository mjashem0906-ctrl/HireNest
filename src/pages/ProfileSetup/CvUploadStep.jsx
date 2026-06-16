import React, { useState, useRef, useCallback } from "react";
import API from "../../axios";
import styles from "./ProfileSetup.module.scss";

/**
 * Step 1 — CV Upload
 * Handles drag-and-drop or click-to-browse, uploads to /api/upload/parse-cv,
 * and calls onParsed(parsedData, resumeUrl) so the parent can advance to Step 2.
 */
const CvUploadStep = ({ onParsed, onSkip }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const inputRef = useRef(null);

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (f) => {
    if (!f) return "No file selected.";
    if (!ALLOWED_TYPES.includes(f.type))
      return "Only PDF, DOC, or DOCX files are accepted.";
    if (f.size > 5 * 1024 * 1024)
      return "File size must be under 5 MB.";
    return null;
  };

  const processFile = useCallback(async (f) => {
    const err = validateFile(f);
    if (err) {
      setWarning(err);
      return;
    }
    setWarning("");
    setFile(f);
    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await API.post("/api/upload/parse-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setStatus("done");
      if (res.data.parseWarning) setWarning(res.data.parseWarning);

      // Small delay so the user sees the "Done!" state before advancing
      setTimeout(() => {
        onParsed(res.data.parsedData || {}, res.data.url || "");
      }, 900);
    } catch (uploadErr) {
      console.error("[CvUploadStep] Upload failed:", uploadErr);
      setStatus("error");
      setWarning("Upload failed. Please try again or skip to fill manually.");
    }
  }, [onParsed]);

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  };
  const onInputChange = (e) => {
    const picked = e.target.files[0];
    if (picked) processFile(picked);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderZoneContent = () => {
    if (status === "uploading") {
      return (
        <div className={styles.cvParsing}>
          <div className={styles.cvSpinner}></div>
          <p className={styles.cvParsingTitle}>Reading your CV…</p>
          <p className={styles.cvParsingSubtitle}>Extracting your profile details</p>
          <div className={styles.cvProgressBar}>
            <div className={styles.cvProgressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.cvProgressLabel}>{progress}%</span>
        </div>
      );
    }

    if (status === "done") {
      return (
        <div className={styles.cvDone}>
          <div className={styles.cvDoneIcon}>✓</div>
          <p className={styles.cvDoneTitle}>CV Parsed Successfully!</p>
          <p className={styles.cvDoneSubtitle}>Taking you to review your details…</p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className={styles.cvError}>
          <span className={styles.cvErrorIcon}>⚠</span>
          <p className={styles.cvErrorTitle}>Upload Failed</p>
          <p className={styles.cvErrorHint}>Please try again or skip to fill manually.</p>
        </div>
      );
    }

    // idle
    return (
      <div className={styles.cvIdle}>
        <div className={styles.cvUploadIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        </div>
        <p className={styles.cvIdleTitle}>
          {dragging ? "Drop your CV here" : "Drag & drop your CV here"}
        </p>
        <p className={styles.cvIdleSubtitle}>or click to browse</p>
        <p className={styles.cvIdleFormats}>PDF, DOC, DOCX · Max 5 MB</p>
      </div>
    );
  };

  return (
    <div className={styles.cvStep}>
      <div className={styles.cvStepHeader}>
        <div className={styles.cvStepIconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <h2 className={styles.cvStepTitle}>Upload Your CV</h2>
          <p className={styles.cvStepDesc}>
            We'll automatically fill your profile with details from your CV.
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`${styles.cvDropZone} ${dragging ? styles.cvDropZoneDragging : ""} ${status === "done" ? styles.cvDropZoneDone : ""} ${status === "error" ? styles.cvDropZoneError : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => status === "idle" || status === "error" ? inputRef.current?.click() : null}
        style={{ cursor: status === "uploading" || status === "done" ? "default" : "pointer" }}
      >
        {renderZoneContent()}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={onInputChange}
        />
      </div>

      {/* File name chip */}
      {file && status !== "error" && (
        <div className={styles.cvFileChip}>
          <span className={styles.cvFileChipIcon}>📄</span>
          <span className={styles.cvFileChipName}>{file.name}</span>
          <span className={styles.cvFileChipSize}>
            ({(file.size / 1024).toFixed(0)} KB)
          </span>
        </div>
      )}

      {/* Warning / hint text */}
      {warning && (
        <p className={styles.cvWarning}>⚠ {warning}</p>
      )}

      {/* Info bullets */}
      {status === "idle" && (
        <ul className={styles.cvInfoList}>
          <li>📋 Name, mobile, email, and LinkedIn will be auto-detected</li>
          <li>🎓 Education and work experience will be extracted</li>
          <li>💡 You can review and edit all fields before saving</li>
        </ul>
      )}

      {/* Skip link */}
      {(status === "idle" || status === "error") && (
        <button type="button" className={styles.cvSkipBtn} onClick={onSkip}>
          Skip — I'll fill my details manually →
        </button>
      )}
    </div>
  );
};

export default CvUploadStep;
