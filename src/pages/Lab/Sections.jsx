import React, { useState } from "react";
import {
  Video, Sparkles, Mic, Award, Trophy, Gift, UserPlus, TrendingUp,
  AlertTriangle, BookOpen, Flame, Coins, Repeat, Heart, Send, Download,
} from "lucide-react";

/**
 * Sections shared by more than one role in the merged-dashboard prototype.
 *
 * Kept in one file so a feature looks identical wherever it appears, and so
 * adding one does not mean editing the student, teacher and admin branches
 * separately. LOCAL PROTOTYPE — not part of the shipped app.
 */

const money = (n) => "€" + Number(n || 0).toLocaleString("de-DE");

const Stat = ({ icon, label, value, sub, tone }) => (
  <div className="alh-stat" data-tone={tone}>
    <span className="alh-stat-ico">{icon}</span>
    <div><b>{value}</b><span>{label}</span>{sub && <i>{sub}</i>}</div>
  </div>
);

const Card = ({ title, tag, from, children }) => (
  <section className="alh-card">
    <header>
      <h3>{title}</h3>
      {tag != null && <span className="alh-tag">{tag}</span>}
      {from && <span className="alh-from">{from}</span>}
    </header>
    {children}
  </section>
);

/** A small write box, so the section is usable rather than read-only. */
const Composer = ({ placeholder, action, onSubmit }) => {
  const [text, setText] = useState("");
  return (
    <form
      className="alh-composer"
      onSubmit={(e) => { e.preventDefault(); onSubmit(text); setText(""); }}
    >
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      <button type="submit" className="alh-mini" disabled={!text.trim()}>
        <Send size={13} /> {action}
      </button>
    </form>
  );
};

const Sections = ({ view, x = {}, live, onPost, onLike, onSend, onReport }) => {
  switch (view) {
    case "supervisors":
      return (
        <Card title="Supervisors" tag={(x.supervisors || []).length}>
          <table className="alh-table">
            <thead><tr><th>Name</th><th>Department</th><th>Teachers</th><th>Students</th><th>Reports</th></tr></thead>
            <tbody>{(x.supervisors || []).map((v) => (
              <tr key={v._id}>
                <td><b>{v.name}</b></td><td>{v.dept}</td><td>{v.teachers}</td>
                <td>{v.students}</td><td>{v.reports}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );

    case "lectures":
      return (
        <Card title="Lectures" tag={(x.lectures || []).length}>
          <table className="alh-table">
            <thead><tr><th>Title</th><th>Teacher</th><th>Day</th><th>Length</th><th>Rate</th><th>Status</th></tr></thead>
            <tbody>{(x.lectures || []).map((l) => (
              <tr key={l._id}>
                <td><b>{l.title}</b></td><td>{l.teacher}</td><td>{l.date}</td>
                <td>{l.mins} min</td><td>{money(l.rate)}</td>
                <td><span className={"alh-pill alh-" + l.status}>{l.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );

    case "online":
      return (
        <Card title="Online classes" tag={(x.online || []).length}>
          <ul className="alh-list">
            {(x.online || []).map((o) => (
              <li key={o._id}>
                <span className="alh-grow">{o.cls}<i>{o.host} · {o.when} · {o.joined}/{o.capacity} joined</i></span>
                {o.live && <span className="alh-pill alh-live">live</span>}
                <button className="alh-mini"><Video size={13} /> {o.live ? "Join" : "Open room"}</button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "platforms":
      return (
        <Card title="Connected platforms" tag={(x.platforms || []).length}>
          <ul className="alh-list">
            {(x.platforms || []).map((p) => (
              <li key={p._id}>
                <span className="alh-grow">{p.name}<i>{p.use}</i></span>
                <span className={"alh-pill alh-" + (p.status === "connected" ? "connected" : "pending")}>{p.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "reports":
      return (
        <Card title="Reports" tag={(x.reports || []).length}>
          <ul className="alh-list">
            {(x.reports || []).map((r) => (
              <li key={r._id}>
                <span className="alh-grow">{r.name}<i>{r.period}</i></span>
                <button className="alh-mini" onClick={() => onReport && onReport(r._id)}>
                  <Download size={13} /> Export CSV
                </button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "courses":
      return (
        <Card title="Courses" tag={(x.courses || []).length}>
          <table className="alh-table">
            <thead><tr><th>Course</th><th>Level</th><th>Students</th><th>Lessons</th><th>State</th></tr></thead>
            <tbody>{(x.courses || []).map((c) => (
              <tr key={c._id}>
                <td><b>{c.title}</b></td><td><span className="alh-chip">{c.level}</span></td>
                <td>{c.students}</td><td>{c.lessons}</td>
                <td><span className={"alh-pill alh-" + (c.published ? "confirmed" : "todo")}>
                  {c.published ? "published" : "draft"}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );

    case "webinars":
      return (
        <Card title="Webinars" tag={(x.webinars || []).length}>
          <ul className="alh-list">
            {(x.webinars || []).map((w) => (
              <li key={w._id}>
                <span className="alh-grow">{w.title}<i>{w.when} · {w.signups} signed up</i></span>
                {w.free && <span className="alh-pill alh-confirmed">free</span>}
                <button className="alh-mini">Open</button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "community":
      return (
        <Card title="Community feed" tag={(x.community || []).length}>
          <Composer
            placeholder={live ? "Post to the real community feed…" : "Connect to production to post"}
            action="Post"
            onSubmit={(t) => onPost && onPost(t)}
          />
          <ul className="alh-list">
            {(x.community || []).map((c) => (
              <li key={c._id}>
                <span className="alh-chip">{c.space}</span>
                <span className="alh-grow">{c.text}<i>{c.author} · {c.likes} likes · {c.comments} comments</i></span>
                <button className="alh-mini" onClick={() => onLike && onLike(c._id)}>
                  <Heart size={13} /> {c.likes}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "aitools":
      return (
        <Card title="AI tools" tag={(x.aiTools || []).length}>
          <ul className="alh-list">
            {(x.aiTools || []).map((t) => (
              <li key={t._id}>
                <span className="alh-stat-ico" style={{ width: 32, height: 32 }}><Sparkles size={15} /></span>
                <span className="alh-grow">{t.name}<i>{t.desc} · {t.runs} runs</i></span>
                <button className="alh-mini">Run</button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "speech":
      return (
        <Card title="Speech Lab">
          <div className="alh-stats">
            <Stat icon={<Mic size={19} />} label="Sessions" value={x.speech?.sessions ?? "—"} tone="cyan" />
            <Stat icon={<TrendingUp size={19} />} label="Average score" value={(x.speech?.avgScore ?? 0) + "%"} tone="green" />
            <Stat icon={<Award size={19} />} label="Last score" value={(x.speech?.lastScore ?? 0) + "%"} tone="violet" />
            <Stat icon={<AlertTriangle size={19} />} label="Most common error" value={x.speech?.topError ?? "—"} tone="warn" />
          </div>
        </Card>
      );

    case "review":
      return (
        <Card title="Daily review">
          <div className="alh-stats">
            <Stat icon={<Repeat size={19} />} label="Cards due" value={x.review?.due ?? 0} tone="warn" />
            <Stat icon={<BookOpen size={19} />} label="Words learned" value={x.review?.learned ?? 0} tone="cyan" />
            <Stat icon={<Flame size={19} />} label="Streak" value={x.review?.streak ?? 0} tone="warn" />
            <Stat icon={<TrendingUp size={19} />} label="Retention" value={(x.review?.retention ?? 0) + "%"} tone="green" />
          </div>
        </Card>
      );

    case "certificates":
      return (
        <Card title="Certificates" tag={(x.certificates || []).length}>
          <ul className="alh-list">
            {(x.certificates || []).map((c) => (
              <li key={c._id}>
                <span className="alh-stat-ico" style={{ width: 32, height: 32 }}><Award size={15} /></span>
                <span className="alh-grow">{c.course}<i>{c.student} · issued {c.issued}</i></span>
                <button className="alh-mini">Download</button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "leaderboard":
      return (
        <Card title="Leaderboard">
          <ul className="alh-list">
            {(x.leaderboard || []).map((r) => (
              <li key={r.rank}>
                <span className="alh-stat-ico" style={{ width: 30, height: 30 }}><Trophy size={14} /></span>
                <span className="alh-grow"><b>{r.rank}. {r.name}</b></span>
                <span className="alh-tag">{r.points.toLocaleString()} pts</span>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "referrals":
      return (
        <Card title="Referrals">
          <div className="alh-stats">
            <Stat icon={<Gift size={19} />} label="Invited" value={x.referrals?.invited ?? 0} tone="violet" />
            <Stat icon={<UserPlus size={19} />} label="Joined" value={x.referrals?.joined ?? 0} tone="green" />
            <Stat icon={<Coins size={19} />} label="Credits earned" value={x.referrals?.earned ?? 0} tone="warn" />
            <Stat icon={<Sparkles size={19} />} label="Your code" value={x.referrals?.code ?? "—"} tone="cyan" />
          </div>
        </Card>
      );

    case "affiliates":
      return (
        <Card title="Affiliate partners" tag={(x.affiliates || []).length}>
          <table className="alh-table">
            <thead><tr><th>Partner</th><th>Clicks</th><th>Signups</th><th>Owed</th></tr></thead>
            <tbody>{(x.affiliates || []).map((a) => (
              <tr key={a._id}>
                <td><b>{a.partner}</b></td><td>{a.clicks}</td><td>{a.signups}</td><td><b>{money(a.due)}</b></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );

    case "waitlist":
      return (
        <Card title="Waitlist" tag={(x.waitlist || []).length}>
          <ul className="alh-list">
            {(x.waitlist || []).map((w) => (
              <li key={w._id}>
                <span className="alh-grow">{w.email}<i>requested {w.requested}</i></span>
                <span className={"alh-pill alh-" + w.status}>{w.status}</span>
                {w.status === "pending" && <button className="alh-mini">Invite</button>}
              </li>
            ))}
          </ul>
        </Card>
      );

    case "jobs":
      return (
        <Card title="Open roles" tag={(x.jobs || []).length}>
          <ul className="alh-list">
            {(x.jobs || []).map((j) => (
              <li key={j._id}>
                <span className="alh-grow">{j.role}<i>{j.applicants} applicants</i></span>
                <span className={"alh-pill alh-" + j.status}>{j.status}</span>
                <button className="alh-mini">Review</button>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "messages":
      return (
        <Card title="Messages" tag={(x.messages || []).filter((m) => m.unread).length + " unread"}>
          <Composer
            placeholder={live ? "Reply to the most recent sender…" : "Connect to production to send"}
            action="Send"
            onSubmit={(t) => onSend && onSend((x.messages || [])[0]?.fromId, t)}
          />
          <ul className="alh-list">
            {(x.messages || []).map((m) => (
              <li key={m._id}>
                <span className="alh-grow">{m.text}<i>{m.who} · {m.role} · {m.when}</i></span>
                {m.unread && <span className="alh-pill alh-pending">new</span>}
              </li>
            ))}
          </ul>
        </Card>
      );

    case "settings":
      return (
        <Card title="Settings">
          <ul className="alh-list">
            <li><span className="alh-grow">Academy profile<i>name, timezone, languages</i></span><button className="alh-mini">Edit</button></li>
            <li><span className="alh-grow">Roles and permissions<i>who can see what</i></span><button className="alh-mini">Edit</button></li>
            <li><span className="alh-grow">Billing<i>plans, invoices, Stripe</i></span><button className="alh-mini">Open</button></li>
            <li><span className="alh-grow">Notifications<i>email and in-app</i></span><button className="alh-mini">Edit</button></li>
          </ul>
        </Card>
      );

    default:
      return null;
  }
};

export default Sections;
