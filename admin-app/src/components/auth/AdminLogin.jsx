import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import adminApiClient from "../../utils/adminApiClient";
import { isValidEmail } from "../../utils/validation";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    console.log("📤 Admin login:", cleanEmail);

    try {
      const res = await adminApiClient.post("/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      /**
       * Backend response:
       * {
       *   success: true,
       *   token: "...",
       *   admin: { id, email, role }
       * }
       */

      if (res.data?.success && res.data?.token) {
        const adminEmail = res.data.admin?.email || cleanEmail;

        // ✅ Save token + email in context
        login(res.data.token, adminEmail);

        // ✅ Hard redirect after login
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="brand-logo">RF</div>
          <h1>Reliance Foundation Event</h1>
          <p>Event Management System</p>
          <p className="admin-label">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-login"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Only authorized administrators can access this portal</p>
          <p className="version">Admin v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
