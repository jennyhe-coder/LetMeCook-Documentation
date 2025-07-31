import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";

export default function SearchBarModal({ onClose }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const imgRef = useRef(null);

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

  const handleCameraClick = () => {
   imgRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    // insert actual aPI endpoint for image upload once developed, wwait for tai
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Image upload failed");
      return;
    } else {
      const result = await response.json();
      // or whatever the API returns
      navigate(`/search?image=${encodeURIComponent(result.imageUrl)}`);
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
              <FaCamera
                className="camera-icon"
                size={20}
                onClick={handleCameraClick}
              />
              <input
                type="file"
                accept="image/*"
                ref={imgRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
