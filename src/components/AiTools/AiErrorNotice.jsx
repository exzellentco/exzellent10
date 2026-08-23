import React from "react";

// Shared error line for the AI tools. Accepts either a plain string (validation
// messages) or an Error object thrown by src/APIs/aiTools.js. When the failure is
// an out-of-credits case (402 → error.needCredits, or a message mentioning
// "credit"), it appends an "Upgrade your plan →" call-to-action linking to /offer.
const AiErrorNotice = ({ error }) => {
  if (!error) return null;
  const message = typeof error === "string" ? error : error.message || "";
  const needCredits = (error && error.needCredits) || /credit/i.test(message);

  return (
    <p className="spl-err">
      {message}
      {needCredits && (
        <a
          href="/offer"
          className="spl-upgrade"
          style={{ display: "inline-block", marginTop: 6, marginLeft: 6, color: "var(--spl-cyanL)", fontWeight: 700, textDecoration: "none" }}
        >
          Upgrade your plan →
        </a>
      )}
    </p>
  );
};

export default AiErrorNotice;
