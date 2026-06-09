/**
 * DashboardPage.jsx - Main Dashboard
 * 
 * Central hub for managing blogs and posts. Features:
 * - View all user's blogs
 * - View posts for selected blog
 * - Create/edit/delete blogs
 * - Manage blog settings
 * - Navigate to post editor
 * - Comprehensive sidebar navigation
 */

import { useState, useEffect, useRef} from "react";
import { useAuth } from "../context/AuthContext";
import { Topbar, Brand, Icons, ConfirmModal, showToast, Spinner } from "../components/UI";
import * as api from "../api/api";
import { useNavigate, Link, Navigate } from "react-router-dom";

/**
 * Utility: Format ISO date to readable format (e.g., "Jan 15, 2024")
 */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Avatar - User avatar with initials
 * Displays first two letters of user's name in a circular badge
 */
function Avatar({ name, size = 34 }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--accent-bg)", color: "var(--accent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, fontWeight: 600, flexShrink: 0,
    }}>{initials}</div>
  );
}

/**
 * Sidebar - Navigation sidebar
 * Displays blog list, current selection, and navigation options
 */
function Sidebar({ blogs, activeBlogId, panel, onSelectBlog, onPanel, onNewBlog }) {
  const { logout } = useAuth();
  const navigate = useNavigate()
  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);


  return (
    <nav className="sidebar">
      <div className="sidebar-section">My Blogs</div>
      <div className={`sidebar-item ${!activeBlogId && panel === "blogs" ? "active" : ""}`} onClick={() => { onSelectBlog(null); onPanel("blogs"); }}>
        {Icons.grid} All blogs
      </div>
      <div className="sidebar-item" onClick={onNewBlog}>
        {Icons.plus} New blog
      </div>

      {activeBlog && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-blog-name" title={activeBlog.title}>{activeBlog.name}</div>
          <div className={`sidebar-item ${panel === "posts" ? "active" : ""}`} onClick={() => onPanel("posts")}>
            {Icons.file} Posts
          </div>
          <div className={`sidebar-item ${panel === "blog-settings" ? "active" : ""}`} onClick={() => onPanel("blog-settings")}>
            {Icons.settings} Blog settings
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />
      <div className="sidebar-divider" />
      <div className="sidebar-item" onClick={() => { logout; navigate("/") }}>
        {Icons.logout} Sign out
      </div>
    </nav>
  );
}

/**
 * BlogsPanel - Grid view of all user's blogs
 * Shows blog cards with metadata and delete option
 */
function BlogsPanel({ blogs, postCounts, onSelectBlog, onNewBlog, onDeleteBlog, onEditBlog}) {
  const { user, token } = useAuth();
  const [openPopover, setOpenPopover] = useState(null)

  useEffect(() => {
  const handleClickOutside = () => setOpenPopover(null);
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (

    <div className="blogs-page fade-up">
      <div className="blogs-header">
        <div className="blogs-header-left">
          <h1>Your blogs</h1>
          <p>Hello, {user.name}. What are you writing today?</p>
        </div>

      </div>
      <div className="blogs-grid">
        {blogs.map(b => (

          <div key={b.blog_id} className="blog-card" style={{zIndex: openPopover === b.blog_id ? 10 : 0}} onClick={() => onSelectBlog(b.blog_id)}>
            <div className="blog-card-name">{b.title}</div>
            {b.tagline && <div className="blog-card-tag">{b.tagline}</div>}
            <div className="blog-card-meta">
              <span>{postCounts[b.blog_id] ?? 0} posts</span>
              <span>·</span>
              <span>Created {formatDate(b.created_at)}</span>
              <div style={{ flex: 1 }} />
              <button
                className="btn ghost sm icon-only"
                onClick={e => { e.stopPropagation(); setOpenPopover(openPopover === b.blog_id ? null : b.blog_id);}}
                title="Edit or Delete Blog"
                
              >{Icons.more}</button>
              {openPopover === b.blog_id && (
                <div className="popover-menu">
                  <button onClick={(e) => {onSelectBlog(b.blog_id); onEditBlog("blog-settings"); setOpenPopover(null); e.stopPropagation()}}>
                    Edit
                  </button>
                <button onClick={e => {e.stopPropagation(); onDeleteBlog(b); setOpenPopover(null); }}>
                   Delete
                </button>
                </div>
              )}
            </div>
          </div>
          


        ))}
        <div className="blog-card blog-card-new" onClick={onNewBlog}>
          <span style={{ fontSize: 22 }}>+</span>
          <span>New blog</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PostsPanel - List view of posts for selected blog
 * Displays post rows with edit/delete options and empty state
 */
function PostsPanel({ blog, onEdit, onNewPost, navigate }) {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Load posts when blog selection changes
  useEffect(() => {
    setLoading(true);
    api.getBlogPosts(blog.blog_id).then(setPosts).finally(() => setLoading(false));
  }, [blog.blog_id]);

  async function handleDelete(post) {
    setConfirm(null);
    setDeletingId(post.id);
    await api.deletePost(post.id);
    setPosts(p => p.filter(x => x.id !== post.id));
    setDeletingId(null);
    showToast("Post deleted");
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          title="Delete post?"
          message={`"${confirm.title || "Untitled"}" will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div>
        <div className="posts-header">
          <div className="posts-header-left">
            <h2>{blog.title}</h2>
            {blog.tagline && <p>{blog.tagline}</p>}
          </div>
          <button className="btn primary" onClick={onNewPost}>{Icons.pen} Write</button>
        </div>

        {loading ? (
          <div className="page-loading" style={{ minHeight: 200 }}><Spinner /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✍️</div>
            <h3>Your first post awaits</h3>
            <p>Hit "Write" to start drafting. It doesn't have to be perfect — just begin.</p>
            <button className="btn primary" onClick={onNewPost}>{Icons.pen} Write something</button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-row" onClick={() => onEdit(post.id)}>
                <div className="post-row-meta">
                  <div className="post-row-title">{post.title || "Untitled"}</div>
                  {post.body && <div className="post-row-excerpt">{post.body.substring(0, 140)}</div>}
                  <div className="post-row-date">{formatDate(post.updatedAt)}</div>
                </div>
                <div className="post-row-right">
                  <span className={`pill ${post.status}`}>{post.status}</span>
                  <button
                    className="btn ghost sm icon-only"
                    onClick={e => { e.stopPropagation(); setConfirm(post); }}
                    disabled={deletingId === post.id}
                    title="Delete post"
                  >{deletingId === post.id ? <Spinner /> : Icons.trash}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * NewBlogModal - Modal for creating a new blog
 * Collects blog name, tagline, and optional about description
 */
function NewBlogModal({ userId, onCreated, onClose }) {
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
              <input type="text" placeholder="Ada's Tech Notes" value={form.name} onChange={set("name")} autoFocus />
            </div>
            <div className="field">
              <label>Tagline</label>
              <input type="text" placeholder="Short notes on databases and code" value={form.tagline} onChange={set("tagline")} />
            </div>
            <div className="field">
              <label>About</label>
              <textarea rows={3} placeholder="What is this blog about?" value={form.about} onChange={set("about")} />
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

/**
 * BlogSettingsPanel - Edit blog settings and delete option
 * Allows updating blog name, tagline, about; with danger zone for deletion
 */
function BlogSettingsPanel({ blog, onUpdated, onDeleted, onSubmit }) {
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
      onSubmit("posts")
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
          <form onSubmit={save}>
            <div className="settings-fields">
              <div className="field"><label>Blog name *</label><input type="text" value={form.name} onChange={set("name")} /></div>
              <div className="field"><label>Tagline</label><input type="text" value={form.tagline} onChange={set("tagline")} /></div>
              <div className="field"><label>About</label><textarea rows={4} value={form.about} onChange={set("about")} /></div>
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

/**
 * DashboardPage - Main component
 * Manages dashboard state and renders appropriate panel based on selection
 */
export default function DashboardPage({ blogId: initialBlogId }) {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [activeBlogId, setActiveBlogId] = useState(initialBlogId || null);
  const [panel, setPanel] = useState(initialBlogId ? "posts" : "blogs");
  const [showNewBlog, setShowNewBlog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate()

  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);

  function selectBlog(id) {
    setActiveBlogId(id);
    setPanel(id ? "posts" : "blogs");
  }

  useEffect(() => {
    async function getAllBlogs() {
      if (!user?.user_id) return;
      try {
        setLoadingBlogs(true);
        const userBlogs = await api.getUserBlogs(user.user_id);
        setBlogs(userBlogs);
      } catch (err) {
        console.log("error fetching blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    }
    getAllBlogs();
  }, [user]);


  async function blogCreated(blog) {
    
    setBlogs(b => [...b, blog]);
    setPostCounts(c => ({ ...c, [blog.blog_id]: 0 }));
    setShowNewBlog(false);
    setActiveBlogId(blog.blog_id);
    setPanel("posts");
    showToast("Blog created!", "success");
  }

  function blogUpdated(updated) {
    setBlogs(b => b.map(x => x.blog_id === updated.blog_id ? updated : x));
  }

  function blogDeleted(id) {
    setBlogs(b => b.filter(x => x.blog_id !== id));
    setActiveBlogId(null);
    setPanel("blogs");
  }

  async function confirmDeleteBlog(blog_id) {
    setDeleteConfirm(null);
    await api.deleteBlog(blog_id);
    blogDeleted(blog_id);
    showToast("Blog deleted", "success");
  }

  return (
    <>
        <button onClick={() => console.log(activeBlog)}>Test</button>
      {showNewBlog && <NewBlogModal userId={user} onCreated={blogCreated} onClose={() => setShowNewBlog(false)} />}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete this blog?"
          message={`"${deleteConfirm.title}" blog and all its posts will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {confirmDeleteBlog(deleteConfirm.blog_id)}}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <Topbar>
        <Brand onClick={() => { setActiveBlogId(null); setPanel("blogs"); }} />
        <div className="topbar-right">
          <Avatar name={user.name} size={30} />
          <span style={{ fontSize: 13, color: "var(--ink2)" }}>{user.name}</span>
        </div>
      </Topbar>

      <div className="dashboard">
        {loadingBlogs ? (
          <div className="page-loading" style={{ flex: 1 }}><Spinner /></div>
        ) : (
          <>
            <Sidebar
              blogs={blogs}
              activeBlogId={activeBlogId}
              panel={panel}
              onSelectBlog={selectBlog}
              onPanel={p => {
                setPanel(p);
                if (p === "blog-settings" && !activeBlogId && blogs.length > 0) setActiveBlogId(blogs[0].id);
              }}
              onNewBlog={() => setShowNewBlog(true)}
            />
            <div className="main-area">
              {panel === "blogs" && (
                <BlogsPanel
                  blogs={blogs}
                  postCounts={postCounts}
                  onSelectBlog={selectBlog}
                  onNewBlog={() => setShowNewBlog(true)}
                  onDeleteBlog={setDeleteConfirm}
                  onEditBlog={setPanel}
                />
              )}
              {panel === "posts" && activeBlog && (
                console.log("Post Panel")
              )}
              {panel === "blog-settings" && activeBlog && (
                <BlogSettingsPanel
                  blog={activeBlog}
                  onUpdated={blogUpdated}
                  onDeleted={blogDeleted}
                  onSubmit={setPanel}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
