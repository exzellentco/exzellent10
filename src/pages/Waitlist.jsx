import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, User, CheckCircle2 } from "lucide-react";
import { joinWaitlist } from "../APIs/learning";
import { validateEmail } from "../utils/SignupValidation";

// Invite-only waitlist (BestSecret-style): visitors without an invite code
// request one here and get emailed an invite when a spot opens up.
const Waitlist = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await joinWaitlist({ email, name });
      if (res?.success === false) {
        setError(res.message || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <a href="/home.html" className="auth-back">← Back to Exzellent</a>
      <div className="auth-card">
        <img src="/logo.png" className="auth-logo" alt="Exzellent" />

        {done ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "#6ee7b7" }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 className="auth-title">You're on the <span className="g">list</span></h2>
            <p className="auth-sub">
              You're on the list — check your inbox soon. We'll email you an invite as spots open up.
            </p>
            <div className="auth-foot">
              Already have an invite? <Link to="/login" className="auth-link">Log in</Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-title">Request an <span className="g">invite</span></h2>
            <p className="auth-sub">
              Exzellent is invite-only. Join the waitlist and we'll email you an invite code to create your account.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="auth-label">Name (optional)</label>
              <div className="auth-field">
                <span className="ico"><User size={18} /></span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                />
              </div>

              <label className="auth-label">Email</label>
              <div className="auth-field">
                <span className="ico"><Mail size={18} /></span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  className="auth-input"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 6 }}>
                {loading ? <><span className="auth-spinner" /> Joining…</> : "Join the waitlist"}
              </button>
            </form>

            <div className="auth-foot">
              Already have an invite? <Link to="/login" className="auth-link">Log in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Waitlist;
