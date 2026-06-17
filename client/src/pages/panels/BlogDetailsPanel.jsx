import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "../../components/UI";
import * as api from "../../api/api";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const AVATAR_COLORS = [
  { bg: "#FAECE7", color: "#993C1D" },
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#E8F4FD", color: "#1A6B9A" },
  { bg: "#FDF0F7", color: "#8B2A6B" },
];

function getAvatarColor(name = "") {
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function Avatar({ name, size = 30 }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";
  const { bg, color } = getAvatarColor(name ?? "");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 500,
      }}
    >
      {initials}
    </div>
  );
}

export default function BlogDetailPanel({ blogId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPostId = location.state?.fromPostId ?? null;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    api
      .getPublicBlog(blogId)
      .then(setBlog)
      .catch((err) => console.error("BlogDetailPanel load error:", err))
      .finally(() => setLoading(false));
    api
      .getPostsforBlog(blogId)
      .then(setPosts)
      .catch((err) => console.error("BlogDetailPanel load error:", err))
      .finally(() => setLoading(false));
  }, [blogId]);

  if (loading) {
    return (
      <div className="page-loading" style={{ minHeight: 300 }}>
        <Spinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>Blog not found</h3>
        <p>This blog may have been removed.</p>
      </div>
    );
  }

  const selected = blog;
  const onReadPost = (post) =>
    navigate(`/home/blogs/${blog.blog_id}/posts/${post.post_id}`, {
      state: { fromBlogId: blog.blog_id },
    });

  return (
    <div className="blogs-page fade-up">
      {/* ── header actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <button className="btn ghost" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>

        {fromPostId && (
          <button
            className="btn"
            onClick={() =>
              navigate(`/home/blogs/${blogId}/posts/${fromPostId}`)
            }
          >
            ↩ Back to post
          </button>
        )}
      </div>

      <div className="settings-section" style={{ background: "#f0e6c6" }}>
        <div
          style={{
            fontFamily: "var(--ff-display)",
            fontSize: 24,
            fontWeight: 500,
            marginBottom: 6,
            color: "var(--ink)",
          }}
        >
          {selected.title}
        </div>
        {selected.tagline && (
          <div style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 14 }}>
            {selected.tagline}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <Avatar name={selected.author?.name} size={30} />
          <span style={{ fontSize: 13, color: "var(--ink2)", fontWeight: 500 }}>
            {selected.author?.name}
          </span>
          <span style={{ fontSize: 12, color: "var(--ink4)" }}>
            · {selected.number_of_published_posts ?? 0} post
            {selected.number_of_published_posts !== 1 ? "s" : ""}
          </span>
        </div>
        {selected.about && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--ink3)",
              lineHeight: 1.7,
            }}
          >
            {selected.about}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink4)", marginBottom: 10 }}>
        {selected.number_of_published_posts ?? 0} published post{" "}
        {selected.number_of_published_posts !== 1 ? "s" : ""}
      </div>
      {!selected.number_of_posts ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No published posts yet</h3>
          <p>Check back later.</p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "#f0e6c6",
          }}
        >
          {posts.map((post, i) => (
            <div
              key={post.post_id}
              onClick={() => onReadPost(post)}
              className="post-row"
              style={{
                borderBottom:
                  i < posts.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="post-row-meta">
                <div className="post-row-title">
                  {post.title || (
                    <em style={{ color: "var(--ink4)" }}>Untitled</em>
                  )}
                </div>
                <div className="post-row-date">
                  {formatDate(post.updated_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
