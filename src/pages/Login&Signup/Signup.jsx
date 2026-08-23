import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Calendar, Gift, Shield, ChevronLeft, ChevronRight, Eye, EyeOff, Ticket, ArrowRight } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as authService from "../../APIs/Signup/SignupApis";
import { validateEmail, validateSignupForm, validatePassword } from "../../utils/SignupValidation";
import axios from "../../utils/axios";

// shared inline styles for role / gender toggles
const toggle = (active) => ({
  flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: ".92rem",
  fontFamily: "var(--a-font)", transition: "all .3s",
  color: active ? "#0a0a14" : "var(--a-text)",
  background: active ? "var(--a-grad)" : "rgba(255,255,255,.03)",
  border: active ? "1px solid transparent" : "1px solid var(--a-line)",
});
const phoneDark = {
  inputStyle: { width: "100%", height: "46px", fontSize: "14px", borderRadius: "12px", paddingLeft: "50px",
    background: "rgba(255,255,255,.03)", border: "1px solid rgba(148,163,215,.14)", color: "#eef1fb" },
  buttonStyle: { borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px", border: "1px solid rgba(148,163,215,.14)",
    borderRight: "none", background: "rgba(255,255,255,.03)" },
  dropdownStyle: { zIndex: 9999, borderRadius: "10px", background: "#0f1220", color: "#eef1fb" },
};

// ─── EmailStep ───────────────────────────────────────────────────────────────
const EmailStep = ({ formData, onChange, onSubmit, loading, errors, needInvite }) => {
  const setRole = (role) => { onChange({ target: { name: "role", value: role } }); };
  return (
    <form onSubmit={onSubmit}>
      <div className="auth-field">
        <span className="ico"><Mail size={18} /></span>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={onChange} className="auth-input" />
      </div>
      {errors?.email && <p style={{ color: "#fca5a5", fontSize: ".8rem", marginTop: -8, marginBottom: 10 }}>{errors.email}</p>}

      <label className="auth-label">Invite code</label>
      <div className="auth-field">
        <span className="ico"><Ticket size={18} /></span>
        <input type="text" name="inviteCode" placeholder="Enter your invite code" value={formData.inviteCode} onChange={onChange} className="auth-input" />
      </div>
      <p style={{ color: "var(--a-muted)", fontSize: ".78rem", marginTop: -8, marginBottom: 12, lineHeight: 1.5 }}>
        Exzellent is invite-only. Enter the invite code you were given to continue.
      </p>

      {needInvite && (
        <div style={{ background: "rgba(138,75,245,.12)", border: "1px solid rgba(138,75,245,.4)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <p style={{ color: "var(--a-violet-l)", fontSize: ".84rem", margin: "0 0 10px", lineHeight: 1.5 }}>
            Don't have an invite code? Join the waitlist and we'll email you one.
          </p>
          <Link to="/waitlist" className="auth-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", textDecoration: "none" }}>
            Request an invite <ArrowRight size={17} style={{ verticalAlign: -3 }} />
          </Link>
        </div>
      )}

      <p className="auth-label" style={{ textAlign: "center", marginTop: 8 }}>I am a:</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <button type="button" onClick={() => setRole("Student")} style={toggle(formData.role === "Student")}>Student</button>
        <button type="button" onClick={() => setRole("Teacher")} style={toggle(formData.role === "Teacher")}>Teacher</button>
      </div>

      <button type="submit" disabled={loading} className="auth-btn">
        {loading ? <><span className="auth-spinner" /> Sending OTP…</> : "Continue"}
      </button>
    </form>
  );
};

// ─── OTPStep ─────────────────────────────────────────────────────────────────
const OTPStep = ({ formData, onChange, onSubmit, loading, error, devOtp }) => (
  <form onSubmit={onSubmit}>
    {devOtp && (
      <div style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.4)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: ".82rem", color: "var(--a-violet-l, #a78bfa)" }}>
        🧪 Dev mode: your code is <b style={{ letterSpacing: 2 }}>{devOtp}</b> (no real email is sent locally)
      </div>
    )}
    <div className="auth-field">
      <span className="ico"><Lock size={18} /></span>
      <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={onChange} className="auth-input" />
    </div>
    {error && <p style={{ color: "#fca5a5", fontSize: ".8rem", marginTop: -8, marginBottom: 10 }}>{error}</p>}
    <button type="submit" disabled={loading} className="auth-btn">
      {loading ? <><span className="auth-spinner" /> Verifying…</> : "Verify OTP"}
    </button>
  </form>
);

// ─── ProfileStep ─────────────────────────────────────────────────────────────
const ProfileStep = ({ formData, onChange, onSubmit, loading, errors, setErrors, referralStatus, referralLoading, onReferralCheck }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhoneChange = (value, country) => {
    const countryCode = "+" + country.dialCode;
    const phoneNumber = value.slice(country.dialCode.length);
    onChange({ target: { name: "countryCode", value: countryCode } });
    onChange({ target: { name: "phone", value: phoneNumber } });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const step1Errors = {};
      if (!formData.name) step1Errors.name = "Name is required";
      if (!formData.password) step1Errors.password = "Password is required";
      else if (!validatePassword(formData.password))
        step1Errors.password = "Password must be at least 8 characters, include an uppercase letter, lowercase, and number.";
      if (!formData.confirmPassword) step1Errors.confirmPassword = "Please confirm password";
      if (formData.password !== formData.confirmPassword) step1Errors.confirmPassword = "Passwords do not match";

      if (Object.keys(step1Errors).length === 0) {
        setCurrentStep(2);
      } else {
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        if (typeof setErrors === "function") setErrors(step1Errors);
      }
    }
  };

  const handlePrevStep = () => setCurrentStep(1);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) handleNextStep();
    else onSubmit(e);
  };

  const err = (m) => m && <p style={{ color: "#fca5a5", fontSize: ".8rem", marginTop: 4 }}>{m}</p>;

  return (
    <div>
      <div className="auth-steps">
        <div className={`auth-dot ${currentStep >= 1 ? "on" : ""}`}>1</div>
        <div className={`auth-bar ${currentStep >= 2 ? "on" : ""}`} />
        <div className={`auth-dot ${currentStep >= 2 ? "on" : ""}`}>2</div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h3 className="auth-title" style={{ fontSize: "1.25rem" }}>{currentStep === 1 ? "Account setup" : "Personal details"}</h3>
        <p className="auth-sub" style={{ margin: "6px auto 0" }}>{currentStep === 1 ? "Create your secure account" : "Complete your profile"}</p>
      </div>

      <form onSubmit={handleFormSubmit}>
        {currentStep === 1 && (
          <>
            <label className="auth-label">Full name</label>
            <div className="auth-field">
              <span className="ico"><User size={18} /></span>
              <input name="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={onChange} className="auth-input" />
            </div>
            {err(errors.name)}

            <label className="auth-label">Password</label>
            <div className="auth-field">
              <span className="ico"><Lock size={18} /></span>
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Create password" value={formData.password} onChange={onChange} className="auth-input" style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1} className="auth-eye">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
            </div>
            {err(errors.password)}

            <label className="auth-label">Confirm password</label>
            <div className="auth-field">
              <span className="ico"><Shield size={18} /></span>
              <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" value={formData.confirmPassword} onChange={onChange} className="auth-input" style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} tabIndex={-1} className="auth-eye">{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
            </div>
            {err(errors.confirmPassword)}

            <button type="submit" className="auth-btn" style={{ marginTop: 6 }}>
              Continue <ChevronRight size={18} style={{ verticalAlign: -4 }} />
            </button>
          </>
        )}

        {currentStep === 2 && (
          <>
            <label className="auth-label">Gender</label>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {["Male", "Female"].map((g) => (
                <button type="button" key={g} onClick={() => onChange({ target: { name: "gender", value: g } })} style={toggle(formData.gender === g)}>{g}</button>
              ))}
            </div>
            {err(errors.gender)}

            <label className="auth-label">Phone number</label>
            <div style={{ marginBottom: 16 }}>
              <PhoneInput country={"in"} value={formData.countryCode.replace("+", "") + formData.phone} onChange={handlePhoneChange}
                inputStyle={phoneDark.inputStyle} buttonStyle={phoneDark.buttonStyle} dropdownStyle={phoneDark.dropdownStyle}
                enableSearch disableCountryCode={false} countryCodeEditable={false} />
              {err(errors.phone)}
            </div>

            <label className="auth-label">Date of birth</label>
            <div className="auth-field">
              <span className="ico"><Calendar size={18} /></span>
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={onChange} className="auth-input" style={{ colorScheme: "dark" }} />
            </div>
            {err(errors.dateOfBirth)}

            <label className="auth-label">Referral code (optional)</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <div className="auth-field" style={{ flex: 1, marginBottom: 0 }}>
                <span className="ico"><Gift size={18} /></span>
                <input name="referral" placeholder="Enter referral code" value={formData.referral} onChange={onChange} className="auth-input" />
              </div>
              <button type="button" onClick={onReferralCheck} disabled={!formData.referral || referralLoading} className="auth-btn auth-btn-ghost" style={{ width: "auto", padding: "0 18px" }}>
                {referralLoading ? "…" : "Apply"}
              </button>
            </div>
            {referralStatus === "valid" && <p style={{ color: "#6ee7b7", fontSize: ".82rem", marginBottom: 8 }}>Referral code applied!</p>}
            {referralStatus === "invalid" && <p style={{ color: "#fca5a5", fontSize: ".82rem", marginBottom: 8 }}>Invalid referral code</p>}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "14px 0", cursor: "pointer" }}>
              <input type="checkbox" name="terms" checked={formData.terms} onChange={onChange} style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--a-violet)" }} />
              <span style={{ fontSize: ".85rem", color: "var(--a-muted)", lineHeight: 1.5 }}>
                I read and agree to the <Link to="/terms" className="auth-link" target="_blank" rel="noopener noreferrer">Terms and Conditions</Link>
              </span>
            </label>
            {err(errors.terms)}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="button" onClick={handlePrevStep} className="auth-btn auth-btn-ghost" style={{ flex: 1 }}>
                <ChevronLeft size={16} style={{ verticalAlign: -3 }} /> Back
              </button>
              <button type="submit" disabled={loading} className="auth-btn" style={{ flex: 1 }}>
                {loading ? <><span className="auth-spinner" /> Creating…</> : "Create account"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

// ─── Signup Page ─────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [referralStatus, setReferralStatus] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [needInvite, setNeedInvite] = useState(false);
  const [showGoogleVerifiedMsg] = useState(false);

  const [formData, setFormData] = useState({ email: "", role: "Student", otp: "", name: "", password: "", confirmPassword: "", gender: "", countryCode: "+91", phone: "",
    dateOfBirth: "", referral: "", inviteCode: "", plan: "", terms: false });

  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (token) navigate("/");
    if (step === 0) initializeGoogleOAuth();
  }, [step, navigate]);

  // Prefill invite code (and plan) from the URL: ?ref=CODE / ?invite=CODE / ?plan=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref") || params.get("invite");
    const plan = params.get("plan");
    if (code || plan) {
      setFormData((prev) => ({
        ...prev,
        ...(code ? { inviteCode: code } : {}),
        ...(plan ? { plan } : {}),
      }));
    }
  }, []);

  const initializeGoogleOAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleEmailVerification,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      const buttonElement = document.getElementById("google-email-button");
      if (buttonElement) {
        buttonElement.innerHTML = "";
        window.google.accounts.id.renderButton(buttonElement, { size: "large", text: "continue_with", logo_alignment: "left" });
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOAuth;
      document.head.appendChild(script);
    }
  };

  const handleGoogleEmailVerification = async (response) => {
    setGoogleLoading(true);
    setErrors({});
    try {
      const { data } = await axios.post("/api/users/google-signup", { token: response.credential });
      if (!data.success) {
        setErrors({ submit: data.message || "Failed to verify Google email" });
        return;
      }
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      setFormData((prev) => ({ ...prev, email: payload.email, name: payload.name || "" }));
      setTempToken(data.token);
      if (formData.role === "Teacher") {
        navigate("/teacher-form", { state: { token: data.token } });
        return;
      }
      setStep(2);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to verify Google email. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "password" && errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    if (name === "confirmPassword" && errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    if (name === "referral") setReferralStatus(null);
    if (name === "inviteCode") setNeedInvite(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Invalid email address" });
      return;
    }
    setLoading(true);
    setNeedInvite(false);
    try {
      // pre-signup now carries the invite code so the backend can gate/attribute it
      const { data } = await axios.post("/api/users/pre-signup", {
        email: formData.email,
        userType: formData.role,
        inviteCode: formData.inviteCode,
      });
      if (data?.success === false) {
        if (data.needInvite) {
          setNeedInvite(true);
          setErrors({ email: data.message || "Exzellent is invite-only. Please enter a valid invite code." });
        } else {
          setErrors({ email: data.message || "Failed to send OTP. Please try again." });
        }
        return;
      }
      if (data?.devOtp) setDevOtp(String(data.devOtp));
      setStep(1);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.needInvite) {
        setNeedInvite(true);
        setErrors({ email: resp.message || "Exzellent is invite-only. Please enter a valid invite code." });
      } else {
        setErrors({ email: resp?.message || "Failed to send OTP. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = formData.role;
      const { data } = await authService.verifyOTP(formData.email, formData.otp, role);
      setTempToken(data.token);
      if (role === "Teacher") {
        navigate("/teacher-form", { state: { mode: "signup", email: formData.email, token: data.token } });
        return;
      }
      setStep(2);
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReferralCheck = async () => {
    if (!formData.referral) return;
    setReferralLoading(true);
    try {
      const isValid = await authService.verifyReferral(formData.referral);
      setReferralStatus(isValid ? "valid" : "invalid");
    } catch {
      setReferralStatus("invalid");
    } finally {
      setReferralLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateSignupForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const questionnaireAnswers = localStorage.getItem("questionnaireAnswers");
      let parsedAnswers = null;
      if (questionnaireAnswers) {
        try { parsedAnswers = JSON.parse(questionnaireAnswers); } catch { parsedAnswers = null; }
      }
      await authService.completeSignup(
        { name: formData.name, role: formData.role, password: formData.password, gender: formData.gender,
          phone: formData.countryCode + formData.phone, dateOfBirth: formData.dateOfBirth, referral: formData.referral,
          inviteCode: formData.inviteCode,
          languagesSpoken: parsedAnswers?.[1] || [], targetLanguage: parsedAnswers?.[2] || "",
          proficiencyLevel: parsedAnswers?.[3] || "", learningGoal: parsedAnswers?.[4] || "" },
        tempToken
      );
      navigate("/login");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 0: return <>Create your <span className="g">account</span></>;
      case 1: return <>Verify your <span className="g">email</span></>;
      default: return "";
    }
  };
  const getStepDescription = () => {
    switch (step) {
      case 0: return "We'll send a one-time code to verify your email.";
      case 1: return "Enter the code we just sent to your inbox.";
      default: return "";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <EmailStep formData={formData} onChange={handleChange} onSubmit={handleEmailSubmit} loading={loading} errors={errors} needInvite={needInvite} />;
      case 1:
        return <OTPStep formData={formData} onChange={handleChange} onSubmit={handleOTPSubmit} loading={loading} error={errors.otp} devOtp={devOtp} />;
      case 2:
        return (
          <div>
            {showGoogleVerifiedMsg && <div className="auth-ok">Email verified via Google — complete your profile below.</div>}
            <ProfileStep formData={formData} onChange={handleChange} onSubmit={handleFinalSubmit} loading={loading} errors={errors} setErrors={setErrors}
              referralStatus={referralStatus} referralLoading={referralLoading} onReferralCheck={handleReferralCheck} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <a href="/exzellent-index.html" className="auth-back">← Back to Exzellent</a>
      <div className="auth-card">
        <img src="/logo.png" className="auth-logo" alt="Exzellent" />
        {step < 2 && (
          <>
            <h2 className="auth-title">{getStepTitle()}</h2>
            <p className="auth-sub">{getStepDescription()}</p>
          </>
        )}

        {errors.submit && <div className="auth-error">{errors.submit}</div>}

        {step === 0 && (
          <>
            <div id="google-email-button" style={{ display: "flex", justifyContent: "center", minHeight: 44 }} />
            {googleLoading && (
              <div style={{ textAlign: "center", color: "var(--a-violet-l)", fontSize: ".88rem", marginTop: 8 }}>
                <span className="auth-spinner" /> Verifying Google email…
              </div>
            )}
            <div className="auth-divider">or</div>
          </>
        )}

        {renderStep()}

        <div className="auth-foot">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
