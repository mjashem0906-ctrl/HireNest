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

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Profile setup check removed as per user request
  // The user should land on Dashboard even if profile is incomplete.

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />; // make sure this route exists
  }

  return children;


};

export default PrivateRoute;
