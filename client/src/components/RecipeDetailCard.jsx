import React, { useEffect, useState } from "react";
import "./RecipeDetailCard.css";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from "react-router-dom";

export default function RecipeDetailCard({ recipe }) {
  const { user } = useAuth();
  const [authorId, setAuthorId] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const navigate = useNavigate();

  const handlePrint = () => window.print();

  useEffect(() => {
    if (!recipe?.id) return;

    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("author_id")
        .eq("id", recipe.id)
        .single();

      if (error) {
        console.warn(error.message);
        return;
      }
      setAuthorId(data?.author_id);
    };

    fetchRecipe();
  }, [recipe?.id]);

  useEffect(() => {
    if (!user?.id || !recipe?.id) return;

    const checkFavourite = async () => {
      const { data, error } = await supabase
        .from("recipe_favourites")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
      }
      setIsFavourite(!!data);
    };

    checkFavourite();
  }, [user?.id, recipe?.id]);

  const handleToggleFavourite = async () => {
    if (!user?.id) return;

    if (isFavourite) {
      const { error } = await supabase
        .from("recipe_favourites")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.id);

      if (error) {
        console.error(error);
      } else {
        setIsFavourite(false);
        alert("Removed from favourites!");
      }
    } else {
      const { error } = await supabase
        .from("recipe_favourites")
        .insert({
          recipe_id: recipe.id,
          user_id: user.id
        });

      if (error) {
        console.error(error);
      } else {
        setIsFavourite(true);
        alert("Added to favourites!");
      }
    }
  };

  const capitalizeWords = (text) =>
    text?.replace(/\b\w/g, (char) => char.toUpperCase());

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

            <button
              className={isFavourite ? "remove-btn" : "save-btn"}
              onClick={handleToggleFavourite}
            >
              {isFavourite ? "Remove from Favourites" : "Save to Favourites"}
            </button>

            {user?.id === authorId && (
              <button
                onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
              >
                Edit
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
          <p className="recipe-detail-rating">
            ★★★★★ ({recipe.rating || 0})
          </p>
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
