import { useState, useEffect } from "react";
import { Icons, showToast, ConfirmModal } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api/api";

/**
 * BlogSettingsPanel - Edit blog settings and delete option
 * Allows updating blog name, tagline, about; with danger zone for deletion
 */
export default function BlogSettingsPanel({
  blog,
  onUpdated,
  onDeleted,
  TITLE_LIMIT,
  TAGLINE_LIMIT,
  CHARACTER_LIMIT,
}) {
  const [form, setForm] = useState({
    name: blog.title,
    tagline: blog.tagline || "",
    about: blog.about || "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const { user } = useAuth();
  const [typedName, setTypedName] = useState("");
  // Helper to update form field values
  function set(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  /**
   * Save blog settings changes
   */
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateBlog(blog.blog_id, {
        title: form.name,
        tagline: form.tagline,
        about: form.about,
      });
      onUpdated(updated);
      showToast("Blog settings saved", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setDeleteConfirm(false);
    setModalConfirm(false);
    await api.deleteBlog(blog.blog_id);
    onDeleted(blog.blog_id);
    showToast("Blog deleted", "success");
  }

  return (
    <>
      {modalConfirm && (
        <ConfirmModal
          title="Delete this blog?"
          message={`All posts in "${form.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete blog"
          danger
          onConfirm={doDelete}
          onCancel={() => {
            setDeleteConfirm(false);
            setModalConfirm(false);
            setTypedName("");
          }}
        />
      )}
      <div id="blog-settings-panel" className="fade-up">
      <div className="settings-page fade-up">
        <h2>Blog Settings</h2>
        <div className="settings-section">
          <h3>Publication details</h3>
          <form>
            <div className="settings-fields">
              <div className="field">
                <label>Blog name *</label>
                <input
                  maxLength={TITLE_LIMIT}
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
              <span
                style={{ textAlign: "right", fontSize: "12px", color: "#666" }}
              >
                {form.name.length} / {TITLE_LIMIT} characters
              </span>
              <div className="field">
                <label>Tagline</label>
                <input
                  maxLength={TAGLINE_LIMIT}
                  type="text"
                  value={form.tagline}
                  onChange={set("tagline")}
                />
              </div>
              <span
                style={{ textAlign: "right", fontSize: "12px", color: "#666" }}
              >
                {form.tagline.length} / {TAGLINE_LIMIT} characters
              </span>
              <div className="field">
                <label>About</label>
                <textarea
                  maxLength={CHARACTER_LIMIT}
                  rows={4}
                  value={form.about}
                  onChange={set("about")}
                />
              </div>
              <span
                style={{ textAlign: "right", fontSize: "12px", color: "#666" }}
              >
                {form.about.length} / {CHARACTER_LIMIT} characters
              </span>
            </div>
            <button
              onClick={save}
              type="submit"
              className="btn primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
        <div className="settings-section danger-zone">
          <h3>Danger zone</h3>
          <p className="danger-text">
            Deleting this blog will permanently remove all its posts. This
            action cannot be undone.
          </p>
          {!deleteConfirm ? (
            <button
              className="btn danger"
              onClick={() => setDeleteConfirm(true)}
            >
              {Icons.trash} Delete this blog
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
              }}
            >
              <div className="field">
                <label>
                  Type <strong>{user.name}</strong> to confirm
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={user.name}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setDeleteConfirm(false);
                    setModalConfirm(false);
                    setTypedName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn danger primary"
                  disabled={
                    saving ||
                    typedName.trim().toLowerCase() !==
                      user.name.trim().toLowerCase()
                  }
                  onClick={() => setModalConfirm(true)}
                >
                  {saving ? "Deleting…" : "Delete my blog"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
