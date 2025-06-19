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
  const linkRefs = useRef([]);
  const indicatorRef = useRef();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const paths = ["/", "/recipes", "/profile", "/dashboard", "/login"];
    const activeIndex = paths.indexOf(location.pathname);
    const activeEl = linkRefs.current[activeIndex];
    const indicator = indicatorRef.current;

    if (activeEl && indicator) {
      const rect = activeEl.getBoundingClientRect();
      const parentRect = activeEl.parentNode.parentNode.getBoundingClientRect();

      const offsetLeft = rect.left - parentRect.left;
      const width = rect.width + 12;

      indicator.style.left = `${offsetLeft - 6}px`;
      indicator.style.width = `${width}px`;
    }
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "home" },
    { path: "/recipes", label: "recipes" },
    { path: "/profile", label: "profile" },
    { path: "/dashboard", label: "dashboard" },
  ];

  if (!user) {
    navItems.push({ path: "/login", label: "login" });
  }

  return (
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
          <div className="nav-link-indicator" ref={indicatorRef}></div>

          {navItems.map((item, i) => (
            <div className="nav-link-wrapper" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                ref={(el) => (linkRefs.current[i] = el)}
              >
                {item.label}
              </NavLink>
            </div>
          ))}

          {user && (
            <div className="nav-link-wrapper">
              <span className="nav-link" onClick={handleLogout}>
                Logout ({user.name})
              </span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
