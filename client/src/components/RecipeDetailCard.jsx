import React from "react";
import "./RecipeDetailCard.css";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from '../context/AuthProvider';

export default function RecipeDetailCard({ recipe }) {
  const { user } = useAuth();
    
  const handlePrint = () => window.print();

  const capitalizeWords = (text) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleSave = async () => {
    const {data: recipeData, error: recipeError} = await supabase
    .from("recipe")
    .select("*")
    .eq("id", recipe.id)
    .single()

    if (recipeData) {
      const {data: favouriteData, error: favouriteError } = await supabase
      .from("recipe_favourites")
      .insert({
        recipe_id: recipeData.id,
        user_id: user.id
      })

      if (favouriteError) {
        console.log("favouriteError: ", favouriteError)
      }
    } else{
      console.log(recipeError)
    }
  }

  return (
    <div className="recipe-detail-card-container">
      <div className="recipe-detail-card">
        {/* Left Column */}

        {/* Right Column */}
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
              {" "}
              Print Recipe
            </button>
            <button className="save-btn" onClick={handleSave}> Save</button>
          </div>
        </div>

        <div className="recipe-detail-image-column">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="recipe-detail-image"
          />
          <p className="recipe-detail-rating">★★★★★ ({recipe.rating || 250})</p>
        </div>
      </div>

      {/* Ingredients + Instructions */}
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
