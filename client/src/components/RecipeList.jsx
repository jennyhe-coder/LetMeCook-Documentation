import RecipeCard from "./RecipeCard";

export default function RecipeList({ recipes = [] }) {
  if (recipes.length === 0) {
    return <div className="recipe-empty">No recipes to display.</div>;
  }

  return (
    <div className="recipe-list">
      {recipes.map((recipe, i) => (
        <RecipeCard
          key={`${recipe.id}-${i}`}
          id={recipe.id}
          title={recipe.title}
          author={recipe.authorName}
          imageUrl={recipe.imageUrl || recipe.image_url}
          cookingTime={recipe.cookingTime}
        />
      ))}
    </div>
  );
}
