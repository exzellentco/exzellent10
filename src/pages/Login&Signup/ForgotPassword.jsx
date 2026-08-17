import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import StaticGridBackground from "../../components/StaticGridBackground";
import axios from "../../utils/axios"; // Import axios axios
import logo from "../../assets/Exzellent_logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempToken, setTempToken] = useState("");

  const [formData, setFormData] = useState({email: "",otp: "", newPassword: "", confirmPassword: "", });

  useEffect(() => {
    // Redirect if already logged in
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) navigate("/student-dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  // Updated Step 1: Send OTP for Password Reset using axios axios
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/users/forgot-password", {
        email: formData.email,
      });

      setSuccess(
        response.data.message || "OTP sent successfully to your email"
      );
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Updated Step 2: Verify OTP using axios axios
  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/users/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      setTempToken(response.data.token);
      setSuccess(response.data.message || "OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Updated Step 3: Reset Password using axios axios
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.newPassword)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        "/api/users/reset-password",
        {
          email: formData.email,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      setSuccess(
        response.data.message ||
          "Password reset successfully! Redirecting to login..."
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: "Forgot Password",
          subtitle: "Enter your email address and we'll send you a reset code",
          content: (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="relative w-full">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                    <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required
                        className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-xl text-white placeholder-slate-800 focus:outline-none focus:border-tertiary focus:bg-bg text-sm"/>
                  </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-primary text-white font-semibold  hover:from-primary hover:to-primary cursor-pointer transition-all duration-500 hover:scale-105">
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ),
        };

      case 2:
        return {
          title: "Verify Reset Code",
          subtitle: `Enter the 6-digit code sent to ${formData.email}`,
          content: (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                <input type="text" name="otp" placeholder="Enter 6-digit code" value={formData.otp} onChange={handleChange} maxLength="6" required
                    className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-lg text-text-secondary placeholder-slate-500 focus:outline-primary focus:bg-white text-sm"/>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/80 cursor-pointer text-white py-3 rounded-md font-bold transition-all">
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-primary py-2 font-medium hover:text-primary/80 transition cursor-pointer">← Back to Email</button>
            </form>
          ),
        };

      case 3:
        return {
          title: "Reset Password",
          subtitle: "Enter your new password",
          content: (
            <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                    <input type={showPassword ? "text" : "password" } name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange} required
                        className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-lg text-text-secondary placeholder-slate-500 focus:outline-primary focus:bg-white text-sm"/>
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-primary">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  </div>
                  <div className="relative w-full">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                    <input type={showPassword ? "text" : "password" } name="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} required
                      className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-lg text-text-secondary placeholder-slate-500 focus:outline-primary focus:bg-white text-sm"/>
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-primary">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  </div>
              <div className="text-xs text-text-secondary bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-3 rounded-full font-bold shadow hover:from-primary hover:to-blue-950 transition disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ),
        };

      default:
        return null;
    }
  };

  const stepContent = getStepContent();

  return (
    <div className="flex z-10 mt-5 items-center justify-center min-h-screen px-4 sm:px-0">
      <StaticGridBackground />
      <div className="w-full max-w-md bg-bg rounded-xl border-2 border-border p-6 sm:p-8 z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-15 flex items-center my-5"><img src={logo} className="w-full object-cover" /></div>
          <h2 className="text-2xl font-bold text-white mb-2">{stepContent.title}</h2>
          <p className="text-sm text-text-secondary font-semibold">{stepContent.subtitle}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
                ${stepNum === step ? "bg-primary text-white" : stepNum < step ? "bg-green-500 text-white" : "bg-slate-200 text-text-secondary"}`}>
                {stepNum < step ? "✓" : stepNum}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>
        )}

        {/* Form Content */}
        {stepContent.content}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link to="/login" className="text-primary font-semibold underline hover:text-primary/80">Sign in here</Link>
        </div>
      </div>
    </div>
);};

export default ForgotPassword;
