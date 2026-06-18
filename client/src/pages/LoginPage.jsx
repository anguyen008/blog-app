/**
 * LoginPage.jsx - User Login Page
 *
 * Allows existing users to sign in with email and password.
 * On successful login, routes to dashboard or setup depending on blog status.
 */

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../components/UI";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to update form field values
  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  /**
   * Handle login form submission
   * Validates input, calls API, and routes user on success
   */
  useEffect(() => {
    if (user) navigate("/");
  });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="auth-deco" aria-hidden="true" />
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <Brand />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to continue writing.</p>
          {error && (
            <div className="error-banner" style={{ marginBottom: 18 }}>
              {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="auth-fields">
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update("email")}
                  autoFocus
                />
              </div>
              <div className="field">
                <label htmlFor="login-pw">Password</label>
                <input
                  id="login-pw"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                />
              </div>
            </div>
            <button
              className="btn primary"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="auth-foot">
            No account? <Link to="/sign-up">Create one</Link>
          </p>
        </div>
      </main>
    </>
  );
}
