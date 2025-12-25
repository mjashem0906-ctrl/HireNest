import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import API from "./axios";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return navigate("/login");

    // localStorage.setItem("token", token);

    // Immediately fetch user with new token
    API.get("/auth/check")
      .then(res => {
        login(res.data.user);
        navigate("/");
      })
      .catch(() => {
        navigate("/login");
      });

  }, []);

  return <p>Signing you in…</p>;
}

export default OAuthSuccess;
