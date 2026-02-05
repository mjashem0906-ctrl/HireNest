import React from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./GoogleLogin.css";

const GoogleLogin = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // UPDATED: redirect to backend Google OAuth (NO localhost)
    window.location.href =
      import.meta.env.VITE_API_URL + "/api/auth/google";
  };

  const handleRegularLogin = () => {
    sessionStorage.removeItem("googleAuthFlow");
    sessionStorage.removeItem("authSource");
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
            <strong>Production Mode:</strong> You will be redirected to Google
            for authentication.
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
      </div>
    </div>
  );
};

export default GoogleLogin;
