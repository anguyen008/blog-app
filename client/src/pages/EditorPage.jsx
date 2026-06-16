/**
 * EditorPage.jsx - Blog Post Editor
 * 
 * Rich text editor for creating and editing blog posts. Features:
 * - Auto-save functionality (2 second debounce)
 * - Real-time word count
 * - Draft and publish states
 * - Preview mode
 * - Save as draft or publish directly
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Topbar, Brand, Icons, showToast, Spinner, ConfirmModal } from "../components/UI";
import * as api from "../api/api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import WordEditor from "../components/WordEditor";


/**
 * Utility: Calculate word count in text
 */
function wordCount(text) {
    const plainText = text
    ? text.replace(/<[^>]+>/g, " ")
    : "";

  return plainText.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Utility: Format ISO date to readable format (e.g., "January 15, 2024")
 */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * PreviewPane - Full-screen preview of post as published
 * Shows formatted blog post with header, content, and author info
 */
function PreviewPane({ title, body, blog, authorName, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--paper)", zIndex: 200,
      overflow: "auto", animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        borderBottom: "1px solid var(--border)", padding: "12px 24px",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, background: "var(--paper)", zIndex: 1,
      }}>
        <button className="btn ghost" onClick={onClose}>{Icons.back} Back to editor</button>
        <span style={{ fontSize: 12, color: "var(--ink4)" }}>Preview</span>
      </div>
      <article style={{ maxWidth: 640, margin: "0 auto", padding: "52px 32px" }}>
        <div style={{ fontSize: 12, color: "var(--ink3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
          {blog?.name} · {formatDate(new Date().toISOString())}
        </div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: 38, fontWeight: 500, lineHeight: 1.2, marginBottom: 32, letterSpacing: "-0.3px" }}>
          {title || <em style={{ color: "var(--ink4)" }}>Untitled</em>}
        </h1>
        <div style={{fontFamily: "var(--ff-display)", fontSize: 20, lineHeight: 1.85,color: "var(--ink)",}}
        dangerouslySetInnerHTML={{__html:body || "<em style='color: var(--ink4)'>No content yet.</em>",}}
/>
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500 }}>
            {authorName ? authorName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{authorName}</div>
            <div style={{ fontSize: 12, color: "var(--ink3)" }}>{blog?.tagline || blog?.name}</div>
          </div>
        </div>
      </article>
    </div>
  );
}

/**
 * EditorPage - Main editor component
 * Manages post state, auto-save, and renders editor UI
 */
export default function EditorPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate()
  const {blogId, postId} = useParams();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft"); // "draft" or "published"
  const [blog, setBlog] = useState(null);
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publish, setPublish] = useState(false)
  const [saveLabel, setSaveLabel] = useState(""); // "✓ Saved" or "✓ Published"
  const [preview, setPreview] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(postId || null);
  const [confirm, setConfirm] = useState(null)
  // Auto-save mechanism
  const autoSaveTimer = useRef(null);
  const isDirty = useRef(false);

 
  /**
   * Load blog and post data on mount or when route changes
   */
  useEffect(() => {
    async function load() {
      setLoading(true)
      // Load blog info
      const [bl] = await api.getUserBlogs(user.user_id).then(bs => bs.filter(b => b.blog_id === blogId));
      setBlog(bl);
      // Load existing post if editing
      if (postId) {
        const post = await api.getPost(currentPostId);
        setTitle(post.title); setBody(post.content); setStatus(post.published ? "published" : "draft"), setPublish(post.published);
      }
      setLoading(false);
    }
    load().catch(err => { showToast(err.message, "error"); setLoading(false); });
  }, [postId, blogId, user.user_id]);

  /**
   * Save post to API (create new or update existing)
   * @param {string} forcedStatus - Optional status to override (for publish/save draft buttons)
   */
  const save = useCallback(async (forcedStatus) => {
    const s = (forcedStatus || status) === "published";
    try {
      // Create new post or update existing
      if (currentPostId) {
        await api.updatePost(currentPostId, {title: title, content: body, published: s});
      } else {
        if (!title.trim()) { showToast(("Post name is required."), "error"); return; }
        const post = await api.createPost({ blog_id: blogId, title: title, content: body, published: s});
        setCurrentPostId(post.post_id);
      }
      if (forcedStatus) setStatus(forcedStatus);
      // Show success feedback
      setSaveLabel(s === "published" ? "✓ Published" : "✓ Saved");
      setTimeout(() => setSaveLabel(""), 2500);
      isDirty.current = false;
    } catch (err) {
      throw error
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }, [title, body, status, currentPostId, blogId]);

  /**
   * Handle title changes with auto-save (debounced)
   * Waits 2 seconds of inactivity before auto-saving
   */
  function onTitleChange(e) {
    setTitle(e.target.value);
    isDirty.current = true;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (isDirty.current) save();
    }, 2000);
  }

  /**
   * Navigate back to dashboard for the current blog
   */
  function goBack() {
    navigate(`/dashboard/blog/${blogId}/posts`); // Need to include the blog name too
  }

  if (loading) return (
    <>
      <Topbar><Brand /></Topbar>
      <div className="page-loading"><Spinner /></div>
    </>
  );

  if (preview) return (
    <PreviewPane title={title} body={body} blog={blog} authorName={user.name} onClose={() => setPreview(false)} />
  );

  return (
    <>
      <Topbar>
        <Brand onClick={goBack} />
        <div className="topbar-right" style={{ fontSize: 12, color: "var(--ink3)" }}>
          {blog && <span style={{ color: "var(--ink4)" }}>{blog.title}</span>}
        </div>
      </Topbar>

      <div className="editor-layout">
        {/* editor topbar */}
        <div className="editor-topbar">
          <button className="btn ghost" onClick={goBack}>{Icons.back} Back</button>
          <input
            className="editor-title-input"
            type="text"
            placeholder="Give your post a title…"
            value={title}
            onChange={onTitleChange}
          />
          <span className="editor-save-label">
            {saving ? <Spinner /> : saveLabel}
          </span>
        </div>

        {/* editor body */}
        <div className="editor-body">
          <WordEditor
            content={body}
            published={publish}
            onChange={(html) => {
              setBody(html);
              isDirty.current = true;
          clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = setTimeout(() => {
            if (isDirty.current) save();
      }, 2000);
    }}
  />
        </div>

        {/* editor footer */}
        <div className="editor-footer">
          <div className="editor-footer-left">
            <span>{wordCount(body)} words</span>
            <span className={`pill ${status}`}>{status}</span>
          </div>
          <div className="editor-footer-right">
            <button className="btn ghost" onClick={() => setPreview(true)}>
              {Icons.eye} Preview
            </button>
            <button className="btn" onClick={() => {save("draft")}} disabled={publish || saving}>
              Save draft
            </button>
            <button className="btn primary" onClick={() => {setConfirm(true)}} disabled={saving}>
              {status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>


        {confirm && !(status === "published") && <ConfirmModal
                  title="Publish post?"
                  message={`"${title || "Untitled"}" will be published publicly.`}
                  confirmLabel="Publish"
                  onConfirm={() =>{ save("published"); setConfirm(null); setPublish(true)}}
                  onCancel={() => setConfirm(null)}
                />}

        {confirm && (status === "published") && <ConfirmModal
                  title="Unpublish post?"
                  message={`"${title || "Untitled"}" will be unpublished.`}
                  confirmLabel="Unpublish"
                  onConfirm={() =>{ save("draft"); setConfirm(null); setPublish(false)}}
                  onCancel={() => setConfirm(null)}
                />}


      </div>
    </>
  );
}
