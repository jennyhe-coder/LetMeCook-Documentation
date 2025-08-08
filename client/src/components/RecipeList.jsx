import { useState, useEffect, useRef } from "react";
import { FaTimes, FaEllipsisH } from "react-icons/fa";
import RecipeCard from "./RecipeCard";

export default function RecipeList({
  recipes = [],
  editMode = false,
  onRemove,
  onDislike,
  onExitEditMode,
  ignoreClickRefs = [],
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({}); // refs for dislike menus
  const listRef = useRef(null); // ref for the root container

  useEffect(() => {
    function handleClickOutside(event) {
      // existing dislike menu logic
      if (openMenuId !== null) {
        const container = menuRefs.current[openMenuId];
        if (container && !container.contains(event.target)) {
          setOpenMenuId(null);
        }
      }

      // Check if click is inside any ignoreClickRefs elements
      const clickedInsideIgnored = ignoreClickRefs.some(
        (ref) => ref.current && ref.current.contains(event.target)
      );

      // Exit edit mode if editMode && click outside recipe-list and NOT inside ignored refs
      if (
        editMode &&
        listRef.current &&
        !listRef.current.contains(event.target) &&
        !clickedInsideIgnored
      ) {
        if (typeof onExitEditMode === "function") {
          onExitEditMode();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, editMode, onExitEditMode]);

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
    <div className="recipe-list" ref={listRef}>
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
              >
                <FaEllipsisH size={20} />
              </button>

              {openMenuId === recipe.id && (
                <div
                  className="dislike-menu button"
                  onClick={() => handleNotInterested(recipe.id)}
                >
                  <span className="dislike-text">Suggest less</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
