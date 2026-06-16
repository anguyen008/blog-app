import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons, showToast } from "../../components/UI";




/**
 * Utility: Format ISO date to readable format (e.g., "Jan 15, 2024")
 */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}


/**
 * BlogsPanel - Grid view of all user's blogs
 * Shows blog cards with metadata and delete option
 */
export default function BlogsPanel({ blogs, onSelectBlog, onNewBlog}) {
  const { user, accessToken } = useAuth();
  const [name, setName] = useState(user.name)
  return (

    <div className="blogs-page fade-up">
      <div className="blogs-header">
        <div className="blogs-header-left">
          <h1>Your blogs</h1>
          <p>Hello, {name}. What are you writing today?</p>
        </div>

      </div>
      <div className="blogs-grid">
        {blogs.map(b => (

          <div key={b.blog_id} className="blog-card" onClick={() => onSelectBlog(b.blog_id)}>
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
