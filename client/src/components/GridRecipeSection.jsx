import React from 'react';
import RecipeCard from './RecipeCard';
import './GridRecipeSection.css';

export default function GridRecipeSection({ title, recipes = [] }) {
  return (
    <section className="grid-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      <div className="grid-content">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
