import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CvUploadStep from "./CvUploadStep";
import ProfileFormStep from "./ProfileFormStep";
import styles from "./ProfileSetup.module.scss";

// ── Wizard step definitions ───────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Upload CV",   icon: "📄" },
  { id: 2, label: "Your Details",icon: "📝" },
  { id: 3, label: "Done!",       icon: "🎉" },
];

// ── WhatsApp links (unchanged from original) ──────────────────────────────────
const WA_FRESHER    = "https://chat.whatsapp.com/LPe6kC4RVjFFqX25uWCKA5";
const WA_EXPERIENCED = "https://chat.whatsapp.com/G29SZJqIJzY1J8lAste193";

const ProfileSetup = () => {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  // ── Wizard state ─────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1); // 1 | 2 | 3
  const [parsedData, setParsedData]   = useState({});
  const [resumeUrl, setResumeUrl]     = useState("");
  const [workExp, setWorkExp]         = useState("0"); // for WhatsApp group selection

  // ── Step 1 → Step 2: CV parsed successfully ──────────────────────────────
  const handleParsed = (data, url) => {
    setParsedData(data);
    setResumeUrl(url);
    if (data.workExp) {
      setWorkExp(data.workExp);
      sessionStorage.setItem("onboarding_workExp", data.workExp);
    } else {
      sessionStorage.setItem("onboarding_workExp", "0");
    }
    setCurrentStep(2);
  };

  // ── Step 1 → Step 2: user skips CV upload ────────────────────────────────
  const handleSkip = () => {
    setParsedData({});
    setResumeUrl("");
    sessionStorage.setItem("onboarding_workExp", "0");
    setCurrentStep(2);
  };

  // ── Step 2 → Step 3: profile saved ───────────────────────────────────────
  const handleSaved = async (finalWorkExp) => {
    console.log("[ProfileSetup] handleSaved called with finalWorkExp:", finalWorkExp);
    if (finalWorkExp !== undefined) {
      console.log("[ProfileSetup] setting workExp to:", finalWorkExp);
      setWorkExp(finalWorkExp);
      sessionStorage.setItem("onboarding_workExp", finalWorkExp);
    }
    await fetchUser(); // re-fetch fresh user data (new memberId, profileCompleted)
    setCurrentStep(3);
  };

  // ── Step 3: WhatsApp actions ──────────────────────────────────────────────
  const storedWorkExp = sessionStorage.getItem("onboarding_workExp");
  const currentWorkExp = storedWorkExp !== null ? storedWorkExp : workExp;
  
  const parseWorkExp = (val) => {
    if (!val || val === "undefined" || val === "null") return 0;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const isFresher = parseWorkExp(currentWorkExp) === 0;
  const waLink = isFresher ? WA_FRESHER : WA_EXPERIENCED;
  console.log("[ProfileSetup] render: workExp =", workExp, "storedWorkExp =", storedWorkExp, "currentWorkExp =", currentWorkExp, "isFresher =", isFresher, "waLink =", waLink);

  const handleWhatsAppJoin = () => {
    window.open(waLink, "_blank");
    navigate("/", { state: { isNew: true } });
  };

  const handleGoHome = () => {
    navigate("/", { state: { isNew: true } });
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className={styles.wizardSteps}>
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive    = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className={`${styles.wizardStep} ${isActive ? styles.wizardStepActive : ""} ${isCompleted ? styles.wizardStepDone : ""}`}>
              <div className={styles.wizardStepCircle}>
                {isCompleted ? <span className={styles.wizardCheckmark}>✓</span> : step.icon}
              </div>
              <span className={styles.wizardStepLabel}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`${styles.wizardConnector} ${isCompleted ? styles.wizardConnectorDone : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Step 3: Completion screen ─────────────────────────────────────────────
  const renderDoneStep = () => (
    <div className={styles.doneStep}>
      <div className={styles.doneAnimation}>
        <div className={styles.doneCircle}>
          <span className={styles.doneCheck}>✓</span>
        </div>
        <div className={styles.doneConfetti}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.doneConfettiPiece} style={{ "--i": i }} />
          ))}
        </div>
      </div>

      <h2 className={styles.doneTitle}>🎉 Profile Created!</h2>
      <p className={styles.doneSubtitle}>
        Your profile is all set. Join our WhatsApp community for job updates, tips & networking.
      </p>

      {/* WhatsApp group card */}
      <div className={styles.waGroupCard}>
        <div className={styles.waGroupCardIcon}>
          <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
          </svg>
        </div>
        <div className={styles.waGroupCardBody}>
          <p className={styles.waGroupCardName}>
            {isFresher ? "JBNK Freshers Community" : "JBNK Experienced Professionals"}
          </p>
          <p className={styles.waGroupCardDesc}>
            {isFresher
              ? "Entry-level jobs, career guidance & mentorship"
              : "Senior roles, referrals & industry insights"}
          </p>
        </div>
      </div>

      <div className={styles.doneActions}>
        <button className={styles.waJoinBtn} onClick={handleWhatsAppJoin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Join WhatsApp Group
        </button>
        <button className={styles.doneSkipBtn} onClick={handleGoHome}>
          Skip — Go to Dashboard →
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {/* Header */}
        <h1>Complete Your Profile</h1>
        <div className={styles.titleAccent} />
        <p>
          {currentStep === 1 && "Upload your CV and we'll auto-fill your details."}
          {currentStep === 2 && "Review and complete your profile information."}
          {currentStep === 3 && "You're all set! Welcome aboard 🚀"}
        </p>

        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Animated step container */}
        <div className={styles.wizardBody} key={currentStep}>
          {currentStep === 1 && (
            <CvUploadStep
              onParsed={handleParsed}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && (
            <ProfileFormStep
              initialData={parsedData}
              resumeUrl={resumeUrl}
              onSaved={handleSaved}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && renderDoneStep()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
