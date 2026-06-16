import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons, showToast } from "../../components/UI";
import * as api from "../../api/api";


/**
 * NewBlogModal - Modal for creating a new blog
 * Collects blog name, tagline, and optional about description
 */
export default function NewBlogModal({ userId, onCreated, onClose, TITLE_LIMIT, TAGLINE_LIMIT, CHARACTER_LIMIT }) {
  const [form, setForm] = useState({ name: "", tagline: "", about: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Blog name is required."); return; }

    setLoading(true);
    try {
      const blog = await api.createBlog({ title: form.name, tagline: form.tagline, about: form.about });
      onCreated(blog);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <h3>Create a new blog</h3>
        <p>Give your new publication a name and optional tagline.</p>
        {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <div className="field">
              <label>Blog name *</label>
              <input maxLength={TITLE_LIMIT} type="text" placeholder="Title" value={form.name} onChange={set("name")} autoFocus />
                <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
                {form.name.length} / {TITLE_LIMIT} characters
                </span>
            </div>
            <div className="field">
              <label>Tagline</label>
              <input maxLength={TAGLINE_LIMIT} type="text" placeholder="A short phrase" value={form.tagline} onChange={set("tagline")} />
                <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
                {form.tagline.length} / {TAGLINE_LIMIT} characters
                </span>
              
            </div>
            <div className="field">
              <label>About</label>
              <textarea maxLength={CHARACTER_LIMIT} rows={5} placeholder="What is this blog about?" value={form.about} onChange={set("about")} />
                <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
                {form.about.length} / {CHARACTER_LIMIT} characters
                </span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={loading}>{loading ? "Creating…" : "Create blog"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
