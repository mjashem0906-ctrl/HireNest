
import React, { useState } from "react";
import "./index.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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

  // Google Login
  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  // Normal Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", formData);

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.success) {

        // SAVE JWT TOKEN
        localStorage.setItem("token", res.data.token);

        const userData = res.data.user;

        // SAVE USER DATA IN CONTEXT
        login(userData);

        // Admins bypass the profile setup requirement
        if (
          userData.role !== "Admin" &&
          (!userData.memberId ||
            userData.profileCompleted === 0)
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

      setError(
        err.response?.data?.message || "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="login-container">
        <div className="login-box">

          <h2 className="login-title">
            Welcome Back
          </h2>

          <p className="login-subtitle">
            Sign in to your account
          </p>

          <form onSubmit={handleLogin}>

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value,
                })
              }
              className="input-field"
              required
            />

            {/* Password */}
            <div className="password-container">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="input-field password-input"
                required
              />

              <button
                type="button"
                className="eye-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label="Toggle password visibility"
              >
                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />}
              </button>

            </div>

            {/* Error */}
            {error && (
              <p className="error-text">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              className="sign-in-button"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="google-login-button"
              onClick={loginWithGoogle}
            >
              <FcGoogle size={22} />
              <span>
                Continue with Google
              </span>
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;