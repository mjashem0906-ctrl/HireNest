import React from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./GoogleLogin.css";

const GoogleLogin = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    console.log("Google login clicked - Redirecting to candidate form");
    
    // For now, we'll simulate a simple Google login
    // We're not actually authenticating, just redirecting
    
    // Store a flag in localStorage/sessionStorage to indicate Google login flow
    sessionStorage.setItem('googleAuthFlow', 'true');
    sessionStorage.setItem('authSource', 'google');
    
    // Redirect directly to candidate form
    navigate("/candidate-form");
  };

  const handleRegularLogin = () => {
    // Clear any Google flow flags
    sessionStorage.removeItem('googleAuthFlow');
    sessionStorage.removeItem('authSource');
    navigate("/login");
  };

  return (
    <div className="google-login-container">
      <div className="google-login-box">
        <div className="google-logo">
          <FcGoogle size={64} />
        </div>
        
        <h1 className="google-login-title">Candidate Registration</h1>
        <p className="google-login-subtitle">
          Sign up as a candidate using Google to access opportunities
        </p>
        
        <button 
          className="google-login-button"
          onClick={handleGoogleLogin}
        >
          <FcGoogle size={24} />
          <span>Continue with Google</span>
        </button>
        
        <div className="login-note">
          <p>
            <strong>Note:</strong> This is a simplified flow for development.
            <br />
            In production, you'll be redirected to Google for authentication.
          </p>
        </div>
        
        <div className="alternative-option">
          <p>Already have an account?</p>
          <button 
            className="alt-login-button"
            onClick={handleRegularLogin}
          >
            Sign in with Email
          </button>
        </div>
        
<div className="login-note">
  <p>
    <strong>Development Mode:</strong> This button will directly take you to the registration form.
    <br />
    In production, you'll be redirected to Google OAuth first.
  </p>
</div>
      </div>
    </div>
  );
};

export default GoogleLogin;