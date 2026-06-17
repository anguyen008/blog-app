/**
 * DashboardPage.jsx
 *
 * The one and only protected route shell.
 * Always renders: AppTopbar → Subnav (if in a blog) → Sidebar + panel.
 *
 * URL → panel mapping:
 *   /home                          → HomePanel      (placeholder)
 *   /my-blogs                      → BlogsPanel
 *   /blog/:blogId/posts            → PostsPanel
 *   /blog/:blogId/settings         → BlogSettingsPanel
 *   /settings                      → UserSettingsPanel
 *   /followed                      → FollowedPanel  (placeholder)
 *   /liked                         → LikedPanel     (placeholder)
 *   /library                       → LibraryPanel   (placeholder)
 *
 * To add a new panel:
 *   1. Create src/panels/YourPanel.jsx
 *   2. Import it here
 *   3. Add one line: {panel === "your-panel" && <YourPanel />}
 *   4. Add the URL in derivePanel() below
 *   5. Add navigate() call in src/components/Sidebar.jsx
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ConfirmModal, showToast, Spinner } from "../components/UI";
import * as api from "../api/api";

// layout
import AppTopbar from "../components/AppTopbar";
import Sidebar from "../components/Sidebar";
import Subnav from "../components/Subnav";

//panels
import BlogSettingsPanel from "./panels/BlogSettingsPanel";
import BlogsPanel from "./panels/BlogsPanel";
import NewBlogModal from "./panels/NewBlogModal";
import UserSettingsPanel from "./panels/UserSettingsPanel";
import PostsPanel from "./panels/PostsPanel";
import HomePanel from "./panels/HomePanel";
import BlogDetailPanel from "./panels/BlogDetailsPanel";
import ReaderPanel from "./panels/ReaderPanel";

// ── URL → panel string ────────────────────────────────────────────────────────
function derivePanel(path) {
  if (path.includes("/settings") && !path.includes("/blog/"))
    return "user-settings";
  if (path.includes("/blog/") && path.includes("/settings"))
    return "blog-settings";
  if (path.includes("/home/blogs/") && path.includes("/posts/"))
    return "reader";
  if (path.includes("/home") && path.includes("/blogs/")) return "blog-detail";

  if (path.includes("/my-blogs") && !path.includes("/blog/")) return "blogs";

  if (path.includes("/posts")) return "posts";
  if (path.includes("/home")) return "home";
  if (path.includes("/followed")) return "followed";
  if (path.includes("/liked")) return "liked";
  if (path.includes("/library")) return "library";
  return "blogs";
}

// ── placeholder for panels not yet built ─────────────────────────────────────
function Placeholder({ label }) {
  return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-state-icon">🚧</div>
      <h3>{label}</h3>
      <p>Coming soon.</p>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [showNewBlog, setShowNewBlog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const TITLE_LIMIT = 60;
  const TAGLINE_LIMIT = 120;
  const CHARACTER_LIMIT = 300;

  // derive everything from URL
  const panel = derivePanel(location.pathname);
  const activeBlogId = location.pathname.includes("/blog/")
    ? location.pathname.split("/blog/")[1]?.split("/")[0]
    : null;
  const selectedBlogId = location.pathname.includes("/blogs/")
    ? location.pathname.split("/blogs/")[1]?.split("/")[0]
    : null;
  const selectedPostId = location.pathname.includes("/posts/")
    ? location.pathname.split("/posts/")[1]?.split("/")[0]
    : null;
  const activeBlog = blogs.find((b) => b.blog_id === activeBlogId);
  const selectedBlog = blogs.find((b) => b.blog_id === selectedBlogId);

  // fetch blogs on mount
  useEffect(() => {
    if (!user?.user_id) return;
    setLoadingBlogs(true);
    api
      .getUserBlogs(user.user_id)
      .then(setBlogs)
      .catch((err) => console.error("blogs fetch:", err))
      .finally(() => setLoadingBlogs(false));
  }, [user]);

  // blog CRUD
  function blogCreated(blog) {
    setBlogs((b) => [...b, blog]);
    setShowNewBlog(false);
    navigate(`my-blogs/blog/${blog.blog_id}/posts`);
    showToast("Blog created!", "success");
  }

  function blogUpdated(updated) {
    setBlogs((b) =>
      b.map((x) => (x.blog_id === updated.blog_id ? updated : x)),
    );
  }

  function blogDeleted(id) {
    setBlogs((b) => b.filter((x) => x.blog_id !== id));
    navigate("/my-blogs");
  }

  async function confirmDeleteBlog(blog_id) {
    setDeleteConfirm(null);
    await api.deleteBlog(blog_id);
    blogDeleted(blog_id);
    showToast("Blog deleted", "success");
  }

  useEffect(() => {
    console.log(selectedBlogId);
    console.log();
  }, [panel]);

  return (
    <>
      {showNewBlog && (
        <NewBlogModal
          onCreated={blogCreated}
          onClose={() => setShowNewBlog(false)}
          TITLE_LIMIT={TITLE_LIMIT}
          TAGLINE_LIMIT={TAGLINE_LIMIT}
          CHARACTER_LIMIT={CHARACTER_LIMIT}
        />
      )}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete this blog?"
          message={`"${deleteConfirm.title}" and all its posts will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => confirmDeleteBlog(deleteConfirm.blog_id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <AppTopbar />
      {/* dashboard body */}
      <div className="dashboard">
        {loadingBlogs ? (
          <div className="page-loading" style={{ flex: 1 }}>
            <Spinner />
          </div>
        ) : (
          <>
            <Sidebar blogs={blogs} onNewBlog={() => setShowNewBlog(true)} />

            <div className="main-area">
              <Subnav blogs={blogs} />

              {panel === "home" && (
                <HomePanel
                  onReadPost={(blog_id, post_id) =>
                    navigate(`/home/blogs/${blog_id}/posts/${post_id}`)
                  }
                />
              )}
              {panel === "followed" && <Placeholder label="Followed blogs" />}
              {panel === "liked" && <Placeholder label="Liked posts" />}
              {panel === "library" && <Placeholder label="Library" />}

              {panel === "blogs" && (
                <BlogsPanel
                  blogs={blogs}
                  onSelectBlog={(id) => navigate(`/my-blogs/blog/${id}/posts`)}
                  onNewBlog={() => setShowNewBlog(true)}
                />
              )}

              {panel === "posts" && activeBlog && (
                <PostsPanel
                  blog={activeBlog}
                  onEdit={(postId) =>
                    navigate(
                      `/my-blogs/blog/${activeBlogId}/posts/editor/${postId}`,
                    )
                  }
                  onNewPost={() =>
                    navigate(`/my-blogs/blog/${activeBlogId}/posts/editor`)
                  }
                />
              )}

              {panel === "blog-settings" && activeBlog && (
                <BlogSettingsPanel
                  blog={activeBlog}
                  onUpdated={blogUpdated}
                  onDeleted={blogDeleted}
                  TITLE_LIMIT={TITLE_LIMIT}
                  TAGLINE_LIMIT={TAGLINE_LIMIT}
                  CHARACTER_LIMIT={CHARACTER_LIMIT}
                />
              )}
              {panel === "blog-detail" && (
                <BlogDetailPanel blogId={selectedBlogId} />
              )}
              {panel === "reader" && (
                <ReaderPanel blogId={selectedBlogId} postId={selectedPostId} />
              )}
              {panel === "user-settings" && <UserSettingsPanel />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
