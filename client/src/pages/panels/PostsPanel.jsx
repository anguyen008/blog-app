import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons, showToast, Spinner} from "../../components/UI";
import * as api from "../../api/api";



/**
 * Utility: Format ISO date to readable format (e.g., "Jan 15, 2024")
 */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * PostsPanel - List view of posts for selected blog
 * Displays post rows with edit/delete options and empty state
 */
export default function PostsPanel({ blog, onEdit, onNewPost }) {
  const { user, accessToken } = useAuth();
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
              <div key={post.post_id} className="post-row" onClick={() => {onEdit(post.post_id)}}>
                
                <div className="post-row-meta">
                  <div className="post-row-title">{post.title || "Untitled"}</div>
                  {post.body && <div className="post-row-excerpt">{post.body.substring(0, 140)}</div>}
                  <div className="post-row-date">Last updated {formatDate(post.updated_at)}</div>
                </div>
                <div className="post-row-right">

                  <span className={`pill ${post.published ? "published": "draft"}`}>{post.published ? "published": "draft"}</span>
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