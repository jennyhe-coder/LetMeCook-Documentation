import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAuth0 } from "@auth0/auth0-react";

export default function MainNav() {
  const location = useLocation();
  const logoRef = useRef();
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    // Reset default values and kill trailing animations
    gsap.killTweensOf(".underline");
    gsap.killTweensOf(".logo-fill");
    const allUnderlines = document.querySelectorAll(".nav-link .underline");
    const fillPath = logoRef.current?.querySelector(".logo-fill");
    if (location.pathname !== "/") {
      gsap.set(fillPath, { fill: "#ffb2bc" });
    }
    allUnderlines.forEach((el) => {
      gsap.set(el, { opacity: 0 });
    });
    //Animate menu underline
    const activeUnderline = document.querySelector(
      ".nav-link.active .underline"
    );
    if (activeUnderline) {
      gsap.fromTo(
        activeUnderline,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "sine.out",
        }
      );
    }

    // Animate logo fill only when navigating to home
    if (location.pathname === "/") {
      if (fillPath) {
        gsap.to(fillPath, {
          fill: "#28200D",
          duration: 1,
          ease: "power2.out",
        });
      }
    }
  }, [location.pathname]);

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
                <div className="logo">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="74"
                    height="21"
                    viewBox="0 0 76 21"
                    fill="none"
                  >
                    <path d="M26.356 10.5234H65.6667" stroke="#28200D" />
                    <path
                      className="logo-fill"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M20.1287 1.45755C22.2373 7.60423 27.3631 9.91424 29.9987 10.4641C27.3492 11.0168 22.1831 13.7368 20.0956 20.1228C16.8467 17.4081 14.037 14.3397 11.4481 10.5674C14.5245 6.71847 17.1179 3.95432 20.1287 1.45755Z"
                      fill="#ffb2bc"
                    />
                    <path
                      d="M20.1287 1.45755L20.6017 1.29531C20.5484 1.13993 20.4221 1.02065 20.264 0.976201C20.1059 0.931755 19.936 0.967816 19.8096 1.07267L20.1287 1.45755ZM29.9987 10.4641L30.1009 10.9535C30.3326 10.9052 30.4987 10.7009 30.4987 10.4641C30.4987 10.2273 30.3326 10.023 30.1009 9.97462L29.9987 10.4641ZM20.0956 20.1228L19.775 20.5065C19.9023 20.6129 20.074 20.6492 20.2335 20.6034C20.3929 20.5577 20.5193 20.4359 20.5708 20.2782L20.0956 20.1228ZM11.4481 10.5674L11.0575 10.2552C10.92 10.4272 10.9112 10.6688 11.0358 10.8503L11.4481 10.5674ZM20.1287 1.45755L19.6558 1.61979C21.8394 7.98506 27.1496 10.3805 29.8966 10.9535L29.9987 10.4641L30.1009 9.97462C27.5766 9.44802 22.6353 7.2234 20.6017 1.29531L20.1287 1.45755ZM29.9987 10.4641L29.8966 9.97462C27.1051 10.557 21.7733 13.3814 19.6203 19.9675L20.0956 20.1228L20.5708 20.2782C22.593 14.0923 27.5932 11.4767 30.1009 10.9535L29.9987 10.4641ZM20.0956 20.1228L20.4162 19.7391C17.2029 17.0541 14.4238 14.0197 11.8603 10.2845L11.4481 10.5674L11.0358 10.8503C13.6501 14.6596 16.4905 17.7621 19.775 20.5065L20.0956 20.1228ZM11.4481 10.5674L11.8386 10.8796C14.9015 7.04767 17.4713 4.31083 20.4479 1.84243L20.1287 1.45755L19.8096 1.07267C16.7645 3.59782 14.1476 6.38926 11.0575 10.2552L11.4481 10.5674Z"
                      fill="#28200D"
                    />
                  </svg>
                </div>
                <span>LET ME COOK</span>
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
              HOME
              <span className="underline"></span>
            </NavLink>
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              RECIPES
              <span className="underline"></span>
            </NavLink>
            {/* <button
              className="login-button"
              onClick={() =>
                loginWithRedirect({
                  appState: { returnTo: "/" },
                })
              }
            >
              Login
            </button> */}
            {isAuthenticated ? (
              <button onClick={() => logout({logoutParams: { returnTo: window.location.origin}})}>
                Logout ({user.name})
              </button>
            ) : (
              <button className="login-button" onClick={() => loginWithRedirect()}>Login</button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
