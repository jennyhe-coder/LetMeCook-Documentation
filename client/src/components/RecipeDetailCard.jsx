import React, { useEffect, useState } from "react";
import "./RecipeDetailCard.css";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";

export default function RecipeDetailCard({ recipe }) {
  const { user } = useAuth();
  const [authorId, setAuthorId] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSaved(false); // Reset before checking
    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("author_id")
        .eq("id", recipe.id)
        .single();

      if (!error && data) {
        setAuthorId(data.author_id);
      }
    };

    const checkIfSaved = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("recipe_favourites")
        .select("*")
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.id)
        .single();

      if (data) setIsSaved(true);
    };

    if (recipe?.id) {
      fetchRecipe();
      checkIfSaved();
    }
  }, [recipe.id, user]);

  const capitalizeWords = (text) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleSave = async () => {
    if (isSaved || !user) return;

    const { error } = await supabase.from("recipe_favourites").insert({
      recipe_id: recipe.id,
      user_id: user.id,
    });

    if (!error) {
      setIsSaved(true);
    } else {
      console.log("Error saving to favourites:", error.message);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="recipe-detail-card-container">
      <div className="recipe-detail-card">
        <div className="recipe-detail-info-column">
          <h1 className="recipe-detail-title">{recipe.title}</h1>

          <div className="recipe-detail-meta">
            <p>
              By <strong>{recipe.authorName}</strong>
            </p>
            <p>
              Yield: {recipe.servings} servings • ⏱ {recipe.cookingTime} minutes
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {recipe.categories?.map(capitalizeWords).join(", ") || "N/A"}
            </p>
            <p>
              <strong>Dietary:</strong>{" "}
              {recipe.dietaryPreferences?.map(capitalizeWords).join(", ") ||
                "N/A"}
            </p>
            <p>
              <strong>Cuisine:</strong>{" "}
              {recipe.cuisines?.map(capitalizeWords).join(", ") || "N/A"}
            </p>
          </div>

          <div className="recipe-detail-actions">
            <button className="print-btn" onClick={handlePrint}>
              Print Recipe
            </button>

            {user?.id === authorId && (
              <button
                className="edit-recipe-btn"
                onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
              >
                Edit
              </button>
            )}

            {isSaved ? (
              <Link to="/favourites" className="save-btn saved">
                Saved to Favourites
              </Link>
            ) : (
              <button
                className={`save-btn ${!user ? "disabled-btn" : ""}`}
                onClick={handleSave}
                disabled={!user}
                title={
                  !user ? "Log in to save this recipe" : "Save this recipe"
                }
              >
                Save
              </button>
            )}
          </div>
        </div>

        <div className="recipe-detail-image-column">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="recipe-detail-image"
          />
          {/* <p className="recipe-detail-rating">★★★★★ ({recipe.rating || 0})</p> */}
        </div>
      </div>

      <div className="recipe-detail-body">
        <h2>Ingredients</h2>
        <ul className="ingredient-list">
          {recipe.ingredients.map((item, index) => (
            <li key={index}>
              {item.quantity} {item.unit} {item.ingredientName}
            </li>
          ))}
        </ul>

        <h2>Instructions</h2>
        <ol
          className="instruction-list"
          dangerouslySetInnerHTML={{ __html: recipe.directions }}
        />
      </div>
    </div>
  );
}
