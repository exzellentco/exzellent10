import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchReferrals, createReferral, updateReferral, deleteReferral } from "../../APIs/AdminReferral";
import DashboardShell from "../../components/DashboardShell";

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newBy, setNewBy] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [editBy, setEditBy] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReferrals()
      .then((data) => {
        if (Array.isArray(data.data)) setReferrals(data.data);
        else setReferrals([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setMessage("");
    const data = await createReferral(newCode, newBy);
    if (data.success) {
      setMessage("Referral code created!");
      setNewCode("");
      setNewBy("");
      setRefreshKey((k) => k + 1);
    } else {
      setMessage(data.message || "Failed to create referral code.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this referral code?")) return;
    const data = await deleteReferral(id);
    if (data.success) {
      setMessage("Referral deleted!");
      setRefreshKey((k) => k + 1);
    } else {
      setMessage(data.message || "Failed to delete referral.");
    }
  };

  const startEdit = (ref) => {
    setEditId(ref._id);
    setEditCode(ref.referralCode);
    setEditBy(ref.referredBy);
    setEditActive(ref.isActive);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    const data = await updateReferral(editId, editCode, editBy, editActive);
    if (data.success) {
      setMessage("Referral updated!");
      setEditId(null);
      setEditCode("");
      setEditBy("");
      setRefreshKey((k) => k + 1);
    } else {
      setMessage(data.message || "Failed to update referral.");
    }
  };

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Referrals"
      title={<>Referral <span className="ex-g">codes</span></>}
      lead="Create and manage referral codes and who they belong to."
    >
      {/* Create */}
      <form onSubmit={handleCreateReferral} className="ex-card ex-reveal flex flex-wrap gap-4 items-end" style={{ marginBottom: 24 }}>
        <div className="flex-1" style={{ minWidth: 180 }}>
          <label className="ex-label">Referral code</label>
          <input type="text" placeholder="e.g. WELCOME10" value={newCode} onChange={(e) => setNewCode(e.target.value)} required className="ex-input" />
        </div>
        <div className="flex-1" style={{ minWidth: 180 }}>
          <label className="ex-label">Referred by</label>
          <input type="text" placeholder="Name" value={newBy} onChange={(e) => setNewBy(e.target.value)} required className="ex-input" />
        </div>
        <button type="submit" className="ex-btn ex-btn-primary"><Plus size={16} /> Create referral</button>
      </form>

      {message && (
        <div style={{ marginBottom: 20 }}>
          <span className={`ex-badge ${message.toLowerCase().includes("fail") ? "ex-badge-warn" : "ex-badge-ok"}`}>{message}</span>
        </div>
      )}

      {/* Edit */}
      {editId && (
        <form onSubmit={handleUpdate} className="ex-card ex-reveal flex flex-wrap gap-4 items-end" style={{ marginBottom: 24 }}>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label className="ex-label">Referral code</label>
            <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value)} required className="ex-input" />
          </div>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label className="ex-label">Referred by</label>
            <input type="text" value={editBy} onChange={(e) => setEditBy(e.target.value)} required className="ex-input" />
          </div>
          <div style={{ minWidth: 140 }}>
            <label className="ex-label">Status</label>
            <select value={editActive} onChange={(e) => setEditActive(e.target.value === "true")} className="ex-input">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button type="submit" className="ex-btn ex-btn-primary">Update</button>
          <button type="button" onClick={() => setEditId(null)} className="ex-btn ex-btn-ghost">Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16 gap-4"><span className="ex-spinner" /><span className="ex-lead">Loading…</span></div>
      ) : (
        <div className="ex-table-wrap ex-reveal">
          <div className="overflow-x-auto">
            <table className="ex-table">
              <thead>
                <tr>{["Code", "Referred by", "Active", ""].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref._id}>
                    <td style={{ fontWeight: 600 }}>{ref.referralCode}</td>
                    <td>{ref.referredBy}</td>
                    <td><span className={`ex-badge ${ref.isActive ? "ex-badge-ok" : "ex-badge-warn"}`}>{ref.isActive ? "Yes" : "No"}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(ref)} className="ex-btn ex-btn-ghost" style={{ padding: "7px 12px", fontSize: ".8rem" }}><Pencil size={14} /> Edit</button>
                        <button onClick={() => handleDelete(ref._id)} className="ex-btn ex-btn-danger" style={{ padding: "7px 12px", fontSize: ".8rem" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {referrals.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--ex-muted)" }}>No referrals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default Referrals;
