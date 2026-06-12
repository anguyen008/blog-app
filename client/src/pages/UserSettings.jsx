import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icons, showToast } from "../components/UI";
import * as api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function UserSettingsPanel() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile")
  const [form, setForm] = useState({
     email: user.email, name: user.name,
  });
  const [passwords, setPasswords] = useState({current: "", next: "", confirm: ""})
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [typedName, setTypedName] = useState("");
  const navigate = useNavigate()

  function set(k) { return e => { setForm(f => ({ ...f, [k]: e.target.value })); setError(""); }; }
  function setp(p) { return e => { setPasswords(f => ({ ...f, [p]: e.target.value })); setError(""); }; }

  async function saveProfile(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email."); return; }
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.user_id, form);
      showToast("Profile updated", "success");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!passwords.current) { setError("Enter your current password."); return; }
    if (passwords.next.length < 6) { setError("New password must be 6+ characters."); return; }
    if (passwords.next !== passwords.confirm) { setError("Passwords don't match."); return; }
    if (passwords.next === passwords.current) {setError("Current and New passwords can't be the same"); return;}
    setSaving(true);
    try {
      await api.changePassword(user.user_id, passwords);
      setForm(f => ({ ...f, current: "", next: "", confirm: "" }));
      showToast("Password changed", "success");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function deleteAccount() {
    if (typedName.trim().toLowerCase() !== user.name.trim().toLowerCase()) return;
    setSaving(true);
    try {
      await api.deleteUser(user.user_id);
      logout();
      navigate("/")
    } catch (err) { showToast(err.message, "error"); setSaving(false); }
  }

  const tabs = [
    { id: "profile",  label: "Profile" },
    { id: "password", label: "Password" },
  ];

  return (
    <div className="settings-page fade-up">
      <h2 style={{ fontFamily: "var(--ff-display)", fontSize: 26, fontWeight: 500, marginBottom: 20 }}>
        Account settings
      </h2>
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} className="btn ghost"
            onClick={() => { setTab(t.id); setError(""); }}
            style={{
              borderRadius: "var(--radius) var(--radius) 0 0", borderBottom: "2px solid",
              borderBottomColor: tab === t.id ? "var(--accent)" : "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--ink3)",
              fontWeight: tab === t.id ? 500 : 400, paddingBottom: 10,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 18 }}>{error}</div>}
      
      {tab === "profile" && (
        <><div className="settings-section fade-up">
                  <h3>Account</h3>
                  <form onSubmit={saveProfile}>
                      <div className="settings-fields">
                          <div className="field"><label>Display name</label>
                              <input type="text" value={form.name} onChange={set("name")} placeholder="Your name" />
                          </div>
                          <div className="field"><label>Email address</label>
                              <input type="email" value={form.email} onChange={set("email")} placeholder="youremail@example.com" />
                          </div>
                      </div>
                      <button type="submit" className="btn primary" disabled={saving}>
                          {saving ? "Saving…" : "Save changes"}
                      </button>
                  </form>
              </div><div className="settings-section danger-zone fade-up">
                      <h3>Danger zone</h3>
                      <p className="danger-text">
                          Permanently deletes your account, all blogs, and every post. Cannot be undone.
                      </p>
                      {!deleteConfirm ? (
                          <button className="btn danger" onClick={() => setDeleteConfirm(true)}>
                              {Icons.trash} Delete account
                          </button>
                      ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                              <div className="field">
                                  <label>Type <strong>{user.name}</strong> to confirm</label>
                                  <input type="text" value={typedName} onChange={e => setTypedName(e.target.value)}
                                      placeholder={user.name} autoFocus />
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                  <button className="btn ghost" onClick={() => { setDeleteConfirm(false); setTypedName(""); } }>
                                      Cancel
                                  </button>
                                  <button className="btn danger primary" disabled={saving ||
                                      typedName.trim().toLowerCase() !== user.name.trim().toLowerCase()}
                                      onClick={deleteAccount}>
                                      {saving ? "Deleting…" : "Delete my account"}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div></>
      )}
      
      {tab === "password" && (
        <div className="settings-section fade-up">
          <h3>Password</h3>
          <form onSubmit={savePassword}>
            <div className="settings-fields">
              <div className="field"><label>Current password</label>
                <input type="password" value={passwords.current} onChange={setp("current")} placeholder="••••••••" />
              </div>
              <div className="field"><label>New password</label>
                <input type="password" value={passwords.next} onChange={setp("next")} placeholder="6+ characters" />
              </div>
              <div className="field"><label>Confirm new password</label>
                <input type="password" value={passwords.confirm} onChange={setp("confirm")} placeholder="Repeat new password" />
              </div>
            </div>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}