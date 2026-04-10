// components/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "./axios";
import "./index.css";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="loader"></div>
      </div>
    );
  }

  // If no user after loading completes, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect new users (no memberId or incomplete profile) to profile setup
  // Admins do not need to complete a profile.
  if (user.role !== 'Admin' && (!user.memberId || user.profileCompleted === 0)) {
    // Allow access to /profile-setup itself to avoid infinite redirect
    if (window.location.pathname !== "/profile-setup") {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
