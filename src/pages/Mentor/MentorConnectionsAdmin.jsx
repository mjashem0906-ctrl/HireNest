import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  X,
  Eye,
  Clock,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import styles from "./MentorConnections.module.scss";

const MentorConnectionsAdmin = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/mentor-connections/admin/all");
      setConnections(res.data || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = useMemo(() => {
    let filtered = [...connections];

    if (filterStatus) {
      filtered = filtered.filter((conn) => conn.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (conn) =>
          conn.userDetails?.name?.toLowerCase().includes(term) ||
          conn.userDetails?.email?.toLowerCase().includes(term) ||
          conn.mentorDetails?.name?.toLowerCase().includes(term) ||
          conn.mentorDetails?.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [connections, searchTerm, filterStatus]);

  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      setUpdatingId(connectionId);

      await API.put(`/api/mentor-connections/${connectionId}`, {
        status: newStatus,
      });

      setConnections((prev) =>
        prev.map((conn) =>
          conn._id === connectionId ? { ...conn, status: newStatus } : conn
        )
      );

      setSelectedConnection((prev) =>
        prev?._id === connectionId ? { ...prev, status: newStatus } : prev
      );

      alert(`Connection ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating connection:", error);
      alert("Failed to update connection");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (connectionId) => {
    if (!window.confirm("Are you sure you want to delete this connection request?")) {
      return;
    }

    try {
      setUpdatingId(connectionId);
      await API.delete(`/api/mentor-connections/${connectionId}`);
      setConnections((prev) => prev.filter((conn) => conn._id !== connectionId));

      if (selectedConnection?._id === connectionId) {
        setSelectedConnection(null);
      }

      alert("Connection deleted successfully!");
    } catch (error) {
      console.error("Error deleting connection:", error);
      alert("Failed to delete connection");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", label: "Pending" },
      accepted: { color: "#10b981", label: "Accepted" },
      rejected: { color: "#ef4444", label: "Rejected" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className={styles.connectionsContainer}>
      <div className={styles.header}>
        <div>
          <h1>Mentor Connection Requests</h1>
          <p>Manage candidate and member mentor connection requests</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by user, mentor, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilter}>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`${styles.filterBtn} ${
              filterStatus === "pending" ? styles.active : ""
            }`}
          >
            <Clock size={16} />
            Pending ({connections.filter((c) => c.status === "pending").length})
          </button>

          <button
            onClick={() => setFilterStatus("accepted")}
            className={`${styles.filterBtn} ${
              filterStatus === "accepted" ? styles.active : ""
            }`}
          >
            <CheckCircle2 size={16} />
            Accepted ({connections.filter((c) => c.status === "accepted").length})
          </button>

          <button
            onClick={() => setFilterStatus("rejected")}
            className={`${styles.filterBtn} ${
              filterStatus === "rejected" ? styles.active : ""
            }`}
          >
            <X size={16} />
            Rejected ({connections.filter((c) => c.status === "rejected").length})
          </button>

          <button
            onClick={() => setFilterStatus("")}
            className={`${styles.filterBtn} ${
              filterStatus === "" ? styles.active : ""
            }`}
          >
            All ({connections.length})
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.connectionsList}>
          {loading ? (
            <div className={styles.loading}>Loading connections...</div>
          ) : filteredConnections.length === 0 ? (
            <div className={styles.empty}>
              No mentor connections found matching your criteria.
            </div>
          ) : (
            filteredConnections.map((conn) => (
              <div
                key={conn._id}
                className={`${styles.connectionRow} ${
                  selectedConnection?._id === conn._id ? styles.selected : ""
                }`}
                onClick={() => setSelectedConnection(conn)}
              >
                <div className={styles.rowContent}>
                  <div className={styles.avatarGroup}>
                    <div className={styles.userAvatar}>
                      {conn.userDetails?.photoUrl ? (
                        <img
                          src={conn.userDetails.photoUrl}
                          alt={conn.userDetails?.name}
                          onError={(e) => {
                            e.target.src = "/members/AnonymousImage.jpg";
                          }}
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          {conn.userDetails?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <div className={styles.arrowIcon}>→</div>

                    <div className={styles.mentorAvatar}>
                      {conn.mentorDetails?.photoUrl ? (
                        <img
                          src={conn.mentorDetails.photoUrl}
                          alt={conn.mentorDetails?.name}
                          onError={(e) => {
                            e.target.src = "/members/AnonymousImage.jpg";
                          }}
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          {conn.mentorDetails?.name?.charAt(0)?.toUpperCase() || "M"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.names}>
                      <span className={styles.userName}>
                        {conn.userDetails?.name}
                      </span>
                      <span className={styles.mentorName}>
                        {conn.mentorDetails?.name}
                      </span>
                    </div>

                    <div className={styles.emails}>
                      <span>{conn.userDetails?.email}</span>
                      <span>{conn.mentorDetails?.email}</span>
                    </div>
                  </div>

                  <div className={styles.statusBadge}>
                    <span
                      className={styles.statusPill}
                      style={{
                        backgroundColor: `${getStatusBadge(conn.status).color}18`,
                        color: getStatusBadge(conn.status).color,
                        borderColor: `${getStatusBadge(conn.status).color}40`,
                      }}
                    >
                      {getStatusBadge(conn.status).label}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedConnection && (
          <div className={styles.detailsPanel}>
            <div className={styles.panelHeader}>
              <h2>Connection Details</h2>
              <button
                onClick={() => setSelectedConnection(null)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.panelContent}>
              <div className={styles.section}>
                <h3>User Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Name</label>
                    <p>{selectedConnection.userDetails?.name || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Email</label>
                    <p>{selectedConnection.userDetails?.email || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Phone</label>
                    <p>{selectedConnection.userDetails?.phone || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Member Type</label>
                    <p>{selectedConnection.userDetails?.memberType || "N/A"}</p>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  {!!selectedConnection.userMemberId && (
                    <button
                      className={styles.viewProfileBtn}
                      onClick={() =>
                        navigate(`/members/${selectedConnection.userMemberId}`)
                      }
                    >
                      <Eye size={16} />
                      View User Profile
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Mentor Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Name</label>
                    <p>{selectedConnection.mentorDetails?.name || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Email</label>
                    <p>{selectedConnection.mentorDetails?.email || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Designation</label>
                    <p>{selectedConnection.mentorDetails?.designation || "N/A"}</p>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Experience</label>
                    <p>
                      {selectedConnection.mentorDetails?.experience
                        ? `${selectedConnection.mentorDetails.experience} years`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  {!!selectedConnection.mentorId && (
                    <button
                      className={styles.viewProfileBtn}
                      onClick={() =>
                        navigate(`/mentors/${selectedConnection.mentorId}`)
                      }
                    >
                      <Eye size={16} />
                      View Mentor Profile
                    </button>
                  )}
                </div>
              </div>

              {selectedConnection.message && (
                <div className={styles.section}>
                  <h3>User Message</h3>
                  <div className={styles.messageBox}>
                    {selectedConnection.message}
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h3>Metadata</h3>
                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <Mail size={16} />
                    <span>{selectedConnection.userDetails?.email || "N/A"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Phone size={16} />
                    <span>{selectedConnection.userDetails?.phone || "N/A"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Briefcase size={16} />
                    <span>
                      {selectedConnection.mentorDetails?.designation || "Mentor"}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <CalendarDays size={16} />
                    <span>
                      {new Date(selectedConnection.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedConnection.status === "pending" && (
                <div className={styles.actions}>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedConnection._id, "accepted")
                    }
                    disabled={updatingId === selectedConnection._id}
                    className={styles.acceptBtn}
                  >
                    <UserCheck size={16} />
                    {updatingId === selectedConnection._id
                      ? "Updating..."
                      : "Accept Request"}
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedConnection._id, "rejected")
                    }
                    disabled={updatingId === selectedConnection._id}
                    className={styles.rejectBtn}
                  >
                    <UserX size={16} />
                    {updatingId === selectedConnection._id
                      ? "Updating..."
                      : "Reject Request"}
                  </button>
                </div>
              )}

              <div className={styles.deleteAction}>
                <button
                  onClick={() => handleDelete(selectedConnection._id)}
                  disabled={updatingId === selectedConnection._id}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={16} />
                  {updatingId === selectedConnection._id
                    ? "Deleting..."
                    : "Delete Connection"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorConnectionsAdmin;