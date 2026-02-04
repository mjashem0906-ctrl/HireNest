import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import API from "./axios";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    const processLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");

      console.log("[OAuth] Processing success redirect...");

      try {
        if (urlToken) {
          console.log("[OAuth] Token found in URL, saving to storage...");
          localStorage.setItem("token", urlToken);
        }

        // The axios interceptor will now automatically pick up this token
        // Combined with standard VITE_API_URL
        const res = await API.get("/auth/check");


        console.log("[OAuth] Auth check successful:", res.data);
        const userData = res.data;

        // Important: Update AuthContext immediately
        login(userData);

        // Redirect to home/dashboard directly as requested by user
        console.log("[OAuth] Login complete, directing home...");
        navigate("/", { replace: true });

      } catch (err) {
        console.error("[OAuth] Auth check failed internally:", err);
        setErrorDetails(err.response?.data?.message || err.message);

        // Wait a moment so user can see what happened if it fails
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    processLogin();
  }, [navigate, login]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
      <div className="loader"></div>
      <h2 style={{ marginTop: '2rem', color: '#333' }}>Securely signing you in...</h2>
      <p style={{ color: '#666' }}>Verifying your credentials with our server</p>

      {errorDetails && (
        <div style={{ marginTop: '20px', color: '#dc3545', background: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #ffc1c1' }}>
          <strong>Login Error:</strong> {errorDetails}<br />
          Redirecting back to login page...
        </div>
      )}
    </div>
  );
}

export default OAuthSuccess;
