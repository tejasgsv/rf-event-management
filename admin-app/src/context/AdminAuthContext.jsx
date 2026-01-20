import { createContext, useContext, useState, useEffect } from "react";

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= INIT ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");

    if (token && email) {
      setAdmin({ email });
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */
  const login = (token, email) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminEmail", email);
    setAdmin({ email });
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("activeEventId");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        adminEmail: admin?.email || null,
        isAuthenticated: !!admin,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    );
  }
  return context;
};
