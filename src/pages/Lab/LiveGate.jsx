import React, { useState } from "react";
import { AlertTriangle, LogIn, LogOut, Wifi, WifiOff } from "lucide-react";
import { liveLogin, liveLogout, liveUser, isLive } from "./liveApi";

/**
 * Sign-in and live/mock switch for the prototype console. LOCAL ONLY.
 *
 * The warning is not decoration: in live mode this console reads and writes the
 * production database. Someone clicking "Resolve" or "Mark absent" is changing
 * a real record, so the state has to be visible at all times rather than being
 * a setting buried somewhere.
 */
const LiveGate = ({ live, setLive, onChange }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const user = liveUser();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await liveLogin(email.trim(), password);
      setOpen(false); setPassword("");
      setLive(true); onChange && onChange();
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => { liveLogout(); setLive(false); onChange && onChange(); };

  return (
    <>
      <button
        type="button"
        className={`alh-live-toggle ${live ? "on" : ""}`}
        onClick={() => (isLive() ? (live ? disconnect() : (setLive(true), onChange && onChange())) : setOpen(true))}
        title={live ? "Connected to production — click to disconnect" : "Using demo data — click to connect"}
      >
        {live ? <Wifi size={13} /> : <WifiOff size={13} />}
        {live ? "Live data" : "Demo data"}
      </button>

      {live && (
        <span className="alh-live-warn" role="status">
          <AlertTriangle size={12} /> writes go to production
        </span>
      )}

      {open && (
        <div className="alh-modal" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form className="alh-modal-box" onSubmit={submit}>
            <h3>Connect to production</h3>
            <p className="alh-modal-warn">
              <AlertTriangle size={13} />
              This signs in to the real Exzellent backend. Everything you then see is
              real, and every action you take is written to the live database.
            </p>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     placeholder="you@exzellent.co" required autoFocus />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" required />
            </label>
            {error && <p className="alh-modal-error">{error}</p>}
            <div className="alh-modal-row">
              <button type="button" className="alh-btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="alh-btn primary" disabled={busy}>
                <LogIn size={14} /> {busy ? "Signing in…" : "Connect"}
              </button>
            </div>
            <small>The token is kept for this tab only and never written to disk.</small>
          </form>
        </div>
      )}

      {user && live && (
        <button type="button" className="alh-btn" onClick={disconnect} title="Disconnect">
          <LogOut size={13} /> {user.email}
        </button>
      )}
    </>
  );
};

export default LiveGate;
