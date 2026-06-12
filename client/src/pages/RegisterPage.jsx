/**
 * RegisterPage.jsx - User Registration Page
 * 
 * Allows new users to create an account with name, email, and password.
 * On successful registration, logs user in and routes to blog setup.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../components/UI";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const {login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to update form field values
  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  /**
   * Handle registration form submission
   * Validates input (name, email, password with min 6 chars)
   * Calls API and logs user in on success
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard")
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
          <div className="auth-brand"><Brand /></div>
          <h1 className="auth-title">Start writing</h1>
          <p className="auth-sub">Create your free account in under a minute.</p>
          {error && <div className="error-banner" style={{ marginBottom: 18 }}>{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="auth-fields">
              <div className="field">
                <label htmlFor="reg-name">Your name</label>
                <input id="reg-name" type="text" placeholder="Choose a name"  value={form.name} onChange={set("name")} autoFocus />
              </div>
              <div className="field">
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email"  placeholder="Choose a valid email (6+ chars)" value={form.email} onChange={set("email")} />
              </div>
              <div className="field">
                <label htmlFor="reg-pw">Password</label>
                <input id="reg-pw" type="password" placeholder="Choose a password (6+ chars)" value={form.password} onChange={set("password")} />
              </div>
            </div>
            <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "10px" }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="auth-foot">Already have one? <Link to="/login">Sign in</Link></p>
        </div>
      </main>
    </>
  );
}
