import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCamera } from "react-icons/fa";

export default function SearchBarModal({ onClose }) {
  const inputRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [imageIngredients, setImageIngredients] = useState([]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const prompt = inputRef.current.value.trim();

      if (!prompt && imageIngredients.length === 0) {
        return;
      }

      const params = new URLSearchParams();

      if (prompt) {
        params.set("prompt", prompt);
      }

      imageIngredients.forEach((i) => {
        params.append("ingredients", i);
      });

      params.append("isPublic", "true");

      navigate(`/search?${params.toString()}`);
      onClose();
    }
  };

  const handleCameraClick = () => {
    imgRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];

        const res = await fetch(
          "https://letmecook.ca/api/opencv/extract_image_ingredients",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          }
        );

        if (!res.ok)
          throw new Error("Failed to extract ingredients from image");

        const json = await res.json();
        const ingredients = json.ingredients || [];

        setImageIngredients(ingredients);
        console.log("Extracted ingredients from image:", ingredients);
      } catch (err) {
        console.error("Image processing error:", err);
        alert("Failed to extract ingredients from image.");
      }
    };

    reader.readAsDataURL(file);
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
                className={`camera-icon ${
                  imageIngredients.length > 0 ? "has-image" : ""
                }`}
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

            {imageIngredients.length > 0 && (
              <div className="image-ingredients-preview">
                <small>
                  Ingredients from image: {imageIngredients.join(", ")}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
