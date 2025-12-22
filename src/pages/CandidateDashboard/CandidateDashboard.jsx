import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CandidateDashboard.css";

const CandidateDashboard = () => {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location= useLocation();
  const [error, setError] = useState("");

// Update the useEffect to fetch from backend:
useEffect(() => {
  console.log("Dashboard mounted - Starting data fetch");
      // Check for data in navigation state first
    if (location.state?.candidateData) {
      console.log("Data from navigation state:", location.state.candidateData);
      setCandidateData(location.state.candidateData);
      setLoading(false);
      return;
    }
  fetchCandidateData();
}, [location.state]);

const fetchCandidateData = async () => {
  try {
    console.log("=== STARTING DATA FETCH ===");
    
    // Check multiple sources for candidate data
    let candidateEmail = localStorage.getItem("candidateEmail");
    let candidateDataFromStorage = localStorage.getItem("candidateData");
    
    console.log("Source 1 - candidateEmail from localStorage:", candidateEmail);
    console.log("Source 2 - candidateData from localStorage:", candidateDataFromStorage);
    
    // Option 1: If we have full data in localStorage (from form submission)
    if (candidateDataFromStorage) {
      try {
        const parsedData = JSON.parse(candidateDataFromStorage);
        console.log("Using data from localStorage:", parsedData);
        setCandidateData(parsedData);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
      }
    }
    
    // Option 2: Fetch from API using email
    if (candidateEmail) {
      console.log("Fetching from API with email:", candidateEmail);
      const response = await API.get(`/api/candidate/profile?email=${encodeURIComponent(candidateEmail)}`);
      
      if (response.data.success) {
        console.log("API data fetched successfully:", response.data.data);
        setCandidateData(response.data.data);
        
        // Also update localStorage with fresh data
        localStorage.setItem("candidateData", JSON.stringify(response.data.data));
      } else {
        setError("Profile not found. Please register again.");
      }
    } else {
      // Option 3: No data found anywhere
      console.log("No candidate data found anywhere");
      setError("No profile data found. Please complete registration first.");
      
      // Check if we have any data in localStorage
      console.log("Full localStorage contents:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }
    }
  } catch (error) {
    console.error("Error in fetchCandidateData:", error);
    setError("Failed to load profile. Please try again.");
  } finally {
    setLoading(false);
  }
};

// Update the handleEditProfile function:
const handleEditProfile = () => {
  // You can implement edit functionality later
  alert("Edit functionality will be implemented soon!");
  // For now, you can redirect to form with current data
  // navigate("/candidate-form");
};

// Update the handleLogout function:
const handleLogout = () => {
  // Clear all candidate-related data
  localStorage.removeItem("candidateEmail");
  sessionStorage.removeItem('googleAuthFlow');
  
  // Redirect to Google login
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
    
       {/* DEBUG BUTTON - Remove after testing */}
    <div style={{
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 1000,
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '5px'
    }}>
      <button onClick={() => {
        console.log("=== DEBUG INFO ===");
        console.log("localStorage contents:");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          console.log(`${key}: ${localStorage.getItem(key)}`);
        }
        console.log("sessionStorage contents:");
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          console.log(`${key}: ${sessionStorage.getItem(key)}`);
        }
        alert("Check console for debug info");
      }}>
        Debug Storage
      </button>
    </div>

      <div className="dashboard-header">
        <h1>Candidate Dashboard</h1>
        <p>Welcome to your dashboard</p>
      </div>

      <div className="dashboard-content">
        {candidateData ? (
          <>
            <div className="profile-card">
              <div className="profile-header">
                <div className="avatar">
                  {candidateData.firstName?.charAt(0)}
                  {candidateData.lastName?.charAt(0)}
                </div>
                <div className="profile-info">
                  <h2>{candidateData.firstName} {candidateData.lastName}</h2>
                  <p className="email">{candidateData.email}</p>
                  <p className="phone">{candidateData.phone}</p>
                  <div className="auth-badge">
                    <span className="badge">Google Sign-up</span>
                  </div>
                </div>
              </div>

              <div className="profile-details">
                
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{candidateData.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{candidateData.phone}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">
                    {new Date(candidateData.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge status-${candidateData.status}`}>
                    {candidateData.status.charAt(0).toUpperCase() + candidateData.status.slice(1)}
                    </span>
                </div>
                
                {candidateData.skills && candidateData.skills.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Skills:</span>
                    <span className="detail-value">
                      {Array.isArray(candidateData.skills) 
                      ? candidateData.skills.join(", ")
                      : candidateData.skills}
                    </span>
                  </div>
                )}

                {candidateData.address && (
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{candidateData.address}</span>
                    </div>
                )}

                {candidateData.qualification && (
                  <div className="detail-item">
                    <span className="detail-label">Qualification:</span>
                    <span className="detail-value">{candidateData.qualification}</span>
                  </div>
                )}

                {candidateData.experience > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{candidateData.experience} years</span>
                  </div>
                )}

                {candidateData.resume && (
                  <div className="detail-item">
                    <span className="detail-label">Resume:</span>
                    <span className="detail-value">
                      {candidateData.resume.name || "Resume uploaded"}
                    </span>
                  </div>
                )}
              </div>

              <div className="dashboard-actions">
                <button className="action-button primary" onClick={handleEditProfile}>
                  Edit Profile
                </button>
                <button className="action-button logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
            
            <div className="dashboard-message">
              <p className="demo-note">
                <strong>Note:</strong> This is a demo flow. In production, this data will be saved to a database and retrieved via API.
              </p>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No profile data found. Please complete your registration first.</p>
            <button 
              className="action-button primary"
              onClick={() => navigate("/candidate-form")}
            >
              Complete Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;