import { useState, useEffect } from "react";
import { Spinner } from "../../components/UI";
import * as api from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
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
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function Avatar({ name, size = 28 }) {
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

export default function HomePanel({ onReadPost }) {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [p, b] = await Promise.all([
          api.getPublicPosts(),
          api.getAllBlogs(),
        ]);
        setPosts(p);
        setBlogs(b);
      } catch (err) {
        console.error("HomePanel load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selected]);

  function switchTab(t) {
    setTab(t);
    setSearch("");
    setSortBy("newest");
    setSelected(null);
  }

  const filteredPosts = posts
    .filter(
      (p) =>
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.blog?.title?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.updated_at) - new Date(a.updated_at);
      if (sortBy === "oldest")
        return new Date(a.updated_at) - new Date(b.updated_at);
      if (sortBy === "title")
        return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  const filteredBlogs = blogs
    .filter(
      (b) =>
        !search ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.tagline?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "title")
        return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  // ── MAIN DISCOVER VIEW ────────────────────────────────────────────────────
  return (
    <div className="blogs-page fade-up" style={{ maxWidth: "1500px" }}>
      {/* header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--ff-display)",
            fontSize: 26,
            fontWeight: 500,
            marginBottom: 4,
            color: "var(--ink)",
          }}
        >
          Discover
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink3)" }}>
          Browse posts and blogs from all writers on Ink.
        </p>
      </div>

      {/* tabs — matches user-settings tab style */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border)",
          marginBottom: 20,
        }}
      >
        {[
          { id: "posts", label: "Posts", count: posts.length },
          { id: "blogs", label: "Blogs", count: blogs.length },
        ].map((t) => (
          <button
            key={t.id}
            className="btn ghost"
            onClick={() => {
              switchTab(t.id);
            }}
            style={{
              borderRadius: "var(--radius) var(--radius) 0 0",
              borderBottom: "2px solid",
              borderBottomColor: tab === t.id ? "var(--accent)" : "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--ink3)",
              fontWeight: tab === t.id ? 500 : 400,
              paddingBottom: 10,
              gap: 6,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 20,
                background: tab === t.id ? "var(--accent-bg)" : "var(--paper2)",
                color: tab === t.id ? "var(--accent)" : "var(--ink4)",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* toolbar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "posts"
                  ? "Search posts, blogs, authors…"
                  : "Search blogs or authors…"
              }
              style={{
                flex: 1,
                fontFamily: "var(--ff-ui)",
                fontSize: 13,
                padding: "7px 12px",
                border: "1px solid var(--border2)",
                borderRadius: "var(--radius)",
                background: "var(--paper2)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                fontFamily: "var(--ff-ui)",
                fontSize: 13,
                padding: "7px 10px",
                border: "1px solid var(--border2)",
                borderRadius: "var(--radius)",
                background: "var(--paper2)",
                color: "var(--ink)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          {/* ── POSTS TAB ── */}
          {tab === "posts" &&
            (filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>
                  {search ? "No posts match that search" : "No posts yet"}
                </h3>
                <p>
                  {search
                    ? "Try different keywords."
                    : "Be the first to publish something."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  background: "#ddd4b4" /* matches blog-card */,
                }}
              >
                {filteredPosts.map((post, i) => (
                  <div
                    key={post.post_id}
                    onClick={() => onReadPost(post.blog_id, post.post_id)}
                    className="post-row"
                    style={{
                      borderBottom:
                        i < filteredPosts.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      flex: 1,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Avatar name={post.author?.name} size={25} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="post-row-title">
                        {post.title || (
                          <em style={{ color: "var(--ink4)" }}>Untitled</em>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--ink2)",
                            fontWeight: 600,
                          }}
                        >
                          {post.author?.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "1px 7px",
                            borderRadius: 20,
                            background: "var(--accent-bg)",
                            color: "var(--accent)",
                          }}
                        >
                          {post.blog?.title}
                        </span>
                        <span className="post-row-date">
                          {formatDate(post.updated_at)}
                        </span>
                      </div>
                      {post.content && (
                        <div
                          className="post-row-excerpt"
                          style={{ WebkitLineClamp: 1 }}
                        >
                          {getPlainText(post.content.substring(0, 120)) + "..."}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {/* ── BLOGS TAB ── */}
          {tab === "blogs" &&
            (filteredBlogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>
                  {search ? "No blogs match that search" : "No blogs yet"}
                </h3>
                <p>
                  {search
                    ? "Try different keywords."
                    : "Create a blog to get started."}
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredBlogs.map((blog) => (
                  <div
                    key={blog.blog_id}
                    onClick={async () => {
                      const full = await api.getPublicBlog(blog.blog_id);
                      setSelected(full);
                      navigate(`/home/blogs/${blog.blog_id}`);
                    }}
                    className="blog-card"
                  >
                    <div className="blog-card-name">{blog.title}</div>
                    {blog.tagline && (
                      <div className="blog-card-tag">{blog.tagline}</div>
                    )}
                    <div className="blog-card-meta" style={{ marginRight: 0 }}>
                      <Avatar name={blog.author?.name} size={22} />
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--ink2)",
                          fontWeight: 500,
                        }}
                      >
                        {blog.author?.name}
                      </span>
                      <div
                        style={{ marginLeft: "auto", display: "flex", gap: 6 }}
                      >
                        {" "}
                        <span
                          style={{
                            fontSize: 12,
                            color: "#188540" /* Vibrant green hex code */,
                            fontWeight: 550,
                          }}
                        >
                          {blog.number_of_posts ?? 0} post
                          {blog.number_of_posts !== 1 ? "s" : ""}
                        </span>
                        <span>·</span>
                        <span> Last {formatDate(blog.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {search && (
            <div
              style={{
                fontSize: 12,
                color: "var(--ink4)",
                marginTop: 12,
                textAlign: "right",
              }}
            >
              {(tab === "posts" ? filteredPosts : filteredBlogs).length} result
              {(tab === "posts" ? filteredPosts : filteredBlogs).length !== 1
                ? "s"
                : ""}
            </div>
          )}
        </>
      )}
    </div>
  );
}
