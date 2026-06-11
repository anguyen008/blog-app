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
import { useNavigate, Link, Navigate, useLocation } from "react-router-dom";

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
function Avatar({ user, size = 34 }) {
  const [openPopover, setOpenPopover] = useState(null)
  const {logout} = useAuth();
  const navigate = useNavigate()

    useEffect(() => {
    const handleClickOutside = () => setOpenPopover(null);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside);
    return () => {document.removeEventListener("click", handleClickOutside); document.addEventListener("scroll", handleClickOutside);};
    }, []);


  const initials = user.name ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <>
    <button className="avatar-button" style={{width: size, height: size, fontSize: size * 0.5}} onClick={e => {e.stopPropagation(); setOpenPopover(openPopover === user.user_id ? null : user.user_id)}}>{initials}</button>
    {openPopover === user.user_id && (
      <div className="popover-menu" style={{right: "5px"}}>
       <button onClick={(e) => {onSelectBlog(b.blog_id); onEditBlog("blog-settings"); setOpenPopover(null); e.stopPropagation()}}>
                    {Icons.settings} Settings
                  </button>
                <button onClick={() => {logout(); navigate("/") }}>
                  {Icons.logout} Sign out
                </button>
      </div>
    )}
    </>
  );
}


function Subnav({blogs, activeBlogId, panel, onPanel, onBack}){
  const navigate = useNavigate()
  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);
  
   return (
      activeBlog && (
        <>
      <div className="subnav">
      <button
        className="btn ghost sm"
        onClick={onBack}
        style={{ marginRight: 8 }}
      >
        {Icons.back} All blogs
      </button>

      <div
        className={`subnav-item ${panel === "posts" ? "active" : ""}`}
        onClick={() => onPanel("posts")}
      >
        {Icons.file} All Posts
      </div>
      <div
        className={`subnav-item ${panel === "blog-settings" ? "active" : ""}`}
        onClick={() => onPanel("blog-settings")}
      >
        {Icons.settings} Settings
      </div>
    </div>
      </>)
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
      <div className={`sidebar-item ${!activeBlogId && panel === "blogs" ? "active" : ""}`} onClick={() => { onSelectBlog(null); onPanel("blogs-settings"); }}>
        {Icons.grid} All blogs
      </div>
      <div className="sidebar-item" onClick={onNewBlog}>
        {Icons.plus} New blog
      </div>
      <div style={{ flex: 1 }} />
      <div className="sidebar-divider" />
      <div className="sidebar-item" onClick={() => { logout(); navigate("/") }}>
        {Icons.logout} Sign out
      </div>
    </nav>
  );
}

/**
 * BlogsPanel - Grid view of all user's blogs
 * Shows blog cards with metadata and delete option
 */
function BlogsPanel({ blogs, onSelectBlog, onNewBlog}) {
  const { user, token } = useAuth();
  const [openPopover, setOpenPopover] = useState(null)

    useEffect(() => {
    const handleClickOutside = () => setOpenPopover(null);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside);
    return () => {document.removeEventListener("click", handleClickOutside); document.addEventListener("scroll", handleClickOutside);};
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
              <span>{b.number_of_posts ?? 0} posts</span>
              <span>·</span>
              <span>Created {formatDate(b.created_at)}</span>
              <div style={{ flex: 1 }} />
    
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
function PostsPanel({ blog, onEdit, onNewPost }) {
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
    setDeletingId(post.post_id);
    await api.deletePost(post.post_id);
    setPosts(p => p.filter(x => x.post_id !== post.post_id));
    setDeletingId(null);
    showToast("Post deleted", "success");
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
            {blog.about && (
              <div className="posts-header-about">
                {blog.about}
            </div>
        )}
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
              <div key={post.post_id} className="post-row" onClick={() => onEdit(post.post_id)}>
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
                    disabled={deletingId === post.post_id}
                    title="Delete post"
                  >{deletingId === post.post_id ? <Spinner /> : Icons.trash}</button>
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
function NewBlogModal({ userId, onCreated, onClose, TITLE_LIMIT, TAGLINE_LIMIT, CHARACTER_LIMIT }) {
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

/**
 * BlogSettingsPanel - Edit blog settings and delete option
 * Allows updating blog name, tagline, about; with danger zone for deletion
 */
function BlogSettingsPanel({ blog, onUpdated, onDeleted, onSubmit, TITLE_LIMIT, TAGLINE_LIMIT, CHARACTER_LIMIT }) {
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

/**
 * DashboardPage - Main component
 * Manages dashboard state and renders appropriate panel based on selection
 */
export default function DashboardPage() {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [showNewBlog, setShowNewBlog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const CHARACTER_LIMIT = 300;
  const TITLE_LIMIT = 60;
  const TAGLINE_LIMIT = 120;
  
  const panel = location.pathname.includes("/settings") ? "blog-settings"
  : location.pathname.includes("/posts") ? "posts"
  : "blogs";

  const activeBlogId = location.pathname.includes("/blog/")
  ? location.pathname.split("/blog/")[1]?.split("/")[0]
  : null;

  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);

  function selectBlog(id) {
    if (id){
      navigate(`/dashboard/blog/${id}/posts`);
    }
    else{
      navigate("/dashboard/my-blogs");
    }
  }
  function handlePanel(p) {
  if (p === "blogs") navigate("/dashboard/my-blogs");
  else if (p === "posts") navigate(`/dashboard/blog/${activeBlogId}/posts`);
  else if (p === "blog-settings") navigate(`/dashboard/blog/${activeBlogId}/settings`);
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
    setShowNewBlog(false);
    navigate(`/dashboard/blog/${blog.blog_id}/posts`);
    showToast("Blog created!", "success");
  }

  function blogUpdated(updated) {
    setBlogs(b => b.map(x => x.blog_id === updated.blog_id ? updated : x));
  }

  function blogDeleted(id) {
    setBlogs(b => b.filter(x => x.blog_id !== id));
    navigate("/dashboard/my-blogs")
  }

  async function confirmDeleteBlog(blog_id) {
    setDeleteConfirm(null);
    await api.deleteBlog(blog_id);
    blogDeleted(blog_id);
    showToast("Blog deleted", "success");
  }

  return (
    <>
      {showNewBlog && <NewBlogModal userId={user} onCreated={blogCreated} onClose={() => setShowNewBlog(false)} TITLE_LIMIT={TITLE_LIMIT} TAGLINE_LIMIT = {TAGLINE_LIMIT} CHARACTER_LIMIT={CHARACTER_LIMIT} />}
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
        <Brand onClick={() => { navigate('/dashboard/my-blogs') }} />
        <div className="topbar-right">
          <Avatar user={user} size={30} />
          <span style={{ fontSize: 15, color: "var(--ink2)" }}>{user.name}</span>
        </div>
      </Topbar>
      
      <Subnav
          blogs = {blogs}
          activeBlogId={activeBlogId}
          panel={panel}
          onPanel={p => {handlePanel(p)}}
          onBack={()=> {handlePanel("blogs");}}
            />


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
              onPanel={p => {handlePanel(p)}}
              onNewBlog={() => setShowNewBlog(true)}
            />
            <div className="main-area">
              {panel === "blogs" && (
                <BlogsPanel
                  blogs={blogs}
                  onSelectBlog={selectBlog}
                  onNewBlog={() => setShowNewBlog(true)}
                />
              )}
              {panel === "posts" && activeBlog && (
                <PostsPanel 
                  blog = {activeBlog}
                  onEdit={post_id => {navigate(`/dashboard/blog/${activeBlogId}/posts/editor/${post_id}`)}}
                  onNewPost={()=> {navigate(`/dashboard/blog/${activeBlogId}/posts/editor`)}}

                  
                  />
              )}
              {panel === "blog-settings" && activeBlog && (
                <BlogSettingsPanel
                  blog={activeBlog}
                  onUpdated={blogUpdated}
                  onDeleted={blogDeleted}
                  onSubmit={handlePanel}
                  TITLE_LIMIT={TITLE_LIMIT}
                  TAGLINE_LIMIT={TAGLINE_LIMIT}
                  CHARACTER_LIMIT={CHARACTER_LIMIT}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
