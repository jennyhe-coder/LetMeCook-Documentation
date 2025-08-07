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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const prompt = inputRef.current.value.trim();
      if (!prompt) return;

      const params = new URLSearchParams();
      params.append("prompt", prompt);
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="search-box">
      <div className="search-inner">
        <textarea
          ref={inputRef}
          className="search-input"
          placeholder="Type anything: “I want Asian dish that's vegan” or “I want dinner with salmon”"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
