import React, { useEffect, useRef } from "react";

/*
 * Wraps a logged-in page in the "ecosystem" dashboard look.
 *
 *   <DashboardShell role="admin" eyebrow="Admin" title={<>All <span className="ex-g">students</span></>}
 *                   lead="Everyone enrolled, in one place." actions={<button .../>}>
 *     ...page content...
 *   </DashboardShell>
 *
 * role sets the accent colour (student=cyan, teacher=orange, admin=violet).
 */
const DashboardShell = ({ role = "admin", eyebrow, title, lead, actions, children }) => {
  const rootRef = useRef(null);

  // Reveal elements marked with .ex-reveal as they scroll into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".ex-reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("ex-on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ex-on");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [children]);

  return (
    <div ref={rootRef} className="ex-dash" data-role={role}>
      <div className="ex-shell">
        <div className="ex-wrap">
          {(eyebrow || title || lead || actions) && (
            <header className="ex-reveal" style={{ marginBottom: 8 }}>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  {eyebrow && <span className="ex-eyebrow">{eyebrow}</span>}
                  {title && <h1 className="ex-title">{title}</h1>}
                  {lead && <p className="ex-lead">{lead}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
              </div>
            </header>
          )}
          {children}
        </div>
      </div>
      {role === "admin" && (
        <a className="spl-fab" href="/calendar" style={{ textDecoration: "none" }}>📅 Calendar</a>
      )}
    </div>
  );
};

export default DashboardShell;
