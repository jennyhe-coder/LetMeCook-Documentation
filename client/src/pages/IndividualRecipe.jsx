import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RecipeDetailCard from "../components/RecipeDetailCard";
import ReviewList from "../components/ReviewList";
import CarouselSection from "../components/CarouselSection";
import ReviewForm from "../components/ReviewForm";
import "./IndividualRecipe.css";
import { supabase } from "../utils/supabaseClient";

export default function IndividualRecipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false); 

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`https://letmecook.ca/api/recipes/${id}`);
        if (!response.ok) throw new Error("Recipe not found");
        const data = await response.json();
        setRecipe(data);
        // Increment view count using Supabase RPC function

        const { error } = await supabase.rpc("increment_view_count", {
        recipe_id: id,
      });
      if (error) {
        console.error("Failed to increment view count:", error.message);
      }
      } catch (error) {
        console.error("Error fetching recipe:", error.message);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) fetchRecipe();
  }, [id]);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const {data, error} = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  },[]); 

  if (loading) return <div className="loading">Loading...</div>;
  if (!recipe) return <div className="not-found">Recipe not found.</div>;
  const refreshReviews = () => setRefreshFlag(!refreshFlag);
  const formattedDate = new Date(recipe.createdAt).toLocaleDateString();

  return (
    <main className="recipe-page-container">
      <section className="layout-wrapper header-section">
        <h1 className="recipe-title">{recipe.title}</h1>
        <div className="meta-info">
          <p>👨‍🍳 <strong>{recipe.authorName || "Anonymous"}</strong></p>
          <p>📅 {formattedDate}</p>
        </div>
        <div className="image-wrapper">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="recipe-image"
          />
        </div>
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: recipe.description }}
        />
      </section>

      <section className="layout-wrapper">
        <RecipeDetailCard recipe={recipe} />
      </section>

      <section className="layout-wrapper review-section">
        <h2 className="section-heading">User Reviews</h2>
        {user && (
          <ReviewForm recipeId={recipe.id}  onReviewSubmitted={refreshReviews}/>
        )}

        <ReviewList recipeId={recipe.id} refreshTrigger={refreshFlag} />
      </section>

    </main>
  );
}
