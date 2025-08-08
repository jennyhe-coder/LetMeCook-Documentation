import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCamera, FaSearch, FaMicrophone } from "react-icons/fa";

export default function SearchBarModal({ onClose }) {
  const inputRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [imageIngredients, setImageIngredients] = useState([]);

  const modalRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close if clicked outside the modal content
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // API not supported

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => setListening(false);

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      // Remove trailing punctuation like period, comma, question mark, exclamation
      transcript = transcript
        .replace(/[.,!?]+$/g, "")
        .trim()
        .toLowerCase();
      setInputValue(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };
  }, []);

  const handleMicClick = () => {
    if (listening) {
      recognitionRef.current.stop();
      // Optionally navigate immediately if inputValue set
      if (inputValue.trim()) {
        navigate(`/search?keyword=${encodeURIComponent(inputValue.trim())}`);
        onClose();
      }
    } else {
      recognitionRef.current.start();
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://letmecook.ca/api/recipes/search?keyword=${encodeURIComponent(
          query
        )}&sort=createdAt&page=0&size=10`
      );
      const data = await response.json();

      const titles = data.content.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
      }));

      setSuggestions(titles);
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const prompt = inputRef?.current?.value.trim() || inputValue?.trim();

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

  const handleSuggestionClick = (id) => {
    navigate(`/recipes/${id}`);
    onClose();
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
      <div className="search-modal-content" ref={modalRef}>
        <div className="layout-wrapper">
          <div className="search-modal-inner">
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close search"
            >
              <FaTimes size={16} />
            </button>

            <div
              className="search-bar-modal-wrapper"
              style={{ position: "relative" }}
            >
              <textarea
                ref={inputRef}
                className="search-input"
                placeholder="Search with Sunny AI"
                rows={1}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <FaCamera
                className={`camera-icon ${
                  imageIngredients.length > 0 ? "has-image" : ""
                }`}
                size={20}
                onClick={handleCameraClick}
              />

              {inputValue.trim() === "" ? (
                <FaMicrophone
                  className={`mic-icon ${listening ? "listening" : ""}`}
                  size={20}
                  onClick={handleMicClick}
                  style={{ cursor: "pointer" }}
                  aria-label={
                    listening ? "Stop listening" : "Start voice search"
                  }
                />
              ) : (
                <FaSearch
                  className="send-icon"
                  size={20}
                  onClick={() => {
                    const keyword = inputValue.trim();
                    if (!keyword) return;
                    navigate(`/search?prompt=${encodeURIComponent(keyword)}`);
                    onClose();
                  }}
                  style={{ cursor: "pointer" }}
                  aria-label="Search"
                />
              )}

              <input
                type="file"
                accept="image/*"
                ref={imgRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item.id)}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="suggestion-image"
                        />
                      )}
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              {imageIngredients.length > 0 && (
                <div className="image-ingredients-preview">
                  <small>
                    Ingredients from image: {imageIngredients.join(", ")}
                  </small>
                </div>
              )}

              {/* {loading && (
                <div className="suggestions-loading">Searching recipes...</div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
