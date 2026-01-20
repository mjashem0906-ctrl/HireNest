

//-------------19/01----------------1.50------------------

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../axios"; 
import "./CandidateDashboard.css";

// ✅ Define Backend URL
const BACKEND_URL = "http://localhost:5000";

const CandidateDashboard = () => {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  // ✅ Helper: Cloudinary or Local file
  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;

    const cleanPath = url.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("uploads/")
      ? cleanPath
      : `uploads/${cleanPath}`;
    return `${BACKEND_URL}/${finalPath}`;
  };

  useEffect(() => {
    if (location.state?.candidateData) {
      setCandidateData(location.state.candidateData);
      setLoading(false);
      return;
    }
    fetchCandidateData();
  }, [location.state]);

  const fetchCandidateData = async () => {
    try {
      const candidateEmail = localStorage.getItem("candidateEmail");
      if (!candidateEmail) {
        setError("No profile data found. Please login.");
        return;
      }

      const response = await API.get(
        `/candidate/profile?email=${encodeURIComponent(candidateEmail)}`
      );

      const data = response.data?.data || response.data;
      setCandidateData(data);
      localStorage.setItem("candidateData", JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    alert("Edit functionality coming soon!");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.removeItem("googleAuthFlow");
    navigate("/google-login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-header">
        <h1>Candidate Dashboard</h1>
        <p>Welcome back</p>
      </div>

      <div className="dashboard-content">
        {candidateData ? (
          <div className="profile-card">
            {/* ===== HEADER ===== */}
            <div className="profile-header">
              <div className="avatar">
                {candidateData.photo ? (
                  <img
                    src={getFileUrl(candidateData.photo)}
                    alt="Profile"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                ) : (
                  <span className="avatar-text">
                    {candidateData.firstName?.charAt(0)}
                    {candidateData.lastName?.charAt(0)}
                  </span>
                )}
              </div>

              <div className="profile-info">
                <h2>
                  {candidateData.firstName} {candidateData.lastName}
                </h2>
                <p>{candidateData.email}</p>
                <p>{candidateData.mobileNumber || candidateData.phone}</p>
              </div>
            </div>

            {/* ===== DETAILS ===== */}
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span>{candidateData.email}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span>{candidateData.mobileNumber || candidateData.phone}</span>
              </div>

              {/* ===== RESUME ===== */}
              {candidateData.resume && (
                <div className="detail-item">
                  <span className="detail-label">Resume:</span>

                  <iframe
                    src={getFileUrl(candidateData.resume)}
                    width="100%"
                    height="400px"
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      marginTop: "10px",
                    }}
                    title="Resume Preview"
                  />

                  <div style={{ marginTop: "10px" }}>
                    <a
                      href={getFileUrl(candidateData.resume)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      ⬇ Download Resume
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="dashboard-actions">
              <button className="action-button primary" onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button className="action-button logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>{error || "No profile data found."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
