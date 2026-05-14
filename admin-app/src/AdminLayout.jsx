import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { logout, adminEmail } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth > 1024;
  });
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/events", label: "Events", icon: "🎪" },
    { path: "/admin/sessions", label: "Sessions", icon: "🎤" },
    { path: "/admin/speakers", label: "Speakers", icon: "🎬" },
    { path: "/admin/registrations", label: "Registrations", icon: "📋" },
    { path: "/admin/waitlist", label: "Waitlist", icon: "⏳" },
    { path: "/admin/scanner", label: "Check-In", icon: "📷" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
  ];

  const currentLabel =
    menuItems.find((item) => location.pathname.startsWith(item.path))
      ?.label || "Admin";

  return (
    <div className="admin-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">RF</span>
            {sidebarOpen && <h2>Admin Panel</h2>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div className="sidebar-quick">
          <NavLink to="/admin/events/new" className="quick-action">
            ➕ Create Event
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <>
              <div className="user-info">
                <div className="user-avatar">👤</div>
                <div className="user-details">
                  <div className="user-email">{adminEmail}</div>
                  <div className="user-role">Administrator</div>
                </div>
              </div>
              <button onClick={logout} className="btn-logout">
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ===== HEADER ===== */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="breadcrumb">
            {currentLabel}
          </div>
        </div>
        <div className="header-right">
          <div className="header-user">{adminEmail}</div>
        </div>
      </header>

      {/* ===== PAGE CONTENT ===== */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
