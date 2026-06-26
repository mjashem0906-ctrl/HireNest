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
              <p className={styles.workflowIntro}>
                Update your admin account password.
              </p>

              <div className={styles.passwordForm}>
                {passwordError && <p className={styles.errorText}>{passwordError}</p>}
                {passwordSuccess && <p className={styles.successText}>{passwordSuccess}</p>}
                
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
              </div>
            </div>
          </CustomCard>
        )}
      </div>
    </div>
  );
}

export default Settings;
