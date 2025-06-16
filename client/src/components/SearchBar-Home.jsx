import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      adjustHeight();
    }
  }, []);

  const handleInput = () => {
    adjustHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const keyword = inputRef.current.value.trim();
      if (!keyword) return;

      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="search-box">
      <div className="search-inner">
        <textarea
          ref={inputRef}
          className="search-input"
          placeholder="Type anything: “vegan Thai curry without peanuts” or “quick dinner with salmon”"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
