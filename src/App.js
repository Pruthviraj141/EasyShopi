import React, { useEffect, useState } from "react";
import PublicView from "./PublicView";
import Login from "./Login";
import AdminPanel from "./AdminPanel";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Listen to "Admin" button from PublicView
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  return (
    <>
      {isAdminLoggedIn ? (
        <AdminPanel />
      ) : showLogin ? (
        <Login onLogin={() => setIsAdminLoggedIn(true)} />
      ) : (
        <PublicView />
      )}
    </>
  );
}
