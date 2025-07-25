import { NavLink, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../utils/supabaseClient";
import { FaUserCircle } from "react-icons/fa";
import { FaSearch, FaTimes } from "react-icons/fa";
import SearchBarModal from "./SearchBarModal";
import logo from "../assets/navbarlogo.png";

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [disableHover, setDisableHover] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const indicator = indicatorRef.current;

    let activeIndex = -1;
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      activeIndex = 0; // Home
    } else if (location.pathname === "/recipes") {
      activeIndex = 1; // Recipes
    }

    if (user) {
      linkRefs.current[8] = avatarRef.current;
    }

    const activeEl = linkRefs.current[activeIndex];

    if (activeEl && indicator) {
      // Re-enable transition when showing/moving the indicator
      indicator.style.transition = "left 0.3s ease, width 0.3s ease";

      const rect = activeEl.getBoundingClientRect();
      const parentRect = activeEl.parentNode.parentNode.getBoundingClientRect();

      const offsetLeft = rect.left - parentRect.left;
      const width = rect.width + 12;

      indicator.style.left = `${offsetLeft - 6}px`;
      indicator.style.width = `${width}px`;
    } else if (indicator) {
      // Disable transition before hiding
      indicator.style.transition = "none";
      indicator.style.width = "0px";
      indicator.style.left = "0px";

      // Optional: Reset transition after one frame
      requestAnimationFrame(() => {
        indicator.style.transition = "left 0.3s ease, width 0.3s ease";
      });
    }
  }, [location.pathname, open, user]);

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
    { path: user ? "/dashboard" : "/", label: "Home" },
    { path: "/recipes", label: "Recipes" },
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
            to={user ? "/dashboard" : "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <div className="logo-container" ref={logoRef}>
              <img src={logo} alt="nav bar logo" className="logo" />
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
            <div
              className={`nav-link-wrapper relative group ${
                disableHover ? "disable-hover" : ""
              }`}
              ref={dropdownRef}
              onMouseEnter={() => setDisableHover(false)}
            >
              <div className="avatar-dropdown-wrapper">
                <div ref={avatarRef} className="cursor-pointer avatar-wrapper">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="avatar-icon-nav"
                    />
                  ) : (
                    <FaUserCircle size={28} />
                  )}
                </div>

                <ul className="dropdown-menu-nav">
                  <li className="dropdown-nav-item">
                    <NavLink
                      to="/profile"
                      className="dropdown-nav-link"
                      onClick={() => {
                        setDisableHover(true);
                        setTimeout(() => setDisableHover(false), 300);
                      }}
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li className="dropdown-nav-item">
                    <NavLink
                      to="/favourites"
                      className="dropdown-nav-link"
                      onClick={() => {
                        setDisableHover(true);
                        setTimeout(() => setDisableHover(false), 300);
                      }}
                    >
                      My Favourites
                    </NavLink>
                  </li>
                  <li className="dropdown-nav-item">
                    <NavLink
                      to="/user-recipe"
                      className="dropdown-nav-link"
                      onClick={() => {
                        setDisableHover(true);
                        setTimeout(() => setDisableHover(false), 300);
                      }}
                    >
                      My Recipes
                    </NavLink>
                  </li>
                  <li
                    className="dropdown-nav-item dropdown-nav-link cursor-pointer"
                    onClick={() => {
                      setDisableHover(true);
                      setTimeout(() => setDisableHover(false), 300);
                      handleLogout();
                    }}
                  >
                    Log Out
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="nav-link-wrapper">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Login
              </NavLink>
            </div>
          )}

          <div className="nav-link-wrapper">
            <button
              className="icon-button"
              onClick={() => setShowSearchModal(true)}
            >
              <FaSearch size={20} />
            </button>
          </div>
        </div>
      </nav>

      {showSearchModal && (
        <div className="search-modal">
          <div className="search-modal-content">
            <SearchBarModal onClose={() => setShowSearchModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
