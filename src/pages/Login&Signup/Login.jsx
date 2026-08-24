import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "../../utils/axios";

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      window.location.href = "/student-dashboard";
    }
  }, []);

  const initGoogle = useCallback(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => renderGoogleButton();
      document.head.appendChild(script);
      return;
    }
    renderGoogleButton();
  }, []);

  const renderGoogleButton = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleEmailLogin,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    const buttonElement = document.getElementById("google-login-button");
    if (buttonElement) {
      buttonElement.innerHTML = "";
      window.google.accounts.id.renderButton(buttonElement, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    }
  };

  const handleGoogleEmailLogin = async (response) => {
    setGoogleLoading(true);
    try {
      const result = await axios.post("/api/users/google-auth", {
        token: response.credential,
      });
      if (result.data.success) {
        localStorage.setItem("user", JSON.stringify(result.data));
        document.cookie = `token=${result.data.accessToken}; max-age=${
          60 * 60 * 12
        }; path=/; secure; samesite=strict`;
        const userRole = result.data.userType;
        if (userRole === "Admin") {
          navigate("/get-student");
        } else if (userRole === "Teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        setLoginError(result.data.message || "Google login failed");
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message ||
          "Failed to login with Google. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (loginError) setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSubmitting(true);
    try {
      const response = await axios.post("/api/users/login", formData);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data));
        document.cookie = `token=${response.data.accessToken}; max-age=${
          60 * 60 * 12
        }; path=/; secure; samesite=strict`;
        const userRole = response.data.userType;
        if (userRole === "Admin") {
          navigate("/get-student");
        } else if (userRole === "Teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        setLoginError(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message ||
          "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <a href="/exzellent-index.html" className="auth-back">← Back to Exzellent</a>
      <div className="auth-card">
        <img src="/logo.png" className="auth-logo" alt="Exzellent" />
        <h2 className="auth-title">Welcome <span className="g">back</span></h2>
        <p className="auth-sub">Sign in to continue your language learning journey.</p>

        {loginError && <div className="auth-error">{loginError}</div>}

        {/* Google Login Button */}
        <div
          id="google-login-button"
          onClick={initGoogle}
          role="button"
          tabIndex={0}
          style={{ display: "flex", justifyContent: "center", minHeight: 44, cursor: "pointer" }}
        />
        {googleLoading && (
          <div style={{ textAlign: "center", color: "var(--a-violet-l)", fontSize: ".88rem", marginTop: 8 }}>
            <span className="auth-spinner" /> Signing in with Google…
          </div>
        )}

        <div className="auth-divider">or</div>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="auth-label">Email address</label>
            <div className="auth-field">
              <span className="ico"><Mail size={18} /></span>
              <input name="email" type="email" required placeholder="Enter your email" value={formData.email} onChange={handleChange} className="auth-input" />
            </div>
          </div>

          <div>
            <label className="auth-label">Password</label>
            <div className="auth-field">
              <span className="ico"><Lock size={18} /></span>
              <input name="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" value={formData.password} onChange={handleChange} className="auth-input" style={{ paddingRight: 42 }} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((prev) => !prev)} className="auth-eye">
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: ".85rem" }}>Forgot password?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? "Signing in…" : "Log in"}
          </button>

          <div className="auth-foot">
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
