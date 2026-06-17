import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner, Icons } from "../../components/UI";
import * as api from "../../api/api";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getPlainText(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
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

function Avatar({ name, size = 40 }) {
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

export default function ReaderPanel({ blogId, postId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromBlogId = location.state?.fromBlogId ?? null;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    api
      .getPublicPost(postId)
      .then(setPost)
      .catch((err) => console.error("ReaderPanel load error:", err))
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return (
      <div className="page-loading" style={{ minHeight: 300 }}>
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <h3>Post not found</h3>
        <p>This post may have been removed or unpublished.</p>
      </div>
    );
  }

  return (
    <div className="settings-page fade-up" style={{ maxWidth: "none" }}>
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
        {fromBlogId ? (
          <button
            className="btn ghost"
            onClick={() => navigate(`/home/blogs/${fromBlogId}`)}
          >
            {Icons.back} Back to blog
          </button>
        ) : (
          <button className="btn ghost" onClick={() => navigate("/home")}>
            {Icons.back} Home
          </button>
        )}

        <button
          className="btn"
          onClick={() =>
            navigate(`/home/blogs/${blogId}`, { state: { fromPostId: postId } })
          }
        >
          {Icons.grid} View blog
        </button>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--ink3)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {post.blog?.title} · {formatDate(post.updated_at)}
      </div>

      <h1
        style={{
          fontFamily: "var(--ff-display)",
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.2,
          marginBottom: 28,
          letterSpacing: "-0.3px",
          color: "var(--ink)",
        }}
      >
        {post.title || <em style={{ color: "var(--ink4)" }}>Untitled</em>}
      </h1>

      <div
        style={{
          fontFamily: "var(--ff-display)",
          fontSize: 19,
          lineHeight: 1.85,
          color: "var(--ink)",
          whiteSpace: "pre-wrap",
        }}
      >
        {getPlainText(post.content)}
      </div>

      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
        }}
      >
        <Avatar name={post.author?.name} size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
            {post.author?.name}
          </div>
        </div>
      </div>
    </div>
  );
}
