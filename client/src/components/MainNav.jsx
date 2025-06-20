import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../utils/supabaseClient";
import { FaUserCircle } from "react-icons/fa";

export default function MainNav() {
  const location = useLocation();
  const logoRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();
  const linkRefs = useRef([]);
  const indicatorRef = useRef();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const avatarRef = useRef(null);
  const [avatar, setAvatar] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const paths = [
      "/",
      "/recipes",
      "/profile",
      "/dashboard",
      "/login",
      "avatar",
    ];
    let activeIndex = paths.indexOf(location.pathname);
    if (user && open) {
      activeIndex = paths.indexOf("avatar");
    }
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

    if (user) {
      linkRefs.current[paths.length - 1] = avatarRef.current;
    }
  }, [location.pathname, open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("image_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching avatar:", error);
      } else {
        setAvatar(data?.image_url || null);
      }
    };

    fetchProfile();
  }, [user]);

  const navItems = [
    { path: "/", label: "home" },
    { path: "/recipes", label: "recipes" },
    // { path: "/profile", label: "profile" },
    // { path: "/dashboard", label: "dashboard" },
  ];

  // if (!user) {
  //   navItems.push({ path: "/login", label: "login" });
  // }

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

          {user ? (
            <div className="nav-link-wrapper relative" ref={dropdownRef}>
              <div
                ref={avatarRef}
                className="cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" className="avatar-icon-nav" />
                ) : (
                  <FaUserCircle size={28} />
                )}
              </div>

              {open && (
                <ul className="dropdown-menu-nav">
                  <li className="dropdown-nav-item">
                    <NavLink to="/profile" onClick={() => setOpen(false)}>
                      Profile
                    </NavLink>
                  </li>
                  <li
                    className="dropdown-nav-item cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="nav-link-wrapper">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                login
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
