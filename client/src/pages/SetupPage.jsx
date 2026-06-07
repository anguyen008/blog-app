/**
 * SetupPage.jsx - Initial Blog Setup
 * 
 * First-time setup page for new users to create their first blog.
 * Collects blog name, tagline, and optional about description.
 * After setup, routes to dashboard.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Topbar, Brand } from "../components/UI";
import * as api from "../api/api";

export default function SetupPage() {
  const { user, setUser, navigate, logout } = useAuth();
  const [form, setForm] = useState({ name: "", tagline: "", about: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to update form field values
  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  /**
   * Handle blog setup form submission
   * Creates initial blog and updates user context
   * Routes to dashboard on success
   */
  async function handleBlogCreation(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Please give your blog a name."); return; }
    setLoading(true);
    try {
      const blog = await api.createBlog({ userId: user.id, ...form });
      const updated = { ...user, blog };
      setUser(updated);
      navigate("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar>
        <Brand />
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </Topbar>
      <main className="setup-page">
        <div className="setup-card">
          <div className="setup-eyebrow">Step 1 of 1 — Blog setup</div>
          <h1 className="setup-title">Set up your blog</h1>
          <p className="setup-sub">You can always change these later. Give readers a sense of what you write about.</p>
          {error && <div className="error-banner" style={{ marginBottom: 20 }}>{error}</div>}
          <form onSubmit={handleBlogCreation}>
            <div className="setup-fields">
              <div className="field">
                <label htmlFor="setup-name">Blog name <span style={{ color: "var(--accent)" }}>*</span></label>
                <input id="setup-name" type="text" placeholder="The Midnight Dispatch" value={form.name} onChange={set("name")} autoFocus />
              </div>
              <div className="field">
                <label htmlFor="setup-tagline">Tagline</label>
                <input id="setup-tagline" type="text" placeholder="Dispatches from the edge of thought" value={form.tagline} onChange={set("tagline")} />
              </div>
              <div className="field">
                <label htmlFor="setup-about">About (optional)</label>
                <textarea id="setup-about" rows={4} placeholder="A short description of what you write about…" value={form.about} onChange={set("about")} />
              </div>
            </div>
            <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14 }}>
              {loading ? "Launching…" : "Launch my blog →"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
