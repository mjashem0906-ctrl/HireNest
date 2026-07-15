import React, { useEffect, useState } from "react";
import { Bell, Settings as SettingsIcon, ChevronDown, Lock, Eye, EyeOff } from "lucide-react";
import CustomCard from "../../components/UI/CustomCard";
import ToggleSwitch from "../../components/UI/ToggleSwitch";
import { useAuth } from "../../context/AuthContext";
import API from "../../axios";
import styles from "./Settings.module.scss";

function Settings() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordChangeMode, setPasswordChangeMode] = useState("username");
  const [adminEmail, setAdminEmail] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Load notification workflow settings (Admin only)
  useEffect(() => {
    const fetchWorkflows = async () => {
      if (user?.role !== "Admin") return;
      try {
        const res = await API.get("/api/notifications/workflow");
        if (res.data.success) {
          setWorkflows(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load workflows:", err);
      } finally {
        setLoadingWorkflows(false);
      }
    };

    if (user) {
      fetchWorkflows();
    }
  }, [user]);

  const handleSaveWorkflows = async () => {
    try {
      const res = await API.put("/api/notifications/workflow", { workflows });
      if (res.data.success) {
        alert("Notification workflow configurations updated successfully!");
        setWorkflows(res.data.data);
      }
    } catch (err) {
      console.error("Failed to save workflows:", err);
      alert("Failed to update workflow configurations.");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await API.post("/auth/change-password", {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerifyEmail = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!adminEmail) {
      setPasswordError("Email is required.");
      return;
    }
    
    setIsVerifyingEmail(true);
    try {
      const res = await API.post("/auth/verify-admin-email", { email: adminEmail });
      if (res.data.success) {
        setIsEmailVerified(true);
        setPasswordSuccess("Email verified. You can now enter your new password.");
      } else {
        setPasswordError(res.data.message || "Failed to verify email.");
      }
    } catch (err) {
      console.error("Failed to verify email:", err);
      setPasswordError(err.response?.data?.message || "Failed to verify email.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleChangePasswordByEmail = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await API.post("/auth/change-password-email", {
        email: adminEmail,
        newPassword
      });
      if (res.data.success) {
        setPasswordSuccess("Password updated successfully! A notification email has been sent.");
        setAdminEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setIsEmailVerified(false);
      } else {
        setPasswordError(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Failed to change password via email:", err);
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.headerRow}>
        <SettingsIcon size={28} className={styles.headerIcon} />
        <h2>Settings</h2>
      </div>

      <div className={styles.settingsGrid}>
        {/* Notification Workflow Configuration (Admin Only) */}
        {user?.role === "Admin" && (
          <CustomCard className={`${styles.settingsCard} ${styles.workflowCard}`}>
            <div 
              className={styles.cardHeader} 
              onClick={() => setIsWorkflowOpen(!isWorkflowOpen)}
            >
              <div className={styles.headerLeft}>
                <Bell size={24} />
                <h3>Notification Workflow Manager</h3>
              </div>
              <ChevronDown 
                size={20} 
                className={`${styles.chevronIcon} ${isWorkflowOpen ? styles.rotated : ""}`} 
              />
            </div>
            
            <div className={`${styles.workflowContent} ${isWorkflowOpen ? styles.expanded : styles.collapsed}`}>
              <p className={styles.workflowIntro}>
                Configure system notification flows. Toggle In-App and Email alerts for system events.
              </p>

              {loadingWorkflows ? (
                <div className={styles.loaderSpinner}>Loading workflows...</div>
              ) : (
                <div className={styles.workflowList}>
                  {workflows.map((wf, idx) => (
                    <div key={wf.notificationType} className={styles.workflowItem}>
                      <div className={styles.workflowInfo}>
                        <h4>{wf.displayName}</h4>
                        <p>{wf.description}</p>
                        <span className={styles.roleTag}>Recipient: {wf.recipientRole}</span>
                      </div>
                      <div className={styles.workflowToggles}>
                        <ToggleSwitch
                          label="In-App Database Alert"
                          checked={wf.inAppEnabled}
                          onChange={(checked) => {
                            const updated = [...workflows];
                            updated[idx].inAppEnabled = checked;
                            setWorkflows(updated);
                          }}
                        />
                        <ToggleSwitch
                          label="Email Dispatch"
                          checked={wf.emailEnabled}
                          onChange={(checked) => {
                            const updated = [...workflows];
                            updated[idx].emailEnabled = checked;
                            setWorkflows(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button className={styles.saveWorkflowsBtn} onClick={handleSaveWorkflows}>
                    Save Workflow Configuration
                  </button>
                </div>
              )}
            </div>
          </CustomCard>
        )}

        {/* Admin Password Reset Configuration */}
        {user?.role === "Admin" && (
          <CustomCard className={`${styles.settingsCard} ${styles.workflowCard}`}>
            <div 
              className={styles.cardHeader} 
              onClick={() => setIsPasswordOpen(!isPasswordOpen)}
            >
              <div className={styles.headerLeft}>
                <Lock size={24} />
                <h3>Change Admin Password</h3>
              </div>
              <ChevronDown 
                size={20} 
                className={`${styles.chevronIcon} ${isPasswordOpen ? styles.rotated : ""}`} 
              />
            </div>
            
            <div className={`${styles.workflowContent} ${isPasswordOpen ? styles.expanded : styles.collapsed}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p className={styles.workflowIntro} style={{ margin: 0 }}>
                  Update your admin account password.
                </p>
                
                <div style={{ display: 'flex', background: 'var(--md-soft)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                  <button 
                    onClick={() => { setPasswordChangeMode("username"); setPasswordError(""); setPasswordSuccess(""); }}
                    style={{ 
                      padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                      background: passwordChangeMode === "username" ? 'var(--md-card-solid)' : 'transparent',
                      color: passwordChangeMode === "username" ? 'var(--md-text)' : 'var(--md-muted)',
                      boxShadow: passwordChangeMode === "username" ? 'var(--md-shadow-sm)' : 'none'
                    }}
                  >
                    Username
                  </button>
                  <button 
                    onClick={() => { setPasswordChangeMode("email"); setPasswordError(""); setPasswordSuccess(""); }}
                    style={{ 
                      padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                      background: passwordChangeMode === "email" ? 'var(--md-card-solid)' : 'transparent',
                      color: passwordChangeMode === "email" ? 'var(--md-text)' : 'var(--md-muted)',
                      boxShadow: passwordChangeMode === "email" ? 'var(--md-shadow-sm)' : 'none'
                    }}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className={styles.passwordForm}>
                {passwordError && <p className={styles.errorText}>{passwordError}</p>}
                {passwordSuccess && <p className={styles.successText}>{passwordSuccess}</p>}
                
                {passwordChangeMode === "username" ? (
                  <>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.inputField}
                      />
                      {showCurrentPassword ? (
                        <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowCurrentPassword(false)} />
                      ) : (
                        <Eye size={18} className={styles.eyeIcon} onClick={() => setShowCurrentPassword(true)} />
                      )}
                    </div>

                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.inputField}
                      />
                      {showNewPassword ? (
                        <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowNewPassword(false)} />
                      ) : (
                        <Eye size={18} className={styles.eyeIcon} onClick={() => setShowNewPassword(true)} />
                      )}
                    </div>

                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.inputField}
                      />
                      {showConfirmPassword ? (
                        <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowConfirmPassword(false)} />
                      ) : (
                        <Eye size={18} className={styles.eyeIcon} onClick={() => setShowConfirmPassword(true)} />
                      )}
                    </div>
                    
                    <button 
                      className={styles.saveWorkflowsBtn} 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      style={{ marginTop: '10px' }}
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </>
                ) : (
                  <>
                    <h4 style={{ color: 'var(--md-text)', marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>Change Password using email</h4>
                    
                    <div className={styles.passwordInputContainer}>
                      <input
                        type="email"
                        placeholder="Enter Admin Email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className={styles.inputField}
                        disabled={isEmailVerified}
                      />
                    </div>
                    
                    {!isEmailVerified ? (
                      <button 
                        className={styles.saveWorkflowsBtn} 
                        onClick={handleVerifyEmail}
                        disabled={isVerifyingEmail || !adminEmail}
                        style={{ marginTop: '10px' }}
                      >
                        {isVerifyingEmail ? "Verifying..." : "Verify Email"}
                      </button>
                    ) : (
                      <>
                        <div className={styles.passwordInputContainer} style={{ marginTop: '16px' }}>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.inputField}
                          />
                          {showNewPassword ? (
                            <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowNewPassword(false)} />
                          ) : (
                            <Eye size={18} className={styles.eyeIcon} onClick={() => setShowNewPassword(true)} />
                          )}
                        </div>

                        <div className={styles.passwordInputContainer}>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.inputField}
                          />
                          {showConfirmPassword ? (
                            <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowConfirmPassword(false)} />
                          ) : (
                            <Eye size={18} className={styles.eyeIcon} onClick={() => setShowConfirmPassword(true)} />
                          )}
                        </div>
                        
                        <button 
                          className={styles.saveWorkflowsBtn} 
                          onClick={handleChangePasswordByEmail}
                          disabled={isChangingPassword}
                          style={{ marginTop: '10px' }}
                        >
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </CustomCard>
        )}
      </div>
    </div>
  );
}

export default Settings;
