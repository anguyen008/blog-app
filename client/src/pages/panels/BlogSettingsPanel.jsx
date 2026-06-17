import { useState, useEffect } from "react";
import { Icons, showToast, ConfirmModal} from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api/api";

/**
 * BlogSettingsPanel - Edit blog settings and delete option
 * Allows updating blog name, tagline, about; with danger zone for deletion
 */
export default function BlogSettingsPanel({ blog, onUpdated, onDeleted, TITLE_LIMIT, TAGLINE_LIMIT, CHARACTER_LIMIT }) {
  const [form, setForm] = useState({ name: blog.title, tagline: blog.tagline || "", about: blog.about || "" });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // Helper to update form field values
  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  /**
   * Save blog settings changes
   */
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateBlog(blog.blog_id, { title: form.name, tagline: form.tagline, about: form.about });
      onUpdated(updated);
      showToast("Blog settings saved", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setConfirm(false);
    await api.deleteBlog(blog.blog_id);
    onDeleted(blog.blog_id);
    showToast("Blog deleted");
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          title="Delete this blog?"
          message={`All posts in "${form.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete blog"
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
      <div className="settings-page fade-up">
        <h2>Blog Settings</h2>
        <div className="settings-section">
          <h3>Publication details</h3>
          <form >
            <div className="settings-fields">
              <div className="field"><label>Blog name *</label><input maxLength={TITLE_LIMIT} type="text" value={form.name} onChange={set("name")} /></div>
                <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
                {form.name.length} / {TITLE_LIMIT} characters
                </span>
              <div className="field"><label>Tagline</label><input maxLength={TAGLINE_LIMIT} type="text" value={form.tagline} onChange={set("tagline")} /></div>
              <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
                {form.tagline.length} / {TAGLINE_LIMIT} characters
                </span>
              <div className="field"><label>About</label><textarea maxLength={CHARACTER_LIMIT} rows={4} value={form.about} onChange={set("about")} /></div>
               <span style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
               {form.about.length} / {CHARACTER_LIMIT} characters
                </span>
            </div>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </form>
        </div>
        <div className="settings-section danger-zone">
          <h3>Danger zone</h3>
          <p className="danger-text">Deleting this blog will permanently remove all its posts. This action cannot be undone.</p>
          <button className="btn danger" onClick={() => setConfirm(true)}>{Icons.trash} Delete this blog</button>
        </div>
      </div>
    </>
  );
}