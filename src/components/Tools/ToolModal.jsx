import React from "react";

// Lightweight overlay panel used by the Top tests & Additional Resources tools.
const ToolModal = ({ icon = "✦", title, subtitle, onClose, children }) => (
  <div className="spl-root">
    <div className="spl-overlay" onClick={onClose}>
      <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
        <div className="spl-aura" />
        <div className="spl-head">
          <span className="spl-mic">{icon}</span>
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="spl-body">{children}</div>
      </div>
    </div>
  </div>
);

export default ToolModal;
