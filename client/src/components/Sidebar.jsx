import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/UI";

export default function Sidebar({ blogs = [], onNewBlog }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const path = location.pathname;

  // derive active panel from URL
  const panel = path.includes("/settings") && !path.includes("/blog/") ? "user-settings"
    : path.includes("/blog/") && path.includes("/settings")            ? "blog-settings"
    : path.includes("/posts")                                           ? "posts"
    : path.includes("/home")                                            ? "home"
    : path.includes("/followed")                                        ? "followed"
    : path.includes("/liked")                                           ? "liked"
    : path.includes("/library")                                         ? "library"
    : "blogs";

  const activeBlogId = path.includes("/blog/")
    ? path.split("/blog/")[1]?.split("/")[0]
    : null;

  const activeBlog = blogs.find(b => b.blog_id === activeBlogId);

  function item(id, label, icon, onClick) {
    return (
      <div
        className={`sidebar-item ${panel === id ? "active" : ""}`}
        onClick={onClick}
      >
        {icon} {label}
      </div>
    );
  }

  return (
    <nav className="sidebar">

      <div className="sidebar-section">Discover</div>
      {item("home", "Home", Icons.house, () => navigate("/home"))}
      {item("followed", "Followed blogs", Icons.follow, () => navigate("/followed"))}
      {item("liked",  "Liked Posts", Icons.heart, () => navigate("/liked"))}
      <div className="sidebar-divider" />

      <div className="sidebar-section">My Blogs</div>
      {item("blogs",   "All blogs", Icons.grid, () => navigate("/my-blogs"))}
      <div className="sidebar-item" onClick={onNewBlog}>
        {Icons.plus} New blog
      </div>

      <div style={{ flex: 1 }} />
      <div className="sidebar-divider" />
      {item("user-settings", "Account", Icons.settings, () => navigate("/settings"))}
      <div className="sidebar-item" onClick={() => { logout(); navigate("/login"); }}>
        {Icons.logout} Sign out
      </div>

    </nav>
  );
}
