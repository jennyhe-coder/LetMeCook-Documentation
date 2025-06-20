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
    const fetchAll = async () => {
      try {
        const response = await fetch(`https://letmecook.ca/api/recipes/${id}`);
        if (!response.ok) throw new Error("Recipe not found");
        const data = await response.json();
        setRecipe(data);

        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError.message);
        } else {
          const currentUser = userData.user;
          setUser(currentUser);

          if (currentUser?.id) {
            const now = new Date().toISOString();

            const { error: insertError } = await supabase
              .from("recipe_browsing_history")
              .insert([
                {
                  user_id: currentUser.id,
                  recipe_id: id,
                  viewed_at: now,
                },
              ]);

            if (insertError) {
              if (insertError.code === "23505") {
                const { error: updateError } = await supabase
                  .from("recipe_browsing_history")
                  .update({ viewed_at: now })
                  .eq("user_id", currentUser.id)
                  .eq("recipe_id", id);

                if (updateError) {
                  console.error(
                    "Failed to update browsing history:",
                    updateError.message
                  );
                }
              } else {
                console.error(
                  "Failed to insert browsing history:",
                  insertError.message
                );
              }
            }
          }
        }

        const { error: viewError } = await supabase.rpc(
          "increment_view_count",
          {
            recipe_id: id,
          }
        );
        if (viewError)
          console.error("Failed to increment view count:", viewError.message);
      } catch (error) {
        console.error("Error fetching recipe:", error.message);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!recipe) return <div className="not-found">Recipe not found.</div>;
  const refreshReviews = () => setRefreshFlag(!refreshFlag);
  const formattedDate = new Date(recipe.createdAt).toLocaleDateString();

  return (
    <main className="layout-wrapper">
      <div className="recipe-page-container">
        <section className="header-section">
          <h1 className="recipe-title">{recipe.title}</h1>
          <div className="meta-info">
            <p>
              <strong>Recipe by {recipe.authorName || "Anonymous"}</strong>
            </p>
            <br />
            <p> {formattedDate}</p>
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

        <RecipeDetailCard recipe={recipe} />

        <section className="review-section">
          <h2 className="section-heading">User Reviews</h2>
          {user && (
            <ReviewForm
              recipeId={recipe.id}
              onReviewSubmitted={refreshReviews}
            />
          )}

          <ReviewList recipeId={recipe.id} refreshTrigger={refreshFlag} />
        </section>
      </div>
    </main>
  );
}
