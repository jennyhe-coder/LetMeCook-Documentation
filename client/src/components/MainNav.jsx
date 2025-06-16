import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../utils/supabaseClient";

export default function MainNav() {
  const location = useLocation();
  const logoRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <div className="banner-nav">
        <nav className="layout-wrapper main-nav">
          <div className="logo-section">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <div className="logo-container" ref={logoRef}>
                <div className="logo"></div>
                <span>let me cook</span>
              </div>
            </NavLink>
          </div>
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              home
              <span className="underline"></span>
            </NavLink>
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              recipes
              <span className="underline"></span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              profile
              <span className="underline"></span>
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              dashboard
            </NavLink>

            {user ? (
              <button onClick={handleLogout}>Logout ({user.name})</button>
            ) : (
              <button className="login-button" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
