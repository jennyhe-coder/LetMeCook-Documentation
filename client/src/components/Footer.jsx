import React from "react";
import { Link } from "react-router-dom";
import "./footer.css"; // <-- note the "./"

export default function Footer() {
  return (
    <footer className="footer full-width">
      <div className="layout-wrapper">
        <div className="footer-inner ">
          <nav className="footer-nav">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </nav>
          <p className="footer-copy">
            © 2025 Let Me Cook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
