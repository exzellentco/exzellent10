import { Cookie } from "lucide-react";
import { useState, useEffect } from "react";
import CookieSvg from "../UI/CookieSvg";

/* Cookie helpers */

const COOKIE_NAME = "cookie-consent";
const COOKIE_EXPIRY_DAYS = 365;

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const getCookie = (name) => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
};

/* Component */

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const consent = getCookie(COOKIE_NAME);
    if (!consent) setVisible(true);
  }, []);

  const save = (type) => {
    let prefs;

    if (type === "accepted") {
      prefs = { analytics: true, personalization: true, type: "accepted" };
      setToastMsg("All cookies accepted — enjoy your personalized experience!");
    } else if (type === "rejected") {
      prefs = { analytics: false, personalization: false, type: "rejected" };
      setToastMsg(
        "Non-essential cookies rejected — only essential cookies are active.",
      );
    } else {
      prefs = { analytics, personalization, type: "custom" };
      const on = [
        analytics && "analytics",
        personalization && "personalization",
      ].filter(Boolean);
      setToastMsg(
        on.length
          ? `Preferences saved — ${on.join(" & ")} enabled.`
          : "Preferences saved — only essential cookies active.",
      );
    }

    setCookie(COOKIE_NAME, prefs, COOKIE_EXPIRY_DAYS);
    setVisible(false);
    setSaved(true);

    // Hide toast after 4 seconds
    setTimeout(() => setSaved(false), 4000);
  };

  if (!visible && !saved) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-50">
      {/* Banner */}
      {visible && (
        <div className="cookie-banner flex flex-col gap-5 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(142,123,252,0.15)",
                border: "1px solid rgba(142,123,252,0.25)",
              }}
            >
              <CookieSvg />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">
                We use cookies
              </h3>
              <p
                className="text-xs leading-relaxed "
                style={{ color: "var(--color-text-secondary)" }}
              >
                We use cookies to enhance your learning experience, analyze
                usage, and personalize content. Manage your preferences below.{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy policy
                </a>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-[1px]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />

          {/* Toggles */}
          <div className="flex flex-wrap gap-2">
            {/* Essential — always on */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 flex-1 min-w-[130px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-xs flex-1 font-medium">Essential</span>
              <ToggleSwitch checked={true} disabled />
            </div>

            {/* Analytics */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 flex-1 min-w-[130px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-xs flex-1 font-medium">Analytics</span>
              <ToggleSwitch
                checked={analytics}
                onChange={() => setAnalytics((v) => !v)}
              />
            </div>

            {/* Personalization */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 flex-1 min-w-[130px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-xs flex-1 font-medium">
                Personalization
              </span>
              <ToggleSwitch
                checked={personalization}
                onChange={() => setPersonalization((v) => !v)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => save("rejected")}
              className="flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-80 hover:scale-105 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "--color-text-primary",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Reject all
            </button>
            <button
              onClick={() => save("custom")}
              className="flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-80 hover:scale-105 cursor-pointer"
              style={{
                background: "rgba(142,123,252,0.1)",
                border: "1px solid rgba(142,123,252,0.35)",
              }}
            >
              Save preferences
            </button>
            <button
              onClick={() => save("accepted")}
              className="flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 hover:opacity-90 hover:scale-105 cursor-pointer"
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {saved && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3"
          style={{
            background: "--color-surface",
            border: "1px solid rgba(0,212,170,0.35)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "var(--color-secondary)" }}
          />
          <p
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {toastMsg}
          </p>
        </div>
      )}
    </div>
  );
};

/* Toggle switch  */

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    onClick={!disabled ? onChange : undefined}
    className="w-[36px] h-[20px] relative flex-shrink-0 rounded-full transition-all duration-200"
    style={{
      background: checked ? "rgba(142,123,252,0.2)" : "var(--color-bg2)",
      border: checked
        ? "1px solid rgba(142,123,252,0.4)"
        : "1px solid rgba(255,255,255,0.1)",
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    <span
      className="w-[14px] h-[14px] absolute rounded-full transition-all duration-200"
      style={{
        top: "2px",
        left: checked ? "calc(100% - 16px)" : "2px",
        background: checked
          ? "var(--color-primary)"
          : "var(--color-text-secondary)",
      }}
    />
  </button>
);

export default CookieBanner;
