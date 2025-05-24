import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const keyword = inputRef.current.value.trim();
      if (!keyword) return;

      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="search-box">
      <span className="icon left"></span>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search recipes..."
        className="search-input"
        onKeyDown={handleKeyDown}
      />
      <span className="icon right"></span>
    </div>
  );
}
