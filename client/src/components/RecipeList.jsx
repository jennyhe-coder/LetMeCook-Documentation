import { FaTimes } from "react-icons/fa";
import RecipeCard from "./RecipeCard";

export default function RecipeList({
  recipes = [],
  editMode = false,
  onRemove,
}) {
  if (recipes.length === 0) {
    return <div className="recipe-empty">No recipes to display.</div>;
  }

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
        </div>
      ))}
    </div>
  );
}
