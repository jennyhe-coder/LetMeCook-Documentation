import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

export default function SearchBarModal({ onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const keyword = inputRef.current.value.trim();
      if (!keyword) return;

      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      onClose();
    }
  };

  return (
    <div className="search-modal">
      <div className="search-modal-content">
        <div className="layout-wrapper">
          <div className="search-modal-inner">
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close search"
            >
              <FaTimes size={16} />
            </button>

            <div className="search-bar-modal-wrapper">
              <textarea
                ref={inputRef}
                className="search-input"
                placeholder="Search with Sunny AI"
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
