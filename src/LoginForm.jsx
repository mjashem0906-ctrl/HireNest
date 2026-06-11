import React, { useState } from "react";
import "./index.css";
import { FaEye, FaEyeSlash, FaCheck, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "./axios";
import { useAuth } from "./context/AuthContext";
import { FcGoogle } from "react-icons/fc";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        const userData = res.data.user;
        login(userData);
        if (
          userData.role !== "Admin" &&
          (!userData.memberId || userData.profileCompleted === 0)
        ) {
          navigate("/profile-setup");
        } else {
          navigate("/");
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* Decorative blobs */}
      <div className="lp-blob lp-blob-tr" />
      <div className="lp-blob lp-blob-bl" />

      {/* Top-left logo — absolute, outside column flow */}
      <div className="lp-logo">
        <img src="/Logo.png" alt="JobBridgeNode" />
      </div>

      {/* Two-column body */}
      <div className="lp-body">

        {/* ── LEFT ── */}
        <div className="lp-left">
          <h1 className="lp-headline">Welcome to JobBridgeNode</h1>
          <p className="lp-tagline">
            Connect talent with opportunity. Build your career or find the
            perfect candidate.
          </p>

          <ul className="lp-features">
            <li>
              <span className="lp-feat-icon"><FaCheck /></span>
              <div>
                <strong>Smart Matching</strong>
                <span>AI-powered job matching for perfect fits</span>
              </div>
            </li>
            <li>
              <span className="lp-feat-icon"><FaCheck /></span>
              <div>
                <strong>Easy Tracking</strong>
                <span>Track applications and projects seamlessly</span>
              </div>
            </li>
            <li>
              <span className="lp-feat-icon"><FaCheck /></span>
              <div>
                <strong>Build Networks</strong>
                <span>Connect with mentors and professionals</span>
              </div>
            </li>
          </ul>


        </div>

        {/* ── RIGHT (card) ── */}
        <div className="lp-right">
          <div className="lp-card">
            <h2 className="lp-card-title">Welcome Back</h2>
            <p className="lp-card-sub">Sign in to your account</p>

            <form onSubmit={handleLogin} className="lp-form">
              <div className="lp-field">
                <label>Email or Username</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="lp-field">
                <label>Password</label>
                <div className="lp-pw-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="lp-pw-input"
                    required
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && <p className="lp-error">{error}</p>}

              <button className="lp-signin-btn" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="lp-divider"><span>or</span></div>

              <p className="lp-register" style={{ textAlign: "center", margin: "4px 0 -8px", fontWeight: "600", color: "#4b5563" }}>
                For Job Seeker
              </p>
              <button
                type="button"
                className="lp-google-btn"
                onClick={loginWithGoogle}
              >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-left">
          <h4>Solidarity Youth Movement Karnataka</h4>
          <p>Connecting talent with opportunity across Karnataka</p>
        </div>

        <div className="lp-footer-right">
          <div className="lp-footer-item">
            <div className="lp-footer-icon-wrap">
              <FaMapMarkerAlt className="lp-footer-icon" />
            </div>
            <div className="lp-footer-text">
              <span className="lp-footer-label">Address</span>
              <span className="lp-footer-address">
                #273 2nd Main, 1st Block, 1st Floor, R.T.Nagar, Bangalore
              </span>
              <a
                href="https://maps.app.goo.gl/15mQX57rUR1vgws37?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-footer-location-btn"
              >
                View Location
              </a>
            </div>
          </div>

          <div className="lp-footer-item">
            <div className="lp-footer-icon-wrap">
              <FaPhoneAlt className="lp-footer-icon" />
            </div>
            <div className="lp-footer-text">
              <span className="lp-footer-label">Mobile</span>
              <a href="tel:6366234200" className="lp-footer-link">
                6366234200
              </a>
            </div>
          </div>

          <div className="lp-footer-item">
            <div className="lp-footer-icon-wrap">
              <FaEnvelope className="lp-footer-icon" />
            </div>
            <div className="lp-footer-text">
              <span className="lp-footer-label">Email</span>
              <a href="mailto:Info.jobbridge@solidaritykarnataka.org" className="lp-footer-link">
                Info.jobbridge@solidaritykarnataka.org
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;