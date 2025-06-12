import React from 'react';
import './RecipeCard.css';

export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <img src={recipe.imageUrl} alt={recipe.title} className="recipe-image" />
      <div className="recipe-body">
        <h2 className="recipe-title">{recipe.title}</h2>
        <p className="recipe-author">by {recipe.authorName}</p>

        <div className="recipe-meta">
          <p>Serving: <strong>{recipe.servings}</strong></p>
          <p>Cooking Time: <strong>{recipe.cookingTime} mins</strong></p>
          {/* <p>Views: <strong>{recipe.viewCount.toLocaleString()}</strong></p> */}
        </div>

        <a href={`/recipe/${recipe.id}`} className="recipe-button">
          View Details
        </a>
      </div>
    </div>
  );
}
