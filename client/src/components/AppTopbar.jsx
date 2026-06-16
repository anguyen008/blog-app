import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Topbar, Brand, Icons } from "../components/UI";

export default function AppTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close);
    };
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <Topbar>
      <Brand onClick={() => navigate("/home")} />
      <div className="topbar-right">
        <div style={{ position: "relative" }}>
          <button
            className="avatar-button"
            style={{ width: 30, height: 30, fontSize: 15 }}
            onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          >
            {initials}
          </button>
          {open && (
            <div className="popover-menu" style={{ right: 0 }}>
              <button
                className="popover-menu-button"
                onClick={() => { navigate("/settings"); setOpen(false); }}
              >
                {Icons.settings} Settings
              </button>
              <button
                className="popover-menu-button"
                onClick={() => { logout(); navigate("/login"); }}
              >
                {Icons.logout} Sign out
              </button>
            </div>
          )}
        </div>
        <span style={{ fontSize: 15, color: "var(--ink2)" }}>{user?.name}</span>
      </div>
    </Topbar>
  );
}
