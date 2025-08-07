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

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const prompt = inputRef.current.value.trim();
      if (!prompt) return;

      try {
        const res = await fetch("https://letmecook.ca/api/opencv/extract_search_fields", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) throw new Error("Failed to extract fields");

        const fields = await res.json();

        const params = new URLSearchParams();

        if (fields.keyword) params.append("keyword", fields.keyword);
        if (fields.cuisines) fields.cuisines.forEach((c) => params.append("cuisines", c));
        if (fields.ingredients) fields.ingredients.forEach((i) => params.append("ingredients", i));
        if (fields.allergies) fields.allergies.forEach((a) => params.append("allergies", a));
        if (fields.categories) fields.categories.forEach((c) => params.append("categories", c));
        if (fields.dietaryPreferences) fields.dietaryPreferences.forEach((d) => params.append("dietaryPreferences", d));

        params.append("isPublic", "true");

        navigate(`/search?${params.toString()}`);
      } catch (err) {
        console.error("❌ Error:", err);
        alert("Failed to extract search fields.");
      }
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
