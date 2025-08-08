import { useState, useEffect, useRef } from "react";
import { FaTimes, FaEllipsisH } from "react-icons/fa";
import RecipeCard from "./RecipeCard";

export default function RecipeList({
  recipes = [],
  editMode = false,
  onRemove,
  onDislike,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({}); // To store refs of each dislike-menu-container

  useEffect(() => {
    function handleClickOutside(event) {
      // If no menu is open, do nothing
      if (openMenuId === null) return;

      // Get the container ref for the open menu
      const container = menuRefs.current[openMenuId];

      // If click is outside container, close menu
      if (container && !container.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  if (recipes.length === 0) {
    return (
      <div className="recipe-empty">
        <br />
        No recipes to display.
      </div>
    );
  }

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleNotInterested = (id) => {
    onDislike(id);
    setOpenMenuId(null);
  };

  return (
    <div className="recipe-list">
      {recipes.map((recipe, i) => (
        <div
          key={`${recipe.id}-${i}`}
          className={`recipe-card-wrapper ${editMode ? "hover-always" : ""}`}
        >
          <div
            className={editMode ? "card-disabled-link" : ""}
            onClick={(e) => editMode && e.preventDefault()}
          >
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              author={recipe.authorName}
              imageUrl={recipe.imageUrl || recipe.image_url}
              cookingTime={recipe.cookingTime}
            />
          </div>

          {editMode && (
            <button
              className="remove-recipe-btn"
              onClick={() => onRemove(recipe.id)}
              title="Remove from favourites"
            >
              <FaTimes size={14} />
            </button>
          )}

          {onDislike && (
            <div
              className="dislike-menu-container"
              ref={(el) => (menuRefs.current[recipe.id] = el)}
            >
              <button
                className="dislike-recipe-btn"
                onClick={() => toggleMenu(recipe.id)}
                title="Dislike this recipe"
              >
                <FaEllipsisH size={20} />
              </button>

              {openMenuId === recipe.id && (
                <div
                  className="dislike-menu button"
                  onClick={() => handleNotInterested(recipe.id)}
                >
                  Not Interested
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
