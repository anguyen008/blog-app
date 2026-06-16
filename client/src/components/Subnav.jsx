import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../components/UI";

export default function Subnav({ blogs = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path     = location.pathname;

  const activeBlogId = path.includes("/blog/")
    ? path.split("/blog/")[1]?.split("/")[0]
    : null;

  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);

  // only show when inside a blog
  if (!activeBlog) return null;

  const panel = path.includes("/settings") ? "blog-settings" : "posts";

  return (
    <div className="subnav">
      <button
        className="btn ghost sm"
        onClick={() => navigate("/my-blogs")}
        style={{ marginRight: 8 }}
      >
        {Icons.back} All blogs
      </button>
      <div
        className={`subnav-item ${panel === "posts" ? "active" : ""}`}
        onClick={() => navigate(`/blog/${activeBlogId}/posts`)}
      >
        {Icons.file} All Posts
      </div>
      <div
        className={`subnav-item ${panel === "blog-settings" ? "active" : ""}`}
        onClick={() => navigate(`/blog/${activeBlogId}/settings`)}
      >
        {Icons.settings} Settings
      </div>
    </div>
  );
}
