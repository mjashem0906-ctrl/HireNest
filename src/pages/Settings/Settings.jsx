import React, { useEffect, useState } from "react";
import { Bell, Settings as SettingsIcon, ChevronDown } from "lucide-react";
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
      </div>
    </div>
  );
}

export default Settings;
