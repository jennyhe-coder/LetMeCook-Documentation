import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="full-width">
      <footer className="footer layout-wrapper">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </footer>
    </div>
  );
}
