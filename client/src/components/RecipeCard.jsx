import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function RecipeCard({
  id,
  title,
  author,
  imageUrl,
  cookingTime,
}) {

  const [rating, setRating] = useState({
    difficulty: 0,
    time: 0,
    cost: 0
  });

  const [loading, setLoading] = useState("true");

  useEffect(() => {
    if(!id) return;

    let cancelled = false;

    async function fetchAllReviews(){
      setLoading(true);

      // query all reviews for specific recipe id
      const{ data, error } = await supabase
        .from("review_ratings")
        .select("category, value, reviews!inner(recipe_id)")
        .eq("reviews.recipe_id", id);

      if (error) {
        console.error("Error fetching review ratings:", error);
        if (!cancelled) setLoading(false);
        return;
      }

      // average out all cost, time, difficulty values
      const categories = ["cost", "time", "difficulty"];
      const avg = {};

      // Calculate average for each category
      categories.forEach((cat) => {
        const values = (data || [])
          .filter((row) => row.category === cat && Number.isFinite(Number(row.value)))
          .map((row) => Number(row.value));

        avg[cat] = values.length
          ? values.reduce((a, b) => a + b, 0) / values.length
          : null;
      });

      // Calculate overall average (ignoring nulls)
      const validAverages = categories
        .map((cat) => avg[cat])
        .filter((v) => v != null);

      avg.overall = validAverages.length
        ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length
        : null;

      if(!cancelled){
        setRating(avg);
        setLoading(false);
      }
    }

    fetchAllReviews();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const renderStars = (avg) => {
    // nothing will be shown if there is no review ratings
    if(avg == null) return null;

    const fill = Math.round(avg);
    return (
      <span className="stars" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < fill ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </span>
    );
  };

  return (
    <Link to={`/recipes/${id}`} className="recipe-card">
      <div className="recipe-card-img-container">
        <img src={imageUrl} alt={title} loading="lazy" className="blob-image" />
      </div>
      <div className="recipe-card-meta">
        <div className="top-half">
          <div className="recipe-card-title">{title}</div>
          <div className="recipe-card-author">{author}</div>
        </div>
        <div className="bot-half">
          <div className="left">
            {rating.difficulty != null && (
              <div className="rating-row">
                <div className="rating-category">Difficulty</div>
                <div className="rating-stars">{loading ? "…" : renderStars(rating.difficulty)}</div>
              </div>
            )}

            {rating.time != null && (
              <div className="rating-row">
                <div className="rating-category">Time</div>
                <div className="rating-stars">{loading ? "…" : renderStars(rating.time)}</div>
              </div>
            )}

            {rating.cost != null && (
              <div className="rating-row">
                <div className="rating-category">Cost</div>
                <div className="rating-stars">{loading ? "…" : renderStars(rating.cost)}</div>
              </div>
            )}
          </div>
          <div className="right recipe-card-time">
            {cookingTime}&nbsp;min&nbsp;
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7493 13.9165L13.916 12.7498L10.8327 9.6665V5.83317H9.16602V10.3332L12.7493 13.9165ZM9.99935 18.3332C8.84657 18.3332 7.76324 18.1144 6.74935 17.6769C5.73546 17.2394 4.85352 16.6457 4.10352 15.8957C3.35352 15.1457 2.75977 14.2637 2.32227 13.2498C1.88477 12.2359 1.66602 11.1526 1.66602 9.99984C1.66602 8.84706 1.88477 7.76373 2.32227 6.74984C2.75977 5.73595 3.35352 4.854 4.10352 4.104C4.85352 3.354 5.73546 2.76025 6.74935 2.32275C7.76324 1.88525 8.84657 1.6665 9.99935 1.6665C11.1521 1.6665 12.2355 1.88525 13.2493 2.32275C14.2632 2.76025 15.1452 3.354 15.8952 4.104C16.6452 4.854 17.2389 5.73595 17.6764 6.74984C18.1139 7.76373 18.3327 8.84706 18.3327 9.99984C18.3327 11.1526 18.1139 12.2359 17.6764 13.2498C17.2389 14.2637 16.6452 15.1457 15.8952 15.8957C15.1452 16.6457 14.2632 17.2394 13.2493 17.6769C12.2355 18.1144 11.1521 18.3332 9.99935 18.3332ZM9.99935 16.6665C11.8466 16.6665 13.4195 16.0172 14.7181 14.7186C16.0167 13.42 16.666 11.8471 16.666 9.99984C16.666 8.15261 16.0167 6.5797 14.7181 5.28109C13.4195 3.98248 11.8466 3.33317 9.99935 3.33317C8.15213 3.33317 6.57921 3.98248 5.2806 5.28109C3.98199 6.5797 3.33268 8.15261 3.33268 9.99984C3.33268 11.8471 3.98199 13.42 5.2806 14.7186C6.57921 16.0172 8.15213 16.6665 9.99935 16.6665Z"
                  fill="black"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
