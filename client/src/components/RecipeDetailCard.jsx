import React from 'react';
import './RecipeDetailCard.css';

export default function RecipeDetailCard({ recipe }) {
  const handlePrint = () => window.print();

  const capitalizeWords = (text) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="recipe-card-container">
      <div className="recipe-card-detail">
        {/* Left Column */}
        <div className="recipe-image-column">
          <img src={recipe.imageUrl} alt={recipe.title} className="recipe-image" />
          <p className="recipe-rating">★★★★★ ({recipe.rating || 250})</p>
        </div>

        {/* Right Column */}
        <div className="recipe-info-column">
          <h1 className="recipe-title">{recipe.title}</h1>

          <div className="recipe-meta">
            <p><strong>{recipe.authorName}</strong></p>
            <p>Yield: {recipe.servings} servings • ⏱ {recipe.cookingTime} minutes</p>
            <p><strong>Category:</strong> {recipe.categories?.map(capitalizeWords).join(", ") || "N/A"}</p>
            <p><strong>Dietary:</strong> {recipe.dietaryPreferences?.map(capitalizeWords).join(", ") || "N/A"}</p>
            <p><strong>Cuisine:</strong> {recipe.cuisines?.map(capitalizeWords).join(", ") || "N/A"}</p>
          </div>

          <div className="recipe-actions">
            <button className="print-btn" onClick={handlePrint}>🖨️ Print Recipe</button>
            <button className="save-btn">❤️ Save</button>
          </div>
        </div>
      </div>

      {/* Ingredients + Instructions */}
      <div className="recipe-body">
        <h2>Ingredients</h2>
        <ul className="ingredient-list">
          {recipe.ingredients.map((item, index) => (
            <li key={index}>
              {item.quantity} {item.unit} {item.ingredientName}
            </li>
          ))}
        </ul>

        <h2>Instructions</h2>
        <ol className="instruction-list" dangerouslySetInnerHTML={{ __html: recipe.directions }} />
      </div>
    </div>
  );
}
