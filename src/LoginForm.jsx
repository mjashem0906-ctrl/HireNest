import React, { useState, useEffect } from "react";
import "./index.css";
import { FaEye, FaEyeSlash, FaCheck, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ShieldCheck, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "./axios";
import { useAuth } from "./context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { recordPortalVisit } from "./utils/portalAnalytics";

const LoginForm = () => {
  const [roleType, setRoleType] = useState("Admin"); // 'Admin' | 'Recruiter'
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const res = await API.post("/auth/login", {
        ...formData,
        role: roleType,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        recordPortalVisit();
        const userData = res.data.user;
        login(userData);
        if (roleType === "Recruiter" || userData.role === "Recruiter") {
          navigate("/recruiter-dashboard");
        } else if (
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

  // Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState("email"); // 'email' | 'otp' | 'password'
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowNewPassword, setFpShowNewPassword] = useState(false);
  const [fpShowConfirmPassword, setFpShowConfirmPassword] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");

  const handleFpSendOtp = async (e) => {
    e.preventDefault();
    setFpError("");
    setFpSuccess("");

    if (!fpEmail) {
      setFpError("Email is required.");
      return;
    }

    setFpLoading(true);
    try {
      const res = await API.post("/auth/verify-admin-email", { email: fpEmail });
      if (res.data.success) {
        setFpStep("otp");
        setFpSuccess(res.data.message || "OTP sent to your registered email address.");
      } else {
        setFpError(res.data.message || "Failed to verify email.");
      }
    } catch (err) {
      console.error("Forgot Password Verify Email Error:", err);
      setFpError(err.response?.data?.message || "Failed to verify email.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpVerifyOtp = async (e) => {
    e.preventDefault();
    setFpError("");
    setFpSuccess("");

    if (!fpOtp) {
      setFpError("Please enter the 6-digit OTP.");
      return;
    }

    setFpLoading(true);
    try {
      const res = await API.post("/auth/verify-admin-otp", { email: fpEmail, otp: fpOtp });
      if (res.data.success) {
        setFpStep("password");
        setFpSuccess(res.data.message || "OTP verified successfully. You can now set your new password.");
      } else {
        setFpError(res.data.message || "Failed to verify OTP.");
      }
    } catch (err) {
      console.error("Forgot Password Verify OTP Error:", err);
      setFpError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpUpdatePassword = async (e) => {
    e.preventDefault();
    setFpError("");
    setFpSuccess("");

    if (!fpNewPassword || !fpConfirmPassword) {
      setFpError("All fields are required.");
      return;
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("New passwords do not match.");
      return;
    }

    setFpLoading(true);
    try {
      const res = await API.post("/auth/change-password-email", {
        email: fpEmail,
        otp: fpOtp,
        newPassword: fpNewPassword,
      });
      if (res.data.success) {
        setFpSuccess("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          setIsForgotPassword(false);
          setFpStep("email");
          setFpEmail("");
          setFpOtp("");
          setFpNewPassword("");
          setFpConfirmPassword("");
          setFpError("");
          setFpSuccess("");
        }, 2000);
      } else {
        setFpError(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Forgot Password Change Password Error:", err);
      setFpError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-logo">
          <img src="/Logo.png" alt="Hirenest" />
        </div>

        <div className="auth-hero">
          <div className="auth-pill">
            Connect Talent with Opportunity 🤩
          </div>
          <h1 className="auth-headline">Start your Journey</h1>
          <p className="auth-subline">
            Follow these simple steps to set up your account and find the perfect candidate.
          </p>
        </div>

        <div className="auth-steps">
          <div className={`auth-step-card ${activeStep === 1 ? 'active' : ''}`}>
            <div className="auth-step-num">1</div>
            <div className="auth-step-text">Choose your<br />Role</div>
          </div>
          <div className={`auth-step-card ${activeStep === 2 ? 'active' : ''}`}>
            <div className="auth-step-num">2</div>
            <div className="auth-step-text">Sign in to your<br />account</div>
          </div>
          <div className={`auth-step-card ${activeStep === 3 ? 'active' : ''}`}>
            <div className="auth-step-num">3</div>
            <div className="auth-step-text">Connect with<br />candidates</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-title">Welcome Back</h2>

          {/* Role Toggle */}
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn ${roleType === "Admin" ? "active" : ""}`}
              onClick={() => {
                setRoleType("Admin");
                setError("");
              }}
            >
              <ShieldCheck size={16} /> Admin
            </button>
            <button
              type="button"
              className={`auth-role-btn ${roleType === "Recruiter" ? "active" : ""}`}
              onClick={() => {
                setRoleType("Recruiter");
                setError("");
              }}
            >
              <Building2 size={16} /> Recruiter
            </button>
          </div>

          {!isForgotPassword ? (
            <form onSubmit={handleLogin}>
              <div className="auth-field">
                <div className="auth-field-header">
                  <label className="auth-label">Email or Username</label>
                </div>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder={
                      roleType === "Recruiter" ? "Enter your email" : "Enter your username"
                    }
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-field-header">
                  <label className="auth-label">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setFpStep("email");
                      setFpEmail("");
                      setFpOtp("");
                      setFpNewPassword("");
                      setFpConfirmPassword("");
                      setFpError("");
                      setFpSuccess("");
                    }}
                    style={{ background: 'none', border: 'none', color: '#215E61', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password
                  </button>
                </div>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="••••••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-submit-btn" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Continue"}
              </button>

              <div className="auth-divider">Or</div>

              <button
                type="button"
                className="auth-google-btn"
                onClick={loginWithGoogle}
              >
                <FcGoogle size={20} /> Continue with Google
              </button>
              
              <p className="auth-disclaimer">
                For Job Seeker support or inquiries, please contact us at <a href="mailto:info@hirenest.com">info@hirenest.com</a>.
                <br /><br />
                Solidarity Youth Movement Karnataka<br />
                #273 2nd Main, 1st Block, 1st Floor, R.T.Nagar, Bangalore
              </p>
            </form>
          ) : (
            <div>
              {fpError && <p className="auth-error">{fpError}</p>}
              {fpSuccess && <p className="auth-success">{fpSuccess}</p>}

              {fpStep === "email" && (
                <>
                  <div className="auth-field">
                    <div className="auth-field-header">
                      <label className="auth-label">{roleType === "Recruiter" ? "Recruiter Email" : "Admin Email"}</label>
                    </div>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder={roleType === "Recruiter" ? "Enter Recruiter Email" : "Enter Admin Email"}
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleFpSendOtp}
                    disabled={fpLoading || !fpEmail}
                  >
                    {fpLoading ? "Sending OTP..." : "Verify Email"}
                  </button>
                </>
              )}

              {fpStep === "otp" && (
                <>
                  <div className="auth-field">
                    <div className="auth-field-header">
                      <label className="auth-label">6-Digit OTP</label>
                    </div>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Enter 6-Digit OTP"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleFpVerifyOtp}
                    disabled={fpLoading || !fpOtp}
                  >
                    {fpLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}

              {fpStep === "password" && (
                <>
                  <div className="auth-field">
                    <div className="auth-field-header">
                      <label className="auth-label">New Password</label>
                    </div>
                    <div className="auth-input-wrap">
                      <input
                        type={fpShowNewPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="••••••••••••••••"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="auth-eye" onClick={() => setFpShowNewPassword((p) => !p)}>
                        {fpShowNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <div className="auth-field-header">
                      <label className="auth-label">Confirm New Password</label>
                    </div>
                    <div className="auth-input-wrap">
                      <input
                        type={fpShowConfirmPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="••••••••••••••••"
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="auth-eye" onClick={() => setFpShowConfirmPassword((p) => !p)}>
                        {fpShowConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleFpUpdatePassword}
                    disabled={fpLoading}
                  >
                    {fpLoading ? "Updating..." : "Update Password"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setFpStep("email");
                }}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '24px', width: '100%' }}
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;