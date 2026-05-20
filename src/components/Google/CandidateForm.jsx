
//------20/01----------------3.00------------

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./CandidateForm.css";
import API from "../../axios";

const CandidateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    experience: "",
    skills: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Server upload function (replaces Cloudinary)
  const uploadToServer = async (file) => {
    if (!file) return null;

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await API.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      return res.data.url;
    } catch (error) {
      console.error("Server Upload Error:", error);
      throw new Error("Failed to upload file to server.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setResumeFile(files[0]);
      // Optional: Preview or validate file
      if (files[0]) {
        const fileSize = files[0].size / 1024 / 1024; // in MB
        if (fileSize > 5) {
          setError("File size must be less than 5MB");
          return;
        }
        setError(""); // Clear any previous file errors
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Add validation function
  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) {
      errors.push("First name is required");
    }
    
    if (!formData.lastName.trim()) {
      errors.push("Last name is required");
    }
    
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email");
    }
    
    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.push("Please enter a valid 10-digit phone number");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Step 1: Upload resume to Cloudinary if file exists
      let resumeUrl = "";
      if (resumeFile) {
        try {
          resumeUrl = await uploadToServer(resumeFile);
          console.log("Resume uploaded successfully:", resumeUrl);
        } catch (uploadError) {
          console.error("Resume upload failed:", uploadError);
          // You can decide whether to proceed without resume or stop
          // For now, we'll proceed but alert the user
          alert("Resume upload failed. Your profile will be saved without resume.");
        }
      }

      // Prepare the data for backend
      const candidateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || "",
        qualification: formData.qualification || "",
        experience: formData.experience || "0",
        skills: formData.skills || "",
        authSource: "google",
        resumeUrl: resumeUrl // Add the Cloudinary URL here
      };

      console.log("Submitting candidate data:", candidateData);

      // Call the backend API
      const response = await API.post("/api/candidate/register", candidateData);

      console.log("Backend response:", response.data);

      if (response.data.success) {
        console.log("Registration successful! Storing email:", formData.email);

        // Store candidate email for dashboard retrieval
        localStorage.setItem("candidateEmail", formData.email);
        console.log("candidateEmail stored in localStorage:", localStorage.getItem("candidateEmail"));
        
        // Also store the full candidate data for immediate access
        localStorage.setItem("candidateData", JSON.stringify(response.data.data));

        // Clear Google flow flag
        sessionStorage.removeItem('googleAuthFlow');
        
        // Show success message
        alert("Registration successful! Redirecting to dashboard...");
        
        console.log("Redirecting to dashboard...");
        // Redirect to candidate dashboard
        navigate("/candidate-dashboard", { 
          state: { 
            candidateData: response.data.data 
          } 
        });
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const errorData = err.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setError(errorData.errors.join(", "));
        } else {
          setError(errorData.message || "Registration failed");
        }
      } else if (err.request) {
        // Request was made but no response
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect back to Google login page
    navigate("/google-login");
  };

  return (
    <div className="candidate-form-container">
      <div className="candidate-form-box">
        <div className="form-header">
          <div className="form-logo">
            <FcGoogle size={40} />
          </div>
          <div>
            <h2 className="candidate-form-title">Complete Your Profile</h2>
            <p className="candidate-form-subtitle">
              Please fill in your details to complete registration
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="qualification">Highest Qualification</label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="experience">Experience (Years)</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills (comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>

          <div className="form-group">
            <label htmlFor="resume">Upload Resume (PDF/DOC)</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleChange}
              className="form-file-input"
              accept=".pdf,.doc,.docx"
            />
            {resumeFile && (
              <div className="file-info">
                <p>Selected file: {resumeFile.name}</p>
                <p>Size: {(resumeFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Back to Login
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit & Proceed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;